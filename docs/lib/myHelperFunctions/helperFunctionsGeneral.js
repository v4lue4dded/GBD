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
