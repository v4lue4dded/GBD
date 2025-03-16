import os
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import hashlib
from concurrent.futures import ThreadPoolExecutor

# Setup path and configurations
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config

# Database connection
engine = create_engine('postgresql://{user}:{pw}@localhost:5432/gbd'.format(
    user=config.db_login["user"],
    pw=config.db_login["pw"]
))
con = engine.connect()

# Set export directory
export_dir = 'test_prepfilter'

# Query the population data
df_population = pd.read_sql('''
    SELECT
        COALESCE(year::varchar, 'All') AS year,
        COALESCE(region_name, 'All') AS region_name,
        COALESCE(sub_region_name, 'All') AS sub_region_name,
        COALESCE(location_name, 'All') AS location_name,
        COALESCE(age_group_name_sorted, 'All') AS age_group_name_sorted,
        COALESCE(age_cluster_name_sorted, 'All') AS age_cluster_name_sorted,
        COALESCE(sex_name, 'All') AS sex_name,
        SUM(pop_val) AS pop_val,
        SUM(pop_upper) AS pop_upper,
        SUM(pop_lower) AS pop_lower
    FROM gbd.db04_modelling.export_population
    GROUP BY ROLLUP(year::varchar, region_name, sub_region_name, location_name, age_group_name_sorted, age_cluster_name_sorted, sex_name)
''', con=engine)

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


# Collect all data in memory
data_to_write = []

for i in index_cols:
    print(f"Processing index column: {i}")
    other_cols = [col for col in index_cols if col != i]
    grouped = df_population.groupby(other_cols)

    for combination_values, group in grouped:
        # Create a combination dict for hashing
        if len(other_cols) == 1:
            combination = {other_cols[0]: combination_values}
        else:
            combination = dict(zip(other_cols, combination_values))

        # Convert grouped DataFrame to JSON
        json_data = group.set_index(i)[aggregated_columns].to_dict(orient='index')
        json_data['generating_combination'] = combination

        # Generate a hash for the filename based on the combination
        combination_str = json.dumps(combination, sort_keys=True)
        hash_object = hashlib.md5(combination_str.encode())
        filename = hash_object.hexdigest() + '.json'

        filepath = os.path.join(export_dir, i, filename)
        data_to_write.append((filepath, json_data))

# Function to write a single JSON file
def write_json(args):
    filepath, data = args
    directory = os.path.dirname(filepath)
    os.makedirs(directory, exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f)

# Write all JSON files using ThreadPoolExecutor
print("Starting to write JSON files...")
with ThreadPoolExecutor() as executor:
    executor.map(write_json, data_to_write)
print("Finished writing JSON files.")