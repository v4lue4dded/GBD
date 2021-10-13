select
count(*)
from gbd.db01_import.import
;

drop table if exists gbd.db02_processing.export_power_bi_v01;
create table         gbd.db02_processing.export_power_bi_v01 as
select 
  location_id
, location_name
, sex_name
, age_name
, year
, cause_name
, measure_name
, metric_name
, sum(lower) as lower
, sum(val  ) as val  
, sum(upper) as upper
from gbd.db01_import.import
where measure_name = 'YLLs (Years of Life Lost)'
group by 
  location_id
, location_name
, sex_name
, age_name
, measure_name
, year
, cause_name
, metric_name
;

select
distinct year
from gbd.db01_import.import

-- nice age query
select
  location_id
, location_name
, age_id
, age_name
, replace(replace(replace(replace(
     age_name,
     '<1 year', '00 to 00'),
     '1 to 4' , '01 to 04'),
     '5 to 9' , '05 to 09'),
     '95 plus', '95 to inf') as age_name_clean
, round(sum(val))
from gbd.db01_import.import
where year = 2019
and location_name = 'Germany'
group by
  location_id
, location_name
, age_id
, age_name
order by age_name_clean
;

-- explore discrepancy query:
select
  im.year
, im.location_name
, im.age_name
, im.sex_name
, im.cause_id
, im.cause_name
, ch.cause_outline
, ch.level
, ch.cause_name
, c2.cause_outline
, c2.level
, c2.cause_name
, round(sum(im.val))
, round(sum(sum(im.val)) over())
, round(sum(sum(im.val)) over(partition by left(ch.cause_outline,1)))
from gbd.db01_import.import im
left join gbd.db01_import.cb_cause_hierarchy ch on im.cause_id = ch.cause_id
left join gbd.db01_import.cb_cause_hierarchy c2 on ch.parent_id = c2.cause_id
where year = 2019
and location_name = 'Germany'
and age_name = '10 to 14'
and sex_name = 'Male'
-- and cause_name = 'Unintentional injuries'
group by
  im.year
, im.location_name
, im.age_name
, im.sex_name
, im.cause_id
, im.cause_name
, ch.cause_outline
, ch.level
, ch.cause_name
, c2.cause_outline
, c2.level
, c2.cause_name
order by ch.cause_outline
;

select
*
from gbd.db01_import.import
where year = 2019
and location_name = 'Germany'
and age_name = '10 to 14'
and sex_name = 'Male'
and cause_name = 'Unintentional injuries'


select sum(val) from gbd.db02_processing.export_power_bi_v01;


select
*
from gbd.db02_processing.import_2021_05_19
where location_name = 'Norway'
and   measure_name  = 'YLLs (Years of Life Lost)'
