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


var groupname = "Choropleth";
console.log("facilities:",  CFDDict0['population']['d']['location_name']);
console.log("facilitiesGroup:",  aggDict0['population']['location_name']);

var facilities = CFDDict0['population']['d']['location_name'];
var facilitiesGroup = facilities.group().reduceSum(function (d) { return d.pop_val; });

console.log("facilities:", facilities);
console.log("facilitiesGroup:", facilitiesGroup);

world_map = dc.leafletChoroplethChart("#gbd_map .map", groupname)
    .dimension(CFDDict0['population']['d']['location_name'])
    .group(aggDict0['population']['location_name'])
    .width(600)
    .height(400)
    .center([24, 26])
    .zoom(1.47)
    .geojson(world_geojson)
    .colors(['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'])
    .colorDomain(function () {
        return [0,
        2000000000];
    })
    .colorAccessor(function (d, i) {
        return d.pop_val;
    })
    .featureKeyAccessor(function (feature) {
        return feature.properties.nameMapped;
    })
    .renderPopup(true)
    .popup(function (d, feature) {
        return feature.properties.nameMapped + " : " + d.pop_val;
    });

world_map.render();




