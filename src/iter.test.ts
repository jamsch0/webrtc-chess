import test from "ava";
import { range, repeat, zip } from "./iter.js";

test("range yields nothing when inputs are equal", t => {
    const results = Array.from(range(5, 5));
    t.is(results.length, 0);
});

test("range yields correct results ascending", t => {
    const results = Array.from(range(3, 8));
    t.is(results.length, 5);
    t.is(results[0], 3);
    t.is(results[4], 7);
});

test("range yields correct results descending", t => {
    const results = Array.from(range(2, -8));
    t.is(results.length, 10);
    t.is(results[0], 2);
    t.is(results[9], -7);
});

test("repeat yields input continuously", t => {
    const iter = repeat(11);
    for (let i = 0; i < 100; i++) {
        t.is(iter.next().value, 11);
    }
});

test("zip yields correct results for input iterators yielding different amounts of values", t => {
    const results = Array.from(zip(range(0, 4), repeat(-1)));
    t.is(results.length, 4);

    for (let i = 0; i < 4; i++) {
        t.is(results[i][0], i);
        t.is(results[i][1], -1);
    }
});
