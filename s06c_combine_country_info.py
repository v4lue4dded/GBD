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

df_country_gbd = pd.read_sql('select * from gbd.db03_clean_tables.cb_location_country', con=engine)
df_country_un = pd.read_excel('UNSD_Methodology_saved_incl_Taiwan.xlsx')

df_country_un.columns = (
    df_country_un.columns
    .str.strip()
    .str.lower()
    .str.replace(' ', '_'  ,regex=False)
    .str.replace('(', ''   ,regex=False)
    .str.replace(')', ''   ,regex=False)
    .str.replace('-', '_'  ,regex=False)
    .str.replace('/', 'or' ,regex=False)
)


df_country_un.least_developed_countries_ldc.replace('x', '1').fillna('0').astype(int).value_counts(dropna=False)

df_country_un_clean = df_country_un.assign(
    least_developed_countries_ldc         = lambda x: x.least_developed_countries_ldc.replace('x', '1').fillna('0').astype(int),
    land_locked_developing_countries_lldc = lambda x: x.land_locked_developing_countries_lldc.replace('x', '1').fillna('0').astype(int),
    small_island_developing_states_sids   = lambda x: x.small_island_developing_states_sids.replace('x', '1').fillna('0').astype(int),
)[[
'country_or_area',
'iso_alpha2_code',
'iso_alpha3_code',
'region_code',
'region_name',
'sub_region_code',
'sub_region_name',
'intermediate_region_code',
'intermediate_region_name',
'least_developed_countries_ldc',
'land_locked_developing_countries_lldc',
'small_island_developing_states_sids',         
'developed_or_developing_countries',
]
]

# # find missmatches
# set_country_gbd       = set(df_country_gbd.location_name)
# set_country_un_clean  = set(df_country_un_clean.country_or_area)
# print(df_country_gbd.shape)
# print(df_country_un_clean.shape)
# print(len(set_country_gbd))
# print(len(set_country_un_clean))
# set_country_gbd - set_country_un_clean

# create renaming for missmatches
rename_dict = {
    "Côte d'Ivoire"              : "Côte d’Ivoire",
    "Palestine"                  : "State of Palestine",
    "Taiwan (Province of China)" : "Taiwan",
    "United Kingdom"             : "United Kingdom of Great Britain and Northern Ireland",
}
    
df_joined = (
    df_country_gbd.assign(
        un_country_name = lambda x: x.location_name.replace(rename_dict)
    )
    .merge(
      df_country_un_clean
    , how = 'left'
    , left_on='un_country_name'
    , right_on='country_or_area'
    , validate="1:1"    
    )
)

df_joined.to_sql(
    name='un_country_info',
    con=engine,
    schema='db03_clean_tables',
    if_exists='replace',
    index=False,
    chunksize=10000
)
