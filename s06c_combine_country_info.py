# -*- coding: utf-8 -*-
from os import listdir
import os
import my_config as config
import json
import pandas as pd
import urllib
from os.path import join as opj

con = config.duckdb_con
con.execute("CREATE SCHEMA IF NOT EXISTS db03_clean_tables;")

# ───────────────────────────────────────────────────────────────
# pull GBD country table from DuckDB
# ───────────────────────────────────────────────────────────────
df_country_gbd = con.execute(
    """
    SELECT *
    FROM db03_clean_tables.info_location_country
"""
).df() 

df_country_un = pd.read_excel(opj(config.REPO_DIRECTORY, "UNSD_Methodology_saved_incl_Taiwan.xlsx"))

df_country_un.columns = (
    df_country_un.columns.str.strip()
    .str.lower()
    .str.replace(" ", "_", regex=False)
    .str.replace("(", "", regex=False)
    .str.replace(")", "", regex=False)
    .str.replace("-", "_", regex=False)
    .str.replace("/", "or", regex=False)
)

df_country_un_clean = df_country_un.assign(
    least_developed_countries_ldc=lambda x: x.least_developed_countries_ldc.replace("x", "1").fillna("0").astype(int),
    land_locked_developing_countries_lldc=lambda x: x.land_locked_developing_countries_lldc.replace("x", "1")
    .fillna("0")
    .astype(int),
    small_island_developing_states_sids=lambda x: x.small_island_developing_states_sids.replace("x", "1")
    .fillna("0")
    .astype(int),
)[
    [
        "country_or_area",
        "iso_alpha2_code",
        "iso_alpha3_code",
        "region_code",
        "region_name",
        "sub_region_code",
        "sub_region_name",
        "intermediate_region_code",
        "intermediate_region_name",
        "least_developed_countries_ldc",
        "land_locked_developing_countries_lldc",
        "small_island_developing_states_sids",
        "developed_or_developing_countries",
    ]
]

# ───────────────────────────────────────────────────────────────
# quick mismatch check (unchanged)
# ───────────────────────────────────────────────────────────────
set_country_gbd = set(df_country_gbd.location_name)
set_country_un_clean = set(df_country_un_clean.country_or_area)

print(df_country_gbd.shape)
print(df_country_un_clean.shape)
print(len(set_country_gbd))
print(len(set_country_un_clean))

set_country_gbd - set_country_un_clean
set_country_un_clean - set_country_gbd

rename_dict = {
    "Côte d'Ivoire": "Côte d’Ivoire",
    "Palestine": "State of Palestine",
    "Taiwan (Province of China)": "Taiwan",
    "Türkiye": "Turkey",
    "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
}

df_joined = df_country_gbd.assign(un_country_name=lambda x: x.location_name.replace(rename_dict)).merge(
    df_country_un_clean, how="left", left_on="un_country_name", right_on="country_or_area", validate="1:1"
)

con.register("df_tmp", df_joined)  # NEW
con.execute(
    """
    CREATE OR REPLACE TABLE db03_clean_tables.un_country_info AS
    SELECT * FROM df_tmp;
"""
)  # NEW
con.unregister("df_tmp")  # NEW

con.close()  # NEW
