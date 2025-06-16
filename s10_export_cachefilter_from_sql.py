import os
from os.path import join as opj
import json
import my_config as config
import time

con = config.duckdb_con

merge_table = "db04_modelling.export_cachefilter_merged"
table_types = ["population", "long"]

union_queries = "\n    UNION ALL\n".join(
    [
        f"""    SELECT
        identifying_string_hash,
        priority,
        json_column
    FROM db04_modelling.export_{table_type}_cachefilter"""
        for table_type in table_types
    ]
)

merge_query = f"""
CREATE OR REPLACE TABLE {merge_table} AS
SELECT *
FROM (
{union_queries}
)
"""

print(merge_query)
merge_start = time.time()
con.execute(merge_query)
print(f"merged tables in {time.time() - merge_start:.2f} seconds")
print("Merge table created.")

export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", "cachefilter_hash_db_2")
os.makedirs(export_dir, exist_ok=True)

file_where = {}
prefix_rows = con.execute("""
    SELECT DISTINCT left(identifying_string_hash, 3) AS file_id
    FROM db04_modelling.export_cachefilter_merged
""").fetchall()

for (fid,) in prefix_rows:
    file_where[fid] = f"left(identifying_string_hash, 3) = '{fid}'"

file_where["priority_1"] = "priority <= 1"
file_where["priority_2"] = "priority = 2"
file_where["priority_3"] = "priority = 3"

metadata = {}
items = list(file_where.items())

for file_id, where_clause in file_where.items():
    print(file_id)
    fetch_start = time.time()
    chunk_json_string = con.execute(
        f"""
        SELECT
            json_group_object(identifying_string_hash, json_column)::VARCHAR
                AS chunk_json_string
        FROM {merge_table}
        WHERE {where_clause}
        """
    ).fetchone()[0]
    print(f"Fetched dataframe in {time.time() - fetch_start:.2f} seconds")

    write_start = time.time()
    filepath = opj(export_dir, f"{file_id}.json")
    with open(filepath, "w") as f:
        f.write(chunk_json_string)
    print(f"Written dataframe in {time.time() - write_start:.2f} seconds")

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
