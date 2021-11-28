/**
 * Creates an iterator over the half-open range [from, to).
 * @param {number} from
 * @param {number} to
 * @returns {Generator<number>}
 */
export function* range(from, to) {
    if (from === to) {
        return;
    }

    if (from < to) {
        for (let i = from; i < to; i++) {
            yield i;
        }
    } else {
        for (let i = from; i > to; i--) {
            yield i;
        }
    }
}

/**
 * Creates an iterator that infinitely repeats x.
 * @param {number} x
 * @returns {Generator<number>}
 */
export function* repeat(x) {
    let exit = false;
    while (!exit) {
        exit = yield x;
    }
}

/**
 * Creates an iterator over pairs of values from a and b.
 * @param {Generator<number>} a
 * @param {Generator<number>} b
 * @returns {Generator<[number, number]>}
 */
export function* zip(a, b) {
    let aResult;
    let bResult;

    while (true) {
        aResult = a.next();
        bResult = b.next();

        if (aResult.done || bResult.done) {
            return;
        }

        yield [aResult.value, bResult.value];
    };
}
