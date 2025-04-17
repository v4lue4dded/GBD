import my_config as config
from sqlalchemy import text
import json
import pandas as pd

# Database connection
engine = config.engine
con = engine.connect()

with open("gbd_setup.json", "r") as fh:
    setup_dict = json.load(fh)

table_types = setup_dict["table_types"]
rollup_cols_dict = setup_dict["rollup_cols_dict"]
dimension_cols_ordered_dict = setup_dict["dimension_cols_ordered_dict"]
aggregated_cols_dict = setup_dict["aggregated_cols_dict"]

for table_type in table_types:
    source_table1 = f"gbd.db04_modelling.export_{table_type}"
    target_table1 = f"gbd.db04_modelling.export_{table_type}_rollup"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    dim_selects = [f"COALESCE({col}::varchar, 'All') AS {col}" for col in dim_cols]
    dim_select_str = ("\n" + " " * 7 + "   , ").join(dim_selects)
    agg_selects = [f"SUM({col}) AS {col}" for col in agg_cols]
    agg_selects.append("COUNT(*) AS anz")
    agg_select_str = ("\n" + " " * 7 + "   , ").join(agg_selects)
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
        FROM {source_table1}
        GROUP BY
            {group_by_str}
        ;
    """

    print(f"Creating rollup table: {target_table1}")
    print(create_rollup_sql)
    # con.execute(text(create_rollup_sql))

for table_type in table_types:
    source_table2 = f"gbd.db04_modelling.export_{table_type}_rollup"
    target_table2 = f"gbd.db04_modelling.export_{table_type}_cachefilter"

    dim_cols = dimension_cols_ordered_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dim_cols]
    identifying_string_expr = "(" + ("\n" + " " * 17 + "|| ' | ' || ").join(combo_pairs) + ")"

    # Build aggregator pairs
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
            md5(identifying_string) AS identifying_string_hash,
            jsonb_build_object(
                'identifying_string', identifying_string
              , {aggregator_expr}
            ) AS json_column
        FROM combo
    """

    print(f"Creating cachefilter table: {target_table2}")
    print(create_cachefilter_sql)
    # con.execute(text(create_cachefilter_sql))

metadata_dict = {}

for table_type in table_types:
    source_table = f"gbd.db04_modelling.export_{table_type}"

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

                raise ValueError()

            # ── build nested mapping ────────────────────────────────────────
            clean_mapping = {row[lower_col]: {col: row[col] for col in higher_cols} for _, row in df.iterrows()}

            metadata_dict.setdefault(table_type, {}).setdefault(lower_col, {}).update(clean_mapping)

# ── save to file ──────────────────────────────────────────────────────────────
with open("gbd_rollup_metadata.json", "w", encoding="utf-8") as fh:
    json.dump(metadata_dict, fh, indent=2, ensure_ascii=False)

con.close()
print("All tables created successfully.")
