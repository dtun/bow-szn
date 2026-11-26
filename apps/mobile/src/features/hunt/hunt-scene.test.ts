import {
  createHunt,
  type Animal,
  type AnimalMode,
  type Arrow,
  type Harvest,
  type HuntPhase,
  type HuntState,
} from "@bow-szn/core";

import { sceneFor, type Mark, type Scene } from "./hunt-scene";

const DOE: Animal = {
  id: 7,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 180 },
  facing: 1,
  mode: { kind: "graze", untilMs: 5000 },
};

const BIG_BUCK: Animal = { ...DOE, antlers: { kind: "rack", points: 10 } };

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

const GLINT_MS = 2161;

function huntWith(animals: Animal[], phase: HuntPhase, elapsedMs = 0): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  return { ...opening, wind: { dir: 1, strength: 0 }, animals, phase, elapsedMs };
}

function markNamed(scene: Scene, key: string): Mark | undefined {
  return scene.marks.find((mark) => mark.key === key);
}

function keysStartingWith(scene: Scene, prefix: string): string[] {
  return scene.marks.map((mark) => mark.key).filter((key) => key.startsWith(prefix));
}

function animalArt(animal: Animal, elapsedMs = 0): Mark | undefined {
  return markNamed(sceneFor(huntWith([animal], { kind: "ready" }, elapsedMs)), "animal-7");
}

test("draws the field of the hunt's spot, laid out from the hunt's seed", () => {
  let hunt = huntWith([], { kind: "ready" });

  expect(sceneFor({ ...hunt, config: { ...hunt.config, seed: 99 } }).field).toEqual({
    terrain: "hardwoods",
    seed: 99,
  });
});

test("a ready hunter stands idle in the stand at the bottom of the field", () => {
  let scene = sceneFor(huntWith([], { kind: "ready" }));

  expect(markNamed(scene, "hunter")).toMatchObject({ id: "hunter-idle", x: 90, y: 318 });
});

test("the hunter raises the bow while drawing", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 }));

  expect(markNamed(scene, "hunter")).toMatchObject({ id: "hunter-draw", x: 90, y: 318 });
});

test("a grazing doe stands on its own spot with its head down, over its shadow", () => {
  let scene = sceneFor(huntWith([DOE], { kind: "ready" }));

  expect(markNamed(scene, "animal-7")).toEqual({
    kind: "sprite",
    key: "animal-7",
    id: "doe-graze",
    x: 90,
    y: 180,
    flip: false,
    tint: null,
    rotate: 0,
  });
  expect(keysStartingWith(scene, "shadow-")).toEqual(["shadow-7"]);
});

test("an animal facing left is mirrored", () => {
  expect(animalArt({ ...DOE, facing: -1 })).toMatchObject({ id: "doe-graze", flip: true });
});

test.each([
  [{ kind: "spike" }, "spike-graze"],
  [{ kind: "rack", points: 5 }, "buck-small-graze"],
  [{ kind: "rack", points: 8 }, "buck-medium-graze"],
  [{ kind: "rack", points: 12 }, "buck-large-graze"],
] as const)("a whitetail with %o shows its antlers as %s", (antlers, id) => {
  expect(animalArt({ ...DOE, antlers })).toMatchObject({ id });
});

test.each([
  ["turkey", { kind: "none" }, "turkey-graze"],
  ["rabbit", { kind: "none" }, "rabbit-graze"],
  ["elk", { kind: "none" }, "elk-cow-graze"],
  ["elk", { kind: "rack", points: 12 }, "elk-bull-graze"],
] as const)("a %s with %o is drawn as %s", (species, antlers, id) => {
  expect(animalArt({ ...DOE, species, antlers })).toMatchObject({ id });
});

test("a walking animal steps between its two walk frames", () => {
  let walker: Animal = { ...DOE, mode: { kind: "walk", target: { x: 10, y: 10 } } };

  let ids = new Set(
    [0, 100, 200, 300, 400, 500].map((ms) => {
      let mark = animalArt(walker, ms);
      return mark?.kind === "sprite" ? mark.id : null;
    })
  );

  expect(ids).toEqual(new Set(["doe-walk-1", "doe-walk-2"]));
});

test("a fleeing animal gallops through its flee frame", () => {
  let fleeing: Animal = { ...DOE, mode: { kind: "flee", dir: { x: 0, y: -1 } } };

  let ids = new Set(
    [0, 50, 100, 150, 200].map((ms) => {
      let mark = animalArt(fleeing, ms);
      return mark?.kind === "sprite" ? mark.id : null;
    })
  );

  expect(ids.has("doe-flee")).toBe(true);
});

