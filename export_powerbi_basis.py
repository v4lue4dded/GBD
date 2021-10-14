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

export_dir = 'data\\export\\'

df_export = pd.read_sql('select * from gbd.db04_modelling.export_power_bi_long', con=engine)

print(config.power_bi_type_cast(df_export), df_export.shape)

df_export.to_csv(f"{export_dir}df_powerbi.csv", index = False, sep = '\t', encoding='utf-8-sig')
