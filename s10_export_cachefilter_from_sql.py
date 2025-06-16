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

BATCH_SIZE = 100
for i in range(0, len(items), BATCH_SIZE):
    batch = items[i:i + BATCH_SIZE]
    case_expr = "CASE\n"
    for file_id, where_clause in batch:
        case_expr += f"    WHEN {where_clause} THEN '{file_id}'\n"
    case_expr += "END AS file_id"

    print(f"Processing batch {i // BATCH_SIZE + 1}")
    fetch_start = time.time()
    batch_result = con.execute(
        f"""
        SELECT
            {case_expr},
            json_group_object(identifying_string_hash, json_column)
                AS chunk_json_string
        FROM {merge_table}
        where file_id is not null
        GROUP BY file_id
        """
    ).fetchall()
    print(f"Fetched batch in {time.time() - fetch_start:.2f} seconds")

    write_start = time.time()
    for file_id, chunk_json_string in batch_result:
        filepath = opj(export_dir, f"{file_id}.json")
        with open(filepath, "w") as f:
            f.write(chunk_json_string)
    print(f"Written batch in {time.time() - write_start:.2f} seconds")

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
