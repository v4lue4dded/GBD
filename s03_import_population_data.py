# -*- coding: utf-8 -*-
from os import listdir
import my_config as config
import pandas as pd

from zipfile import ZipFile
from os.path import join as opj

con = config.duckdb_con
con.execute("CREATE SCHEMA IF NOT EXISTS db01_import;")

##################################################################################################

download_ids = ["d04b0831"]

download_dir = opj(config.REPO_DIRECTORY, "data", "download", "population")
intermediate_dir = opj(config.REPO_DIRECTORY, "data", "intermediate")

list_of_dfs = list()
for i_file in listdir(download_dir):
    for download_id in download_ids:
        if download_id in i_file:
            print(i_file)
            file_name = i_file.split(".")[0]
            zip_file = ZipFile(opj(download_dir, file_name) + ".zip")
            i_df = pd.read_csv(zip_file.open(file_name + ".csv"), sep=",")
            list_of_dfs.append(i_df)

for i_df in list_of_dfs:
    print(i_df.shape)

df_population = pd.concat(list_of_dfs)

con.register("df_tmp", df_population)
con.execute(
    """
    CREATE OR REPLACE TABLE db01_import.population AS
    SELECT * FROM df_tmp;
"""
)
con.unregister("df_tmp")

##################################################################################################

con.close()
