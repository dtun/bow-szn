import type { Terrain } from "@bow-szn/core";

import { decorBox, fieldLayout, OPEN_MIDDLE, STAND, type Box } from "./field-layout";

const TERRAINS: Terrain[] = ["hardwoods", "meadow", "marsh", "ridge"];
const SEEDS = Array.from({ length: 40 }, (_, index) => index * 7919 + 1);

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

test("the same terrain and seed lay out the same field", () => {
  expect(fieldLayout("hardwoods", 42)).toEqual(fieldLayout("hardwoods", 42));
});

test("a new seed moves the dressing around", () => {
  expect(fieldLayout("hardwoods", 42).decor).not.toEqual(fieldLayout("hardwoods", 43).decor);
});

test.each(TERRAINS)("%s keeps every prop out of the open middle where animals graze", (terrain) => {
  let crowding = SEEDS.flatMap((seed) =>
    fieldLayout(terrain, seed).decor.filter((decor) => overlaps(decorBox(decor), OPEN_MIDDLE))
  );

  expect(crowding).toEqual([]);
});

test.each(TERRAINS)("%s keeps every prop off the tree stand", (terrain) => {
  let crowding = SEEDS.flatMap((seed) =>
    fieldLayout(terrain, seed).decor.filter((decor) => overlaps(decorBox(decor), STAND))
  );

  expect(crowding).toEqual([]);
});

test.each([
  ["hardwoods", "stump"],
  ["meadow", "grass-tuft-1"],
  ["marsh", "cattails"],
  ["ridge", "rock-2"],
] as const)("%s dresses its edges with %s", (terrain, prop) => {
  let props = new Set(SEEDS.flatMap((seed) => fieldLayout(terrain, seed).decor.map((d) => d.id)));

  expect(props.has(prop)).toBe(true);
});

test("cattails grow only in the marsh", () => {
  let dry = (["hardwoods", "meadow", "ridge"] as const).flatMap((terrain) =>
    SEEDS.flatMap((seed) => fieldLayout(terrain, seed).decor.filter((d) => d.id === "cattails"))
  );

  expect(dry).toEqual([]);
});

test("draws the dressing back to front so nearer props overlap farther ones", () => {
  let rows = fieldLayout("hardwoods", 5).decor.map((decor) => decor.y);

  expect(rows).toEqual([...rows].sort((a, b) => a - b));
});
