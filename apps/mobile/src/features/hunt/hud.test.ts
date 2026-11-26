import { createHunt, type Harvest, type HuntState, type Wind } from "@bow-szn/core";

import { clockLabel, hudFor } from "./hud";
import { huntView } from "./hunt-view";
import type { Mark } from "./scene-marks";

const VIEW = huntView({ width: 390, height: 844, insetTop: 47, insetBottom: 34 });

const DOE: Harvest = {
  id: "1-3",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 132,
  meatLb: 59,
  spot: "high-ridge",
  season: "rut",
  clockMin: 381,
  shotYards: 41,
};

function hunt(changes: Partial<HuntState> = {}): HuntState {
  let opening = createHunt({ spot: "high-ridge", season: "rut", difficulty: "hard", seed: 1 });
  return { ...opening, ...changes };
}

function labelText(state: HuntState, key: string): string | undefined {
  return hudFor(state, VIEW).labels.find((label) => label.key === key)?.text;
}

function windFlag(wind: Wind): Mark | undefined {
  return hudFor(hunt({ wind }), VIEW).marks.find((mark) => mark.key === "wind-flag");
}

test.each([
  [360, "6:00 AM"],
  [363, "6:03 AM"],
  [363.9, "6:03 AM"],
  [419, "6:59 AM"],
  [600, "10:00 AM"],
  [720, "12:00 PM"],
])("%p minutes after midnight reads %p", (clockMin, text) => {
  expect(clockLabel(clockMin)).toBe(text);
});

test("the top bar shows the spot, the clock, and the tags filled", () => {
  let state = hunt({ clockMin: 363, harvests: [DOE, { ...DOE, id: "1-4" }] });

  expect(labelText(state, "spot")).toBe("HIGH RIDGE");
  expect(labelText(state, "clock")).toBe("6:03 AM");
  expect(labelText(state, "tags")).toBe("TAGS 2");
});

test("the quiver shows one pixel arrow per arrow left", () => {
  function quiver(arrows: number): Mark[] {
    return hudFor(hunt({ arrows }), VIEW).marks.filter((mark) =>
      mark.key.startsWith("quiver-arrow-")
    );
  }

  expect(quiver(4)).toHaveLength(4);
  expect(quiver(1)).toHaveLength(1);
  expect(quiver(0)).toHaveLength(0);
});

test("the top bar sits just under the top safe area", () => {
  let bar = hudFor(hunt(), VIEW).marks.find((mark) => mark.key === "hud-bar");

  expect(bar).toMatchObject({ x: -7, y: VIEW.safeTop, width: 195 });
});

test("MAP sits at the left of the row under the bar", () => {
  expect(hudFor(hunt(), VIEW).mapButton).toEqual({ x: -4, y: -47, width: 22, height: 11 });
});

test.each([
  [0, "icon-wind-light"],
  [1, "icon-wind-light"],
  [2, "icon-wind-medium"],
  [3, "icon-wind-strong"],
])("wind of strength %p flies the %s flag", (strength, id) => {
  expect(windFlag({ dir: 1, strength })).toMatchObject({ id, flip: false });
});

test("the flag flies the way the wind blows, with its strength beside it", () => {
  expect(windFlag({ dir: -1, strength: 2 })).toMatchObject({ flip: true });
  expect(labelText(hunt({ wind: { dir: -1, strength: 2 } }), "wind-strength")).toBe("2");
});
