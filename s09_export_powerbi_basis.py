import os
import my_config as config
import json
import pandas as pd
from sqlalchemy import create_engine
import math
from os.path import join as opj

engine = config.engine
con = engine.connect()



def encode_dataframe(df, categorical_cols):
    """
    Encode categorical columns in the DataFrame to integers.

    Parameters:
    - df: pd.DataFrame, the original DataFrame.
    - categorical_cols: list of str, the list of categorical column names to be encoded.

    Returns:
    - df_encoded: pd.DataFrame, the DataFrame with categorical columns encoded.
    - decoding_dict: dict, containing information for row decoding.
    """
    df_encoded = df.copy()
    decoding_dict = {}
    columns_decoding = {v: k for k, v in enumerate(df_encoded.columns)}  # Always initialize for return structure
    
    for col in categorical_cols:
        codes, uniques = pd.factorize(df_encoded[col])        
        df_encoded[col] = codes
        decoding_dict[col] = {code: category for code, category in enumerate(uniques)}
        
    return df_encoded, decoding_dict

def save_df_in_chunks(df, chunk_size, export_location):
    """
    Splits a DataFrame into chunks and saves each chunk as a separate JSON file.
    Additionally, saves a list of these chunk file names (without paths) in a separate JSON file.
    
    Parameters:
    - df: The pandas DataFrame to be split and saved.
    - chunk_size: The maximum number of rows each chunk should contain.
    - export_location: The base path and filename prefix for the exported files.
    """
    num_chunks = math.ceil(len(df) / chunk_size)
    chunk_file_names = []  # List to store just the file names of the chunks

    for i in range(num_chunks):
        chunk = df[i*chunk_size:(i+1)*chunk_size]
        chunk_file_name = f'{export_location}_chunk_{i}.json'
        chunk.to_json(chunk_file_name, orient='split', index=False)
        # chunk_file_name = f'{export_location}_chunk_{i}.parquet'
        # chunk.to_parquet(chunk_file_name, index=False)        
        chunk_file_names.append(os.path.basename(chunk_file_name))
        print(f"Saved {chunk_file_name}")
    return chunk_file_names

export_dir = opj(config.REPO_DIRECTORY, 'docs','data_doc')

# df_basis = pd.read_sql('select * from gbd.db04_modelling.export_basis_population', con=engine)
# df_basis.to_csv(f"{export_dir}df_basis.csv", index = False, sep = '\t', encoding='utf-8-sig')
# print(config.power_bi_type_cast(df_basis), df_basis.shape)

df_population = pd.read_sql('select * from gbd.db04_modelling.export_population', con=engine)
df_population.to_csv(opj(export_dir,"df_population.csv"), index = False, sep = '\t', encoding='utf-8-sig')
# print(config.power_bi_type_cast(df_population), df_population.shape)

df_measure = pd.read_sql('select * from gbd.db04_modelling.export_long', con=engine)
# df_measure.to_csv(f"{export_dir}df_measure.csv", index = False, sep = '\t', encoding='utf-8-sig')
df_measure_narrow = df_measure[[
'year',
'location_name',
'region_name',
'sub_region_name',
'age_group_name_sorted',
'age_cluster_name_sorted',
'sex_name',
'l1_cause_name',
'l2_cause_name',
'deaths_val',
'deaths_lower',
'deaths_upper',
'yll_val',
'yll_lower',
'yll_upper',
'deaths_present',
'yll_present'
]].assign(
deaths_val = lambda x: round(x.deaths_val), 
deaths_lower = lambda x: round(x.deaths_lower), 
deaths_upper = lambda x: round(x.deaths_upper), 
yll_val = lambda x: round(x.yll_val), 
yll_lower = lambda x: round(x.yll_lower), 
yll_upper = lambda x: round(x.yll_upper), 
)

categorical_cols = ['year', 'location_name', 'region_name', 'sub_region_name', 'age_group_name_sorted', 'age_cluster_name_sorted', 'sex_name', 'l1_cause_name', 'l2_cause_name']
df_measure_narrow_encoded, decoding_dict = encode_dataframe(df_measure_narrow, categorical_cols)

chunk_file_names = save_df_in_chunks(df_measure_narrow_encoded, 400000, opj(export_dir,"df_measure_narrow_encoded"))
with open(opj(export_dir,"df_measure_narrow_import_dict.json"), 'w') as json_file:
    json.dump({
        "decoding_dict": decoding_dict,
        "chunk_file_names": chunk_file_names,
        }, json_file)

df_measure_narrow_small_encoded = df_measure_narrow_encoded.loc[lambda df: df.location_name.isin(range(1,5)),]
chunk_file_names_small = save_df_in_chunks(df_measure_narrow_small_encoded, 20000, opj(export_dir,"df_measure_narrow_small_encoded"))
with open(opj(export_dir,"df_measure_narrow_small_import_dict.json"), 'w') as json_file:
    json.dump({
        "decoding_dict": decoding_dict,
        "chunk_file_names": chunk_file_names_small,
        }, json_file)

df_un_country_info = pd.read_sql('select * from gbd.db03_clean_tables.un_country_info', con=engine)
df_un_country_info.to_csv(opj(export_dir,"df_un_country_info.csv"), index = False, sep = '\t', encoding='utf-8-sig')
# print(config.power_bi_type_cast(df_un_country_info), df_un_country_info.shape)
