console.log("population_id_dim.group().all()")
console.log(population_id_dim.group().all())

var keyList = population_id_dim.group().all().map(item => item.key);
console.log(keyList);
console.log("population_data[keyList]")
console.log(population_data[keyList])

// console.log(population_id_dim.filterAll())
// console.log(population_id_dim.filterExact())
// console.log(population_id_dim.filterFunction())
// console.log(population_id_dim.filterRange())
// console.log(population_id_dim.group())
// console.log(population_id_dim.groupAll())
