function buildIdentifyingString(obj, colOrder, allValue) {
    return colOrder
        .map(col => `${col}: ${obj[col] || allValue}`)
        .join(" | ");
}

async function fetchRange(url, startByte, endByte) {
    const rangeHeader = `bytes=${startByte}-${endByte}`;
    const response = await fetch(url, {
        headers: { Range: rangeHeader }
    });
    if (!response.ok && response.status !== 206) {
        throw new Error(`Failed partial fetch from ${startByte} to ${endByte}, status=${response.status}`);
    }
    return response.text();
}

function parseChunkForSubObjects(chunk) {
    const results = {};
    // Regex to find "32-hexdigit": { ... }
    const hashRegex = /"([0-9a-f]{32})"\s*:\s*\{/gi;
    let match;

    while ((match = hashRegex.exec(chunk)) !== null) {
        const hash = match[1];
        // Find the '{' from where the regex matched
        const start = chunk.indexOf('{', match.index);
        if (start === -1) continue; // safeguard

        // Find the matching '}' by tracking brace depth
        let braceCount = 0;
        let end = -1;
        for (let i = start; i < chunk.length; i++) {
            if (chunk[i] === '{') {
                braceCount++;
            } else if (chunk[i] === '}') {
                braceCount--;
            }
            if (braceCount === 0) {
                end = i;
                break;
            }
        }
        if (end === -1) break;

        const objString = chunk.slice(start, end + 1);
        try {
            const parsedObj = JSON.parse(objString);
            results[hash] = parsedObj;
        } catch (error) {
            console.warn(`Failed to parse for hash=${hash}, error=${error}`);
        }
    }

    return results;
}

function getWeight(searchHash, lowerHash, upperHash) {
    const search = BigInt("0x" + searchHash);
    const lower = BigInt("0x" + lowerHash);
    const upper = BigInt("0x" + upperHash);

    if (upper === lower) {
        return 0.5;
    }

    const numerator = search - lower;
    const denominator = upper - lower;
    return Number(numerator) / Number(denominator);
}

async function guidedSearchRange(
    fileUrl, searchHash,
    minByte, maxByte,
    minHash, maxHash,
    rangeSize
) {
    if (searchHash < minHash || searchHash > maxHash) {
        return null;
    }
    if (minByte > maxByte) {
        return null;
    }

    // Approximate where to look by fraction
    let fraction = getWeight(searchHash, minHash, maxHash);
    let bestGuessByte = minByte + fraction * (maxByte - minByte);
    bestGuessByte = Math.floor(bestGuessByte);

    let requestStart = Math.max(bestGuessByte - 0.5 * rangeSize, minByte);
    let requestEnd = Math.min(bestGuessByte + 0.5 * rangeSize, maxByte);

    let chunkText;
    try {
        chunkText = await fetchRange(fileUrl, Math.floor(requestStart), Math.floor(requestEnd));
    } catch (err) {
        throw err;  // or handle error
    }

    const subObjects = parseChunkForSubObjects(chunkText);
    if (Object.keys(subObjects).length === 0) {
        const newRangeSize = rangeSize * 2;
        return await guidedSearchRange(
            fileUrl, searchHash,
            Math.floor(requestEnd + 1),
            maxByte,
            minHash,
            maxHash,
            newRangeSize
        );
    }

    // Sort the subObjects by hash
    const sortedEntries = Object.entries(subObjects).sort(([a], [b]) => a.localeCompare(b));
    const chunkMinHash = sortedEntries[0][0];
    const chunkMaxHash = sortedEntries[sortedEntries.length - 1][0];

    // Direct match?
    for (const [h, obj] of sortedEntries) {
        if (h === searchHash) {
            obj["hash"] = h
            return obj;
        }
    }

    // If chunkMinHash < searchHash < chunkMaxHash but not found => not present
    if (chunkMinHash < searchHash && chunkMaxHash > searchHash) {
        return null;
    }

    // If entire chunk is below
    if (chunkMaxHash < searchHash) {
        const newMinByte = Math.floor(bestGuessByte);
        const newMinHash = chunkMaxHash;
        const newRangeSize = Math.floor(rangeSize * 1.3);
        return await guidedSearchRange(
            fileUrl, searchHash,
            newMinByte, maxByte,
            newMinHash, maxHash,
            newRangeSize
        );
    }

    // If entire chunk is above
    if (chunkMinHash > searchHash) {
        const newMaxByte = Math.floor(bestGuessByte);
        const newMaxHash = chunkMinHash;
        const newRangeSize = Math.floor(rangeSize * 1.3);
        return await guidedSearchRange(
            fileUrl, searchHash,
            minByte, newMaxByte,
            minHash, newMaxHash,
            newRangeSize
        );
    }

    return null;
}


async function searchHashValue(hashFileSizes, hash) {
    const partialHash = hash.substring(0, 3);
    const fileUrl = `data_doc/cachefilter_hash_db/${partialHash}.json`;
    const minByte = 0;
    const maxByte = hashFileSizes[partialHash];
    const minHash = `${partialHash}00000000000000000000000000000`;
    const maxHash = `${partialHash}fffffffffffffffffffffffffffff`;
    const initialRange = 5_000;       // 5 KB

    // store **one** in‑flight promise per hash so concurrent requests co‑alesce
    searchResult = guidedSearchRange(
        fileUrl, hash,
        minByte, maxByte,
        minHash, maxHash,
        initialRange
    );

    // ensure the cache always ends up with the resolved value, not a promise
    if (searchResult instanceof Promise) {
        searchResult = await searchResult;
    }
    return searchResult;            // ← always the fully‑resolved object
}

function enrichFilters(dataDict, filterDict) {
    const enriched = { ...filterDict };

    for (const [filterKey, filterValue] of Object.entries(filterDict)) {
        const lookupTable = dataDict[filterKey];
        if (!lookupTable) continue;

        const mapping = lookupTable[filterValue];
        if (!mapping) continue;

        for (const [higherKey, higherValue] of Object.entries(mapping)) {
            const currentValue = enriched[higherKey];
            const isMissingOrNone = currentValue === undefined || currentValue === null;

            if (isMissingOrNone) {
                enriched[higherKey] = higherValue;
            }
        }
    }

    return enriched;
}

function cartesianProduct(dimensions) {
    const entries = Object.entries(dimensions).filter(([_, values]) => Array.isArray(values) && values.length > 0);
    if (entries.length === 0) return [{}];

    return entries.reduce((acc, [key, values]) => {
        const temp = [];
        for (const combo of acc) {
            for (const value of values) {
                temp.push({ ...combo, [key]: value });
            }
        }
        return temp;
    }, [{}]);
}


function generateHashes(dim_distinct_values, currentFiltersSubset, colOrderList, allValue, rollup_higher_values_filtered) {
    const resultTree = {};
    const hashSet = new Set()
    for (const [col, values] of Object.entries({ ...dim_distinct_values, "all_col": ["All"] })) {
        // console.log("col:", col);
        // console.log("values:", values);
        const colResult = {};
        for (const value of [...values, allValue]) { // values: {"2000", "2005", ..., "All"}
            // console.log("value:", value);
            // console.log("currentFiltersSubset:", currentFiltersSubset);
            const currentFilterList = cartesianProduct(currentFiltersSubset)
            const ValResultList = [];
            // console.log("currentFilterList:", currentFilterList);
            for (const currentFilterItem of currentFilterList) {
                // console.log("currentFilterItem:", currentFilterItem);
                const identifiyingDict = deepClone(currentFilterItem);
                identifiyingDict[col] = value
                const identifiyingDictRollupEnriched = enrichFilters(rollup_higher_values_filtered, identifiyingDict)
                const identifyingString = buildIdentifyingString(identifiyingDictRollupEnriched, colOrderList, allValue);
                const identifyingHash = md5(identifyingString);
                hashSet.add(identifyingHash)
                const valResult = {
                    "identifyingString": identifyingString,
                    "identifyingHash": identifyingHash,
                    "identifiyingDict": identifiyingDict,
                    "identifiyingDictRollupEnriched": identifiyingDictRollupEnriched,

                };
                // console.log("valResult:", valResult);
                ValResultList.push(valResult)
            }
            colResult[value] = { "valueList": ValResultList }
        }
        resultTree[col] = colResult
    }
    return { "resultTree": resultTree, "hashSet": hashSet };
}

function aggregateValuesInTree(valueTree, aggDict, valueName, aggName) {
    if (typeof valueTree !== 'object' || valueTree === null) return valueTree;

    const result = Array.isArray(valueTree) ? [] : {};

    for (const key in valueTree) {
        const value = valueTree[key];

        // Handle the object that contains the list with cachedData
        if (key === 'valueList' && typeof value === 'object') {
            const aggregated = {};

            // Initialize all fields to 0
            for (const field in aggDict) {
                if (aggDict[field] === 'sum') {
                    aggregated[field] = 0;
                }
                // You can add support for other aggregation types here
            }

            // Perform aggregation
            for (const itemKey in value) {
                const item = value[itemKey];
                const data = item[valueName];
                if (data) {
                    for (const field in aggDict) {
                        if (aggDict[field] === 'sum' && typeof data[field] === 'number') {
                            aggregated[field] += data[field];
                        }
                    }
                }
            }

            // Assign both the original list and the aggregated values
            result[aggName] = aggregated;
            result[key] = value;
        } else if (typeof value === 'object' && value !== null) {
            result[key] = aggregateValuesInTree(value, aggDict, valueName, aggName);
        } else {
            result[key] = value;
        }
    }

    return result;
}



function buildHashStructures(tableSets, tables, dim_distinct_values, currentFilters, setup_info, rollup_higher_values) {
    const hashTree = {};
    const hashSets = {};

    for (const table of tables) {
        hashSets[table] = new Set();
    }

    // console.log("currentFilters:", currentFilters);
    for (const set of tableSets) {
        // console.log("set:", set);
        hashTree[set] = {};
        for (const table of tables) {
            // console.log("table:", table);
            // console.log("dim_distinct_values[table],:", dim_distinct_values[table],);
            // console.log("currentFilters[set],:", currentFilters[set],);
            // console.log("setup_info.dimension_cols_ordered_dict[table],:", setup_info.dimension_cols_ordered_dict[table],);
            // console.log("rollup_higher_values[table]:", rollup_higher_values[table]);
            const { resultTree, hashSet } = generateHashes(
                dim_distinct_values[table],
                currentFilters[set],
                setup_info.dimension_cols_ordered_dict[table],
                "All",
                rollup_higher_values[table]
            );
            // console.log("resultTree:", resultTree);
            // console.log("hashSet:", hashSet);
            hashTree[set][table] = deepClone(resultTree);

            for (const hash of hashSet) {
                hashSets[table].add(hash);
            }
        }
    }

    return { hashTree, hashSets };
}


async function fetchMissingHashesAndMerge(hashSets, cachedHashes, hashFileSizes, default_agg_values) {
    const results = {};
    // console.log("cachedHashes:", cachedHashes);

    for (const [table, hashSet] of Object.entries(hashSets)) {
        const BATCH_SIZE = 100;
        const hashesToSearch = [...setDifference(hashSet, Object.keys(cachedHashes))];
        // console.log("hashesToSearch:", hashesToSearch);

        for (let start = 0; start < hashesToSearch.length; start += BATCH_SIZE) {
            const batch = hashesToSearch.slice(start, start + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(async (hash) => {
                    const founddata = await searchHashValue(hashFileSizes, hash);
                    const aggResult = founddata ?? default_agg_values[table];
                    return { hash, aggResult };
                })
            );

            for (const { hash, aggResult } of batchResults) {
                results[hash] = aggResult;
            }
        }
    }
    cachedHashes = mergeUniqueObjects(cachedHashes, results);
    return cachedHashes;
}

function addDataToTree(hashTree, cachedHashes, hashName) {
    if (typeof hashTree !== 'object' || hashTree === null) return hashTree;
    const result = {};
    for (const key in hashTree) {
        if (key === hashName) {
            result[key] = hashTree[key];
            result["cachedData"] = cachedHashes[hashTree[key]];
        } else if (typeof hashTree[key] === 'object' && hashTree[key] !== null) {
            result[key] = addDataToTree(hashTree[key], cachedHashes, hashName);
        } else {
            result[key] = hashTree[key];
        }
    }
    return result;
}

