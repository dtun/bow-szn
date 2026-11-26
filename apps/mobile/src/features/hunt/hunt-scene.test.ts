import {
  createHunt,
  type Animal,
  type AnimalMode,
  type Arrow,
  type Harvest,
  type HuntPhase,
  type HuntState,
} from "@bow-szn/core";

import { sceneFor, type Scene, type SceneRect } from "./hunt-scene";

const DOE: Animal = {
  id: 7,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 180 },
  facing: 1,
  mode: { kind: "graze", untilMs: 5000 },
};

const HARVEST: Harvest = {
  id: "h1",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 140,
  meatLb: 63,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 372,
  shotYards: 55,
};

function huntWith(animals: Animal[], phase: HuntPhase): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  return { ...opening, wind: { dir: 1, strength: 0 }, animals, phase };
}

function rectNamed(scene: Scene, key: string): SceneRect | undefined {
  return scene.rects.find((rect) => rect.key === key);
}

function rectKeysStartingWith(scene: Scene, prefix: string): string[] {
  return scene.rects.map((rect) => rect.key).filter((key) => key.startsWith(prefix));
}

test("a ready hunt shows the field, the hunter, and each animal at its own position", () => {
  let scene = sceneFor(huntWith([DOE], { kind: "ready" }));

  expect(scene.rects.map((rect) => rect.key)).toEqual(["field", "hunter", "animal-7"]);
  expect(rectNamed(scene, "field")).toMatchObject({ x: 0, y: 0, width: 180, height: 320 });
  expect(rectNamed(scene, "hunter")).toMatchObject({ x: 85, y: 285, width: 10, height: 10 });
  expect(rectNamed(scene, "animal-7")).toMatchObject({ x: 83, y: 173, width: 14, height: 14 });
  expect(scene.powerLabel).toBe(null);
  expect(scene.resultLabel).toBe(null);
});

test("sizes each animal by its species", () => {
  let rabbit: Animal = { ...DOE, id: 8, species: "rabbit" };

  let scene = sceneFor(huntWith([rabbit], { kind: "ready" }));

  expect(rectNamed(scene, "animal-8")).toMatchObject({ x: 87, y: 177, width: 6, height: 6 });
});

test("colors a downed animal differently from a live one", () => {
  let down: Animal = { ...DOE, mode: { kind: "down" } };

  let live = rectNamed(sceneFor(huntWith([DOE], { kind: "ready" })), "animal-7");
  let fallen = rectNamed(sceneFor(huntWith([down], { kind: "ready" })), "animal-7");

  expect(fallen?.color).not.toBe(live?.color);
});

test("treats every live mode the same color", () => {
  let modes: AnimalMode[] = [
    { kind: "graze", untilMs: 1 },
    { kind: "walk", target: { x: 10, y: 10 } },
    { kind: "alert", untilMs: 1 },
    { kind: "flee", dir: { x: 0, y: -1 } },
  ];

  let colors = modes.map(
    (mode) =>
      rectNamed(sceneFor(huntWith([{ ...DOE, mode }], { kind: "ready" })), "animal-7")?.color
  );

  expect(new Set(colors).size).toBe(1);
});

test("drops an animal that has left the field", () => {
  let gone: Animal = { ...DOE, mode: { kind: "gone" } };

  let scene = sceneFor(huntWith([gone], { kind: "ready" }));

  expect(scene.rects.map((rect) => rect.key)).toEqual(["field", "hunter"]);
});

test("drawing back past the dead zone shows the dotted path, the reticle, and the power", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 }));

  expect(rectKeysStartingWith(scene, "aim-dot-")).toHaveLength(12);
  expect(rectNamed(scene, "aim-dot-11")).toMatchObject({ x: 89, y: 219, width: 2, height: 2 });
  expect(rectNamed(scene, "reticle-across")).toMatchObject({ x: 86, y: 220, width: 9, height: 1 });
  expect(rectNamed(scene, "reticle-down")).toMatchObject({ x: 90, y: 216, width: 1, height: 9 });
  expect(scene.powerLabel).toBe("POWER 50%");
});

test("a full draw reads 100% power", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 90 }, heldMs: 0 }));

  expect(scene.powerLabel).toBe("POWER 100%");
});

test("a pull inside the dead zone shows no aim", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 5 }, heldMs: 0 }));

  expect(rectKeysStartingWith(scene, "aim-")).toEqual([]);
  expect(rectKeysStartingWith(scene, "reticle-")).toEqual([]);
  expect(scene.powerLabel).toBe(null);
});

test("an arrow mid-flight rides above its shadow on the ground", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 90, y: 190 },
    durationMs: 1000,
    elapsedMs: 500,
    peakHeight: 20,
  };

  let scene = sceneFor(huntWith([], { kind: "flight", arrow }));

  expect(rectNamed(scene, "arrow-shadow")).toMatchObject({ x: 87, y: 239, width: 6, height: 2 });
  expect(rectNamed(scene, "arrow")).toMatchObject({ x: 89, y: 216, width: 2, height: 8 });
  expect(scene.powerLabel).toBe(null);
});

test("an arrow at launch sits on the ground at the hunter", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 90, y: 190 },
    durationMs: 1000,
    elapsedMs: 0,
    peakHeight: 20,
  };

  let scene = sceneFor(huntWith([], { kind: "flight", arrow }));

  expect(rectNamed(scene, "arrow")).toMatchObject({ x: 89, y: 286 });
  expect(rectNamed(scene, "arrow-shadow")).toMatchObject({ x: 87, y: 289 });
});

test("a harvest reads HIT!", () => {
  let scene = sceneFor(
    huntWith([], { kind: "result", outcome: { kind: "harvest", harvest: HARVEST } })
  );

  expect(scene.resultLabel).toBe("HIT!");
});

test("a miss reads MISS, near or far", () => {
  let far = sceneFor(huntWith([], { kind: "result", outcome: { kind: "miss", near: false } }));
  let near = sceneFor(huntWith([], { kind: "result", outcome: { kind: "miss", near: true } }));

  expect(far.resultLabel).toBe("MISS");
  expect(near.resultLabel).toBe("MISS");
});

test("shows no aim and no arrow when the hunt is ready", () => {
  let scene = sceneFor(huntWith([], { kind: "ready" }));

  expect(scene.rects.map((rect) => rect.key)).toEqual(["field", "hunter"]);
});

test("an ended hunt says why, in place of a shot result", () => {
  let dusk = sceneFor(huntWith([], { kind: "over", reason: "dusk" }));
  let empty = sceneFor(huntWith([], { kind: "over", reason: "quiver-empty" }));

  expect(dusk.overLabel).toBe("DUSK");
  expect(empty.overLabel).toBe("OUT OF ARROWS");
  expect(dusk.resultLabel).toBe(null);
  expect(dusk.powerLabel).toBe(null);
});

test("only an ended hunt carries the over label", () => {
  let scene = sceneFor(huntWith([], { kind: "ready" }));

  expect(scene.overLabel).toBe(null);
});
