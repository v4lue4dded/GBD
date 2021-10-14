drop table if exists gbd.db03_clean_tables.pop_groups_country;
create table         gbd.db03_clean_tables.pop_groups_country as
select
  po.location_id
, po.location_name
, po.sex_id
, po.sex_name
, po.age_group_id
, po.age_group_name
, po.year_id as year
, po.val     as pop_val
, po.upper   as pop_upper
, po.lower   as pop_lower
from      gbd.db01_import.pop_age_year_groups        po
inner join gbd.db03_clean_tables.cb_location_country lc on po.location_id = lc.location_id
;

alter table gbd.db03_clean_tables.pop_groups_country
add primary key (location_id, sex_id, age_group_id, year);
