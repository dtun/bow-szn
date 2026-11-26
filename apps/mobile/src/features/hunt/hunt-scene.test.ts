import {
  createHunt,
  type Animal,
  type AnimalMode,
  type Arrow,
  type Harvest,
  type HuntPhase,
  type HuntState,
} from "@bow-szn/core";

import { fieldLayout } from "./field-layout";
import { sceneFor, type Mark, type Scene } from "./hunt-scene";
import { createSession, type Juice } from "./hunt-session";
import type { Screen } from "./hunt-view";

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

const STILL: Juice = createSession({
  spot: "cedar-hollow",
  season: "early",
  difficulty: "easy",
  seed: 1,
}).juice;

const PHONE: Screen = { width: 390, height: 844, insetTop: 47, insetBottom: 34 };
const BIG_PHONE: Screen = { width: 430, height: 932, insetTop: 59, insetBottom: 34 };

function huntWith(animals: Animal[], phase: HuntPhase, elapsedMs = 0): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  return { ...opening, wind: { dir: 1, strength: 0 }, animals, phase, elapsedMs };
}

function sceneOf(state: HuntState): Scene {
  return sceneFor(state, STILL, PHONE);
}

function keys(marks: Mark[]): string[] {
  return marks.map((mark) => mark.key);
}

function markNamed(scene: Scene, key: string): Mark | undefined {
  return [...scene.ground, ...scene.air].find((mark) => mark.key === key);
}

function keysStartingWith(scene: Scene, prefix: string): string[] {
  return keys([...scene.ground, ...scene.air]).filter((key) => key.startsWith(prefix));
}

function animalArt(animal: Animal, elapsedMs = 0): Mark | undefined {
  return markNamed(sceneOf(huntWith([animal], { kind: "ready" }, elapsedMs)), "animal-7");
}

test("draws the field of the hunt's spot, laid out from the hunt's seed", () => {
  let hunt = huntWith([], { kind: "ready" });

  expect(sceneOf({ ...hunt, config: { ...hunt.config, seed: 99 } }).field).toEqual({
    terrain: "hardwoods",
    seed: 99,
  });
});

test.each([
  ["390x844", PHONE],
  ["430x932", BIG_PHONE],
  ["393x852", { width: 393, height: 852, insetTop: 59, insetBottom: 34 }],
])("the field on a %s screen fills it edge to edge", (_, screen) => {
  let scene = sceneFor(huntWith([], { kind: "ready" }), STILL, screen);
  let { bounds, scale } = scene.view;
  let [ground] = fieldLayout(scene.field.terrain, scene.field.seed, bounds).ground;
  let columns = Array.from({ length: screen.width }, (_, x) => Math.floor(x / scale) + bounds.left);
  let rows = Array.from({ length: screen.height }, (_, y) => Math.floor(y / scale) + bounds.top);

  let bareColumns = columns.filter((x) => x < ground.x || x >= ground.x + ground.width);
  let bareRows = rows.filter((y) => y < ground.y || y >= ground.y + ground.height);

  expect(bareColumns).toEqual([]);
  expect(bareRows).toEqual([]);
});

test("the whole gameplay world sits on screen, stand at the bottom", () => {
  let { bounds, safeBottom } = sceneFor(huntWith([], { kind: "ready" }), STILL, PHONE).view;

  expect(bounds.left).toBeLessThanOrEqual(0);
  expect(bounds.right).toBeGreaterThanOrEqual(180);
  expect(bounds.top).toBeLessThanOrEqual(0);
  expect(safeBottom).toBe(320);
});

test("a big rack's glint shows over the treeline canopy, while the animal stays under it", () => {
  let scene = sceneOf(huntWith([BIG_BUCK], { kind: "ready" }, GLINT_MS));

  expect(keys(scene.ground)).toEqual(["shadow-7", "animal-7"]);
  expect(keys(scene.air)).toEqual(["glint-7", "hunter"]);
});

test("a ready hunter stands idle in the stand at the bottom of the field", () => {
  let scene = sceneOf(huntWith([], { kind: "ready" }));

  expect(markNamed(scene, "hunter")).toMatchObject({ id: "hunter-idle", x: 90, y: 318 });
});

function drawingScene(pull: { x: number; y: number }): Scene {
  return sceneOf(huntWith([], { kind: "drawing", pull, heldMs: 0 }));
}

