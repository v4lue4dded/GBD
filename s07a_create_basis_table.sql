drop table if exists gbd.db03_clean_tables.cb_age_group;
create table         gbd.db03_clean_tables.cb_age_group as
select
distinct
  age_group_id
, age_group_name
from gbd.db01_import.pop_age_year_groups
;

alter table gbd.db03_clean_tables.cb_age_group
add primary key (age_group_id);

drop table if exists gbd.db04_modelling.cb_age_group_export;
create table         gbd.db04_modelling.cb_age_group_export as
select
*
from (
         select  28 as age_group_id ,  '<1 year' as age_group_name ,'00 years' as age_group_name_sorted, '00 to 14' as age_cluster_name_sorted
   union select   5 as age_group_id ,   '1 to 4' as age_group_name ,'01 to 04' as age_group_name_sorted, '00 to 14' as age_cluster_name_sorted
   union select   6 as age_group_id ,   '5 to 9' as age_group_name ,'05 to 09' as age_group_name_sorted, '00 to 14' as age_cluster_name_sorted
   union select   7 as age_group_id , '10 to 14' as age_group_name ,'10 to 14' as age_group_name_sorted, '00 to 14' as age_cluster_name_sorted
   union select   8 as age_group_id , '15 to 19' as age_group_name ,'15 to 19' as age_group_name_sorted, '15 to 29' as age_cluster_name_sorted
   union select   9 as age_group_id , '20 to 24' as age_group_name ,'20 to 24' as age_group_name_sorted, '15 to 29' as age_cluster_name_sorted
   union select  10 as age_group_id , '25 to 29' as age_group_name ,'25 to 29' as age_group_name_sorted, '15 to 29' as age_cluster_name_sorted
   union select  11 as age_group_id , '30 to 34' as age_group_name ,'30 to 34' as age_group_name_sorted, '30 to 44' as age_cluster_name_sorted
   union select  12 as age_group_id , '35 to 39' as age_group_name ,'35 to 39' as age_group_name_sorted, '30 to 44' as age_cluster_name_sorted
   union select  13 as age_group_id , '40 to 44' as age_group_name ,'40 to 44' as age_group_name_sorted, '30 to 44' as age_cluster_name_sorted
   union select  14 as age_group_id , '45 to 49' as age_group_name ,'45 to 49' as age_group_name_sorted, '45 to 59' as age_cluster_name_sorted
   union select  15 as age_group_id , '50 to 54' as age_group_name ,'50 to 54' as age_group_name_sorted, '45 to 59' as age_cluster_name_sorted
   union select  16 as age_group_id , '55 to 59' as age_group_name ,'55 to 59' as age_group_name_sorted, '45 to 59' as age_cluster_name_sorted
   union select  17 as age_group_id , '60 to 64' as age_group_name ,'60 to 64' as age_group_name_sorted, '60 to 74' as age_cluster_name_sorted
   union select  18 as age_group_id , '65 to 69' as age_group_name ,'65 to 69' as age_group_name_sorted, '60 to 74' as age_cluster_name_sorted
   union select  19 as age_group_id , '70 to 74' as age_group_name ,'70 to 74' as age_group_name_sorted, '60 to 74' as age_cluster_name_sorted
   union select  20 as age_group_id , '75 to 79' as age_group_name ,'75 to 79' as age_group_name_sorted, '75 plus' as age_cluster_name_sorted
   union select  30 as age_group_id , '80 to 84' as age_group_name ,'80 to 84' as age_group_name_sorted, '75 plus' as age_cluster_name_sorted
   union select  31 as age_group_id , '85 to 89' as age_group_name ,'85 to 89' as age_group_name_sorted, '75 plus' as age_cluster_name_sorted
   union select  32 as age_group_id , '90 to 94' as age_group_name ,'90 to 94' as age_group_name_sorted, '75 plus' as age_cluster_name_sorted
   union select 235 as age_group_id ,  '95 plus' as age_group_name ,'95 plus'  as age_group_name_sorted, '75 plus' as age_cluster_name_sorted
) x
;

alter table gbd.db04_modelling.cb_age_group_export
add primary key (age_group_id);


drop table if exists gbd.db03_clean_tables.cb_sex;
create table         gbd.db03_clean_tables.cb_sex as
select
distinct
  sex_id
, sex_name
from gbd.db01_import.pop_age_year_groups;

alter table gbd.db03_clean_tables.cb_sex
add primary key (sex_id);

drop table if exists gbd.db03_clean_tables.cb_year;
create table         gbd.db03_clean_tables.cb_year as
select
distinct
 year_id as year
from gbd.db01_import.pop_age_year_groups;

alter table gbd.db03_clean_tables.cb_year
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
from       gbd.db03_clean_tables.cb_year               as ye
cross join gbd.db03_clean_tables.cb_location_country   as lc
cross join gbd.db04_modelling.cb_age_group_export      as ag
cross join gbd.db03_clean_tables.cb_sex                as se
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
from       gbd.db04_modelling.export_basis_population as po
cross join gbd.db03_clean_tables.cb_cause_hierarchy_l2 as ch
;

alter table gbd.db04_modelling.export_basis_measures
add primary key (location_id, sex_id, age_group_id, year, l2_cause_id);
