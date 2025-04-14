import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

table_types = ["population", "long"]

rollup_cols_dict = {
    "population": [
        ["year"],
        ["sex_name"],
        ["region_name", "sub_region_name", "location_name"],
        ["age_cluster_name_sorted", "age_group_name_sorted"],
    ],
    "long": [
        ["year"],
        ["sex_name"],
        ["region_name", "sub_region_name", "location_name"],
        ["age_cluster_name_sorted", "age_group_name_sorted"],
        ["l1_cause_name", "l2_cause_name"],
    ],
}

dimension_cols_dict = {
    table_type: [col for group in rollup_lists for col in group]
    for table_type, rollup_lists in rollup_cols_dict.items()
}

aggregated_cols_dict = {
    "population": [
        "pop_val",
        "pop_upper",
        "pop_lower",
    ],
    "long": [
        "yll_val",
        "yll_upper",
        "yll_lower",
        "deaths_val",
        "deaths_upper",
        "deaths_lower",
    ],
}

for table_type in table_types:
    source_table1 = f"gbd.db04_modelling.export_{table_type}"
    target_table1 = f"gbd.db04_modelling.export_{table_type}_rollup"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]

    dim_selects = [f"COALESCE({col}::varchar, 'All') AS {col}" for col in dim_cols]
    dim_select_str = ("\n"+ " " * 7 +"   , ").join(dim_selects)
    agg_selects = [f"SUM({col}) AS {col}" for col in agg_cols]
    agg_selects.append("COUNT(*) AS anz")
    agg_select_str = ("\n"+ " " * 7 +"   , ").join(agg_selects)
    group_by_parts = []
    for group in rollup_col_lists:
        group_cols = ", ".join(f"{c}::varchar" for c in group)
        group_by_parts.append(f"ROLLUP({group_cols})")
    group_by_str = ("\n"+ " " * 7 +"   , ").join(group_by_parts)

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

    dim_cols = dimension_cols_dict[table_type]
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

con.close()
print("All tables created successfully.")
