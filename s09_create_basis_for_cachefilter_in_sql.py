import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

table_types = ["population", "long"]

# TODO: continue here and create jsons encoding this info
rollup_column_groups = [
    ["region_name", "sub_region_name", "location_name"],
    ["age_group_name_sorted", "age_cluster_name_sorted"],
    ["l1_cause_name", "l2_cause_name"],
]

dimension_cols_dict = {
    "population": [
        "year",
        "region_name",
        "sub_region_name",
        "location_name",
        "age_group_name_sorted",
        "age_cluster_name_sorted",
        "sex_name",
    ],
    "long": [
        "year",
        "region_name",
        "sub_region_name",
        "location_name",
        "age_group_name_sorted",
        "age_cluster_name_sorted",
        "sex_name",
        "l1_cause_name",
        "l2_cause_name",
    ],
}

aggregated_columns_dict = {
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
    source_table = f"gbd.db04_modelling.export_{table_type}_rollup"
    target_table = f"gbd.db04_modelling.export_{table_type}_cachefilter"


    dimensions = dimension_cols_dict[table_type]
    agg_cols = aggregated_columns_dict[table_type]
    combo_pairs = [f"'{od}: ' || {od}::varchar" for od in dimensions]
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
