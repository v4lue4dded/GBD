drop table if exists gbd.db03_clean_tables.cb_cause_hierarchy_l4;
create table         gbd.db03_clean_tables.cb_cause_hierarchy_l4 as
select
  l4.cause_id      as l4_cause_id
, l4.cause_name    as l4_cause_name
, l4.cause_outline as l4_cause_outline
, l3.cause_id      as l3_cause_id
, l3.cause_name    as l3_cause_name
, l3.cause_outline as l3_cause_outline
, l2.cause_id      as l2_cause_id
, l2.cause_name    as l2_cause_name
, l2.cause_outline as l2_cause_outline
, l1.cause_id      as l1_cause_id
, l1.cause_name    as l1_cause_name
, l1.cause_outline as l1_cause_outline
from      (select * from gbd.db01_import.cb_cause_hierarchy where level = 4) l4
full join (select * from gbd.db01_import.cb_cause_hierarchy where level = 3) l3 on l4.parent_id = l3.cause_id
full join (select * from gbd.db01_import.cb_cause_hierarchy where level = 2) l2 on l3.parent_id = l2.cause_id
full join (select * from gbd.db01_import.cb_cause_hierarchy where level = 1) l1 on l2.parent_id = l1.cause_id
where l1.cause_outline not in (
 'D'
,'E'
,'F'
,'G'
)
;
select *
from gbd.db03_clean_tables.cb_cause_hierarchy_l4


drop table if exists gbd.db03_clean_tables.cb_cause_hierarchy_l3;
create table         gbd.db03_clean_tables.cb_cause_hierarchy_l3 as
select
distinct
  l3_cause_id
, l3_cause_name
, l3_cause_outline
, l2_cause_id
, l2_cause_name
, l2_cause_outline
, l1_cause_id
, l1_cause_name
, l1_cause_outline
from gbd.db03_clean_tables.cb_cause_hierarchy_l4
;

drop table if exists gbd.db03_clean_tables.cb_cause_hierarchy_l2;
create table         gbd.db03_clean_tables.cb_cause_hierarchy_l2 as
select
distinct
  l2_cause_id
, l2_cause_name
, l2_cause_outline
, l1_cause_id
, l1_cause_name
, l1_cause_outline
from gbd.db03_clean_tables.cb_cause_hierarchy_l4
;

drop table if exists gbd.db03_clean_tables.cb_cause_hierarchy_l1;
create table         gbd.db03_clean_tables.cb_cause_hierarchy_l1 as
select
distinct
  l1_cause_id
, l1_cause_name
, l1_cause_outline
from gbd.db03_clean_tables.cb_cause_hierarchy_l4
;

-- alter table gbd.db03_clean_tables.cb_cause_hierarchy_l4 add primary key (l4_cause_id);
alter table gbd.db03_clean_tables.cb_cause_hierarchy_l3 add primary key (l3_cause_id);
alter table gbd.db03_clean_tables.cb_cause_hierarchy_l2 add primary key (l2_cause_id);
alter table gbd.db03_clean_tables.cb_cause_hierarchy_l1 add primary key (l1_cause_id);


-- checking
select *
from (
      select (select count(*) from gbd.db01_import.cb_cause_hierarchy where level = 4) freq_import, (select count(*) from gbd.db03_clean_tables.cb_cause_hierarchy_l4) as freq_clean, 'l4' as level
union select (select count(*) from gbd.db01_import.cb_cause_hierarchy where level = 3) freq_import, (select count(*) from gbd.db03_clean_tables.cb_cause_hierarchy_l3) as freq_clean, 'l3' as level
union select (select count(*) from gbd.db01_import.cb_cause_hierarchy where level = 2) freq_import, (select count(*) from gbd.db03_clean_tables.cb_cause_hierarchy_l2) as freq_clean, 'l2' as level
union select (select count(*) from gbd.db01_import.cb_cause_hierarchy where level = 1) freq_import, (select count(*) from gbd.db03_clean_tables.cb_cause_hierarchy_l1) as freq_clean, 'l1' as level
) x
order by level
;