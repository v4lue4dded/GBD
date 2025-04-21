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
            return { hash: h, data: obj };
        }
    }

    // If chunkMinHash < searchHash < chunkMaxHash but not found => not present
    if (chunkMinHash < searchHash && chunkMaxHash > searchHash) {
        return null;
    }

    // If entire chunk is below
    if (chunkMaxHash < searchHash) {
        const newMinByte = Math.floor(requestEnd + 1);
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
        const newMaxByte = Math.floor(requestStart - 1);
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


async function getHashValue(hashFileSizes, hash) {
    if (!cachedHashes.hasOwnProperty(hash)) {
        const partialHash = hash.substring(0, 3);
        const fileUrl = `data_doc/cachefilter_hash_db/${partialHash}.json`;
        const minByte = 0;
        const maxByte = hashFileSizes[partialHash];
        const minHash = `${partialHash}00000000000000000000000000000`;
        const maxHash = `${partialHash}fffffffffffffffffffffffffffff`;
        const initialRange = 5_000;       // 5 KB

        // store **one** in‑flight promise per hash so concurrent requests co‑alesce
        cachedHashes[hash] = guidedSearchRange(
            fileUrl, hash,
            minByte, maxByte,
            minHash, maxHash,
            initialRange
        );
    }

    // ensure the cache always ends up with the resolved value, not a promise
    if (cachedHashes[hash] instanceof Promise) {
        cachedHashes[hash] = await cachedHashes[hash];
    }
    return cachedHashes[hash];            // ← always the fully‑resolved object
}