function arrowHeading(scene: Scene): number {
  let tip = markNamed(scene, "bow-arrow-tip");
  let nock = markNamed(scene, "bow-nock");
  if (tip === undefined || nock === undefined) {
    throw new Error("no nocked arrow on the bow");
  }
  return Math.atan2(tip.x - nock.x, nock.y - tip.y);
}

test("the hunter holds the bow out with its arrow up-field on a straight pull back", () => {
  let scene = drawingScene({ x: 0, y: 30 });
  let tip = markNamed(scene, "bow-arrow-tip");

  expect(markNamed(scene, "hunter")).toMatchObject({ x: 90, y: 318 });
  expect(tip?.x).toBe(90);
  expect(tip?.y).toBeLessThan(290);
  expect(arrowHeading(scene)).toBe(0);
});

test.each([
  ["down and left", { x: -30, y: 30 }, Math.PI / 4],
  ["down and right", { x: 30, y: 30 }, -Math.PI / 4],
  ["mostly sideways to the left", { x: -40, y: 15 }, Math.atan2(40, 15)],
])("pulling %s swings the bow and arrow to point along the aim", (_, pull, heading) => {
  expect(Math.abs(arrowHeading(drawingScene(pull)) - heading)).toBeLessThan(0.1);
});

test("a harder draw bends the bow's limbs back toward the hunter", () => {
  let light = markNamed(drawingScene({ x: 0, y: 15 }), "bow-limb-tip-0");
  let full = markNamed(drawingScene({ x: 0, y: 60 }), "bow-limb-tip-0");

  expect(full?.y).toBeGreaterThan(light?.y ?? Infinity);
});

test("a harder draw brings the string back toward the hunter", () => {
  let light = markNamed(drawingScene({ x: 0, y: 15 }), "bow-nock");
  let full = markNamed(drawingScene({ x: 0, y: 60 }), "bow-nock");

  expect(full?.y).toBeGreaterThan(light?.y ?? Infinity);
  expect(full?.x).toBe(90);
});

test("a grazing doe stands on its own spot with its head down, over its shadow", () => {
  let scene = sceneOf(huntWith([DOE], { kind: "ready" }));

  expect(markNamed(scene, "animal-7")).toEqual({
    kind: "sprite",
    key: "animal-7",
    id: "doe-graze",
    x: 90,
    y: 180,
    flip: false,
    tint: null,
    outline: "#1b1530",
    rotate: 0,
  });
  expect(keysStartingWith(scene, "shadow-")).toEqual(["shadow-7"]);
});

test.each([
  ["grazing", DOE],
  ["walking", { ...DOE, mode: { kind: "walk", target: { x: 10, y: 180 } } } as Animal],
  ["fleeing", { ...DOE, mode: { kind: "flee", dir: { x: 1, y: 0 } } } as Animal],
  ["downed", { ...DOE, mode: { kind: "down" } } as Animal],
])("a %s animal wears a dark outline so it pops off the grass", (_, animal) => {
  expect(animalArt(animal)).toMatchObject({ outline: "#1b1530" });
});

test("the hunter and the arrow wear no outline", () => {
  let scene = sceneOf(huntWith([], { kind: "ready" }));

  expect(markNamed(scene, "hunter")).toMatchObject({ outline: null });
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

  let scene = sceneOf(huntWith([gone], { kind: "ready" }));

  expect(keys(scene.ground)).toEqual([]);
  expect(keys(scene.air)).toEqual(["hunter"]);
});

test("draws farther animals first so nearer ones overlap them", () => {
  let near: Animal = { ...DOE, id: 1, pos: { x: 60, y: 220 } };
  let far: Animal = { ...DOE, id: 2, pos: { x: 120, y: 140 } };

  let scene = sceneOf(huntWith([near, far], { kind: "ready" }));

  expect(keysStartingWith(scene, "animal-")).toEqual(["animal-2", "animal-1"]);
});

test("a big rack glints at its tip for a moment every few seconds", () => {
  let quiet = sceneOf(huntWith([BIG_BUCK], { kind: "ready" }, 0));
  let glinting = sceneOf(huntWith([BIG_BUCK], { kind: "ready" }, GLINT_MS));

  expect(keysStartingWith(quiet, "glint-")).toEqual([]);
  expect(markNamed(glinting, "glint-7")).toMatchObject({ id: "glint-1", x: 89, y: 166 });
});

