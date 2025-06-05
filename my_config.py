# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
from os.path import join as opj
import duckdb
import os

pd.set_option("display.max_rows", 2000)
pd.set_option("display.max_columns", 100)
np.set_printoptions(threshold=1000)


REPO_DIRECTORY = os.path.dirname(__file__)
db_path = opj(REPO_DIRECTORY, "data", "duckdb", "gdb_database.duckdb")
duckdb_con = duckdb.connect(db_path)
