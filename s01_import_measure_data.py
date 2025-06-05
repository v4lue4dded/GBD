import os
from os import listdir
from os.path import join as opj
import json
import pandas as pd

# from sqlalchemy import create_engine
from zipfile import ZipFile
import time

# from io import StringIO
# import psycopg2
import duckdb
import my_config as config


# ────────────────────────────────────────────────────────────────
# Linux DB setup  ➜  switch from PostgreSQL to DuckDB
# ────────────────────────────────────────────────────────────────
db_path = opj(config.REPO_DIRECTORY, "data", "duckdb", "gdb_database.duckdb")
con = duckdb.connect(db_path)

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

disk_write_start = time.time()
parquet_path = opj(intermediate_dir, "df_measure.parquet")
df_measure.to_parquet(parquet_path)
print(f"Wrote to disk in {time.time() - disk_write_start:.2f} seconds")

disk_read_start = time.time()
df_measure = pd.read_parquet(parquet_path)
print(f"Read from disk in {time.time() - disk_read_start:.2f} seconds")

print(df_measure.shape)

sql_start = time.time()
print("Uploading to DuckDB…")

con.register("df_measure_view", df_measure)
con.execute(
    """                                             
    CREATE SCHEMA IF NOT EXISTS db01_import;
    CREATE OR REPLACE TABLE db01_import.measure AS
    SELECT * FROM df_measure_view;
"""
)
con.unregister("df_measure_view")

print(f"Saved to DuckDB in {time.time() - sql_start:.2f} seconds")

total_time = time.time() - start_time
print(f"Script completed in {total_time:.2f} seconds")

con.close()
