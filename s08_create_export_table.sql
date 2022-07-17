
drop table if exists gbd.db04_modelling.export_measure;
create table         gbd.db04_modelling.export_measure as
select
  eb.year
-- , eb.location_id
-- , eb.location_name
-- , eb.age_group_id
-- , eb.age_group_name
-- , eb.sex_id
-- , eb.sex_name
, eb.population_id
, eb.l1_cause_id
, eb.l1_cause_name
, eb.l2_cause_id
, eb.l2_cause_name
, coalesce(de.val      ,0) as deaths_val
, coalesce(de.lower    ,0) as deaths_lower
, coalesce(de.upper    ,0) as deaths_upper
, coalesce(yl.val      ,0) as yll_val
, coalesce(yl.lower    ,0) as yll_lower
, coalesce(yl.upper    ,0) as yll_upper
, case when de.val     is not null then 1 else 0 end as deaths_present
, case when yl.val     is not null then 1 else 0 end as yll_present
from gbd.db04_modelling.export_basis_measures       eb
left join  gbd.db01_import.measure                   de on eb.year       = de.year
                                                     and eb.location_id  = de.location
                                                     and eb.age_group_id = de.age
                                                     and eb.sex_id       = de.sex
                                                     and eb.l2_cause_id  = de.cause
                                                     and de.measure      = 1 -- 'Deaths'
                                                     and de.metric       = 1 -- 'Number'
left join  gbd.db01_import.measure                   yl on eb.year         = yl.year
                                                     and eb.location_id  = yl.location
                                                     and eb.age_group_id = yl.age
                                                     and eb.sex_id       = yl.sex
                                                     and eb.l2_cause_id  = yl.cause
                                                     and yl.measure      = 4 -- 'YLLs (Years of Life Lost)'
                                                     and yl.metric       = 1 -- 'Number'
;

alter table gbd.db04_modelling.export_measure
add primary key (population_id, l2_cause_name)
;

-- plausi check
do $$
begin
assert 0 = (select
 count(*)
from gbd.db04_modelling.export_measure
where
   deaths_val       <  0 or deaths_val       is null
or deaths_lower     <  0 or deaths_lower     is null
or deaths_upper     <  0 or deaths_upper     is null
or yll_val          <  0 or yll_val          is null
or yll_lower        <  0 or yll_lower        is null
or yll_upper        <  0 or yll_upper        is null
), 'negative yll or negative pop or zero pop';
end;
$$
;

