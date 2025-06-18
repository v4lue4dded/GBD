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
# all distinct 3-char prefixes
prefix_rows = con.execute("""
    SELECT DISTINCT left(identifying_string_hash, 3) AS file_id
    FROM db04_modelling.export_cachefilter_merged
""").fetchall()

for (fid,) in prefix_rows:
    file_where[fid] = f"left(identifying_string_hash, 3) = '{fid}'"

# special buckets
file_where["priority_1"] = "priority <= 1"
file_where["priority_2"] = "priority <= 2"

metadata = {}

for file_id, where_clause in file_where.items():
    filepath = opj(export_dir, f"{file_id}.jsonl")
    con.execute(f"""
    COPY (
        SELECT
            json_column
        FROM {merge_table}
        WHERE {where_clause}
    )
    TO '{filepath}'
    ( FORMAT CSV,
      HEADER FALSE,
      DELIMITER '\t',   -- tab never occurs inside the JSON
      QUOTE '|'         -- choose a quote char that never occurs either
    );
    """)
    file_size = os.path.getsize(filepath)
    metadata[file_id] = file_size
    print(f"Wrote {filepath} ({file_size} bytes)")

# ----------------------------------------------------------------------
# 3) Save metadata
# ----------------------------------------------------------------------

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
