import os
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import math

# Setup path and configurations
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config

# Database connection
engine = create_engine('postgresql://'+config.db_login["user"] +':'+ config.db_login["pw"]+'@localhost:5432/gbd')
con = engine.connect()

# Set export directory
export_dir = 'test_prepfilter'

# Query the population data
df_population = pd.read_sql('''
    SELECT
        coalesce(year::varchar          , 'All') as year
      , coalesce(region_name            , 'All') as region_name
      , coalesce(sub_region_name        , 'All') as sub_region_name
      , coalesce(location_name          , 'All') as location_name
      , coalesce(age_group_name_sorted  , 'All') as age_group_name_sorted
      , coalesce(age_cluster_name_sorted, 'All') as age_cluster_name_sorted
      , coalesce(sex_name               , 'All') as sex_name
      , sum(pop_val) pop_val
      , sum(pop_upper) pop_upper
      , sum(pop_lower) pop_lower
    FROM gbd.db04_modelling.export_population
    group by rollup(year::varchar, region_name, sub_region_name, location_name, age_group_name_sorted, age_cluster_name_sorted, sex_name)
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

# create dict with all possible categories for each column
category_dict = {}
for i in index_cols:
    category_dict[i] = df_population[i].unique().tolist()

# for each column, create a list of all possible combinations of the other columns
for i in index_cols:
    # create a list of all possible combinations of the other columns
    other_cols = [x for x in index_cols if x != i]
    combinations = df_population[other_cols].drop_duplicates().to_dict(orient='records')

    # we want to end up with a json file for each of the combinations of the other_cols
    # this json file will contain the categories for the column we are currently working on (i)
    # and the values for the aggregated_columns
    # and it will be named after the hash of the combination of the other columns
