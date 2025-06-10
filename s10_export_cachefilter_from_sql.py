import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config
from sqlalchemy import text

con = config.duckdb_con

merge_table = "db04_modelling.export_cachefilter_merged"
agg_table = "db04_modelling.export_cachefilter_agg"
table_types = ["population", "long"]

# ----------------------------------------------------------------------
# 1) Create aggregate table including priority-level chunks
# ----------------------------------------------------------------------
union_queries = "\n    UNION ALL\n".join(
    [
        f"""SELECT
        identifying_string_hash,
        priority,
        json_column
    FROM db04_modelling.export_{table_type}_cachefilter"""
        for table_type in table_types
    ]
)

merge_query = f"""
CREATE OR REPLACE TABLE {merge_table} AS
select *
from (
    {union_queries}
)
"""

print(merge_query)
con.execute(merge_query)

create_chunk_json_string = """json_group_object(identifying_string_hash, json_column)::VARCHAR AS chunk_json_string"""

agg_sql = f"""
CREATE OR REPLACE TABLE {agg_table} AS
SELECT * FROM (
    SELECT
        left(identifying_string_hash, 5) AS file_id
        , {create_chunk_json_string}
    FROM {merge_table}
    GROUP BY left(identifying_string_hash, 5)
    UNION ALL
    SELECT
        'priority_1'                        AS file_id
        , {create_chunk_json_string}
    FROM {merge_table}
    WHERE priority <= 1
    UNION ALL
    SELECT
        'priority_2'                        AS file_id
        , {create_chunk_json_string}
    FROM {merge_table}
    WHERE priority <= 2
) combined;
"""

print(agg_sql)
con.execute(agg_sql)
print("Aggregation complete.")

# ----------------------------------------------------------------------
# 2) Export each JSON chunk to file
# ----------------------------------------------------------------------

export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", "cachefilter_hash_db_2")
os.makedirs(export_dir, exist_ok=True)

df_chunks = con.execute(
    f"""
    SELECT *
    FROM {agg_table}
    ORDER BY file_id
"""
).df()

metadata = {}

for idx, row in df_chunks.iterrows():
    file_id = row["file_id"]
    chunk_json_string = row["chunk_json_string"]

    filename = f"{file_id}.json"
    filepath = opj(export_dir, filename)

    with open(filepath, "w") as f:
        f.write(chunk_json_string)

    file_size = os.path.getsize(filepath)
    metadata[file_id] = file_size

# ----------------------------------------------------------------------
# 3) Save metadata
# ----------------------------------------------------------------------

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
