from os import listdir
import os
import my_config as config
import json
import pandas as pd
from sqlalchemy import create_engine
from zipfile import ZipFile
from os.path import join as opj
import urllib

engine = config.engine
con = engine.connect()

intermediate_dir = opj('data','intermediate')
population_dir = opj('data','download','population')
listdir(population_dir)

list_0_zip = [] # 5 year and custom age groups
list_SYA_zip = [] # single year age groups
dict_dfs = {}

# ##################################################################################################
# get lists of zips
for i_cb in listdir(population_dir):
    print(i_cb)
    if i_cb[-5:] == '0.zip':
        list_0_zip.append(i_cb)
    if i_cb[-7:] == 'SYA.zip':
        list_SYA_zip.append(i_cb)

# extracts csvs from list of zips and fill dict of dfs
for zip_type, list_zip in [
      ['pop_age_year_groups', list_0_zip]
    , ['pop_single_year_age', list_SYA_zip]
    ]:
    list_of_dfs = []
    for i_zip in list_zip:
        print(i_zip)
        zip_file = ZipFile(opj(population_dir, i_zip))
        for i_file in zip_file.filelist:
            print(i_file.filename)
            df_temp = pd.read_csv(zip_file.open(i_file.filename), sep=',')
            list_of_dfs.append(df_temp) 

    dict_dfs[zip_type] = pd.concat(list_of_dfs)

# upload dict of dfs
for table_name, df_full in dict_dfs.items():
    print(table_name)
    df_full.to_csv(f"{opj(intermediate_dir,table_name)}.csv", index = False, sep = '\t', encoding='utf-8-sig')
    df_full = pd.read_csv(f"{opj(intermediate_dir,table_name)}.csv", sep = '\t', encoding='utf-8-sig')
    df_full.to_sql(name=table_name, con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)


# ##################################################################################################

# for i_df in list_of_dfs:
#     print(i_df.shape)
#     print(set(i_df.columns) - {'age_group_id',
#  'age_group_name',
#  'location_id',
#  'location_name',
#  'lower',
#  'measure_id',
#  'measure_name',
#  'metric_id',
#  'metric_name',
#  'sex_id',
#  'sex_name',
#  'upper',
#  'val',
#  'year_id'})




# for i_cb in listdir(population_dir):
#     print(i_cb)




#     if i_cb[-11:] == '_saved.xlsx':
#         cb_name = 'cb_' + i_cb[14:-23].lower()
#         print(cb_name)
#         df = pd.read_excel(population_dir + i_cb)
#         df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
#         df.to_sql(name=cb_name, con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)


