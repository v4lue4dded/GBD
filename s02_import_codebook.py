from os import listdir
import os
import my_config as config
import json
import pandas as pd
from zipfile import ZipFile
import urllib
from os.path import join as opj


engine = config.engine
con = engine.connect()

codebook_dir =  opj(config.REPO_DIRECTORY,'GBD_2021_DATA_TOOLS_GUIDE')

listdir(codebook_dir)

for i_cb in listdir(codebook_dir):
    print(i_cb)
    if i_cb[-4:] == '.csv':
        cb_name = 'info_' + i_cb[:-5].lower()
        print(cb_name)
        df = pd.read_csv(opj(codebook_dir, i_cb))
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        df.to_sql(name=cb_name, con=engine, schema='db01_import', if_exists='replace', index=False, chunksize=10000)