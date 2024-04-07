
df_measure.to_parquet(f"{export_dir}df_measure.parquet", index=False)
df_measure_narrow_encoded.to_parquet(f"{export_dir}df_measure_narrow_encoded.parquet", index=False)
df_measure_narrow_encoded.loc[:10,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny10.parquet", index=False)
df_measure_narrow_encoded.loc[:100,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny100.parquet", index = False)
df_measure_narrow_encoded.loc[:1000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny1000.parquet", index = False)
df_measure_narrow_encoded.loc[:10000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny10000.parquet", index = False)
df_measure_narrow_encoded.loc[:100000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny100000.parquet", index = False)
df_measure_narrow_encoded.loc[:100000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny100000.parquet", index = False)


df_measure_narrow_encoded.loc[:120001,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny120001.parquet", index = False)
df_measure_narrow_encoded.loc[:125000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny125000.parquet", index = False)


df_measure_narrow_encoded.loc[125000:125125,]

df_measure_narrow_encoded.loc[:125125,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny125125.parquet", index = False)



# these files still work
df_measure_narrow_encoded.loc[:125000,].to_parquet(f"{export_dir}df_still_working_in_parquet_125000.parquet.txt", index = False)
df_measure_narrow_encoded.loc[:125000,].to_csv(f"{export_dir}df_still_working_in_parquet_125000.csv", index = False, encoding='utf-8-sig')

# these files don't work
df_measure_narrow_encoded.loc[:125125,].to_parquet(f"{export_dir}df_not_working_in_parquet_125125.parquet.txt", index = False)
df_measure_narrow_encoded.loc[:125125,].to_csv(f"{export_dir}df_not_working_in_parquet_125125.csv", index = False, encoding='utf-8-sig')


df_measure_narrow_encoded.loc[10000:125125,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny10000-125125.parquet", index = False)

df_measure_narrow_encoded.loc[:125250,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny125250.parquet", index = False)
df_measure_narrow_encoded.loc[:125500,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny125500.parquet", index = False)
df_measure_narrow_encoded.loc[:126000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny126000.parquet", index = False)
df_measure_narrow_encoded.loc[:127500,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny127500.parquet", index = False)
df_measure_narrow_encoded.loc[:131000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny131000.parquet", index = False)
df_measure_narrow_encoded.loc[:131072,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny131072.parquet", index = False)
df_measure_narrow_encoded.loc[:131099,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny131099.parquet", index = False)


df_measure_narrow_encoded.loc[:150000,].to_parquet(f"{export_dir}df_measure_narrow_encoded_tiny150000.parquet", index = False)


df_measure_narrow_encoded.loc[800000:1000000,].shape.to_parquet(f"{export_dir}df_measure_narrow_encoded_test.parquet", index = False)




df_measure_narrow_encoded.loc[:10,].to_csv(f"{export_dir}df_measure_narrow_encoded_tiny100000000.csv", index = False, encoding='utf-8-sig')
