drop table if exists gbd.db04_modelling.export_population;
create table         gbd.db04_modelling.export_population as
select
   eb.year as year
, eb.location_id
, eb.location_name
, eb.age_group_id
, eb.age_group_name_sorted
, eb.sex_id
, eb.sex_name
, concat(eb.year, '--', eb.location_id, '--', eb.age_group_id, '--', eb.sex_id) population_id
, po.val     as pop_val
, po.upper   as pop_upper
, po.lower   as pop_lower
, case when po.val is not null then 1 else 0 end as pop_present
from      gbd.db04_modelling.export_basis_population eb
left join gbd.db01_import.pop_age_year_groups         po on eb.year         = po.year_id
                                                        and eb.location_id  = po.location_id
                                                        and eb.age_group_id = po.age_group_id
                                                        and eb.sex_id       = po.sex_id
;


alter table gbd.db04_modelling.export_population
add primary key (population_id);

select
  eb.year
, sum(pop_val)   as pop_val
, sum(pop_upper) as pop_upper
, sum(pop_lower) as pop_lower
from      gbd.db04_modelling.export_basis_population eb
left join gbd.db04_modelling.export_population        po on eb.population_id = po.population_id
group by
eb.year
order by year
;


-- plausi check
do $$
begin
assert 0 = (select
 count(*)
from gbd.db04_modelling.export_population
where
   pop_val       <=  0 or pop_val       is null
or pop_lower     <=  0 or pop_lower     is null
or pop_upper     <=  0 or pop_upper     is null
or pop_present = 0
), 'negative pop or zero pop or missing pop';
end;
$$
;

