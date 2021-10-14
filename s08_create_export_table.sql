drop table if exists gbd.db04_modelling.export_power_bi_long;
create table         gbd.db04_modelling.export_power_bi_long as
select
  yl.location_name
, yl.sex_name
, yl.age_name
, yl.year
, yl.cause_name
, yl.lower     as yll_lower
, yl.val       as yll_val
, yl.upper     as yll_upper
, po.pop_lower as pop_lower
, po.pop_val   as pop_val
, po.pop_upper as pop_upper
from      gbd.db01_import.cause                    yl
left join gbd.db03_clean_tables.pop_groups_country po on yl.location_id = po.location_id
                                                     and yl.sex_id      = po.sex_id
                                                     and yl.age_id      = po.age_group_id
                                                     and yl.year        = po.year
                                                     and yl.location_id = po.location_id
where yl.measure_name = 'YLLs (Years of Life Lost)' and yl.metric_name = 'Number'
;

alter table gbd.db04_modelling.export_power_bi_long
add primary key (location_name, sex_name, age_name, year, cause_name)
;

-- plausi check
do $$
begin
assert 0 = (select
 count(*)
from gbd.db04_modelling.export_power_bi_long
where
   yll_lower <  0
or yll_val   <  0
or yll_upper <  0
or pop_lower <= 0
or pop_val   <= 0
or pop_upper <= 0
), 'negative yll or negative pop or zero pop';
end;
$$
;

select
distinct year
from gbd.db04_modelling.export_power_bi_long
