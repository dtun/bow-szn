import { createRoller } from "./rng";

function rolls(seed: number, count: number): number[] {
  let roller = createRoller(seed);
  return Array.from({ length: count }, () => roller.float());
}

describe("rng", () => {
  test("the same seed rolls the same sequence", () => {
    expect(rolls(42, 5)).toEqual(rolls(42, 5));
  });

  test("a roller resumed from a saved state continues the same sequence", () => {
    let first = createRoller(7);
    first.float();
    first.float();
    let resumed = createRoller(first.state());
    expect(resumed.float()).toBe(first.float());
  });

  test("different seeds roll different sequences", () => {
    expect(rolls(1, 5)).not.toEqual(rolls(2, 5));
  });

  test("floats stay in [0, 1) and ints stay inside their inclusive range", () => {
    let roller = createRoller(99);
    let floats = Array.from({ length: 500 }, () => roller.float());
    let ints = Array.from({ length: 500 }, () => roller.int(4, 12));
    expect(Math.min(...floats)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...floats)).toBeLessThan(1);
    expect(new Set(ints)).toEqual(new Set([4, 5, 6, 7, 8, 9, 10, 11, 12]));
  });

  test("a weighted pick never lands on a zero-weight item", () => {
    let roller = createRoller(3);
    let picks = Array.from({ length: 200 }, () =>
      roller.pick(["doe", "spike", "buck"], (kind) => (kind === "spike" ? 0 : 1))
    );
    expect(new Set(picks)).toEqual(new Set(["doe", "buck"]));
  });
});
