



select

from       gbd.db03_clean_tables.cb_location_country
cross join gbd.db03_clean_tables.cb_cause_hierarchy_l2
cross join gbd.db03_clean_tables.cb_cause_hierarchy_l2








drop table if exists gbd.db02_processing.export_power_bi_v01;
create table         gbd.db02_processing.export_power_bi_v01 as
select 
  yl.location_id
, yl.location_name
, yl.sex_name
, yl.age_name
, yl.year
, yl.cause_name
, sum(yl.lower    ) as yll_lower
, sum(yl.val      ) as yll_val
, sum(yl.upper    ) as yll_upper
, sum(po.pop_lower) as pop_lower
, sum(po.pop_val  ) as pop_val
, sum(po.pop_upper) as pop_upper
from      gbd.db01_import.cause                    yl
left join gbd.db03_clean_tables.pop_groups_country po on yl.location_id = po.location_id
                                                      and yl.sex_id      = po.sex_id
                                                      and yl.age_id      = po.age_group_id
                                                      and yl.year        = po.year
                                                      and yl.location_id = po.location_id
where yl.measure_name = 'YLLs (Years of Life Lost)' and yl.metric_name = 'Number'
group by 
  yl.location_id
, yl.location_name
, yl.sex_name
, yl.age_name
, yl.year
, yl.cause_name
, yl.measure_name
;


select
*
from      gbd.db01_import.cause                     yl
full join gbd.db03_clean_tables.pop_age_year_groups po on yl.location_id = po.location_id
                                                      and yl.sex_id      = po.sex_id
                                                      and yl.age_id      = po.age_group_id
                                                      and yl.year        = po.year
                                                      and yl.location_id = po.location_id
left join gbd.db01_import.cb_all_locations_hierarchies lh on po.location_id = lh.location_id
where yl.location_name is null
or  (po.location_name is null)
;


select
distinct metric_name
from gbd.db01_import.cause

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
from gbd.db01_import.cause
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
from gbd.db01_import.cause im
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
from gbd.db01_import.cause
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
