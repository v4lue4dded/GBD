import os
from os.path import join as opj
import json
import my_config as config

con = config.duckdb_con

merge_table = "db04_modelling.export_cachefilter_merged"
table_types = ["population", "long"]

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
SELECT *
FROM (
    {union_queries}
)
"""

print(merge_query)
con.execute(merge_query)
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
file_where["priority_2"] = "priority <= 2"

metadata = {}
items = list(file_where.items())

for file_id, where_clause in items:
    filepath = opj(export_dir, f"{file_id}.parquet")
    con.execute(
        f"""
        COPY (
            SELECT
                identifying_string_hash,
                json_column
            FROM {merge_table}
            WHERE {where_clause}
        ) TO '{filepath}' (FORMAT 'parquet')
        """
    )
    file_size = os.path.getsize(filepath)
    metadata[file_id] = file_size
    print(f"Wrote {file_id}.parquet ({file_size} bytes)")

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
