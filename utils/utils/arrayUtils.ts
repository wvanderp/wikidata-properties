/**
 * Splits an array into chunks of the specified size.
 * @param array - The array to split into chunks
 * @param size - The size of each chunk
 * @returns An array of chunks
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array');
    }

    if (!Number.isInteger(size) || size < 1) {
        throw new RangeError('Size must be a positive integer');
    }

    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }

    return chunks;
}

/**
 * Creates an object from an array of key-value pairs.
 * @param pairs - An array of [key, value] tuples
 * @returns An object constructed from the key-value pairs
 * @example
 * fromPairs([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 */
export function fromPairs<T = any>(pairs: Array<[string | number | symbol, T]>): Record<string | number | symbol, T> {
    if (!Array.isArray(pairs)) {
        throw new TypeError('Argument must be an array');
    }

    const result: Record<string | number | symbol, T> = {};

    for (const pair of pairs) {
        if (!Array.isArray(pair) || pair.length < 2) {
            // Skip invalid pairs instead of throwing to match lodash behavior
            continue;
        }

        const [key, value] = pair;
        result[key] = value;
    }

    return result;
}
