--
-- select
-- *
-- from      gbd.db04_modelling.export_power_bi_long new
-- full join gbd.db04_modelling.export_power_bi_long_old old
-- on  new.year           = old.year
-- and new.location_name  = old.location_name
-- and new.age_group_name = old.age_name
-- and lower(new.sex_name)       = lower(old.sex_name)
-- and new.l2_cause_name  = old.cause_name
-- where (new.year is null or old.year is null)
-- and coalesce(new.year, old.year ) = 2015
-- ;
--
-- select
-- distinct  sex_name
-- from      gbd.db04_modelling.export_power_bi_long
--
--
-- select
-- distinct  sex_name
-- from      gbd.db04_modelling.export_power_bi_long_old
--

-- ;
--
--
-- select
--  distinct sex_name
-- from gbd.db03_clean_tables.cb_sex  a
--
-- select
--  distinct age_group_name
-- from gbd.db03_clean_tables.cb_age_group  a
-- where a.age_group_name in (
--   '<1 year'
-- , '1 to 4'
-- , '5 to 9'
-- , '10 to 14'
-- , '15 to 19'
-- , '20 to 24'
-- , '25 to 29'
-- , '30 to 34'
-- , '35 to 39'
-- , '40 to 44'
-- , '45 to 49'
-- , '50 to 54'
-- , '55 to 59'
-- , '60 to 64'
-- , '65 to 69'
-- , '70 to 74'
-- , '75 to 79'
-- , '80 to 84'
-- , '85 to 89'
-- , '90 to 94'
-- , '95 plus'
-- )
--
--
--
--
-- select
--  distinct age_group_name
-- from gbd.db02_processing.export_basis a
--
--
-- select
-- *
-- from gbd.db03_clean_tables.cb_age_group a
-- inner join (select distinct age from gbd.db01_import.cause) b on a.age_group_id = b.age
--
-- select year           , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by year           order by deaths_present asc;
-- select location_name  , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by location_name  order by deaths_present asc;
-- select age_group_name , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by age_group_name order by deaths_present asc;
-- select sex_name       , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by sex_name       order by deaths_present asc;
-- select l1_cause_name  , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by l1_cause_name  order by deaths_present asc;
-- select l2_cause_name  , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long group by l2_cause_name  order by deaths_present asc;
--
--
--
-- select age_group_name , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long where l2_cause_name = 'Mental disorders' group by age_group_name order by deaths_present asc;
-- select sex_name       , count(*) anz, sum(population_present) as population_present, sum(deaths_present) as deaths_present, sum(yll_present) as yll_present from gbd.db04_modelling.export_power_bi_long where l2_cause_name = 'Mental disorders' group by sex_name       order by deaths_present asc;
--
--
-- select
-- *
-- from gbd.db04_modelling.export_power_bi_long
-- where l2_cause_name = 'Maternal and neonatal disorders'
--
-- select
-- *
-- from gbd.db04_modelling.export_power_bi_long
--
--
-- select
-- *
-- from gbd.db03_clean_tables.cb_cause_hierarchy_l4
-- where l2_cause_name = 'Sense organ diseases'



select count(*) from gbd.db04_modelling.export_population_rollup
where anz > 400


select
  anz
, count(*) as freq
from gbd.db04_modelling.export_population_rollup as x
group by
  anz
order by freq desc
;

DROP TABLE IF EXISTS gbd.db04_modelling.population_json CASCADE;
CREATE TABLE gbd.db04_modelling.population_json AS
SELECT
    -- Generate an MD5 hash of all grouping columns as text:
    md5(
        jsonb_build_object(
            'region_name', region_name,
            'sub_region_name', sub_region_name,
            'location_name', location_name,
            'age_group_name_sorted', age_group_name_sorted,
            'age_cluster_name_sorted', age_cluster_name_sorted,
            'sex_name', sex_name
        )::text
    ) AS hash_column,
    -- Build a single JSON object for each group:
    (
        -- 1) Start with "identifying_string" = { ...grouping columns... }
        jsonb_build_object(
            'identifying_string',
            jsonb_build_object(
                'region_name', region_name,
                'sub_region_name', sub_region_name,
                'location_name', location_name,
                'age_group_name_sorted', age_group_name_sorted,
                'age_cluster_name_sorted', age_cluster_name_sorted,
                'sex_name', sex_name
            ),
            jsonb_object_agg(
                year::text,
                jsonb_build_object(
                    'pop_val', pop_val,
                    'pop_upper', pop_upper,
                    'pop_lower', pop_lower
                )
            )
        )
    ) AS jsonb_column,
    -- Build a single JSON object for each group:
    (
        -- 1) Start with "identifying_string" = { ...grouping columns... }
        jsonb_build_object(
            'identifying_string',
            jsonb_build_object(
                'region_name', region_name,
                'sub_region_name', sub_region_name,
                'location_name', location_name,
                'age_group_name_sorted', age_group_name_sorted,
                'age_cluster_name_sorted', age_cluster_name_sorted,
                'sex_name', sex_name
            )
        )
        ||
        -- 2) Append an object whose keys = year, values = {pop_val, pop_upper, pop_lower}
        jsonb_object_agg(
            year::text,
            jsonb_build_object(
                'pop_val', pop_val,
                'pop_upper', pop_upper,
                'pop_lower', pop_lower
            )
        )
    ) AS jsonb_column_old
FROM gbd.db04_modelling.export_population_rollup
GROUP BY
    region_name,
    sub_region_name,
    location_name,
    age_group_name_sorted,
    age_cluster_name_sorted,
    sex_name
;


select *
from gbd.db04_modelling.population_json
order by hash_column




