import { huntConfigFor } from "./hunt-config";

const NOW_MS = 1_700_000_000_000;

test("takes the seed from the url param and the first spot, season, and difficulty", () => {
  expect(huntConfigFor("42", NOW_MS)).toEqual({
    spot: "cedar-hollow",
    season: "early",
    difficulty: "easy",
    seed: 42,
  });
});

test("reads a negative seed", () => {
  expect(huntConfigFor("-7", NOW_MS).seed).toBe(-7);
});

test("reads the first value when the param repeats", () => {
  expect(huntConfigFor(["7", "9"], NOW_MS).seed).toBe(7);
});

test("seeds from the clock when the param is missing", () => {
  expect(huntConfigFor(undefined, NOW_MS).seed).toBe(NOW_MS);
});

test.each(["", "abc", "4.5", "12abc", " 3"])("seeds from the clock for the param %p", (param) => {
  expect(huntConfigFor(param, NOW_MS).seed).toBe(NOW_MS);
});
