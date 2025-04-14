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
        ["age_group_name_sorted", "age_cluster_name_sorted"],
        ["l1_cause_name", "l2_cause_name"],
    ],
    "long": [
        ["year"],
        ["sex_name"],
        ["region_name", "sub_region_name", "location_name"],
        ["age_group_name_sorted", "age_cluster_name_sorted"],
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
    source_table = f"gbd.db04_modelling.export_{table_type}"
    target_table = f"gbd.db04_modelling.export_{table_type}_rollup"

    rollup_col_lists = rollup_cols_dict[table_type]
    dim_cols = dimension_cols_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]


    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dim_cols]
    identifying_string_expr = "(" +  ("\n"+" "*17+"|| ' | ' || ").join(combo_pairs) + ")"
    agg_pairs = [f"'{agg}', {agg}" for agg in agg_cols]
    aggregator_expr = ("\n"+" "*14+", ").join(agg_pairs)

    query = f"""
        DROP TABLE IF EXISTS {target_table} CASCADE;
        CREATE TABLE {target_table} AS
        SELECT
            COALESCE(year::varchar, 'All') AS year,
            COALESCE(region_name::varchar, 'All') AS region_name,
            COALESCE(sub_region_name::varchar, 'All') AS sub_region_name,
            COALESCE(location_name::varchar, 'All') AS location_name,
            COALESCE(age_group_name_sorted::varchar, 'All') AS age_group_name_sorted,
            COALESCE(age_cluster_name_sorted::varchar, 'All') AS age_cluster_name_sorted,
            COALESCE(sex_name::varchar, 'All') AS sex_name,
            COALESCE(l1_cause_name::varchar, 'All') AS l1_cause_name,
            COALESCE(l2_cause_name::varchar, 'All') AS l2_cause_name,
            SUM(yll_val) AS yll_val,
            SUM(yll_upper) AS yll_upper,
            SUM(yll_lower) AS yll_lower,
            SUM(deaths_val) AS deaths_val,
            SUM(deaths_upper) AS deaths_upper,
            SUM(deaths_lower) AS deaths_lower,
            count(*) as anz
        FROM gbd.db04_modelling.export_long
        GROUP BY
            ROLLUP(year::varchar),
            ROLLUP(region_name::varchar, sub_region_name::varchar, location_name::varchar),
            ROLLUP(age_cluster_name_sorted::varchar, age_group_name_sorted::varchar),
            ROLLUP(sex_name::varchar),
            ROLLUP(l1_cause_name::varchar, l2_cause_name::varchar)
        ;
    """

    print(f"Creating table: {target_table}")
    print(query)

    # Execute the SQL
    # con.execute(text(create_table_sql))


for table_type in table_types:
    source_table = f"gbd.db04_modelling.export_{table_type}_rollup"
    target_table = f"gbd.db04_modelling.export_{table_type}_cachefilter"


    dim_cols = dimension_cols_dict[table_type]
    agg_cols = aggregated_cols_dict[table_type]
    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dim_cols]
    identifying_string_expr = "(" +  ("\n"+" "*17+"|| ' | ' || ").join(combo_pairs) + ")"
    agg_pairs = [f"'{agg}', {agg}" for agg in agg_cols]
    aggregator_expr = ("\n"+" "*14+", ").join(agg_pairs)

    query = f"""
        DROP TABLE IF EXISTS {target_table} CASCADE;
        CREATE TABLE {target_table} AS
        WITH combo AS (
            SELECT
                *
                ,           {identifying_string_expr} AS identifying_string
            FROM {source_table}
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

    print(f"Creating table: {target_table}")
    print(query)

    # Execute the SQL
    # con.execute(text(create_table_sql))

con.close()
print("All tables created successfully.")
