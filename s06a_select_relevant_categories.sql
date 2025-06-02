drop table if exists gbd.db02_processing.relevant_year;
create table         gbd.db02_processing.relevant_year as
select
*
from (
      select 1980 as year
union select 1985 as year
union select 1990 as year
union select 1995 as year
union select 2000 as year
union select 2005 as year
union select 2010 as year
union select 2015 as year
union select 2019 as year
union select 2020 as year
union select 2021 as year
) x
;

drop table if exists gbd.db02_processing.relevant_age_group_name;
create table         gbd.db02_processing.relevant_age_group_name as
select
*
from (
      select     '<1 year' as age_group_name
union select   '1-4 years' as age_group_name
union select   '5-9 years' as age_group_name
union select '10-14 years' as age_group_name
union select '15-19 years' as age_group_name
union select '20-24 years' as age_group_name
union select '25-29 years' as age_group_name
union select '30-34 years' as age_group_name
union select '35-39 years' as age_group_name
union select '40-44 years' as age_group_name
union select '45-49 years' as age_group_name
union select '50-54 years' as age_group_name
union select '55-59 years' as age_group_name
union select '60-64 years' as age_group_name
union select '65-69 years' as age_group_name
union select '70-74 years' as age_group_name
union select '75-79 years' as age_group_name
union select '80-84 years' as age_group_name
union select '85-89 years' as age_group_name
union select '90-94 years' as age_group_name
union select   '95+ years' as age_group_name
) x
;

drop table if exists gbd.db02_processing.relevant_sex_name;
create table         gbd.db02_processing.relevant_sex_name as
select
*
from (
      select 'female' as sex_name
union select 'male'   as sex_name
) x
;

