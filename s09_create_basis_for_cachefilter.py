import os
import json
import pandas as pd
import hashlib

# Setup path and configurations
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config

# Database connection
engine = config.engine
con = engine.connect()

# Set export directory
export_dir = 'test_prepfilter'

# Query the population data
df_population = pd.read_sql('''select * from gbd.db04_modelling.export_population_rollup''', con=engine)

# Define hierarchical columns
index_cols = [
    'year',
    'region_name',
    'sub_region_name',
    'location_name',
    'age_group_name_sorted',
    'age_cluster_name_sorted',
    'sex_name'
]

aggregated_columns = [
    'pop_val',
    'pop_upper',
    'pop_lower',
]

# Instead of creating a separate file for each group, we'll gather
# them by partial hash (first three characters) and then write
# everything out at once.

for i in index_cols:
    print(i)
    other_cols = [col for col in index_cols if col != i]
    grouped = df_population.groupby(other_cols)

    # Create the directory if it doesn't exist
    directory = os.path.join(export_dir, i)
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
        json_data = group.set_index(i)[aggregated_columns].to_dict(orient='index')
        json_data['generating_combination'] = combination

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
        filepath = os.path.join(directory, filename)
        with open(filepath, 'w') as f:
            json.dump(data_dict, f, indent=2)
