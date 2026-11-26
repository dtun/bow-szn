import type { Terrain } from "@bow-szn/core";

import {
  decorBox,
  fieldLayout,
  groundColor,
  OPEN_MIDDLE,
  STAND,
  type Box,
  type Decor,
  type FieldLayout,
} from "./field-layout";
import { huntView } from "./hunt-view";
import type { Block } from "./sprite-pictures";

const TERRAINS: Terrain[] = ["hardwoods", "meadow", "marsh", "ridge"];
const SEEDS = Array.from({ length: 40 }, (_, index) => index * 7919 + 1);
const TALL_PHONE = huntView({ width: 430, height: 932, insetTop: 59, insetBottom: 34 }).bounds;
const SHORT_PHONE = huntView({ width: 375, height: 667, insetTop: 20, insetBottom: 0 }).bounds;
const PRO_MAX = huntView({ width: 440, height: 956, insetTop: 62, insetBottom: 34 }).bounds;

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

test("the ground covers the whole screen, overscan included, in the terrain's own green", () => {
  let [base] = fieldLayout("meadow", 7, TALL_PHONE).ground;

  expect(base).toEqual({ x: -17, y: -129, width: 215, height: 466, color: groundColor("meadow") });
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

function colorAt(blocks: Block[], x: number, y: number): string | null {
  let painted = blocks.filter(
    (block) =>
      x >= block.x && x < block.x + block.width && y >= block.y && y < block.y + block.height
  );
  return painted.at(-1)?.color ?? null;
}

function underCanopy(canopy: Decor[], x: number, y: number): boolean {
  return canopy.some((tree) => {
    let box = decorBox(tree);
    return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
  });
}

function crowns(layout: FieldLayout): Decor[] {
  return layout.canopy.filter((tree) => tree.id === "tree-canopy");
}

test("a tall phone's overscan holds a dawn sky, blue at the top and orange at the horizon", () => {
  let { sky } = fieldLayout("hardwoods", 3, PRO_MAX);
  let horizon = Math.max(...sky.map((block) => block.y + block.height));

  expect(colorAt(sky, 0, PRO_MAX.top)).toBe("#2b6cd9");
  expect(colorAt(sky, PRO_MAX.left, PRO_MAX.top)).toBe("#2b6cd9");
  expect(colorAt(sky, PRO_MAX.right - 1, PRO_MAX.top)).toBe("#2b6cd9");
  expect(colorAt(sky, 0, horizon - 1)).toBe("#f08a4b");
  expect(horizon).toBeLessThan(0);
});

test("a low yellow sun sits in the dawn sky", () => {
  let { sky } = fieldLayout("hardwoods", 3, PRO_MAX);
  let horizon = Math.max(...sky.map((block) => block.y + block.height));
  let sun = sky.filter((block) => block.color === "#f7d44a");

  expect(sun.length).toBeGreaterThan(0);
  expect(Math.max(...sun.map((block) => block.y + block.height))).toBeLessThanOrEqual(horizon);
  expect(Math.min(...sun.map((block) => block.y))).toBeGreaterThan(horizon - 30);
});

test("a thin treeline stands along the horizon in front of the sky", () => {
  let layout = fieldLayout("hardwoods", 3, PRO_MAX);
  let horizon = Math.max(...layout.sky.map((block) => block.y + block.height));
  let treeline = layout.canopy.filter((tree) => tree.id === "brand-treeline");

  expect(treeline.map((tree) => tree.y)).toEqual(Array(treeline.length).fill(horizon));
  for (let x = PRO_MAX.left; x < PRO_MAX.right; x++) {
    expect(underCanopy(treeline, x, horizon - 1)).toBe(true);
  }
});

test.each([
  ["440x956", PRO_MAX],
  ["430x932", TALL_PHONE],
  ["375x667", SHORT_PHONE],
])(
  "on a %s phone the world's own canopy still hides the top of the field, so animals walk out of the trees",
  (_, bounds) => {
    let trees = crowns(fieldLayout("hardwoods", 3, bounds));
    let hidden = [-10, 0, 20, 40].flatMap((y) =>
      Array.from({ length: 180 }, (_, x) => underCanopy(trees, x, y))
    );

    expect(hidden.every(Boolean)).toBe(true);
    expect(trees.every((tree) => tree.y >= 0)).toBe(true);
  }
);

test("a phone with no room above the world shows its canopy right up to the top", () => {
  let layout = fieldLayout("hardwoods", 3, SHORT_PHONE);

  expect(layout.sky).toEqual([]);
  for (let x = SHORT_PHONE.left; x < SHORT_PHONE.right; x++) {
    expect(underCanopy(crowns(layout), x, SHORT_PHONE.top)).toBe(true);
  }
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
