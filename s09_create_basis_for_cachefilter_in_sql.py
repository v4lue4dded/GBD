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


def build_fully_split_rollup_sql(
    source_table: str,
    target_table: str,
    rollup_groups: list[list[str]],
    dim_cols: list[str],
    agg_cols: list[str],
    priority_groups: list[list[str]],
    priority_exclude: set[str],
    temp_prefix: str = "tmp_gs_",  # gs == grouping-set
) -> str:
    """
    Emit SQL that:
      • drops the final table if it exists
      • creates ONE in-memory temp table per grouping-set
      • finally unions them all into `target_table`.
    """
    # ── 0. enumerate every grouping-set produced by the multi-ROLLUP
    level_lists = [[tuple(g[:k]) for k in range(len(g), -1, -1)] for g in rollup_groups]
    all_sets = [tuple(c for lvl in combo for c in lvl) for combo in product(*level_lists)]

    def gs_sql(cols: tuple[str]) -> str:
        return "()" if not cols else f"({', '.join(cols)})"

    stmts = [f"DROP TABLE IF EXISTS {target_table} CASCADE;"]

    # ── 1. create one TEMP TABLE per grouping-set
    for idx, gset in enumerate(all_sets, 1):
        print(idx)
        tmp = f"{temp_prefix}{idx}"
        cols_present = set(gset)

        # projection list
        dim_select = [
            (f"COALESCE({c}::varchar, 'All')" if c in cols_present else "'All'") + f" AS {c}" for c in dim_cols
        ]
        agg_select = [f"SUM(ROUND({c}::numeric,4)) AS {c}" for c in agg_cols]
        agg_select.append("COUNT(*) AS anz")

        # priority expression (omit cols that aren’t grouped here)
        pr_terms = ["0"]
        for grp in priority_groups:
            useful = [c for c in grp if c not in priority_exclude and c in cols_present]
            if useful:
                cond = " OR ".join(f"{c}::varchar IS NOT NULL" for c in useful)
                pr_terms.append(f"CASE WHEN {cond} THEN 1 ELSE 0 END")
        priority_select = " + ".join(pr_terms) + " AS priority"

        select_list = ",\n       ".join(dim_select + agg_select + [priority_select])

        stmts.append(
            f"""
CREATE TEMP TABLE {tmp} AS
SELECT
       {select_list}
FROM {source_table}
GROUP BY GROUPING SETS ({gs_sql(gset)});
"""
        )

    # ── 2. final UNION ALL into the roll-up table
    union_all = " UNION ALL\n".join(f"SELECT * FROM {temp_prefix}{i+1}" for i in range(len(all_sets)))
    stmts.append(f"CREATE TABLE {target_table} AS\n{union_all}\n;")

    return "\n".join(stmts)


# ── MAIN LOOP ──────────────────────────────────────────────────────────────────
for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"
    rollup_table = f"db04_modelling.export_{table_type}_rollup"
    cachefilter_table = f"db04_modelling.export_{table_type}_cachefilter"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    # priority groups unchanged
    rollup_query = build_fully_split_rollup_sql(
        source_table=source_table,
        target_table=rollup_table,
        rollup_groups=rollup_col_lists,
        dim_cols=dim_cols,
        agg_cols=agg_cols,
        priority_groups=rollup_col_lists,
        priority_exclude=priority_exclude_cols,
        temp_prefix=f"tmp_{table_type}_gs_",
    )
    print(f"Creating rollup table (fully split): {rollup_table}")
    print(rollup_query)
    # con.execute(rollup_query)

    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dim_cols]
    identifying_string_expr = "(" + ("\n" + "|| ' | ' || ").join(combo_pairs) + ")"
    agg_pairs = [f"'{agg}', {agg}" for agg in agg_cols]
    aggregator_expr = ("\n" + " " * 14 + ", ").join(agg_pairs)

    cachefilter_prep_query = f"""CREATE OR REPLACE TABLE {cachefilter_table} AS
select 
  {identifying_string_expr} as identifying_string
, substr(sha256(identifying_string), 1, 32) AS identifying_string_hash
, priority
, json_object(
  {aggregator_expr}
  ) AS json_column
from {rollup_table}"""
    print(cachefilter_prep_query)
    con.execute(cachefilter_prep_query)


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

            df = con.execute(is_unique_col_sql).df()

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
        df_vals = con.execute(sql).df()
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
