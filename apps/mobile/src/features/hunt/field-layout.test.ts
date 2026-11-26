import type { Terrain } from "@bow-szn/core";

import { decorBox, fieldLayout, OPEN_MIDDLE, STAND, type Box } from "./field-layout";
import { huntView } from "./hunt-view";

const TERRAINS: Terrain[] = ["hardwoods", "meadow", "marsh", "ridge"];
const SEEDS = Array.from({ length: 40 }, (_, index) => index * 7919 + 1);
const TALL_PHONE = huntView({ width: 430, height: 932, insetTop: 59, insetBottom: 34 }).bounds;
const SHORT_PHONE = huntView({ width: 375, height: 667, insetTop: 20, insetBottom: 0 }).bounds;

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

test("the same terrain, seed, and screen lay out the same field", () => {
  expect(fieldLayout("hardwoods", 42, TALL_PHONE)).toEqual(
    fieldLayout("hardwoods", 42, TALL_PHONE)
  );
});

test("a new seed moves the dressing around", () => {
  expect(fieldLayout("hardwoods", 42, TALL_PHONE).decor).not.toEqual(
    fieldLayout("hardwoods", 43, TALL_PHONE).decor
  );
});

test("the ground covers the whole screen, overscan included", () => {
  let [base] = fieldLayout("meadow", 7, TALL_PHONE).ground;

  expect(base).toMatchObject({ x: -17, y: -129, width: 215, height: 466 });
});

test.each(TERRAINS)("%s keeps every prop out of the open middle where animals graze", (terrain) => {
  let crowding = [TALL_PHONE, SHORT_PHONE].flatMap((bounds) =>
    SEEDS.flatMap((seed) => {
      let layout = fieldLayout(terrain, seed, bounds);
      return [...layout.decor, ...layout.canopy].filter((decor) =>
        overlaps(decorBox(decor), OPEN_MIDDLE)
      );
    })
  );

  expect(crowding).toEqual([]);
});

test.each(TERRAINS)("%s keeps every prop off the tree stand and its ladder", (terrain) => {
  let crowding = SEEDS.flatMap((seed) =>
    fieldLayout(terrain, seed, TALL_PHONE).decor.filter((decor) => overlaps(decorBox(decor), STAND))
  );

  expect(crowding).toEqual([]);
});

test("the canopy runs from the treeline up past the top of the screen", () => {
  let tops = fieldLayout("hardwoods", 3, TALL_PHONE).canopy.map((tree) => decorBox(tree).top);

  expect(Math.min(...tops)).toBeLessThanOrEqual(TALL_PHONE.top);
});

test("the stand's ladder runs down to the bottom of the screen", () => {
  let ground = fieldLayout("hardwoods", 3, TALL_PHONE).ground;
  let rails = ground.filter((block) => block.y === 318 && block.width === 1 && block.height > 1);

  expect(rails.map((rail) => rail.y + rail.height)).toEqual(Array(6).fill(TALL_PHONE.bottom));
});

test.each([
  ["hardwoods", "stump"],
  ["meadow", "grass-tuft-1"],
  ["marsh", "cattails"],
  ["ridge", "rock-2"],
] as const)("%s dresses its edges with %s", (terrain, prop) => {
  let props = new Set(
    SEEDS.flatMap((seed) => fieldLayout(terrain, seed, TALL_PHONE).decor.map((d) => d.id))
  );

  expect(props.has(prop)).toBe(true);
});

test("cattails grow only in the marsh", () => {
  let dry = (["hardwoods", "meadow", "ridge"] as const).flatMap((terrain) =>
    SEEDS.flatMap((seed) =>
      fieldLayout(terrain, seed, TALL_PHONE).decor.filter((d) => d.id === "cattails")
    )
  );

  expect(dry).toEqual([]);
});

test("draws props and trees back to front so nearer ones overlap farther ones", () => {
  let layout = fieldLayout("hardwoods", 5, TALL_PHONE);

  for (let rows of [layout.decor.map((d) => d.y), layout.canopy.map((d) => d.y)]) {
    expect(rows).toEqual([...rows].sort((a, b) => a - b));
  }
});
