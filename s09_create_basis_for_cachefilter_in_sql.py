# Source table name:
source_table = "gbd.db04_modelling.export_long_rollup"

# Dimensions we might pivot on (each dimension will become the "indexing_column"):
dimensions = [
    "year",
    "region_name",
    "sub_region_name",
    "location_name",
    "age_group_name_sorted",
    "age_cluster_name_sorted",
    "sex_name",
    "l1_cause_name",
    "l2_cause_name",
]

# Columns we want to aggregate into JSON for each dimension value:
aggregations = [
    "yll_val",
    "yll_upper",
    "yll_lower",
    "deaths_val",
    "deaths_upper",
    "deaths_lower",
]

# Destination table where we'll store the union of all queries:
target_table = "gbd.db04_modelling.long_cachefilter_prep"

# -------------------------------------------------------------------
# 2) Build the SQL
# -------------------------------------------------------------------


def build_query_for_dimension(table_name, pivot_col, all_dimensions, agg_cols):
    # 1) Dimensions other than the pivot
    other_dims = [d for d in all_dimensions if d != pivot_col]

    # 2) Build a JSON object for the grouping combo:
    #    json_build_object('col1', col1::varchar, 'col2', col2::varchar, ...)
    combo_pairs = []
    for od in other_dims:
        combo_pairs.append(f"'{od}', {od}::varchar")
    generating_combination_expr = "json_build_object(" + ", ".join(combo_pairs) + ")::varchar"

    # 3) Build the aggregator object for each pivot value:
    #    json_build_object('pop_val', pop_val, 'pop_upper', pop_upper, ...)
    agg_pairs = []
    for agg in agg_cols:
        agg_pairs.append(f"'{agg}', {agg}")
    aggregator_expr = "json_build_object(" + ", ".join(agg_pairs) + ")"

    # 4) Put it together in a query, using a WITH clause for clarity:
    #    pivot_col is used inside json_object_agg(...) as the key, aggregator_expr as the value
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
                json_build_object(
                    'generating_combination', generating_combination
                )
                ||
                json_object_agg(
                    {pivot_col}::varchar,
                    {aggregator_expr}
                )::varchar
            ) AS json_column
        FROM combo
        GROUP BY generating_combination
    """
    return query


# Build the individual pivot queries and then UNION ALL
individual_queries = []
for dim in dimensions:
    sql_for_dim = build_query_for_dimension(source_table, dim, dimensions, aggregations)
    # We'll wrap in parentheses so we can safely do "UNION ALL" among them:
    individual_queries.append(f"({sql_for_dim})")

# Single SQL statement that union all of them
union_sql = " UNION ALL ".join(individual_queries)

# Finally, create a table with these results (dropping the old one if it exists)
create_table_sql = f"""
DROP TABLE IF EXISTS {target_table} CASCADE;
CREATE TABLE {target_table} AS
{union_sql}
;
"""


print(create_table_sql)
