drop table if exists gbd.db02_processing.relevant_year;
create table         gbd.db02_processing.relevant_year as
select
*
from (
      select 1990 as year
union select 1995 as year
union select 2000 as year
union select 2005 as year
union select 2010 as year
union select 2015 as year
union select 2019 as year
) x
;

drop table if exists gbd.db02_processing.relevant_age_group_name;
create table         gbd.db02_processing.relevant_age_group_name as
select
*
from (
      select '<1 year'  as age_group_name
union select '1 to 4'   as age_group_name
union select '5 to 9'   as age_group_name
union select '10 to 14' as age_group_name
union select '15 to 19' as age_group_name
union select '20 to 24' as age_group_name
union select '25 to 29' as age_group_name
union select '30 to 34' as age_group_name
union select '35 to 39' as age_group_name
union select '40 to 44' as age_group_name
union select '45 to 49' as age_group_name
union select '50 to 54' as age_group_name
union select '55 to 59' as age_group_name
union select '60 to 64' as age_group_name
union select '65 to 69' as age_group_name
union select '70 to 74' as age_group_name
union select '75 to 79' as age_group_name
union select '80 to 84' as age_group_name
union select '85 to 89' as age_group_name
union select '90 to 94' as age_group_name
union select '95 plus'  as age_group_name
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

