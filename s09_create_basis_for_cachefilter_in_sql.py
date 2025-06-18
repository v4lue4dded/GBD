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

table_types = setup_dict.keys()

priority_exclude_cols = {"year"}

# ==============================================================================
# 1.  DISTINCT-VALUE METADATA FOR EVERY DIMENSION COLUMN
# ==============================================================================

distinct_values_dict = {}

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"

    dim_cols = (
        list(setup_dict[table_type]["derived_categories_dict"].keys())
        + setup_dict[table_type]["base_categories_ordered_list"]
    )
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

print("created gbd_dim_distinct_values.json")

# ==============================================================================
# 2. Get derived col info
# ==============================================================================
derived_col_dict = {}

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"

    derived_col_dict[table_type] = {}
    for derived_col, base_col in setup_dict[table_type]["derived_categories_dict"].items():
        is_unique_col_sql = (
            f"SELECT *, COUNT(*) OVER (PARTITION BY {base_col}) AS is_unique_col\n"
            f"FROM (\n"
            f"  SELECT DISTINCT {derived_col}, {base_col} FROM {source_table}\n"
            f") x"
        )

        df = con.execute(is_unique_col_sql).df()

        # ── check n:1 assumption ───────────────────────────────────────
        violating_rows = df[df["is_unique_col"] > 1].sort_values(
            by=["is_unique_col", base_col], ascending=[False, True]
        )

        if not violating_rows.empty:
            error_string = (
                f"\nViolation detected for: {table_type}.{base_col}"
                + "Rows with multiple parent mappings:\n"
                + violating_rows.to_string(index=False)
                + f"\n{table_type}.{base_col} has non-unique mapping. "
            )
            raise ValueError(error_string)

        base_to_derived_mapping = df.sort_values(base_col).set_index(base_col)[derived_col].to_dict()

        derived_col_dict[table_type][derived_col] = base_to_derived_mapping

with open(opj(data_directory, "gbd_derived_col_dict.json"), "w", encoding="utf-8") as fh:
    json.dump(derived_col_dict, fh, indent=2, ensure_ascii=False)

print("created gbd_derived_col_dict.json")

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Run Cube
# ═══════════════════════════════════════════════════════════════════════════════

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}"
    target_table = f"db04_modelling.export_{table_type}_cubed"

    base_columns = setup_dict[table_type]["base_categories_ordered_list"]
    agggregated_columns = setup_dict[table_type]["aggregated_cols_incl_renaming_dict"]
    all_agg_value = setup_dict[table_type]["all_agg_value"]

    dim_select_list = []
    for base_col in base_columns:
        dim_select_list.append(f"COALESCE({base_col}::varchar, '{all_agg_value}') AS {base_col}")
    dim_select = "\n    , ".join(dim_select_list)

    agg_select_list = []
    for col_name in agggregated_columns.keys():
        agg_select_list.append(f"SUM(ROUND({col_name}::numeric,4)) AS {col_name}")
    agg_select_list.append("COUNT(*) AS anz")
    agg_select = "\n    , ".join(agg_select_list)

    group_by_cube = "CUBE(" + ", ".join(base_columns) + ")"

    priority_select_list = []
    for base_col in base_columns:
        if base_col != "year":
            priority_select_list.append(f"""CASE WHEN {base_col} IS NOT NULL THEN 1 ELSE 0 END""")

    max_year = max(distinct_values_dict[table_type]["year"])
    min_year = min(distinct_values_dict[table_type]["year"])

    priority_select_list.append(
        f"""CASE WHEN YEAR IS NOT NULL AND YEAR NOT IN ({min_year}, {max_year}) THEN 1 ELSE 0 END"""
    )
    priority_select = ("\n    + ".join(priority_select_list)) + " AS PRIORITY"

    cube_query = f"""
    CREATE OR REPLACE TABLE {target_table} AS
    SELECT
      {dim_select}
    , {agg_select}
    , {priority_select}
    FROM {source_table}
    GROUP BY
      {group_by_cube}
    ;"""
    print(cube_query)
    con.execute(cube_query)

print("Cube tables created successfully.")


# ═══════════════════════════════════════════════════════════════════════════════
# 3. create cachefilter tables
# ═══════════════════════════════════════════════════════════════════════════════

for table_type in table_types:
    source_table = f"db04_modelling.export_{table_type}_cubed"
    target_table = f"db04_modelling.export_{table_type}_cachefilter"

    base_columns = setup_dict[table_type]["base_categories_ordered_list"]
    aggregated_columns = setup_dict[table_type]["aggregated_cols_incl_renaming_dict"]

    base_col_pairs = [f"'{bc}: ' || {bc}::varchar" for bc in base_columns]
    identifying_string_expr = "(" + " " * 11 + ("\n" + " " * 6 + "|| ' | ' || ").join(base_col_pairs) + ")"
    agg_pairs = [f"'{col_rename}', {col_name}" for col_name, col_rename in aggregated_columns.items()]
    aggregator_expr = ("\n" + " " * 4 + ", ").join(agg_pairs)

    cachefilter_query = f"""
    CREATE OR REPLACE TABLE {target_table} AS
    SELECT
      {identifying_string_expr} as identifying_string
    , substr(sha256(identifying_string), 1, 32) AS identifying_string_hash
    , priority
    , json_object(
      {aggregator_expr}
      ) AS json_column
    from {source_table}
    ;"""
    print(cachefilter_query)
    con.execute(cachefilter_query)

print("Cachefilter tables created successfully.")
con.close()
