function getRandomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}


function round_z(value) {
    let rounded = Math.round(value);
    if (Math.sign(rounded) === -1 && Math.abs(rounded) === 0) {
        return 0;
    }
    return rounded;
}

function bigNStyle(value) {
    return d3.format(',')(round_z(value));
}

function deepClone(item) {
    if (Array.isArray(item)) {
        // Handle array
        return item.map(deepClone);
    } else if (typeof item === 'object' && item !== null) {
        // Handle object
        if (typeof item.clone === 'function') {
            // If the object has a custom clone method, use it.
            return item.clone();
        } else {
            // Else, create a shallow copy and deep clone any properties
            const clone = {};
            for (const [key, value] of Object.entries(item)) {
                clone[key] = deepClone(value);
            }
            return clone;
        }
    } else {
        // Primitive types can be returned directly
        return item;
    }
}


function setDifference(a, b) {
    aSet = new Set([...a])
    bSet = new Set([...b])
    return new Set([...aSet].filter(x => !bSet.has(x)));
}


function mergeUniqueObjects(...objects) {
    //   const a = { x: 1, y: 2 };
    //   const b = { z: 3 };
    //   const c = { a: 4, b: 5 };

    //   const combined = mergeUniqueObjects(a, b, c);
    //   console.log(combined); // { x: 1, y: 2, z: 3, a: 4, b: 5 }

    const result = {};

    for (const obj of objects) {
        for (const [key, value] of Object.entries(obj)) {
            if (key in result) {
                throw new Error(`Duplicate key found: "${key}"`);
            }
            result[key] = value;
        }
    }

    return result;
}

