drop table if exists gbd.db02_processing.cb_location_hierarchy_l4;
create table         gbd.db02_processing.cb_location_hierarchy_l4 as
select
  l4.location_id             as l4_location_id
, l4.location_name           as l4_location_name
, l3.location_id             as l3_location_id
, l3.location_name           as l3_location_name
, l2.location_id             as l2_location_id
, l2.location_name           as l2_location_name
, l1.location_id             as l1_location_id
, l1.location_name           as l1_location_name
from      (select * from gbd.db01_import.cb_gbd_location_hierarchy where level = 4) l4
full join (select * from gbd.db01_import.cb_gbd_location_hierarchy where level = 3) l3 on l4.parent_id = l3.location_id
full join (select * from gbd.db01_import.cb_gbd_location_hierarchy where level = 2) l2 on l3.parent_id = l2.location_id
full join (select * from gbd.db01_import.cb_gbd_location_hierarchy where level = 1) l1 on l2.parent_id = l1.location_id
where l1.location_id not in (
 44637 -- Low SDI
,44634 -- High-middle SDI
,44636 -- Low-middle SDI
,44639 -- Middle SDI
,44635 -- High SDI
)
;

drop table if exists gbd.db02_processing.cb_location_hierarchy_l3;
create table         gbd.db02_processing.cb_location_hierarchy_l3 as
select
distinct
  l3_location_id
, l3_location_name
, l2_location_id
, l2_location_name
, l1_location_id
, l1_location_name
from gbd.db02_processing.cb_location_hierarchy_l4
;

drop table if exists gbd.db02_processing.cb_location_hierarchy_l2;
create table         gbd.db02_processing.cb_location_hierarchy_l2 as
select
distinct
  l2_location_id
, l2_location_name
, l1_location_id
, l1_location_name
from gbd.db02_processing.cb_location_hierarchy_l4
;

drop table if exists gbd.db02_processing.cb_location_hierarchy_l1;
create table         gbd.db02_processing.cb_location_hierarchy_l1 as
select
distinct
  l1_location_id
, l1_location_name
from gbd.db02_processing.cb_location_hierarchy_l4
;

-- alter table gbd.db02_processing.cb_location_hierarchy_l4 add primary key (l4_location_id);
alter table gbd.db02_processing.cb_location_hierarchy_l3 add primary key (l3_location_id);
alter table gbd.db02_processing.cb_location_hierarchy_l2 add primary key (l2_location_id);
alter table gbd.db02_processing.cb_location_hierarchy_l1 add primary key (l1_location_id);


-- checking
select *
from (
      select (select count(*) from gbd.db01_import.cb_gbd_location_hierarchy where level = 4) freq_import, (select count(*) from gbd.db02_processing.cb_location_hierarchy_l4) as freq_clean, 'l4' as level
union select (select count(*) from gbd.db01_import.cb_gbd_location_hierarchy where level = 3) freq_import, (select count(*) from gbd.db02_processing.cb_location_hierarchy_l3) as freq_clean, 'l3' as level
union select (select count(*) from gbd.db01_import.cb_gbd_location_hierarchy where level = 2) freq_import, (select count(*) from gbd.db02_processing.cb_location_hierarchy_l2) as freq_clean, 'l2' as level
union select (select count(*) from gbd.db01_import.cb_gbd_location_hierarchy where level = 1) freq_import, (select count(*) from gbd.db02_processing.cb_location_hierarchy_l1) as freq_clean, 'l1' as level
) x
order by level
;

drop table if exists gbd.db03_clean_tables.cb_location_country;
create table         gbd.db03_clean_tables.cb_location_country as
select
  l3_location_id   as location_id
, l3_location_name as location_name
from gbd.db02_processing.cb_location_hierarchy_l3