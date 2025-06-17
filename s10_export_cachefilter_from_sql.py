import os
from os.path import join as opj, getsize
import json
import my_config as config
import time

con = config.duckdb_con

merge_table = "db04_modelling.export_cachefilter_merged"
table_types = ["population", "long"]

union_queries = "\n    UNION ALL\n".join(
    [
        f"""
            SELECT
                  identifying_string_hash
                , priority
                , json_column
            FROM db04_modelling.export_{table_type}_cachefilter"""
        for table_type in table_types
    ]
)

merge_query = f"""
CREATE OR REPLACE TABLE {merge_table} AS
SELECT *, left(identifying_string_hash, 3) as file_id
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

load_start = time.time()
df_merged = con.execute(f"""SELECT * FROM {merge_table} ORDER BY file_id, identifying_string_hash""").df() # get the dataframe already ordered
print(f"load table in {time.time() - load_start:.2f} seconds")

batch_start = time.time()
batch_result = (
    df_merged
        .groupby("file_id", sort=False)
        .apply(lambda g: dict(zip(g.identifying_string_hash, g.json_column)))
        .to_dict()
)
print(f"built batch_result in {time.time() - batch_start:.2f} seconds")


write_start = time.time()
metadata = {}
for file_id, chunk_dict in batch_result.items():
    print(file_id)
    filepath = opj(export_dir, f"{file_id}.json")
    with open(filepath, "w") as f:
        json.dump(chunk_dict, f, separators=(",", ":"))
    metadata[file_id] = getsize(filepath)
print(f"written {len(batch_result)} JSON files in {time.time() - write_start:.2f} seconds")


metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
