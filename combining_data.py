from my_setup import * 
import pandas as pd
import sqlalchemy as sa
import urllib

list_of_dfs = list()
from os import listdir

data_dir = 'download_1\data'

for i_file in range(1, len(listdir(data_dir))+1):
    i_df = pd.read_csv(data_dir + '\IHME-GBD_2019_DATA-b8585613-'+ str(i_file) +'.csv', sep=',')
    list_of_dfs.append(i_df) 

for i_df in list_of_dfs:
    print(i_df.shape)


df_full = pd.concat(list_of_dfs)

df_full.to_csv("df_full.csv", index = False, sep = '\t', encoding='utf-8-sig')

##################################################################################################

df_full = pd.read_csv("df_full.csv", sep = '\t', encoding='utf-8-sig')



params = urllib.parse.quote_plus("DRIVER={SQL Server Native Client 11.0};"
                                 "SERVER=MW-S-HCHE01;"
                                 "DATABASE=global_burden_disease;"
                                 "Trusted_Connection=yes")

engine = sa.create_engine("mssql+pyodbc:///?odbc_connect={}".format(params))

df_full.to_sql('import_2021_05_19', if_exists = 'replace', con = engine, index = False)

##################################################################################################

df_export = pd.read_sql('select * from global_burden_disease.dbo.export_power_bi_v01', con=engine)

print(power_bi_type_cast(df_export), df_export.shape)

df_export.to_csv("df_powerbi.csv", index = False, sep = '\t', encoding='utf-8-sig')




# from my_setup import * 

# list_of_dfs = list()
# from os import listdir

# data_dir = 'download_1\data'

# for i_file in range(1, len(listdir(data_dir))+1):
#     i_df = pd.read_csv(data_dir + '\IHME-GBD_2019_DATA-b8585613-'+ str(i_file) +'.csv', sep=',')
# list_of_dfs.append(i_df) 

# for i_file in :
#     print(i_file, dir_of_dfs[i_file].shape)


# df = pd.concat(list_of_dfs)

# # Reduce do only full countries (no states/regions)
# # adjust variables
# df_measures = df_measures_raw \
#     .loc[lambda df: df.RegionCode.isnull()]\
#     .assign(
#         match_date = lambda x: x.Date.apply(lambda v: datetime.datetime.strptime(str(v), '%Y%m%d')),
#         match_code = lambda x: x.CountryCode,
#         Date = lambda x: x.Date.apply(str)
#     )\
#     .reset_index(drop = True) 

# # ensure that there is no name overlap in the columns before the merge
# col_df_prevalence = set(df_prevalence.columns)
# col_df_measures   = set(df_measures.columns)

# matching_cols = ['match_code', 'match_date']

# overlap_col_prevalence_measures  = (col_df_prevalence - set(matching_cols)).intersection(col_df_measures   - set(matching_cols))

# assert overlap_col_prevalence_measures == set(), "overlap_col_prevalence_measures: " + str(overlap_col_prevalence_measures)


# # merge
# df_merged = df_prevalence\
#     .merge(df_measures  , how = 'inner', on = matching_cols, validate = 'm:1')

# # create dict to replace all non word characters in column names (spaces, \, etc.) by _
# cols_raw = list(df_merged.columns)
# cols_rename_dict = {col: re.sub(r'\W', '_', col) for col in cols_raw} 

# #  make sure renaming wont give two columns the same name
# assert len(cols_raw) == len(set(cols_rename_dict.values()))


# lower_valid_data_date = datetime.datetime.strptime('2020-03-20', '%Y-%m-%d')
# upper_valid_data_date = datetime.datetime.now() - datetime.timedelta(days = 24)
# train_data_date = datetime.datetime.now() - datetime.timedelta(days = 140)


    

# # .loc[lambda df: ~df.match_code.isin(['FRA','AUT','SWE','CZE'])]\
# df_analysis_step_1 = df_merged \
#     .rename(columns = cols_rename_dict, inplace = False) \
#     .loc[lambda df: df.Population >=   5 * 10**6]\
#     .loc[lambda df: df.Population <= 200 * 10**6]\
#     .loc[lambda df: df.match_code.isin(eu_countries)]\
#     .loc[lambda df: df.match_date >= lower_valid_data_date]\
#     .loc[lambda df: df.match_date <= upper_valid_data_date]\
#     .reset_index(drop = True)\
#     .assign(
#         increase_confirmed                        = lambda x: (x.confirmed - x.lag_1_confirmed),
#         increase_confirmed_roll                   = lambda x: x.sort_values(by=['match_date'], ascending=True).groupby(['match_code'])['increase_confirmed'].transform(lambda x: x.rolling(window=35, min_periods=1, center=True, win_type='gaussian').mean(std = 7)),
#         lag_7_increase_confirmed_roll             = lambda x: x.sort_values(by=['match_date'], ascending=True).groupby(['match_code'])['increase_confirmed_roll'].shift(7).fillna(0),
#         valid_growth_data                         = lambda x: np.where((x.increase_confirmed_roll > 20) & (x.lag_7_increase_confirmed_roll >20),1,0),
#         log_growth_increase_confirmed_roll_7_days = lambda x: np.where(x.valid_growth_data == 1, np.log(x.increase_confirmed_roll/x.lag_7_increase_confirmed_roll)/7,np.nan),

