drop table if exists db04_modelling.export_population;
create table         db04_modelling.export_population as
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
from      db04_modelling.export_basis_population eb
left join db01_import.population                 po on eb.year         = po.year
                                                       and eb.location_id  = po.location
                                                       and eb.age_group_id = po.age
                                                       and eb.sex_id       = po.sex
left join db03_clean_tables.un_country_info      ci on eb.location_id = ci.location_id
;


alter table db04_modelling.export_population
add primary key (population_id);

select
  year
, location_name
, max(sum(pop_val)) over (partition by location_name)   as max_pop_val
, sum(pop_val)::decimal(20,0)   as pop_val
, sum(pop_upper)::decimal(20,0) as pop_upper
, sum(pop_lower)::decimal(20,0) as pop_lower
from      db04_modelling.export_population
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
from      db04_modelling.export_basis_population eb
left join db04_modelling.export_population       po on eb.population_id = po.population_id
group by
  eb.year
, eb.location_name
order by max_pop_val desc, eb.year desc
;

select
  eb.year
, sum(pop_val)::decimal(20,0)   as pop_val
, sum(pop_upper)::decimal(20,0) as pop_upper
, sum(pop_lower)::decimal(20,0) as pop_lower
from      db04_modelling.export_basis_population eb
left join db04_modelling.export_population       po on eb.population_id = po.population_id
group by
eb.year
order by eb.year desc
;

-- plausibility check
SELECT
    CASE
      WHEN NOT (
         (SELECT COUNT(*)
            FROM db04_modelling.export_population
           WHERE  pop_val   <= 0 OR pop_val   IS NULL
              OR  pop_lower <= 0 OR pop_lower IS NULL
              OR  pop_upper <= 0 OR pop_upper IS NULL
              OR  pop_present = 0
           ) = 0)
      THEN error('negative pop or zero pop or missing pop')
   END
;
