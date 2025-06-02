
drop table if exists gbd.db03_clean_tables.info_location_country;
create table         gbd.db03_clean_tables.info_location_country as
select
  location_id
, location_name
from gbd.db01_import.info_location_hierarchy
where level = 3
;