drop table if exists db04_modelling.export_long;
create table         db04_modelling.export_long as
select
  eb.year
, eb.location_id
, eb.location_name
, eb.age_group_id
, eb.age_group_name_sorted
, eb.age_cluster_name_sorted
, eb.sex_id
, eb.sex_name
, concat(eb.sex_name, '--', eb.age_group_name_sorted) as sex_name__age_group_name_sorted
, eb.population_id
, eb.l1_cause_id
, eb.l1_cause_name
, eb.l2_cause_id
, eb.l2_cause_name
, eb.l3_cause_id
, eb.l3_cause_name
, eb.l4_cause_id
, eb.l4_cause_name
, ci.region_code
, ci.region_name
, ci.sub_region_code
, ci.sub_region_name
, coalesce(de.val      ,0) as deaths_val
, coalesce(de.lower    ,0) as deaths_lower
, coalesce(de.upper    ,0) as deaths_upper
, coalesce(da.val      ,0) as daly_val
, coalesce(da.lower    ,0) as daly_lower
, coalesce(da.upper    ,0) as daly_upper
, coalesce(yd.val      ,0) as yld_val
, coalesce(yd.lower    ,0) as yld_lower
, coalesce(yd.upper    ,0) as yld_upper
, coalesce(yl.val      ,0) as yll_val
, coalesce(yl.lower    ,0) as yll_lower
, coalesce(yl.upper    ,0) as yll_upper
, case when de.val     is not null then 1 else 0 end as deaths_present
, case when yl.val     is not null then 1 else 0 end as yll_present
from db04_modelling.export_basis_measures eb
left join  db01_import.measure            de on eb.year         = de.year
                                                and eb.location_id  = de.location
                                                and eb.age_group_id = de.age
                                                and eb.sex_id       = de.sex
                                                and eb.l4_cause_id  = de.cause
                                                and de.measure      = 1 -- 'Deaths'
                                                and de.metric       = 1 -- 'Number'
left join  db01_import.measure            da on eb.year         = da.year
                                                and eb.location_id  = da.location
                                                and eb.age_group_id = da.age
                                                and eb.sex_id       = da.sex
                                                and eb.l4_cause_id  = da.cause
                                                and da.measure      = 2 -- 'DALYs (Disability-Adjusted Life Years)'
                                                and da.metric       = 1 -- 'Number'
left join  db01_import.measure            yd on eb.year         = yd.year
                                                and eb.location_id  = yd.location
                                                and eb.age_group_id = yd.age
                                                and eb.sex_id       = yd.sex
                                                and eb.l4_cause_id  = yd.cause
                                                and yd.measure      = 3 -- 'YLDs (Years Lived with Disability)'
                                                and yd.metric       = 1 -- 'Number'
left join  db01_import.measure            yl on eb.year         = yl.year
                                                and eb.location_id  = yl.location
                                                and eb.age_group_id = yl.age
                                                and eb.sex_id       = yl.sex
                                                and eb.l4_cause_id  = yl.cause
                                                and yl.measure      = 4 -- 'YLLs (Years of Life Lost)'
                                                and yl.metric       = 1 -- 'Number'
left join  db03_clean_tables.un_country_info  ci on eb.location_id = ci.location_id
;


alter table db04_modelling.export_long
add primary key (population_id, l4_cause_name)
;

SELECT
    CASE
      WHEN NOT (
         (
            SELECT COUNT(*)
            from db04_modelling.export_long
            where
               deaths_val       <  0 or deaths_val       is null
            or deaths_lower     <  0 or deaths_lower     is null
            or deaths_upper     <  0 or deaths_upper     is null
            or daly_val         <  0 or daly_val         is null
            or daly_lower       <  0 or daly_lower       is null
            or daly_upper       <  0 or daly_upper       is null
            or yld_val          <  0 or yld_val          is null
            or yld_lower        <  0 or yld_lower        is null
            or yld_upper        <  0 or yld_upper        is null
            or yll_val          <  0 or yll_val          is null
            or yll_lower        <  0 or yll_lower        is null
            or yll_upper        <  0 or yll_upper        is null
         ) = 0)
      THEN error('negative yll or negative pop or zero pop')
   END
;
