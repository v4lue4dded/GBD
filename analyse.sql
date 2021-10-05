drop table if exists global_burden_disease.dbo.export_power_bi_v01
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
into global_burden_disease.dbo.export_power_bi_v01 
from global_burden_disease.dbo.import_2021_05_19
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

select sum(val) from global_burden_disease.dbo.export_power_bi_v01


select
*
from global_burden_disease.dbo.import_2021_05_19
where location_name = 'Norway'
and   measure_name  = 'YLLs (Years of Life Lost)'
