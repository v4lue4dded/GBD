import os
from os.path import join as opj
import json
import pandas as pd
import my_config as config

# Database connection
engine = config.engine
con = engine.connect()

table_types = ["population", "long"]

for table_type in table_types:
    # We'll read from the newly created cachefilter tables:
    prep_table = f"gbd.db04_modelling.export_{table_type}_cachefilter_prep"
    
    # Output directory
    export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", f"cachefilter_{table_type}")
    os.makedirs(export_dir, exist_ok=True)


    index_cols_query = f"""
        select distinct indexing_column FROM {prep_table}
    """
    index_cols = list(pd.read_sql(index_cols_query, con=engine)['indexing_column'])


    for pivot_col in index_cols:
        print(f"Exporting JSON for table_type={table_type}, pivot_col={pivot_col}")

        # Make subdirectory for this pivot column
        directory = opj(export_dir, pivot_col)
        os.makedirs(directory, exist_ok=True)

        partial_hash_query = f"""
            select distinct substring(generating_combination_hash,0,4) as partial_hash FROM {prep_table}
        """
        partial_hash_list = list(pd.read_sql(partial_hash_query, con=engine)['partial_hash'])

        # Query only rows for the pivot_col dimension
        # Each row already has:
        #   indexing_column, generating_combination, generating_combination_hash, json_column
        query = f"""
            SELECT 
                generating_combination,
                generating_combination_hash,
                json_column
            FROM {prep_table}
            WHERE indexing_column = '{pivot_col}'
        """

        df = pd.read_sql(query, con=engine)

        # This dictionary will map: first_three_chars_of_hash -> { full_hash : data }
        chunk_data = {}

        for idx, row in df.iterrows():
            full_hash = row["generating_combination_hash"]
            partial_hash = full_hash[:3]

            # Parse the JSON column (which includes "generating_combination" as a *string*)
            new_struct = json.loads(row["json_column"])

            # Now parse the "generating_combination" string inside the JSON object
            gen_combo_str = new_struct.get("generating_combination", "{}")
            gen_combo_dict = json.loads(gen_combo_str)
            new_struct["generating_combination"] = gen_combo_dict

            # Insert into chunk_data
            if partial_hash not in chunk_data:
                chunk_data[partial_hash] = {}
            chunk_data[partial_hash][full_hash] = new_struct

        # Write out one file per partial_hash
        for p_hash, data_dict in chunk_data.items():
            filename = f"{p_hash}.json"
            filepath = opj(directory, filename)
            with open(filepath, "w") as f:
                json.dump(data_dict, f, indent=2)

con.close()
print("Export complete.")
