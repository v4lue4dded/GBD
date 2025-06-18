import os
from os.path import join as opj, getsize
import json
import my_config as config
import time

con = config.duckdb_con

merge_table = "db04_modelling.export_cachefilter_merged"
table_types = ["population", "long"]

# # ── EDIT 1 ───────────────────────────────────────────────────────────────
# # pull the MAP column (stored as `json_column`) and alias it to `map_column`
# union_queries = "\n    UNION ALL\n".join(
#     [
#         f"""
#             SELECT
#                   identifying_string_hash
#                 , priority
#                 , map_column
#             FROM db04_modelling.export_{table_type}_cachefilter"""
#         for table_type in table_types
#     ]
# )
# # ─────────────────────────────────────────────────────────────────────────

# merge_query = f"""
# CREATE OR REPLACE TABLE {merge_table} AS
# SELECT *, left(identifying_string_hash, 3) as file_id
# FROM (
# {union_queries}
# )
# """

# print(merge_query)
# merge_start = time.time()
# con.execute(merge_query)
# print(f"merged tables in {time.time() - merge_start:.2f} seconds")
# print("Merge table created.")

# export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", "cachefilter_hash_db_2")
# os.makedirs(export_dir, exist_ok=True)

# load_start = time.time()
# # ── EDIT 2 ───────────────────────────────────────────────────────────────
# # fetch the ordered result straight into pandas so `map_column`
# # arrives as Python dicts (one per row)
# df_merged = (
#     con.sql(
#         f"""
#         SELECT
#               file_id
#             , identifying_string_hash
#             , priority
#             , map_column
#         FROM {merge_table}
#         ORDER BY file_id, identifying_string_hash
#         """
#     )
#     .df()
# )
# # ─────────────────────────────────────────────────────────────────────────
# print(f"load table in {time.time() - load_start:.2f} seconds")

load_start = time.time()
df_merged = (
    con.sql(
        f"""
        SELECT 
          identifying_string_hash
        , PRIORITY, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11
        , left(identifying_string_hash, 3) as file_id
        FROM db04_modelling.export_long_cachefilter
        ORDER BY file_id, identifying_string_hash
        """
    )
    .df()
)
print(f"load table in {time.time() - load_start:.2f} seconds")
# ─────────────────────────────────────────────────────────────────────────

x = df_merged.set_index("identifying_string_hash")


y = x[:100000000].to_dict('records')


batch_start = time.time()
batch_result = (
    df_merged
        .groupby("file_id", sort=False)
        .apply(lambda g: dict(zip(g.identifying_string_hash, g.map_column)))
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
