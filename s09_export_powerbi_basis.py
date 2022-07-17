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

df_basis = pd.read_sql('select * from gbd.db04_modelling.export_basis_population', con=engine)
df_basis.to_csv(f"{export_dir}df_basis.csv", index = False, sep = '\t', encoding='utf-8-sig')
print(config.power_bi_type_cast(df_basis), df_basis.shape)

df_population = pd.read_sql('select * from gbd.db04_modelling.export_population', con=engine)
df_population.to_csv(f"{export_dir}df_population.csv", index = False, sep = '\t', encoding='utf-8-sig')
print(config.power_bi_type_cast(df_population), df_population.shape)

df_measure = pd.read_sql('select * from gbd.db04_modelling.export_measure', con=engine)
df_measure.to_csv(f"{export_dir}df_measure.csv", index = False, sep = '\t', encoding='utf-8-sig')
print(config.power_bi_type_cast(df_measure), df_measure.shape)

df_measure = pd.read_sql('select * from gbd.db03_clean_tables.un_country_info', con=engine)
df_measure.to_csv(f"{export_dir}df_un_country_info.csv", index = False, sep = '\t', encoding='utf-8-sig')
print(config.power_bi_type_cast(df_measure), df_measure.shape)
