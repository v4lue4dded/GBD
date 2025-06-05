
drop table if exists db03_clean_tables.info_location_country;
create table         db03_clean_tables.info_location_country as
select
  location_id
, location_name
from db01_import.info_location_hierarchy
where level = 3
;