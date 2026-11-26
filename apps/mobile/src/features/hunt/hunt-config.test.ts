import { huntConfigFor } from "./hunt-config";

const NOW_MS = 1_700_000_000_000;

test("takes the seed from the url param and the first spot, season, and difficulty", () => {
  expect(huntConfigFor({ seed: "42" }, NOW_MS)).toEqual({
    spot: "cedar-hollow",
    season: "early",
    difficulty: "easy",
    seed: 42,
  });
});

test("reads the spot, season, and difficulty the map picked", () => {
  expect(
    huntConfigFor({ seed: "9", spot: "high-ridge", season: "rut", difficulty: "hard" }, NOW_MS)
  ).toEqual({ spot: "high-ridge", season: "rut", difficulty: "hard", seed: 9 });
});

test("falls back to the first choice for a spot, season, or difficulty it does not know", () => {
  expect(
    huntConfigFor({ seed: "9", spot: "the-moon", season: "summer", difficulty: "HARD" }, NOW_MS)
  ).toEqual({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 9 });
});

test("reads the first value of a repeated spot, season, or difficulty", () => {
  expect(
    huntConfigFor(
      { spot: ["cattail-marsh", "high-ridge"], season: ["late", "rut"], difficulty: ["medium"] },
      NOW_MS
    )
  ).toEqual({ spot: "cattail-marsh", season: "late", difficulty: "medium", seed: NOW_MS });
});

test("reads a negative seed", () => {
  expect(huntConfigFor({ seed: "-7" }, NOW_MS).seed).toBe(-7);
});

test("reads the first value when the param repeats", () => {
  expect(huntConfigFor({ seed: ["7", "9"] }, NOW_MS).seed).toBe(7);
});

test("seeds from the clock when the param is missing", () => {
  expect(huntConfigFor({}, NOW_MS).seed).toBe(NOW_MS);
});

test.each(["", "abc", "4.5", "12abc", " 3"])("seeds from the clock for the param %p", (param) => {
  expect(huntConfigFor({ seed: param }, NOW_MS).seed).toBe(NOW_MS);
});
