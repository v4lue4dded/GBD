import os
from os import listdir
from os.path import join as opj
import json
import pandas as pd
from sqlalchemy import create_engine
from zipfile import ZipFile
import time
import my_config as config

# Linux DB setup
engine = config.engine
con = engine.connect()

##################################################################################################

start_time = time.time()

download_ids = ["9c14765c", "601d6a66"]
download_dir = opj(config.REPO_DIRECTORY, "data", "download", "measure")
intermediate_dir = opj(config.REPO_DIRECTORY, "data", "intermediate")

list_of_dfs = list()

print("Loading and parsing CSVs from ZIPs...")
for i_file in listdir(download_dir):
    for download_id in download_ids:
        if download_id in i_file:
            print(f"  Processing: {i_file}")
            file_name = i_file.split(".")[0]
            zip_file = ZipFile(opj(download_dir, file_name) + ".zip")
            i_df = pd.read_csv(zip_file.open(file_name + ".csv"), sep=",")
            list_of_dfs.append(i_df)
print(f"Finished loading files in {time.time() - start_time:.2f} seconds")

print("Dataframe shapes:")
for i_df in list_of_dfs:
    print(f"  {i_df.shape}")

concat_start = time.time()
df_measure = pd.concat(list_of_dfs)
print(f"Concatenated dataframes in {time.time() - concat_start:.2f} seconds")

# Optional save
# df_measure.to_csv(opj(intermediate_dir,f"df_measure"), index=False, sep='\t', encoding='utf-8-sig')

sql_start = time.time()
df_measure.to_sql(name="measure", con=engine, schema="db01_import", if_exists="replace", index=False, chunksize=10000)
print(f"Saved to SQL in {time.time() - sql_start:.2f} seconds")

total_time = time.time() - start_time
print(f"Script completed in {total_time:.2f} seconds")
