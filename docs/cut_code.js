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


function synchronizeFilters() {
    // Get all currently filtered dimensions in gbd_data
    var filtered_population_id = new Set(population_id_dimGbd.group().all()
        .filter(function(d) { return d.value > 0; })
        .map(function(d) { return d.key; }));
    var filtered_year = new Set(year_dimGbd.group().all()
        .filter(function(d) { return d.value > 0; })
        .map(function(d) { return d.key; }));

    // Apply filter to population_data using the Set for efficient lookups
    population_id_dimPopulation.filter(function(d) {
        return filtered_population_id.has(d);
    });
    year_dimPopulation.filter(function(d) {
        return filtered_year.has(d);
    });
}




