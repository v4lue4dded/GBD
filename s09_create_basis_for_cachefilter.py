import os
from os.path import join as opj
import json
import pandas as pd
import hashlib
import my_config as config

# Database connection
engine = config.engine
con = engine.connect()

index_cols_dict = {
    "population": [
        "year",
        "region_name",
        "sub_region_name",
        "location_name",
        "age_group_name_sorted",
        "age_cluster_name_sorted",
        "sex_name",
    ],
    "long": [
        "year",
        "region_name",
        "sub_region_name",
        "location_name",
        "age_group_name_sorted",
        "age_cluster_name_sorted",
        "sex_name" "l1_cause_name" "l2_cause_name",
    ],
}

aggregated_columns_dict = {
    "population": [
        "pop_val",
        "pop_upper",
        "pop_lower",
    ],
    "long": [
        "yll_val",
        "yll_upper",
        "yll_lower",
        "deaths_val",
        "deaths_upper",
        "deaths_lower",
    ],
}

for table_type in ["population", "long"]:
    index_cols = index_cols_dict[table_type]
    aggregated_columns = aggregated_columns_dict[table_type]
    # Set export directory
    export_dir = opj(config.REPO_DIRECTORY, "docs", "data_doc", f"cachefilter_{table_type}")
    df = pd.read_sql(f"""select * from gbd.db04_modelling.export_{table_type}_rollup""", con=engine)

    for i in index_cols:
        print(i)
        other_cols = [col for col in index_cols if col != i]
        grouped = df.groupby(other_cols)

        # Create the directory if it doesn't exist
        directory = opj(export_dir, i)
        os.makedirs(directory, exist_ok=True)

        # This dictionary will map: first_three_chars_of_hash -> { full_hash : data }
        chunk_data = {}

        for combination_values, group in grouped:
            # Build the 'combination' dict
            if len(other_cols) == 1:
                combination = {other_cols[0]: combination_values}
            else:
                combination = dict(zip(other_cols, combination_values))

            # Convert grouped DataFrame to the JSON-like structure
            json_data = group.set_index(i)[aggregated_columns].to_dict(orient="index")
            json_data["generating_combination"] = combination

            # Compute the full hash and the partial (first 3 chars)
            combination_str = json.dumps(combination, sort_keys=True)
            full_hash = hashlib.md5(combination_str.encode()).hexdigest()
            partial_hash = full_hash[:3]

            # Insert into the chunk_data dict
            if partial_hash not in chunk_data:
                chunk_data[partial_hash] = {}
            chunk_data[partial_hash][full_hash] = json_data

        # Write out one file per partial_hash
        for partial_hash, data_dict in chunk_data.items():
            filename = f"{partial_hash}.json"
            filepath = opj(directory, filename)
            with open(filepath, "w") as f:
                json.dump(data_dict, f, indent=2)
