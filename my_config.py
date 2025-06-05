# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import sqlalchemy as sa
from pprint import pprint
import os
import random
import re
import datetime
import json
from sqlalchemy import create_engine

pd.set_option('display.max_rows', 2000)
pd.set_option('display.max_columns', 100)
np.set_printoptions(threshold=1000)


REPO_DIRECTORY = os.path.dirname(__file__)


try:
    with open('private/db_login.json') as json_file:
        db_login = json.load(json_file)
except Exception as e:
    print(e)    

# engine = create_engine('postgresql://' + db_login["user"] + ':' + db_login["pw"] + '@host.docker.internal:5432/gbd')

###############################################################################################################################
## defining functions ###########################################################################################################
#################################################################################################################################


def groupby_count(df, columns, ascending = None):
    """
    returns the data frame grouped by the columns with a count of how of then this grouping occurs
    sorted 
    """
    temp_df = df[columns].fillna('temp_na').groupby(columns).size().reset_index(name = "count")

    if ascending is None:
        return temp_df
    else:
        return temp_df.sort_values(by = "count", ascending = ascending)

def power_bi_type_cast(df):
    type_string = '= Table.TransformColumnTypes(#"Promoted Headers",\n{   \n'
    first = True
    
    
    max_len_c_name = len(max(df.columns, key=len))
    
    for i_c in df.dtypes.iteritems():
        c_name = i_c[0]
        c_type = i_c[1]        
        
        if first:
            type_string += ' ' 
            first = False
        else:
            type_string += ','
            
        type_string += '{"'+c_name+'" '       
        type_string +=' '*(max_len_c_name-len(c_name)) # Ensures that all types start at the same point making it easiert to read
        type_string +=', '
        
        # python type to Power_BI type
        if c_type in ['object', 'bool']:
            type_string += 'type text'
        elif str(c_type) in ['category']:
            type_string += 'type text'
        elif c_type in ['int64', 'int32','int16', 'int8', 'uint64', 'uint32','uint16', 'uint8']:
            type_string += 'Int64.Type'
        elif c_type in ['float64', 'float32']:
            type_string += 'type number'
        elif c_type in ['<M8[ns]', 'datetime64[ns]']:
            type_string += 'type datetime'
        else:
            type_string += 'ERROR type: ' + str(c_type) + ' not defined' 
        type_string += '}\n'        
    type_string += '})\n'
    return type_string

# import urllib
# params = urllib.parse.quote_plus("DRIVER={SQL Server Native Client 11.0};"
#                                  "SERVER=MW-S-HCHE01;"
#                                  "DATABASE=samuel_feder;"
#                                  "Trusted_Connection=yes")

# engine = sa.create_engine("mssql+pyodbc:///?odbc_connect={}".format(params))
