drop table if exists gbd.db04_modelling.export_population;
create table         gbd.db04_modelling.export_population as
select
  eb.year as year
, eb.location_id
, eb.location_name
, eb.age_group_id
, eb.age_group_name_sorted
, eb.age_cluster_name_sorted
, eb.sex_id
, eb.sex_name
, concat(eb.year, '--', eb.location_id, '--', eb.age_group_id, '--', eb.sex_id) as population_id
, po.val     as pop_val
, po.upper   as pop_upper
, po.lower   as pop_lower
, ci.region_code
, ci.region_name
, ci.sub_region_code
, ci.sub_region_name
, case when po.val is not null then 1 else 0 end as pop_present
from      gbd.db04_modelling.export_basis_population eb
left join gbd.db01_import.population                 po on eb.year         = po.year
                                                       and eb.location_id  = po.location
                                                       and eb.age_group_id = po.age
                                                       and eb.sex_id       = po.sex
left join gbd.db03_clean_tables.un_country_info      ci on eb.location_id = ci.location_id
;


alter table gbd.db04_modelling.export_population
add primary key (population_id);

select
  year
, location_name
, max(sum(pop_val)) over (partition by location_name)   as max_pop_val
, sum(pop_val)::decimal(20,0)   as pop_val
, sum(pop_upper)::decimal(20,0) as pop_upper
, sum(pop_lower)::decimal(20,0) as pop_lower
from      gbd.db04_modelling.export_population
where location_name = 'India'
group by
  year
, location_name
order by max_pop_val desc,  year desc
;


select
  eb.year
, eb.location_name
, max(sum(pop_val)) over (partition by eb.location_name)   as max_pop_val
, sum(pop_val)::decimal(20,0)   as pop_val
, sum(pop_upper)::decimal(20,0) as pop_upper
, sum(pop_lower)::decimal(20,0) as pop_lower
from      gbd.db04_modelling.export_basis_population eb
left join gbd.db04_modelling.export_population       po on eb.population_id = po.population_id
group by
eb.year
, eb.location_name
order by max_pop_val desc,  year desc
;

select
  eb.year
, sum(pop_val)::decimal(20,0)   as pop_val
, sum(pop_upper)::decimal(20,0) as pop_upper
, sum(pop_lower)::decimal(20,0) as pop_lower
from      gbd.db04_modelling.export_basis_population eb
left join gbd.db04_modelling.export_population       po on eb.population_id = po.population_id
group by
eb.year
order by year desc


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