test("a small rack never glints", () => {
  let small: Animal = { ...DOE, antlers: { kind: "rack", points: 6 } };

  let scene = sceneOf(huntWith([small], { kind: "ready" }, GLINT_MS));

  expect(keysStartingWith(scene, "glint-")).toEqual([]);
});

test("drawing back shows the dotted arc, the reticle with its yards, and no kill zone", () => {
  let scene = sceneOf(huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 }));

  expect(keysStartingWith(scene, "arc-dot-")).toHaveLength(16);
  expect(markNamed(scene, "reticle")).toMatchObject({ id: "reticle", x: 90, y: 225 });
  expect(markNamed(scene, "reticle")).toHaveProperty("tint", "#ffffff");
  expect(keysStartingWith(scene, "zone")).toEqual([]);
  expect(scene.labels.map((each) => each.text)).not.toContain("KILL ZONE");
  expect(scene.labels[0]).toMatchObject({ text: "35Y", x: 90, y: 205 });
});

test("a 35 yard draw stakes green and yellow pins at 20 and 30 yards along the aim", () => {
  let scene = sceneOf(huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 }));

  expect(markNamed(scene, "pin-20")).toMatchObject({
    x: 89,
    y: 249,
    width: 3,
    height: 3,
    color: "#5fae3a",
  });
  expect(markNamed(scene, "pin-30")).toMatchObject({
    x: 89,
    y: 229,
    width: 3,
    height: 3,
    color: "#f7d44a",
  });
  expect(markNamed(scene, "pin-40")).toBe(undefined);
  expect(scene.labels.map((each) => each.text)).toEqual(["35Y", "20", "30"]);
});

test("a long draw adds the red 40 yard pin, and the pins follow the aim sideways", () => {
  let scene = sceneOf(huntWith([], { kind: "drawing", pull: { x: -36, y: 48 }, heldMs: 0 }));
  let pin = markNamed(scene, "pin-40");

  expect(pin).toMatchObject({ width: 3, height: 3, color: "#e23b3b" });
  expect((pin?.x ?? 0) + 1).toBe(90 + 48);
  expect((pin?.y ?? 0) + 1).toBe(290 - 64);
});

test("the reticle turns red once a held draw starts to wobble", () => {
  let steady = sceneOf(huntWith([], { kind: "drawing", pull: { x: 0, y: 60 }, heldMs: 2400 }));
  let wobbling = sceneOf(huntWith([], { kind: "drawing", pull: { x: 0, y: 60 }, heldMs: 2600 }));

  expect(markNamed(steady, "reticle")).toHaveProperty("tint", "#ffffff");
  expect(markNamed(wobbling, "reticle")).toHaveProperty("tint", "#e23b3b");
});

test("a pull inside the dead zone shows no aim", () => {
  let scene = sceneOf(huntWith([], { kind: "drawing", pull: { x: 0, y: 5 }, heldMs: 0 }));

  expect(keysStartingWith(scene, "arc-")).toEqual([]);
  expect(keysStartingWith(scene, "reticle")).toEqual([]);
  expect(keysStartingWith(scene, "zone")).toEqual([]);
  expect(scene.labels).toEqual([]);
  expect(scene.draw).toBe(null);
});

test("an arrow at the top of its arc rides above its shadow, pointing up-field", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 90, y: 190 },
    durationMs: 1000,
    elapsedMs: 500,
    peakHeight: 20,
  };

  let scene = sceneOf(huntWith([], { kind: "flight", arrow }));

  expect(markNamed(scene, "arrow-shadow")).toMatchObject({ x: 89, y: 240, width: 3, height: 1 });
  expect(markNamed(scene, "arrow")).toMatchObject({ id: "arrow", x: 90, y: 220 });
  expect(markNamed(scene, "arrow")).toHaveProperty("rotate", 0);
  expect(keysStartingWith(scene, "arrow-trail-")).toHaveLength(3);
  expect(scene.draw).toBe(null);
});