test("an alert animal stands with its head up", () => {
  expect(animalArt({ ...DOE, mode: { kind: "alert", untilMs: 900 } })).toMatchObject({
    id: "doe-walk-1",
    rotate: 0,
  });
});

test("a downed animal lies tipped onto its side, toward the way it faced", () => {
  let down: AnimalMode = { kind: "down" };

  expect(animalArt({ ...DOE, mode: down })).toMatchObject({
    id: "doe-graze",
    rotate: Math.PI / 2,
  });
  expect(animalArt({ ...DOE, facing: -1, mode: down })).toMatchObject({
    id: "doe-graze",
    rotate: -Math.PI / 2,
  });
});

test("drops an animal that has left the field, shadow and all", () => {
  let gone: Animal = { ...DOE, mode: { kind: "gone" } };

  let scene = sceneFor(huntWith([gone], { kind: "ready" }));

  expect(scene.marks.map((mark) => mark.key)).toEqual(["hunter"]);
});

test("draws farther animals first so nearer ones overlap them", () => {
  let near: Animal = { ...DOE, id: 1, pos: { x: 60, y: 220 } };
  let far: Animal = { ...DOE, id: 2, pos: { x: 120, y: 140 } };

  let scene = sceneFor(huntWith([near, far], { kind: "ready" }));

  expect(keysStartingWith(scene, "animal-")).toEqual(["animal-2", "animal-1"]);
});

test("a big rack glints at its tip for a moment every few seconds", () => {
  let quiet = sceneFor(huntWith([BIG_BUCK], { kind: "ready" }, 0));
  let glinting = sceneFor(huntWith([BIG_BUCK], { kind: "ready" }, GLINT_MS));

  expect(keysStartingWith(quiet, "glint-")).toEqual([]);
  expect(markNamed(glinting, "glint-7")).toMatchObject({ id: "glint-1", x: 88, y: 167 });
});

test("a small rack never glints", () => {
  let small: Animal = { ...DOE, antlers: { kind: "rack", points: 6 } };

  let scene = sceneFor(huntWith([small], { kind: "ready" }, GLINT_MS));

  expect(keysStartingWith(scene, "glint-")).toEqual([]);
});

test("drawing back past the dead zone shows the dotted path, the reticle, and the power", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 }));

  expect(keysStartingWith(scene, "aim-dot-")).toHaveLength(12);
  expect(markNamed(scene, "aim-dot-11")).toMatchObject({ x: 89, y: 219, width: 2, height: 2 });
  expect(markNamed(scene, "reticle-across")).toMatchObject({ x: 86, y: 220, width: 9, height: 1 });
  expect(markNamed(scene, "reticle-down")).toMatchObject({ x: 90, y: 216, width: 1, height: 9 });
  expect(scene.powerLabel).toBe("POWER 50%");
});

test("a full draw reads 100% power", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 90 }, heldMs: 0 }));

  expect(scene.powerLabel).toBe("POWER 100%");
});

test("a pull inside the dead zone shows no aim", () => {
  let scene = sceneFor(huntWith([], { kind: "drawing", pull: { x: 0, y: 5 }, heldMs: 0 }));

  expect(keysStartingWith(scene, "aim-")).toEqual([]);
  expect(keysStartingWith(scene, "reticle-")).toEqual([]);
  expect(scene.powerLabel).toBe(null);
});

test("an arrow at the top of its arc rides above its shadow, pointing up-field", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 90, y: 190 },
    durationMs: 1000,
    elapsedMs: 500,
    peakHeight: 20,
  };

  let scene = sceneFor(huntWith([], { kind: "flight", arrow }));

  expect(markNamed(scene, "arrow-shadow")).toMatchObject({ x: 89, y: 240, width: 3, height: 1 });
  expect(markNamed(scene, "arrow")).toMatchObject({ id: "arrow", x: 90, y: 220 });
  expect(markNamed(scene, "arrow")).toHaveProperty("rotate", 0);
  expect(keysStartingWith(scene, "arrow-trail-")).toHaveLength(3);
  expect(scene.powerLabel).toBe(null);
});

test("an arrow loosed to the right turns to follow its line across the field", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 130, y: 190 },
    durationMs: 1000,
    elapsedMs: 500,
    peakHeight: 20,
  };

  let scene = sceneFor(huntWith([], { kind: "flight", arrow }));
  let mark = markNamed(scene, "arrow");

  expect(mark?.kind === "sprite" ? mark.rotate : null).toBeCloseTo(Math.atan2(40, 100));
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

  expect(markNamed(scene, "arrow")).toMatchObject({ x: 90, y: 290 });
  expect(markNamed(scene, "arrow-shadow")).toMatchObject({ x: 89, y: 290 });
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

  expect(scene.marks.map((mark) => mark.key)).toEqual(["hunter"]);
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
