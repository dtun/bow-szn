import { createHunt, type HuntPhase, type HuntState } from "@bow-szn/core";

import { huntView } from "./hunt-view";
import { powerFor } from "./power-meter";

const VIEW = huntView({ width: 390, height: 844, insetTop: 47, insetBottom: 34 });
const DIM = "#5b5772";
const GREEN = "#5fae3a";
const YELLOW = "#f7d44a";
const RED = "#e23b3b";

function drawing(pullY: number, heldMs = 0): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  let phase: HuntPhase = { kind: "drawing", pull: { x: 0, y: pullY }, heldMs };
  return { ...opening, wind: { dir: 1, strength: 0 }, phase };
}

function segmentColors(state: HuntState): string[] {
  let meter = powerFor(state, VIEW);
  return (meter?.marks ?? [])
    .filter((mark) => mark.key.startsWith("power-segment-"))
    .map((mark) => (mark.kind === "rect" ? mark.color : ""));
}

function texts(state: HuntState): string[] {
  return (powerFor(state, VIEW)?.labels ?? []).map((label) => label.text);
}

function steadyWidth(state: HuntState): number | undefined {
  let bar = powerFor(state, VIEW)?.marks.find((mark) => mark.key === "steady");
  return bar?.kind === "rect" ? bar.width : undefined;
}

test("half a pull reads 50% and lights the five green segments", () => {
  expect(texts(drawing(30))).toEqual(["POWER", "50%", "STEADY"]);
  expect(segmentColors(drawing(30))).toEqual([
    GREEN,
    GREEN,
    GREEN,
    GREEN,
    GREEN,
    DIM,
    DIM,
    DIM,
    DIM,
    DIM,
  ]);
});

test("a full draw reads 100% and lights the meter green to yellow to red", () => {
  expect(texts(drawing(90))).toEqual(["POWER", "100%", "STEADY"]);
  expect(segmentColors(drawing(90))).toEqual([
    GREEN,
    GREEN,
    GREEN,
    GREEN,
    GREEN,
    YELLOW,
    YELLOW,
    YELLOW,
    RED,
    RED,
  ]);
});

test("the steady bar drains while a full draw is held, empty as the sway starts", () => {
  expect(steadyWidth(drawing(60, 0))).toBe(59);
  expect(steadyWidth(drawing(60, 1250))).toBe(30);
  expect(steadyWidth(drawing(60, 2500))).toBe(0);
});

test("past the sway onset the panel calls out the wobble", () => {
  expect(texts(drawing(60, 2600))).toEqual(["POWER", "100%", "WOBBLE!"]);
});

test("sits in the bottom right corner, above the home indicator", () => {
  let panel = powerFor(drawing(30), VIEW)?.marks.find((mark) => mark.key === "power-panel");

  expect(panel).toMatchObject({ x: 118, y: 279, width: 67, height: 38 });
});

test("shows nothing until the pull clears the dead zone", () => {
  expect(powerFor(drawing(5), VIEW)).toBe(null);
});
