drop table if exists gbd.db03_clean_tables.info_age_group;
create table         gbd.db03_clean_tables.info_age_group as
select
distinct
  age_id   age_group_id
, age_name age_group_name
from gbd.db01_import.info_age_to_age_id
;
alter table gbd.db03_clean_tables.info_age_group
add primary key (age_group_id);

drop table if exists gbd.db04_modelling.info_age_group_export;
create table         gbd.db04_modelling.info_age_group_export as
select
  y.age_group_id
, x.*
from (
         select      '<1 year' as age_group_name ,   '00 years' as age_group_name_sorted, '00-14 years' as age_cluster_name_sorted
   union select '12-23 months' as age_group_name ,    '01 year' as age_group_name_sorted, '00-14 years' as age_cluster_name_sorted
   union select    '2-4 years' as age_group_name ,'02-04 years' as age_group_name_sorted, '00-14 years' as age_cluster_name_sorted
   union select    '5-9 years' as age_group_name ,'05-09 years' as age_group_name_sorted, '00-14 years' as age_cluster_name_sorted
   union select  '10-14 years' as age_group_name ,'10-14 years' as age_group_name_sorted, '00-14 years' as age_cluster_name_sorted
   union select  '15-19 years' as age_group_name ,'15-19 years' as age_group_name_sorted, '15-29 years' as age_cluster_name_sorted
   union select  '20-24 years' as age_group_name ,'20-24 years' as age_group_name_sorted, '15-29 years' as age_cluster_name_sorted
   union select  '25-29 years' as age_group_name ,'25-29 years' as age_group_name_sorted, '15-29 years' as age_cluster_name_sorted
   union select  '30-34 years' as age_group_name ,'30-34 years' as age_group_name_sorted, '30-44 years' as age_cluster_name_sorted
   union select  '35-39 years' as age_group_name ,'35-39 years' as age_group_name_sorted, '30-44 years' as age_cluster_name_sorted
   union select  '40-44 years' as age_group_name ,'40-44 years' as age_group_name_sorted, '30-44 years' as age_cluster_name_sorted
   union select  '45-49 years' as age_group_name ,'45-49 years' as age_group_name_sorted, '45-59 years' as age_cluster_name_sorted
   union select  '50-54 years' as age_group_name ,'50-54 years' as age_group_name_sorted, '45-59 years' as age_cluster_name_sorted
   union select  '55-59 years' as age_group_name ,'55-59 years' as age_group_name_sorted, '45-59 years' as age_cluster_name_sorted
   union select  '60-64 years' as age_group_name ,'60-64 years' as age_group_name_sorted, '60-74 years' as age_cluster_name_sorted
   union select  '65-69 years' as age_group_name ,'65-69 years' as age_group_name_sorted, '60-74 years' as age_cluster_name_sorted
   union select  '70-74 years' as age_group_name ,'70-74 years' as age_group_name_sorted, '60-74 years' as age_cluster_name_sorted
   union select  '75-79 years' as age_group_name ,'75-79 years' as age_group_name_sorted, '75+ years' as age_cluster_name_sorted
   union select  '80-84 years' as age_group_name ,'80-84 years' as age_group_name_sorted, '75+ years' as age_cluster_name_sorted
   union select  '85-89 years' as age_group_name ,'85-89 years' as age_group_name_sorted, '75+ years' as age_cluster_name_sorted
   union select  '90-94 years' as age_group_name ,'90-94 years' as age_group_name_sorted, '75+ years' as age_cluster_name_sorted
   union select    '95+ years' as age_group_name ,  '95+ years' as age_group_name_sorted, '75+ years' as age_cluster_name_sorted
) x
left join gbd.db03_clean_tables.info_age_group as y on x.age_group_name = y.age_group_name
where age_group_id != 49 -- duplicate key for '12-23 months' we only need 238 not 49
;

alter table gbd.db04_modelling.info_age_group_export
add primary key (age_group_name);



drop table if exists gbd.db03_clean_tables.info_sex;
create table         gbd.db03_clean_tables.info_sex as
select
*
from (
         select  1 as sex_id, 'male'   as sex_name
   union select  2 as sex_id, 'female' as sex_name
) x
;

alter table gbd.db03_clean_tables.info_sex
add primary key (sex_id);

drop table if exists gbd.db03_clean_tables.info_year;
create table         gbd.db03_clean_tables.info_year as
select
distinct
 year
from gbd.db01_import.population;

alter table gbd.db03_clean_tables.info_year
add primary key (year);

-- create basis table population
drop table if exists gbd.db04_modelling.export_basis_population;
create table         gbd.db04_modelling.export_basis_population as
select
  ye.year
, lc.location_id
, lc.location_name
, ag.age_group_id
, ag.age_group_name_sorted
, ag.age_cluster_name_sorted
, se.sex_id
, se.sex_name
, concat(ye.year, '--', lc.location_id, '--', ag.age_group_id, '--', se.sex_id) population_id
from       gbd.db03_clean_tables.info_year               as ye
cross join gbd.db03_clean_tables.info_location_country   as lc
cross join gbd.db04_modelling.info_age_group_export      as ag
cross join gbd.db03_clean_tables.info_sex                as se
where ye.year           in (select * from gbd.db02_processing.relevant_year          )
and   ag.age_group_name in (select * from gbd.db02_processing.relevant_age_group_name)
and   se.sex_name       in (select * from gbd.db02_processing.relevant_sex_name      )
;

alter table gbd.db04_modelling.export_basis_population
add primary key (location_id, sex_id, age_group_id, year);

-- create basis table measures
drop table if exists gbd.db04_modelling.export_basis_measures;
create table         gbd.db04_modelling.export_basis_measures as
select
  po.*
, ch.l1_cause_id
, ch.l1_cause_name
, ch.l2_cause_id
, ch.l2_cause_name
, ch.l3_cause_id
, ch.l3_cause_name
, ch.l4_cause_id
, ch.l4_cause_name
from       gbd.db04_modelling.export_basis_population    as po
cross join gbd.db03_clean_tables.info_cause_hierarchy_l4 as ch
;

alter table gbd.db04_modelling.export_basis_measures
add primary key (location_id, sex_id, age_group_id, year, l4_cause_id);
