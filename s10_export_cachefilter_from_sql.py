import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

table_types = ["population", "long"]

for table_type in table_types:
    print(table_type)
    # We'll read from the newly created cachefilter tables:
    create_table_sql = f"""
        DROP TABLE IF EXISTS gbd.db04_modelling.export_{table_type}_cachefilter_agg CASCADE;
        create table         gbd.db04_modelling.export_{table_type}_cachefilter_agg as
        select
            substr(identifying_string_hash,0,4) as partial_hash
         ,  json_object_agg(
                identifying_string_hash
              , json_column
                ORDER BY identifying_string_hash
            )::varchar as chunk_json_string
        from gbd.db04_modelling.export_{table_type}_cachefilter
        group by
            substr(identifying_string_hash,0,4)
    """
    con.execute(text(create_table_sql))


for table_type in table_types:
    print(table_type)
    prep_table = f"gbd.db04_modelling.export_{table_type}_cachefilter_agg"
    
    # Output directory
    export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", f"cachefilter_{table_type}")
    os.makedirs(export_dir, exist_ok=True)

    # 2) Determine all partial-hash prefixes for the relevant rows
    partial_hash_agg_query = f"""
        SELECT *
        FROM {prep_table}
        ORDER BY partial_hash
    """
    df_partial_has_agg = pd.read_sql(partial_hash_agg_query, con=engine)

    metadata = {}

    for idx, row in df_partial_has_agg.iterrows():
        if idx % 10 == 0:
            print(idx)
        p_hash = row["partial_hash"]
        chunk_json_string = row["chunk_json_string"]
        
        filename = f"{p_hash}.json"
        filepath = opj(export_dir, filename)

        with open(filepath, "w") as f:
            f.write(chunk_json_string)

        # Record file size
        file_size = os.path.getsize(filepath)
        metadata[p_hash] = file_size

    # Export metadata.json
    metadata_path = opj(export_dir, "file_sizes.json")
    with open(metadata_path, "w") as meta_file:
        json.dump(metadata, meta_file, indent=1)

con.close()
print("Export complete.")