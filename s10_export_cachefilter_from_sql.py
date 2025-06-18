import os
import shutil
import json
import time
from os.path import join as opj, getsize

import my_config as config

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
SELECT *, left(identifying_string_hash, 3) AS file_id
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

con.execute("SET partitioned_write_max_open_files = 5000;")

copy_sql = f"""
COPY (
    select 
        json_column -- first column becomes the line in the file
      , file_id
    from (        
    SELECT
          json_column         
        , left(identifying_string_hash, 3) AS file_id
    FROM   {merge_table}
    union all 
    SELECT
          json_column
        , 'priority_' || priority AS file_id
    FROM   {merge_table}
    where priority <= 2
    )
)
TO '{export_dir}'
(
    FORMAT          csv,
    HEADER          false,
    QUOTE           '',
    PARTITION_BY    (file_id),
    FILE_EXTENSION  'jsonl',
    OVERWRITE_OR_IGNORE
);
"""
copy_start = time.time()
con.execute(copy_sql)
print(f"partitioned COPY in {time.time() - copy_start:.2f} seconds")

# ----------------------------------------------------------------------
# 3. glue the per-thread chunks back together → <fid>.jsonl
# ----------------------------------------------------------------------
stitch_start = time.time()
metadata = {}

for part_dir in os.scandir(export_dir):
    if part_dir.is_dir():
        fid = part_dir.name.split("=", 1)[1]
        outfile_path = opj(export_dir, f"{fid}.jsonl")

        with open(outfile_path, "wb") as outfile:
            count = 0
            for piece in sorted(os.scandir(part_dir.path), key=lambda e: e.name):
                if piece.is_file() and piece.name.endswith(".jsonl"):
                    with open(piece.path, "rb") as infile:
                        shutil.copyfileobj(infile, outfile)
        metadata[fid] = getsize(outfile_path)
        shutil.rmtree(part_dir.path)

print(f"stitched files in {time.time() - stitch_start:.2f} seconds")

metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")
