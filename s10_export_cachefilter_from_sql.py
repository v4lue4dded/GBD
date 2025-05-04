import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()


prep_table = f"gbd.db04_modelling.export_cachefilter_agg"
table_types = ["population", "long"]

# Base SQL
start_sql = f"""
DROP TABLE IF EXISTS {prep_table} CASCADE;
CREATE TABLE {prep_table} AS
SELECT
    substr(identifying_string_hash, 0, 4) AS file_id,
    json_object_agg(
        identifying_string_hash,
        json_column
        ORDER BY identifying_string_hash
    )::varchar AS chunk_json_string
from (
"""

end_sql = f"""
) merged
    GROUP BY substr(identifying_string_hash, 0, 4)
;
"""


# Generate UNION ALL query parts for each table
union_queries = [
    f"""
    SELECT
      identifying_string_hash
    , json_column
    FROM gbd.db04_modelling.export_{table_type}_cachefilter
    """ for table_type in table_types
]

# Join with UNION ALL (you could use just UNION if deduplication was needed)
full_sql = start_sql + "\n    UNION ALL\n".join(union_queries) + end_sql
print(full_sql)

# Execute the query
con.execute(text(full_sql))
print("Aggregation complete.")

# Output directory
export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", f"cachefilter_hash_db")
os.makedirs(export_dir, exist_ok=True)


# 2) Determine all partial-hash prefixes for the relevant rows
file_id_agg_query = f"""
    SELECT *
    FROM {prep_table}
    ORDER BY file_id
"""

df_partial_has_agg = pd.read_sql(file_id_agg_query, con=engine)
metadata = {}

for idx, row in df_partial_has_agg.iterrows():
    if idx % 10 == 0:
        print(idx)
    file_id = row["file_id"]
    chunk_json_string = row["chunk_json_string"]
    
    filename = f"{file_id}.json"
    filepath = opj(export_dir, filename)

    with open(filepath, "w") as f:
        f.write(chunk_json_string)

    # Record file size
    file_size = os.path.getsize(filepath)
    metadata[file_id] = file_size

# Export metadata.json
metadata_path = opj(export_dir, "file_sizes.json")
with open(metadata_path, "w") as meta_file:
    json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")