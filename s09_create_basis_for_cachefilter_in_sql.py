import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

table_types = ['population', 'long']

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

def build_query_for_dimension(table_name, pivot_col, all_dimensions, agg_cols):
    other_dims = [d for d in all_dimensions if d != pivot_col]
    combo_pairs = [f"'{od}', {od}::varchar" for od in other_dims]
    generating_combination_expr = "json_build_object(" + ", ".join(combo_pairs) + ")::varchar"
    agg_pairs = [f"'{agg}', {agg}" for agg in agg_cols]
    aggregator_expr = "json_build_object(" + ", ".join(agg_pairs) + ")"

    query = f"""
        WITH combo AS (
            SELECT
                *,
                {generating_combination_expr} AS generating_combination
            FROM {table_name}
        )
        SELECT
            '{pivot_col}' AS indexing_column,
            generating_combination,
            md5(generating_combination) AS generating_combination_hash,
            (
                jsonb_build_object(
                    'generating_combination', generating_combination
                )
                ||
                jsonb_object_agg(
                    {pivot_col}::varchar,
                    {aggregator_expr}
                )
            ) AS json_column
        FROM combo
        GROUP BY generating_combination
    """
    return query

# -------------------------------------------------------------------
# Loop over each table_type, build the UNION ALL query, and create the table
# -------------------------------------------------------------------
for table_type in table_types:
    source_table = f"gbd.db04_modelling.export_{table_type}_rollup"
    target_table = f"gbd.db04_modelling.export_{table_type}_cachefilter_prep"

    dimensions = dimension_cols_dict[table_type]
    aggregations = aggregated_columns_dict[table_type]

    # Build the individual pivot queries and then UNION ALL
    individual_queries = []
    for dim in dimensions:
        sql_for_dim = build_query_for_dimension(source_table, dim, dimensions, aggregations)
        # Wrap in parentheses so we can safely do "UNION ALL" among them
        individual_queries.append(f"({sql_for_dim})")

    union_sql = " UNION ALL ".join(individual_queries)

    # Create the table with these results (dropping the old one if it exists)
    create_table_sql = f"""
        DROP TABLE IF EXISTS {target_table} CASCADE;
        CREATE TABLE {target_table} AS
        {union_sql}
        ;
    """

    print(f"Creating table: {target_table}")
    print(create_table_sql)

    # Execute the SQL
    con.execute(text(create_table_sql))

con.close()
print("All tables created successfully.")
