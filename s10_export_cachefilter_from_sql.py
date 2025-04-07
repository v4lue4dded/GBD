import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config
from sqlalchemy import text

# Database connection
engine = config.engine
con = engine.connect()

table_types = ["population"]

for table_type in table_types:
    # We'll read from the newly created cachefilter tables:
    prep_table = f"gbd.db04_modelling.export_{table_type}_cachefilter_prep"
    
    # Output directory
    export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", f"cachefilter_{table_type}")
    os.makedirs(export_dir, exist_ok=True)

    # 1) Get all pivot columns from the prep table
    index_cols_query = f"""
        SELECT DISTINCT indexing_column 
        FROM {prep_table}
        ORDER BY indexing_column
    """
    index_cols = list(pd.read_sql(index_cols_query, con=engine)['indexing_column'])

    for pivot_col in index_cols:
        print(f"Exporting JSON for table_type={table_type}, pivot_col={pivot_col}")

        # Make subdirectory for this pivot column
        directory = opj(export_dir, pivot_col)
        os.makedirs(directory, exist_ok=True)

        # 2) Determine all partial-hash prefixes for the relevant rows
        partial_hash_query = f"""
            SELECT DISTINCT substring(generating_combination_hash, 1, 3) AS partial_hash
            FROM {prep_table}
            WHERE indexing_column = '{pivot_col}'
            ORDER BY partial_hash
        """
        partial_hash_list = list(pd.read_sql(partial_hash_query, con=engine)['partial_hash'])

        # 3) For each partial hash, we do one query that returns multiple rows:
        #    each row has: generating_combination_hash, json_column
        #    We then build chunk_data = { full_hash: row_json_dict }
        for p_hash in partial_hash_list:
            print(p_hash)
            export_query = f"""
                SELECT
                    json_object_agg(
                        generating_combination_hash
                      , json_column
                    )::varchar as chunk_json_string
                FROM {prep_table}
                WHERE indexing_column = '{pivot_col}'
                  AND generating_combination_hash LIKE '{p_hash}%'
            """
            chunk_json_string = pd.read_sql(text(export_query), con=engine).iloc[0,0]

            # 4) Write this chunk_data to a file named p_hash.json
            filename = f"{p_hash}.json"
            filepath = opj(directory, filename)
            with open(filepath, "w") as f:
                f.write(chunk_json_string)

con.close()
print("Export complete.")
