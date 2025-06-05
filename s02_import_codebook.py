# -*- coding: utf-8 -*-
from os import listdir
import my_config as config
import pandas as pd
from os.path import join as opj

con = config.duckdb_con

codebook_dir = opj(config.REPO_DIRECTORY, "GBD_2021_DATA_TOOLS_GUIDE")

for i_cb in listdir(codebook_dir):
    print(i_cb)
    if i_cb.endswith(".csv"):
        cb_name = "info_" + i_cb[:-4].lower()
        print(cb_name)
        df = pd.read_csv(opj(codebook_dir, i_cb))
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
        con.register("df_tmp", df)
        con.execute(
            f"""
            CREATE OR REPLACE TABLE db01_import.{cb_name} AS
            SELECT * FROM df_tmp;
        """
        )
        con.unregister("df_tmp")

con.close()
