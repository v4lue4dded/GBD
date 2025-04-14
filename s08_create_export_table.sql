
drop table if exists gbd.db04_modelling.full_measure_table;
create table         gbd.db04_modelling.full_measure_table as
select
  eb.year
, eb.location_id
, eb.location_name
, eb.age_group_id
, eb.age_group_name_sorted
, eb.age_cluster_name_sorted
, eb.sex_id
, eb.sex_name
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
from gbd.db04_modelling.export_basis_measures eb
left join  gbd.db01_import.measure            de on eb.year         = de.year
                                                and eb.location_id  = de.location
                                                and eb.age_group_id = de.age
                                                and eb.sex_id       = de.sex
                                                and eb.l2_cause_id  = de.cause
                                                and de.measure      = 1 -- 'Deaths'
                                                and de.metric       = 1 -- 'Number'
left join  gbd.db01_import.measure            yl on eb.year         = yl.year
                                                and eb.location_id  = yl.location
                                                and eb.age_group_id = yl.age
                                                and eb.sex_id       = yl.sex
                                                and eb.l2_cause_id  = yl.cause
                                                and yl.measure      = 4 -- 'YLLs (Years of Life Lost)'
                                                and yl.metric       = 1 -- 'Number'
left join  db03_clean_tables.un_country_info  ci on eb.location_id = ci.location_id
;

alter table gbd.db04_modelling.full_measure_table
add primary key (population_id, l2_cause_name)
;

-- plausi check
do $$
begin
assert 0 = (select
 count(*)
from gbd.db04_modelling.full_measure_table
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

drop table if exists gbd.db04_modelling.export_long;
create table         gbd.db04_modelling.export_long as
select
  fm.* 
, ci.region_code
, ci.region_name
, ci.sub_region_code
, ci.sub_region_name
from gbd.db04_modelling.full_measure_table   fm
left join  db03_clean_tables.un_country_info ci on fm.location_id = ci.location_id


alter table gbd.db04_modelling.export_long
add primary key (population_id, l2_cause_name)
;


drop table if exists gbd.db04_modelling.export_population_rollup;
create table         gbd.db04_modelling.export_population_rollup as
SELECT
    COALESCE(year::varchar, 'All') AS year,
    COALESCE(region_name, 'All') AS region_name,
    COALESCE(sub_region_name, 'All') AS sub_region_name,
    COALESCE(location_name, 'All') AS location_name,
    COALESCE(age_group_name_sorted, 'All') AS age_group_name_sorted,
    COALESCE(age_cluster_name_sorted, 'All') AS age_cluster_name_sorted,
    COALESCE(sex_name, 'All') AS sex_name,
    SUM(pop_val) AS pop_val,
    SUM(pop_upper) AS pop_upper,
    SUM(pop_lower) AS pop_lower,
    count(*) as anz
FROM gbd.db04_modelling.export_population
GROUP BY
    ROLLUP(year::varchar),
    ROLLUP(region_name, sub_region_name, location_name),
    Rollup(age_cluster_name_sorted, age_group_name_sorted),
    Rollup(sex_name)


drop table if exists gbd.db04_modelling.export_long_rollup;
create table         gbd.db04_modelling.export_long_rollup as
SELECT
    COALESCE(year::varchar, 'All') AS year,
    COALESCE(region_name::varchar, 'All') AS region_name,
    COALESCE(sub_region_name::varchar, 'All') AS sub_region_name,
    COALESCE(location_name::varchar, 'All') AS location_name,
    COALESCE(age_group_name_sorted::varchar, 'All') AS age_group_name_sorted,
    COALESCE(age_cluster_name_sorted::varchar, 'All') AS age_cluster_name_sorted,
    COALESCE(sex_name::varchar, 'All') AS sex_name,
    COALESCE(l1_cause_name::varchar, 'All') AS l1_cause_name,
    COALESCE(l2_cause_name::varchar, 'All') AS l2_cause_name,
    SUM(yll_val) AS yll_val,
    SUM(yll_upper) AS yll_upper,
    SUM(yll_lower) AS yll_lower,
    SUM(deaths_val) AS deaths_val,
    SUM(deaths_upper) AS deaths_upper,
    SUM(deaths_lower) AS deaths_lower,
    count(*) as anz
FROM gbd.db04_modelling.export_long
GROUP BY
    ROLLUP(year::varchar),
    ROLLUP(region_name::varchar, sub_region_name::varchar, location_name::varchar),
    ROLLUP(age_cluster_name_sorted::varchar, age_group_name_sorted::varchar),
    ROLLUP(sex_name::varchar),
    ROLLUP(l1_cause_name::varchar, l2_cause_name::varchar)
;


select *
FROM gbd.db04_modelling.export_long