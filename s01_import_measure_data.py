from os import listdir
import os
import my_config as config
import json
import pandas as pd
from sqlalchemy import create_engine
from zipfile import ZipFile
import urllib
from os.path import join as opj

# linux
engine = config.engine
con = engine.connect()

##################################################################################################

year = "2021"
download_ids = ['a7dc7bf9', '79e15be9']

download_dir =  opj(config.REPO_DIRECTORY,'data','download','measure')
intermediate_dir = opj(config.REPO_DIRECTORY,'data','intermediate')

list_of_dfs = list()
for i_file in listdir(download_dir):
    for download_id in download_ids:
        if download_id in i_file: 
            print(i_file)
            file_name = i_file.split('.')[0]
            zip_file = ZipFile(opj(download_dir, file_name) +'.zip')
            i_df = pd.read_csv(zip_file.open(file_name + '.csv'), sep=',')
            list_of_dfs.append(i_df) 

for i_df in list_of_dfs:
    print(i_df.shape)

df_measure = pd.concat(list_of_dfs)
# df_measure.to_csv(opj(intermediate_dir,f"df_measure_{year}"), index = False, sep = '\t', encoding='utf-8-sig')

# ##################################################################################################

# df_measure = pd.read_csv(opj(intermediate_dir,f"df_measure_{year}.csv"), sep = '\t', encoding='utf-8-sig')

df_measure.to_sql(name=f'measure_{year}', con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)
##################################################################################################



