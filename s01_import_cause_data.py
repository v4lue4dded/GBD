from os import listdir
import os
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config
import json
import pandas as pd
from sqlalchemy import create_engine
from zipfile import ZipFile
import urllib

engine = create_engine('postgresql://'+config.db_login["user"] +':'+ config.db_login["pw"]+'@localhost:5432/gbd')
con = engine.connect()

##################################################################################################

download_dir = 'data\\download\\cause\\'
intermediate_dir = 'data\\intermediate\\'

download_id = '9f27d6f5'
list_of_dfs = list()
for i_file in listdir(download_dir):
    if download_id in i_file: 
        print(i_file)
        file_name = i_file.split('.')[0]
        zip_file = ZipFile(download_dir + file_name +'.zip')
        i_df = pd.read_csv(zip_file.open(file_name + '.csv'), sep=',')
        list_of_dfs.append(i_df) 

for i_df in list_of_dfs:
    print(i_df.shape)

df_cause = pd.concat(list_of_dfs)
df_cause.to_csv(intermediate_dir+"df_cause.csv", index = False, sep = '\t', encoding='utf-8-sig')

##################################################################################################

df_cause = pd.read_csv(intermediate_dir+"df_cause.csv", sep = '\t', encoding='utf-8-sig')

df_cause.to_sql(name=f'cause', con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)
##################################################################################################