#         valid_testing_rate_data                   = lambda x: np.where(x.match_code.isin(['FRA','AUT','SWE','CZE']),0,1),
#         increase_tested                           = lambda x: (x.tested    - x.lag_1_tested),
#         increase_tested_roll                      = lambda x: x.sort_values(by=['match_date'], ascending=True).groupby(['match_code'])['increase_tested'].transform(lambda x: x.rolling(window=35, min_periods=1, center=True, win_type='gaussian').mean(std = 7)),
#         lag_7_increase_tested_roll                = lambda x: x.sort_values(by=['match_date'], ascending=True).groupby(['match_code'])['increase_tested_roll'].shift(7).fillna(0),
#         log_growth_increase_tested_roll_7_days    = lambda x: np.where((x.valid_growth_data == 1) & (x.valid_testing_rate_data == 1), np.log(x.increase_tested_roll/x.lag_7_increase_tested_roll)/7,0),

#         growth_to_predict                         = lambda x: x.log_growth_increase_confirmed_roll_7_days.fillna(0),
#         train                                     = lambda x: (x.match_date <= train_data_date),
#         test                                      = lambda x: (x.match_date >  train_data_date),
#         C6_Stay_at_home_requirements              = lambda x: x.sort_values(by=['match_date'], ascending=True).groupby(['match_code'])['C6_Stay_at_home_requirements'].apply(lambda group: group.interpolate()),
#         observations                              = 1
#     )\
#     .loc[lambda df: df.valid_growth_data == 1]\
#     .reset_index(drop = True)

# df_analysis_step_1.loc[lambda df: df.train].match_code.value_counts()

# df_analysis = df_analysis_step_1

# df_analysis = pd.concat(
#         [df_analysis_step_1, categorical(df_analysis_step_1.match_code, drop=True)]
#     , axis = 1
#     )

# df_analysis.to_csv("df_analysis.csv"      , index = False, sep = '\t', encoding='utf-8-sig')

# categorical(df_analysis.match_code, drop=True)

# # x_vars = list(set(df_analysis.match_code)) + [
# x_vars = [
# # "valid_testing_rate_data",
# # "log_growth_increase_tested_roll_7_days",
# "C1_School_closing",
# "C2_Workplace_closing",
# "C3_Cancel_public_events",
# "C4_Restrictions_on_gatherings",
# "C5_Close_public_transport",
# "C6_Stay_at_home_requirements",
# "C7_Restrictions_on_internal_movement",
# "C8_International_travel_controls",
# "E1_Income_support",
# "E2_Debt_contract_relief",
# # "E3_Fiscal_measures",
# # "E4_International_support",
# "H1_Public_information_campaigns",
# "H2_Testing_policy",
# "H3_Contact_tracing",
# # "H4_Emergency_investment_in_healthcare",
# # "H5_Investment_in_vaccines",
# "H6_Facial_Coverings",
# "H7_Vaccination_policy",
# ]

# df_train = df_analysis.loc[lambda df: df.train]

# est = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=1, random_state=0, loss='ls').fit(df_train[x_vars], df_train[['growth_to_predict']])



# # formula_text = 'growth_to_predict' + ' ~ ' + ' + '.join(x_vars) 
# # model = sm.ols(formula= formula_text, data=df_train).fit()
# # # print(result.params)

# # # df_pred = df_pred \
# # # .assign(**{
# # #     dv_i + '_pred' : 
# # # })
# # print(model.summary())
# # # generate table from summary:
# # results_as_html = models_dict[dv_i].summary().tables[1].as_html()
# # result_df = pd.DataFrame(pd.read_html(results_as_html, header=0, index_col=0)[0]).reset_index()

# # #highlight relevant variable:
# # rel_independent_var = rel_independent_var_dict[dv_i]
# # if rel_independent_var != 'no':
# #     display(result_df.loc[lambda df: df['index'] == rel_independent_var,])

# # #display sorted result table
# # display(result_df.sort_values(by = ['P>|t|']))



# df_prediction = df_analysis.assign(
#     growth_predicted  = lambda x: est.predict(x[x_vars]),
#     # growth_predicted  = lambda x: model.predict(x[x_vars]),
#     deviation_abs     = lambda x: (x.growth_to_predict - x.growth_predicted).abs(),
#     deviation_squared = lambda x: (x.growth_to_predict - x.growth_predicted) **2 ,
# )


# print(df_prediction\
#     .loc[lambda df: df.valid_growth_data == 1]\
#     .groupby(['test'])\
#     [['growth_to_predict', 'growth_predicted', 'deviation_squared', 'deviation_abs',]]\
#     .mean()\
#     *100
# )

# # assert no inf in df
# assert np.isinf(df_prediction.select_dtypes(include=np.number)).any().any() == False
# # check for nulls df_prediction.isnull().sum()



# print(power_bi_type_cast(df_prediction), df_prediction.shape)
# df_prediction.to_csv("df_prediction.csv"      , index = False, sep = '\t', encoding='utf-8-sig')
