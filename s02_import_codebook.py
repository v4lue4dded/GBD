from os import listdir
import os
path = os.getcwd()
os.chdir(path.split('GBD', 1)[0] + 'GBD')
import my_config as config
import json
import pandas as pd
from zipfile import ZipFile
import urllib
from os.path import join as opj


engine = config.engine
con = engine.connect()

codebook_dir =  opj(config.REPO_DIRECTORY,'IHME_GBD_2019_CODEBOOK')

listdir(codebook_dir)

for i_cb in listdir(codebook_dir):
    print(i_cb)
    if i_cb[-11:] == '_saved.xlsx':
        cb_name = 'cb_' + i_cb[14:-23].lower()
        print(cb_name)
        df = pd.read_excel(opj(codebook_dir, i_cb))
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        df.to_sql(name=cb_name, con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)