test("an arrow loosed to the right turns to follow its line across the field", () => {
  let arrow: Arrow = {
    from: { x: 90, y: 290 },
    to: { x: 130, y: 190 },
    durationMs: 1000,
    elapsedMs: 500,
    peakHeight: 20,
  };

  let scene = sceneOf(huntWith([], { kind: "flight", arrow }));
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

  let scene = sceneOf(huntWith([], { kind: "flight", arrow }));

  expect(markNamed(scene, "arrow")).toMatchObject({ x: 90, y: 290 });
  expect(markNamed(scene, "arrow-shadow")).toMatchObject({ x: 89, y: 290 });
});

test("a result floats its pop line over the spot, as the shot result", () => {
  let juice: Juice = {
    ...STILL,
    pop: { text: "DOE!", at: { x: 90, y: 200 }, tone: "snack", animalId: 7, startMs: 0 },
  };
  let result = huntWith([], { kind: "result", outcome: { kind: "harvest", harvest: HARVEST } });

  expect(sceneFor(result, juice, PHONE).labels).toContainEqual({
    key: "pop",
    text: "DOE!",
    x: 90,
    y: 179,
    size: 7,
    color: "#f4efe1",
    align: "center",
    testID: "shotResult",
  });
});

test("the pop line goes once the bow is ready again", () => {
  let juice: Juice = {
    ...STILL,
    pop: { text: "WHIFF!", at: { x: 40, y: 150 }, tone: "miss", animalId: null, startMs: 0 },
  };

  expect(sceneFor(huntWith([], { kind: "ready" }), juice, PHONE).labels).toEqual([]);
});

test("a felled animal blinks white the moment it drops", () => {
  let down: Animal = { ...DOE, mode: { kind: "down" } };
  let juice: Juice = {
    ...STILL,
    pop: { text: "DOE!", at: DOE.pos, tone: "snack", animalId: 7, startMs: 0 },
  };

  let scene = sceneFor(huntWith([down], { kind: "ready" }), juice, PHONE);

  expect(markNamed(scene, "animal-7")).toHaveProperty("tint", "#ffffff");
});

test("the hit-stop flashes the field white", () => {
  let frozen: Juice = { ...STILL, frozenUntilMs: 120 };

  expect(
    keysStartingWith(sceneFor(huntWith([], { kind: "ready" }), frozen, PHONE), "flash")
  ).toEqual(["flash"]);
  expect(keysStartingWith(sceneOf(huntWith([], { kind: "ready" })), "flash")).toEqual([]);
});

test("a fresh shake knocks the field down by its full size", () => {
  let shaking: Juice = { ...STILL, bursts: [{ kind: "shake", px: 4, startMs: 0 }] };

  expect(sceneFor(huntWith([], { kind: "ready" }), shaking, PHONE).shake).toEqual({ x: 0, y: 4 });
  expect(sceneOf(huntWith([], { kind: "ready" })).shake).toEqual({ x: 0, y: 0 });
});

test("confetti bursts once its moment comes, one fleck per piece", () => {
  let burst = { kind: "confetti", at: DOE.pos, count: 72, seed: 9, startMs: 100 } as const;
  let waiting: Juice = { ...STILL, bursts: [burst] };
  let flying: Juice = { ...STILL, nowMs: 300, bursts: [burst] };

  let hunt = huntWith([], { kind: "ready" });

  expect(keysStartingWith(sceneFor(hunt, waiting, PHONE), "confetti-")).toHaveLength(0);
  expect(keysStartingWith(sceneFor(hunt, flying, PHONE), "confetti-")).toHaveLength(72);
});

test("slow-mo dims the field and brackets where a buck shot will land", () => {
  let buck: Animal = { ...BIG_BUCK, pos: { x: 90, y: 200 } };
  let flight: HuntPhase = {
    kind: "flight",
    arrow: {
      from: { x: 90, y: 290 },
      to: buck.pos,
      durationMs: 400,
      elapsedMs: 399,
      peakHeight: 10,
    },
  };

  let scene = sceneOf(huntWith([buck], flight));

  expect(keysStartingWith(scene, "slow-mo")).toEqual(["slow-mo"]);
  expect(keysStartingWith(scene, "bracket-")).toHaveLength(8);
});

test("an alert animal shows a yellow ! over its head", () => {
  let alert: Animal = { ...DOE, mode: { kind: "alert", untilMs: 900 } };

  expect(sceneOf(huntWith([alert], { kind: "ready" })).labels).toContainEqual({
    key: "alert-7",
    text: "!",
    x: 90,
    y: 158,
    size: 6,
    color: "#f7d44a",
    align: "center",
  });
});

