import { createHunt, type HuntPhase, type HuntState } from "@bow-szn/core";

import { drawGauge, powerSegments } from "./draw-gauge";
import type { Mark } from "./scene-marks";

const CREAM = "#f4efe1";
const GOLD = "#f7d44a";
const RED = "#e23b3b";
const EMPTY = "rgba(11,15,26,0.4)";

function drawing(pullY: number, heldMs = 0, elapsedMs = 0): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  let phase: HuntPhase = { kind: "drawing", pull: { x: 0, y: pullY }, heldMs };
  return { ...opening, wind: { dir: 1, strength: 0 }, phase, elapsedMs };
}

function colors(marks: Mark[]): string[] {
  return marks.map((mark) => (mark.kind === "rect" ? mark.color : ""));
}

function lit(state: HuntState): string[] {
  return colors(drawGauge(state)?.marks ?? []).filter((color) => color !== EMPTY);
}

function positions(state: HuntState): string[] {
  return (drawGauge(state)?.marks ?? []).map((mark) => `${mark.x},${mark.y}`);
}

test.each([
  [0.95, 9],
  [0.5, 5],
  [0.49, 4],
  [1, 10],
])("a power of %p crosses %p of ten draw steps", (power, steps) => {
  expect(powerSegments(power)).toBe(steps);
});

test("half a pull lights half the arc in cream, steady", () => {
  let gauge = drawGauge(drawing(30));
  let dots = gauge?.marks.length ?? 0;

  expect(gauge?.percent).toBe(50);
  expect(gauge?.feel).toBe("steady");
  expect(lit(drawing(30)).length).toBe(Math.round(dots / 2));
  expect(new Set(lit(drawing(30)))).toEqual(new Set([CREAM]));
});

test("a full draw lights the whole arc in gold", () => {
  let gauge = drawGauge(drawing(60));

  expect(gauge?.percent).toBe(100);
  expect(gauge?.feel).toBe("full");
  expect(colors(gauge?.marks ?? []).every((color) => color === GOLD)).toBe(true);
});

test("a full draw held past the sway onset turns the arc red and shakes it", () => {
  let still = positions(drawing(60, 2000, 1000));
  let shaking = [1000, 1020, 1040, 1060, 1080].map((ms) => positions(drawing(60, 3000, ms)));

  expect(drawGauge(drawing(60, 3000))?.feel).toBe("wobble");
  expect(new Set(lit(drawing(60, 3000)))).toEqual(new Set([RED]));
  expect(shaking.some((each) => each.join() !== still.join())).toBe(true);
});

test("the arc hugs the hunter, opening downward over the stand", () => {
  let marks = drawGauge(drawing(30))?.marks ?? [];
  let ys = marks.map((mark) => mark.y);
  let xs = marks.map((mark) => mark.x);

  expect(Math.min(...ys)).toBe(277);
  expect(Math.max(...ys)).toBe(307);
  expect(Math.min(...xs)).toBe(70);
  expect(Math.max(...xs)).toBe(110);
});

test("shows nothing until the pull clears the dead zone", () => {
  expect(drawGauge(drawing(5))).toBe(null);
});
