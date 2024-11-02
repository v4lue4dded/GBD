import os
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import math
import hashlib

# Setup path and configurations
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config

# Database connection
engine = create_engine('postgresql://' + config.db_login["user"] + ':' + config.db_login["pw"] + '@localhost:5432/gbd')
con = engine.connect()

# Set export directory
export_dir = 'test_prepfilter'

# Query the population data
df_population = pd.read_sql('''
    SELECT
        coalesce(year::varchar          , 'All') as year,
        coalesce(region_name            , 'All') as region_name,
        coalesce(sub_region_name        , 'All') as sub_region_name,
        coalesce(location_name          , 'All') as location_name,
        coalesce(age_group_name_sorted  , 'All') as age_group_name_sorted,
        coalesce(age_cluster_name_sorted, 'All') as age_cluster_name_sorted,
        coalesce(sex_name               , 'All') as sex_name,
        sum(pop_val) as pop_val,
        sum(pop_upper) as pop_upper,
        sum(pop_lower) as pop_lower
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

# Create dict with all possible categories for each column
category_dict = {}
for i in index_cols:
    category_dict[i] = df_population[i].unique().tolist()

# For each column, create a list of all possible combinations of the other columns
for i in index_cols:
    # Create a list of all possible combinations of the other columns
    other_cols = [x for x in index_cols if x != i]
    combinations = df_population[other_cols].drop_duplicates().to_dict(orient='records')

    # Iterate over each combination
    for combination in combinations:
        # Filter df_population to rows matching the combination
        df_filtered = df_population.copy()
        for col in other_cols:
            df_filtered = df_filtered[df_filtered[col] == combination[col]]

        # Convert grouped DataFrame to JSON

        json_data = df_filtered.set_index(i)[aggregated_columns].to_dict(orient='index')

        # Generate a hash for the filename based on the combination
        combination_str = json.dumps(combination, sort_keys=True)
        hash_object = hashlib.md5(combination_str.encode())
        filename = hash_object.hexdigest() + '.json'

        # Create the directory if it doesn't exist
        directory = os.path.join(export_dir, i)
        if not os.path.exists(directory):
            os.makedirs(directory)

        filepath = os.path.join(directory, filename)

        # Save JSON data to file
        with open(filepath, 'w') as f:
            json.dump(json_data, f)
