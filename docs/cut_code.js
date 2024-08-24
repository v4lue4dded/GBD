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




var locationNameDimPopAgg0 = CFDDict0['population']['d']['location_name'].group().reduceSum(function (d) { return d.pop_val; });
var locationNameDimGBDAgg0 = CFDDict0['gbd']['d']['location_name'].group().reduceSum(function (d) { return d.yll_val; });
var YLLPerPerson0 = createRatioGroup(locationNameDimGBDAgg0, locationNameDimPopAgg0);



function createRatioGroup(nominatorData, denominatorData, nominatorCol, denominatorCol) {
    // console.log("nominatorData, denominatorData, nominatorCol, denominatorCol");
    // console.log(nominatorData, denominatorData, nominatorCol, denominatorCol);
    return {
        all: function() {
            var nominatorMap = new Map(nominatorData.map(d => [d.key, d.value[nominatorCol]]));
            var denominatorMap = new Map(denominatorData.map(d => [d.key, d.value[denominatorCol]]));
            var keys = new Set([...nominatorMap.keys(), ...denominatorMap.keys()]);
            var result = Array.from(keys).map(key => {
                console.log("key");
                console.log(key);
                var nominator = nominatorMap.get(key) || 0;
                var denominator = denominatorMap.get(key) || 0;
                console.log("nominator, denominator");
                console.log(nominator, denominator);
                return {
                    key: key,
                    value: denominator > 0 ? nominator / denominator : 0
                };
            });
            return result;
        }
    };
}



function createRatioGroup(nominatorGroup, denominatorGroup) {
    return {
        all: function() {
            var nominatorData = nominatorGroup.all();
            var denominatorData = denominatorGroup.all();
            var nominatorMap = new Map(nominatorData.map(d => [d.key, d.value]));
            var denominatorMap = new Map(denominatorData.map(d => [d.key, d.value]));
            var keys = new Set([...nominatorMap.keys(), ...denominatorMap.keys()]);
            var result = Array.from(keys).map(key => {
                var nominator = nominatorMap.get(key) || 0;
                var denominator = denominatorMap.get(key) || 0;
                return {
                    key: key,
                    value: denominator > 0 ? nominator / denominator : 0
                };
            });
            return result;
        }
    };
}

var locationNameDimPopAgg0 = CFDDict0['population']['d']['location_name'].group().reduceSum(function (d) { return d.pop_val; });
var locationNameDimGBDAgg0 = CFDDict0['gbd']['d']['location_name'].group().reduceSum(function (d) { return d.yll_val; });
var YLLPerPerson0 = createRatioGroup(locationNameDimGBDAgg0, locationNameDimPopAgg0);

var locationNameDimPopAgg1 = CFDDict1['population']['d']['location_name'].group().reduceSum(function (d) { return d.pop_val; });
var locationNameDimGBDAgg1 = CFDDict1['gbd']['d']['location_name'].group().reduceSum(function (d) { return d.yll_val; });
var YLLPerPerson1 = createRatioGroup(locationNameDimGBDAgg0, locationNameDimPopAgg0);

console.log("YLLPerPerson0:", YLLPerPerson0.all());
console.log("YLLPerPerson1:", YLLPerPerson1.all());

YLLPerPersonChange = createRatioGroup(YLLPerPerson1, YLLPerPerson0);



// Adjust the color scale for appropriate visualization of the ratio
var logColorScale = d3.scale.log()
    .domain([0.01, 1]) // Adjust the domain based on expected ratio values
    .range(["#E2F2FF", "#5F3366"]);
.colors(logColorScale)
.colorCalculator(function (d) {
    return d ? worldChart.colors()(Math.max(0.001, d)) : '#ccc'; // Ensure valid log input
})




function redrawDcAndC3() {
    console.log("redrawDcAndC3");

    // Iterate through dictionary with a for loop
    for (var key in CFDDict0['gbd']['d']) {
        console.log(key);
        var filter = CFDDict0['gbd']['d'][key].currentFilter();
        // Check if the filter is a function and try to get more meaningful output
        if (typeof filter === 'function') {
            try {
                // Log results of calling the function with likely values
                console.log("Filter function returns:", filter('male'));
            } catch (error) {
                console.log("Error calling filter function:", error);
            }
        } else {
            // Directly log the filter if it's not a function
            console.log("Current filter:", filter);
        }
    }
    dc.redrawAll();
    redraw();
}



}, {
    header: { text: "Population change" },
    cells: { html: function (d) { return d3.format('.2%')(getVal1("population", d.value, d.key, "pop_val") * 1. / getVal0("population", d.value, d.key, "pop_val") - 1.); } },
    sort: function (d) { return getVal1("population", d.value, d.key, "pop_val") * 1. / getVal0("population", d.value, d.key, "pop_val") - 1.; },
    vis: 'color',
    vis_options: {
        styles: {
            'domain': [+1, 0, -0.5],
            'range': ['#b3fcd9', '#FFF59D', '#E8A1A1'],
        }
    }
}, {
    header: { text: "Deaths change" },
    cells: { html: function (d) { return d3.format('.2%')(getVal1("gbd", d.value, d.key, "deaths_val") * 1. / getVal0("gbd", d.value, d.key, "deaths_val") - 1.); } },
    sort: function (d) { return getVal1("gbd", d.value, d.key, "deaths_val") * 1. / getVal0("gbd", d.value, d.key, "deaths_val") - 1.; },
    vis: 'color',
    vis_options: {
        styles: {
            'domain': [-0.5, 0, +1],
            'range': ['#b3fcd9', '#FFF59D', '#E8A1A1'],
        }
    }
}, {
    header: { text: "Years of live lost change" },
    cells: { html: function (d) { return d3.format('.2%')(getVal1("gbd", d.value, d.key, "yll_val") * 1. / getVal0("gbd", d.value, d.key, "yll_val") - 1.); } },
    sort: function (d) { return getVal1("gbd", d.value, d.key, "yll_val") * 1. / getVal0("gbd", d.value, d.key, "yll_val") - 1.; },
    vis: 'color',
    vis_options: {
        styles: {
            'domain': [-0.5, 0, +1],
            'range': ['#b3fcd9', '#FFF59D', '#E8A1A1'],
        }
    }
