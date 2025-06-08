# -*- coding: utf-8 -*-
import my_config as config
import json
import pandas as pd
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

# ==============================================================================
# 1.  CREATE ROLLUP + CACHEFILTER TABLES
# ==============================================================================
for table_type in table_types:
    source_table1 = f"db04_modelling.export_{table_type}"
    target_table1 = f"db04_modelling.export_{table_type}_rollup"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    dim_selects = [f"COALESCE({col}::varchar, 'All') AS {col}" for col in dim_cols]
    dim_select_str = ("\n" + " " * 7 + "   , ").join(dim_selects)

    agg_selects = [f"SUM(ROUND({col}::numeric,4)) AS {col}" for col in agg_cols]
    agg_selects.append("COUNT(*) AS anz")
    agg_select_str = ("\n" + " " * 7 + "   , ").join(agg_selects)

    priority_parts = []
    for group in rollup_col_lists:
        filtered_group = [col for col in group if col not in priority_exclude_cols]
        if filtered_group:
            cond = " OR ".join(f"{col}::varchar IS NOT NULL" for col in filtered_group)
            priority_parts.append(f"CASE WHEN {cond} THEN 1 ELSE 0 END")
    priority_expr = ("\n" + " " * 7 + "   + ").join(priority_parts)
    priority_select = f"{priority_expr}\n" + " " * 7 + "   AS priority"

    group_by_parts = []
    for group in rollup_col_lists:
        group_cols = ", ".join(f"{c}::varchar" for c in group)
        group_by_parts.append(f"ROLLUP({group_cols})")
    group_by_str = ("\n" + " " * 7 + "   , ").join(group_by_parts)

    create_rollup_sql = f"""
        DROP TABLE IF EXISTS {target_table1} CASCADE;
        CREATE TABLE {target_table1} AS
        SELECT
            {dim_select_str}
          , {agg_select_str}
          , {priority_select}
        FROM {source_table1}
        GROUP BY
            {group_by_str}
        ;
    """

    print(f"Creating rollup table: {target_table1}")
    print(create_rollup_sql)
    con.execute(create_rollup_sql)

for table_type in table_types:
    source_table2 = f"db04_modelling.export_{table_type}_rollup"
    target_table2 = f"db04_modelling.export_{table_type}_cachefilter"

    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dim_cols]
    identifying_string_expr = "(" + ("\n" + " " * 17 + "|| ' | ' || ").join(combo_pairs) + ")"

    agg_pairs = [f"'{agg}', {agg}" for agg in agg_cols]
    aggregator_expr = ("\n" + " " * 14 + ", ").join(agg_pairs)

    create_cachefilter_sql = f"""
        DROP TABLE IF EXISTS {target_table2} CASCADE;
        CREATE TABLE {target_table2} AS
        WITH combo AS (
            SELECT
                *,
                {identifying_string_expr} AS identifying_string
            FROM {source_table2}
        )
        SELECT
            identifying_string,
            priority,
            substr(sha256(identifying_string), 1, 32) AS identifying_string_hash,
            json_object(
                {aggregator_expr}
            ) AS json_column
        FROM combo
    """

    print(f"Creating cachefilter table: {target_table2}")
    print(create_cachefilter_sql)
    con.execute(create_cachefilter_sql)

# ==============================================================================
# 2.  HIERARCHICAL (n:1) ROLL-UP METADATA (unchanged)
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
