import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

prep_table = "gbd.db04_modelling.export_cachefilter_agg"
table_types = ["population", "long"]

# ----------------------------------------------------------------------
# 1) Create aggregate table including priority-level chunks
# ----------------------------------------------------------------------

# Build merged subqueries
union_queries = "\n    UNION ALL\n".join(
    [
        f"""SELECT
        identifying_string_hash,
        priority,
        json_column
    FROM gbd.db04_modelling.export_{table_type}_cachefilter"""
        for table_type in table_types
    ]
)

full_sql = f"""
DROP TABLE IF EXISTS {prep_table} CASCADE;

CREATE TABLE {prep_table} AS
WITH merged AS (
    {union_queries}
)
SELECT * FROM (
    SELECT
        substr(identifying_string_hash, 0, 4) AS file_id,
        json_object_agg(
            identifying_string_hash,
            json_column
            ORDER BY identifying_string_hash
        )::varchar AS chunk_json_string
    FROM merged
    GROUP BY substr(identifying_string_hash, 0, 4)

    UNION

    SELECT
        'priority_1' AS file_id,
        json_object_agg(
            identifying_string_hash,
            json_column
            ORDER BY identifying_string_hash
        )::varchar AS chunk_json_string
    FROM merged
    WHERE priority <= 1

    UNION

    SELECT
        'priority_2' AS file_id,
        json_object_agg(
            identifying_string_hash,
            json_column
            ORDER BY identifying_string_hash
        )::varchar AS chunk_json_string
    FROM merged
    WHERE priority <= 2
) combined;
"""

print(full_sql)
con.execute(text(full_sql))
print("Aggregation complete.")

# ----------------------------------------------------------------------
# 2) Export each JSON chunk to file
# ----------------------------------------------------------------------

export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", "cachefilter_hash_db")
os.makedirs(export_dir, exist_ok=True)

file_id_agg_query = f"""
    SELECT *
    FROM {prep_table}
    ORDER BY file_id
"""
df_chunks = pd.read_sql(file_id_agg_query, con=engine)

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
