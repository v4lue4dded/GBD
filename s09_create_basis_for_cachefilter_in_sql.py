# -*- coding: utf-8 -*-
import my_config as config
import json
import pandas as pd
from itertools import product
from os.path import join as opj

con = config.duckdb_con

data_directory = opj(config.REPO_DIRECTORY, "docs", "data_doc")

# ── setup definitions ───────────────────────────────────────────────────────────
with open(opj(data_directory, "gbd_setup_info.json"), "r") as fh:
    setup_dict = json.load(fh)

table_types = setup_dict["table_types"]
rollup_cols_dict = setup_dict["rollup_cols_dict"]
dimension_cols_ordered_dict = setup_dict["dimension_cols_ordered_dict"]
aggregated_cols_dict = setup_dict["aggregated_cols_dict"]

priority_exclude_cols = {"year"}


# ═══════════════════════════════════════════════════════════════════════════════
# 1.  CREATE ROLLUP + CACHEFILTER TABLES  (now using split queries)
# ═══════════════════════════════════════════════════════════════════════════════


def build_split_rollup_sql(
    source_table: str,
    target_table: str,
    rollup_groups,  # list[list[str]]
    dim_select_str: str,
    agg_select_str: str,
    priority_select: str,
    batch_size: int = 50,
    temp_prefix: str = "tmp_split_",
) -> str:
    """Return a multi-statement SQL script that:
    • drops the old target,
    • materialises batches of grouping sets into TEMP tables,
    • unions them into the final roll-up table.
    """
    # ── 1) Enumerate every grouping-set the multi-ROLLUP would produce
    level_lists = [[tuple(group[:k]) for k in range(len(group), -1, -1)] for group in rollup_groups]
    all_sets = [tuple(c for level in combo for c in level) for combo in product(*level_lists)]

    def gs_fmt(cols):
        return "()" if not cols else f"({', '.join(cols)})"

    # ── 2) Build the batch temp-table statements
    stmts = [f"DROP TABLE IF EXISTS {target_table} CASCADE;"]
    for idx in range(0, len(all_sets), batch_size):
        batch_no = idx // batch_size + 1
        tmp_name = f"{temp_prefix}{batch_no}"
        stmts.append(f"DROP TABLE IF EXISTS {tmp_name};")

        grouping_sets_sql = ",\n       ".join(gs_fmt(gs) for gs in all_sets[idx : idx + batch_size])

        stmts.append(
            f"""\
CREATE TEMP TABLE {tmp_name} AS
SELECT
       {dim_select_str}
     , {agg_select_str}
     , {priority_select}
FROM {source_table}
GROUP BY GROUPING SETS (
       {grouping_sets_sql}
);
"""
        )

    # ── 3) Union everything into the final table
    union_all = " UNION ALL\n".join(f"SELECT * FROM {temp_prefix}{i+1}" for i in range(len(stmts) // 2))  # temp count
    stmts.append(f"CREATE TABLE {target_table} AS\n{union_all}\n;")

    return "\n".join(stmts)


# ── MAIN LOOP ──────────────────────────────────────────────────────────────────
for table_type in table_types:
    source_table1 = f"db04_modelling.export_{table_type}"
    target_table1 = f"db04_modelling.export_{table_type}_rollup"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    # 1a. projection lists (unchanged)
    dim_selects = [f"COALESCE({c}::varchar, 'All') AS {c}" for c in dim_cols]
    dim_select_str = ("\n" + " " * 7 + ", ").join(dim_selects)

    agg_selects = [f"SUM(ROUND({c}::numeric,4)) AS {c}" for c in agg_cols]
    agg_selects.append("COUNT(*) AS anz")
    agg_select_str = ("\n" + " " * 7 + ", ").join(agg_selects)

    # 1b. priority expression (unchanged)
    priority_parts = [
        f"CASE WHEN {' OR '.join(f'{c}::varchar IS NOT NULL' for c in group if c not in priority_exclude_cols)} "
        f"THEN 1 ELSE 0 END"
        for group in rollup_col_lists
        if any(c not in priority_exclude_cols for c in group)
    ]
    priority_select = ("\n" + " " * 7 + " + ").join(priority_parts) + " AS priority"

    # 1c. generate split SQL and execute
    split_sql = build_split_rollup_sql(
        source_table=source_table1,
        target_table=target_table1,
        rollup_groups=rollup_col_lists,
        dim_select_str=dim_select_str,
        agg_select_str=agg_select_str,
        priority_select=priority_select,
        batch_size=50,  # ⇐ tune if needed
        temp_prefix=f"tmp_{table_type}_batch_",
    )

    print(f"Creating rollup table (split): {target_table1}")
    print(split_sql)
    con.execute(split_sql)

# ==============================================================================
# 2.  HIERARCHICAL (n:1) ROLL-UP METADATA
# ==============================================================================
metadata_dict = {}

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"

    for rollup_list in rollup_cols_dict[table_type]:
        if len(rollup_list) < 2:
            continue  # skip single-col groups like ["year"]

        for lvl in range(1, len(rollup_list)):
            lower_col = rollup_list[lvl]
            higher_cols = rollup_list[:lvl]
            all_cols = [lower_col] + higher_cols

            cols_sql = ", ".join(all_cols)
            partition_col = lower_col
            is_unique_col_sql = (
                f"SELECT *, COUNT(*) OVER (PARTITION BY {partition_col}) AS is_unique_col\n"
                f"FROM (\n"
                f"  SELECT DISTINCT {cols_sql} FROM {source_table}\n"
                f") x"
            )

            df = pd.read_sql(is_unique_col_sql, con)

            # ── check n:1 assumption ───────────────────────────────────────
            violating_rows = df[df["is_unique_col"] > 1].sort_values(
                by=["is_unique_col", lower_col], ascending=[False, True]
            )

            if not violating_rows.empty:
                error_string = (
                    f"\nViolation detected for: {table_type}.{lower_col}"
                    + "Rows with multiple parent mappings:\n"
                    + violating_rows.to_string(index=False)
                    + f"\n{table_type}.{lower_col} has non-unique mappings to parents. "
                )
                raise ValueError(error_string)

            # ── build nested mapping ────────────────────────────────────────
            clean_mapping = {row[lower_col]: {col: row[col] for col in higher_cols} for _, row in df.iterrows()}

            metadata_dict.setdefault(table_type, {}).setdefault(lower_col, {}).update(clean_mapping)

# save hierarchical metadata
with open(opj(data_directory, "gbd_rollup_higher_values.json"), "w", encoding="utf-8") as fh:
    json.dump(metadata_dict, fh, indent=2, ensure_ascii=False)

# ==============================================================================
# 3.  DISTINCT-VALUE METADATA FOR EVERY DIMENSION COLUMN
# ==============================================================================

distinct_values_dict = {}

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"
    dim_cols = dimension_cols_ordered_dict[table_type]

    for col in dim_cols:
        sql = f"SELECT DISTINCT {col}::varchar AS val FROM {source_table}"
        df_vals = pd.read_sql(sql, con)

        # Assert no NULLs present
        if df_vals["val"].isna().any():
            raise ValueError(f"Null value detected in column '{col}' of table type '{table_type}'")

        values = sorted(df_vals["val"].astype(str).tolist())
        distinct_values_dict.setdefault(table_type, {})[col] = values

with open(opj(data_directory, "gbd_dim_distinct_values.json"), "w", encoding="utf-8") as fh:
    json.dump(distinct_values_dict, fh, indent=2, ensure_ascii=False)

# ── tidy up ────────────────────────────────────────────────────────────────────
con.close()
print("All tables and metadata created successfully (distinct values validated).")
