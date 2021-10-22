drop table if exists gbd.db03_clean_tables.pop_groups_country;
create table         gbd.db03_clean_tables.pop_groups_country as
select
  po.year_id as year
, po.location_id
, po.location_name
, po.age_group_id
, po.age_group_name
, po.sex_id
, po.sex_name
, concat(po.year_id, '--', po.location_id, '--', po.age_group_id, '--', po.sex_id) population_id
, po.val     as pop_val
, po.upper   as pop_upper
, po.lower   as pop_lower
from      gbd.db01_import.pop_age_year_groups        po
inner join gbd.db03_clean_tables.cb_location_country lc on po.location_id = lc.location_id
;

alter table gbd.db03_clean_tables.pop_groups_country
add primary key (location_id, sex_id, age_group_id, year);

drop table if exists gbd.db03_clean_tables.cb_age_group;
create table         gbd.db03_clean_tables.cb_age_group as
select
distinct
  age_group_id
, age_group_name
from gbd.db03_clean_tables.pop_groups_country
;

alter table gbd.db03_clean_tables.cb_age_group
add primary key (age_group_id);


drop table if exists gbd.db03_clean_tables.cb_sex;
create table         gbd.db03_clean_tables.cb_sex as
select
distinct
  sex_id
, sex_name
from gbd.db03_clean_tables.pop_groups_country;

alter table gbd.db03_clean_tables.cb_sex
add primary key (sex_id);

drop table if exists gbd.db03_clean_tables.cb_year;
create table         gbd.db03_clean_tables.cb_year as
select
distinct
 year
from gbd.db03_clean_tables.pop_groups_country;

alter table gbd.db03_clean_tables.cb_year
add primary key (year);


drop table if exists gbd.db04_modelling.export_population;
create table         gbd.db04_modelling.export_population as
select
*
from gbd.db03_clean_tables.pop_groups_country
where year           in (select * from gbd.db02_processing.relevant_year          )
and   age_group_name in (select * from gbd.db02_processing.relevant_age_group_name)
and   sex_name       in (select * from gbd.db02_processing.relevant_sex_name      )
;

alter table gbd.db04_modelling.export_population
add primary key (location_id, sex_id, age_group_id, year);

select
year,
 sum(pop_val)
from gbd.db04_modelling.export_population
group by
year
order by year

6151964698