import { stuckArrows, type Landing } from "./landings";

const HIT_AT_QUARTER: Landing = { pos: 0.25, hit: true };
const HIT_AT_HALF: Landing = { pos: 0.5, hit: true };
const FLIER_AT_START: Landing = { pos: 0, hit: false };
const FLIER_AT_END: Landing = { pos: 1, hit: false };

test("no arrows are stuck before the first shot", () => {
  expect(stuckArrows([])).toEqual([]);
});

test("every good arrow stays stuck in the bale", () => {
  expect(stuckArrows([HIT_AT_QUARTER, HIT_AT_HALF])).toEqual([HIT_AT_QUARTER, HIT_AT_HALF]);
});

test("a flier sticks only until the next shot", () => {
  expect(stuckArrows([HIT_AT_QUARTER, FLIER_AT_START])).toEqual([HIT_AT_QUARTER, FLIER_AT_START]);
  expect(stuckArrows([HIT_AT_QUARTER, FLIER_AT_START, HIT_AT_HALF])).toEqual([
    HIT_AT_QUARTER,
    HIT_AT_HALF,
  ]);
});

test("a second flier takes the first one's place", () => {
  expect(stuckArrows([FLIER_AT_START, FLIER_AT_END])).toEqual([FLIER_AT_END]);
});

test("a flier before a hit never comes back", () => {
  expect(stuckArrows([FLIER_AT_START, HIT_AT_HALF, FLIER_AT_END])).toEqual([
    HIT_AT_HALF,
    FLIER_AT_END,
  ]);
});
