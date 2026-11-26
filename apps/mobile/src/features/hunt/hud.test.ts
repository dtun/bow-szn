import { createHunt, type Harvest, type HuntState, type Wind } from "@bow-szn/core";

import { hudFor, hudRow } from "./hud";
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

test("the hunt opens with the spot's name, which clears after a moment", () => {
  expect(labelText(hunt({ elapsedMs: 0 }), "spot")).toBe("HIGH RIDGE");
  expect(labelText(hunt({ elapsedMs: 2400 }), "spot")).toBe("HIGH RIDGE");
  expect(labelText(hunt({ elapsedMs: 2600 }), "spot")).toBe(undefined);
});

test("there is no top bar and no digital clock", () => {
  let hud = hudFor(hunt({ clockMin: 363 }), VIEW);

  expect(hud.marks.filter((mark) => mark.key.startsWith("hud-bar"))).toEqual([]);
  expect(hud.labels.map((each) => each.key)).not.toContain("clock");
});

function tagIcons(state: HuntState): Mark[] {
  return hudFor(state, VIEW).marks.filter((mark) => mark.key.startsWith("tag-"));
}

test("each tag filled hangs a paper deer tag in the row, after the quiver", () => {
  let state = hunt({ harvests: [DOE, { ...DOE, id: "1-4" }] });
  let hud = hudFor(state, VIEW);
  let quiverEnd = hud.quiver.x + hud.quiver.width;

  expect(tagIcons(state).map((mark) => (mark.kind === "sprite" ? mark.id : null))).toEqual([
    "deer-tag",
    "deer-tag",
  ]);
  expect(tagIcons(state).every((mark) => mark.x > quiverEnd)).toBe(true);
  expect(hud.labels.map((each) => each.text)).not.toContain("TAGS 2");
});

test("a morning with no tags yet shows no tag", () => {
  expect(tagIcons(hunt({ harvests: [] }))).toEqual([]);
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

test("the HUD row sits just under the top safe area", () => {
  expect(hudRow(VIEW)).toEqual({ top: VIEW.safeTop + 3, bottom: VIEW.safeTop + 15, windLeft: 153 });
});

test("MAP sits at the left of the row under the bar", () => {
  expect(hudFor(hunt(), VIEW).mapButton).toEqual({ x: -4, y: -58, width: 26, height: 12 });
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