test("shows no aim and no arrow when the hunt is ready", () => {
  let scene = sceneOf(huntWith([], { kind: "ready" }));

  expect(keys(scene.ground)).toEqual([]);
  expect(keys(scene.air)).toEqual(["hunter"]);
});

test("an ended hunt shows no aim and no draw gauge", () => {
  let scene = sceneOf(huntWith([], { kind: "over", reason: "dusk" }));

  expect(scene.labels).toEqual([]);
  expect(scene.draw).toBe(null);
});

test.each([
  [
    "ready, with an animal on alert",
    huntWith([{ ...DOE, mode: { kind: "alert", untilMs: 9000 } }], { kind: "ready" }),
  ],
  ["drawing", huntWith([DOE], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 })],
  ["wobbling at full draw", huntWith([], { kind: "drawing", pull: { x: 0, y: 60 }, heldMs: 4000 })],
  ["over", huntWith([], { kind: "over", reason: "quiver-empty" })],
])("every label reads at 12pt or more on a 390x844 phone while %s", (_, hunt) => {
  let scene = sceneFor(hunt, STILL, PHONE);
  let labels = [...scene.labels, ...scene.hud.labels];

  expect(labels.length).toBeGreaterThan(0);
  expect(labels.filter((each) => each.size * scene.view.scale < 12)).toEqual([]);
});

test.each([
  ["a long miss line", { text: "THAT TURKEY SAW YOU.", tone: "miss" as const }],
  ["a close call", { text: "SO CLOSE!", tone: "near" as const }],
  ["a snack", { text: "TURKEY!", tone: "snack" as const }],
])("the pop line for %s reads at 12pt or more on a 390x844 phone", (_, line) => {
  let juice: Juice = {
    ...STILL,
    pop: { ...line, at: { x: 90, y: 150 }, animalId: null, startMs: 0 },
  };
  let hunt = huntWith([], { kind: "result", outcome: { kind: "miss", near: false } });
  let scene = sceneFor(hunt, juice, PHONE);
  let pop = scene.labels.find((each) => each.key === "pop");

  expect((pop?.size ?? 0) * scene.view.scale).toBeGreaterThanOrEqual(12);
});

function onAlert(id: number, x: number, y: number): Animal {
  return { ...DOE, id, pos: { x, y }, mode: { kind: "alert", untilMs: 9000 } };
}

function texts(scene: Scene): string[] {
  return scene.labels.map((each) => each.text);
}

test("two animals on alert side by side raise one ! between them", () => {
  let scene = sceneOf(huntWith([onAlert(7, 90, 180), onAlert(8, 93, 181)], { kind: "ready" }));

  expect(texts(scene)).toEqual(["!"]);
});

test("animals on alert far apart each raise their own !", () => {
  let scene = sceneOf(huntWith([onAlert(7, 40, 180), onAlert(8, 140, 180)], { kind: "ready" }));

  expect(texts(scene)).toEqual(["!", "!"]);
});

test("a pop line wins over an alert ! it would cover", () => {
  let alert = onAlert(7, 90, 180);
  let bang = sceneOf(huntWith([alert], { kind: "ready" })).labels[0];
  let juice: Juice = {
    ...STILL,
    pop: {
      text: "WHIFF!",
      tone: "miss",
      at: { x: 90, y: bang.y + 20 },
      animalId: null,
      startMs: 0,
    },
  };
  let hunt = huntWith([alert], { kind: "result", outcome: { kind: "miss", near: false } });

  expect(bang.text).toBe("!");
  expect(texts(sceneFor(hunt, juice, PHONE))).toEqual(["WHIFF!"]);
});

test("the yards over the reticle win over an alert ! they would cover", () => {
  let target = huntWith([], { kind: "drawing", pull: { x: 0, y: 30 }, heldMs: 0 });
  let yards = sceneOf(target).labels.find((each) => each.key === "yards");
  let under = onAlert(7, 90, (yards?.y ?? 0) + 20);
  let scene = sceneOf({ ...target, animals: [under] });

  expect(texts(scene)).toContain("35Y");
  expect(texts(scene)).not.toContain("!");
});
