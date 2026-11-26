import {
  createHunt,
  huntReducer,
  SPOTS,
  TUNING,
  WORLD_W,
  type Animal,
  type HuntConfig,
  type SeasonId,
  type SpotId,
} from "./index";
import { CONFIG, DOE, huntWith } from "./test-support/hunt-scenario";

const SEEDS = Array.from({ length: 2000 }, (_, index) => index + 1);

function openers(spot: SpotId, season: SeasonId): Animal[] {
  return SEEDS.flatMap((seed) => createHunt({ ...CONFIG, spot, season, seed }).animals);
}

function share(animals: Animal[], matches: (animal: Animal) => boolean): number {
  return animals.filter(matches).length / animals.length;
}

function racks(animals: Animal[]): number[] {
  return animals.flatMap((animal) =>
    animal.antlers.kind === "rack" ? [animal.antlers.points] : []
  );
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

describe("opening animals", () => {
  test("a hunt opens with game from the spot grazing in the open middle", () => {
    let meadow = TUNING.animals.meadow;
    let animals = openers("cedar-hollow", "early");
    expect(animals).toHaveLength(SEEDS.length * TUNING.spawn.opening);
    expect(new Set(animals.map((animal) => animal.mode.kind))).toEqual(new Set(["graze"]));
    expect(new Set(animals.map((animal) => animal.species))).toEqual(
      new Set(SPOTS["cedar-hollow"].species)
    );
    expect(Math.min(...animals.map((animal) => animal.pos.x))).toBeGreaterThanOrEqual(meadow.minX);
    expect(Math.max(...animals.map((animal) => animal.pos.x))).toBeLessThanOrEqual(meadow.maxX);
    expect(Math.min(...animals.map((animal) => animal.pos.y))).toBeGreaterThanOrEqual(meadow.minY);
    expect(Math.max(...animals.map((animal) => animal.pos.y))).toBeLessThanOrEqual(meadow.maxY);
  });

  test("species out of season never show up", () => {
    let early = openers("high-ridge", "early");
    let rut = openers("high-ridge", "rut");
    expect(new Set(early.map((animal) => animal.species))).toEqual(new Set(["whitetail"]));
    expect(new Set(rut.map((animal) => animal.species))).toEqual(new Set(["elk", "whitetail"]));
  });

  test("rarity weights who shows up", () => {
    let animals = openers("cattail-marsh", "early");
    expect(share(animals, (animal) => animal.species === "rabbit")).toBeCloseTo(6 / 12, 1);
    expect(share(animals, (animal) => animal.species === "whitetail")).toBeCloseTo(5 / 12, 1);
    expect(share(animals, (animal) => animal.species === "turkey")).toBeCloseTo(1 / 12, 1);
  });

  test("turkeys are a rare sight in every season", () => {
    for (let season of ["early", "rut", "late"] as const) {
      let turkeys = share(openers("cedar-hollow", season), (animal) => animal.species === "turkey");
      expect(turkeys).toBeGreaterThan(0);
      expect(turkeys).toBeLessThan(0.15);
    }
  });

  test("antlered game rolls doe, spike, or buck from the season's odds", () => {
    let early = openers("high-ridge", "early");
    let late = openers("high-ridge", "late");
    let rut = openers("miller-bottoms", "rut").filter((animal) => animal.species === "whitetail");
    expect(share(early, (animal) => animal.antlers.kind === "none")).toBeCloseTo(0.55, 1);
    expect(share(early, (animal) => animal.antlers.kind === "spike")).toBeCloseTo(0.25, 1);
    expect(share(early, (animal) => animal.antlers.kind === "rack")).toBeCloseTo(0.2, 1);
    expect(share(late, (animal) => animal.antlers.kind === "none")).toBeCloseTo(0.6, 1);
    expect(share(rut, (animal) => animal.antlers.kind === "rack")).toBeCloseTo(0.4, 1);
  });

  test("turkeys and rabbits never grow antlers", () => {
    let animals = openers("cattail-marsh", "early").filter(
      (animal) => animal.species !== "whitetail"
    );
    expect(new Set(animals.map((animal) => animal.antlers.kind))).toEqual(new Set(["none"]));
  });

  test("rack points stay inside each species' range and run bigger in the rut", () => {
    let early = openers("high-ridge", "early");
    let rut = openers("high-ridge", "rut");
    let elkRacks = racks(rut.filter((animal) => animal.species === "elk"));
    let earlyRacks = racks(early);
    let rutRacks = racks(rut.filter((animal) => animal.species === "whitetail"));
    expect(new Set(earlyRacks)).toEqual(new Set([4, 5, 6, 7, 8, 9, 10, 11, 12]));
    expect(Math.min(...elkRacks)).toBe(10);
    expect(Math.max(...elkRacks)).toBe(16);
    expect(mean(rutRacks)).toBeGreaterThan(mean(earlyRacks) + 1);
  });
});

describe("walk-ins", () => {
  test("a new animal walks in from the field edge when the spawn timer runs out", () => {
    let hunt = { ...huntWith([]), spawnInMs: 100 };
    let before = huntReducer(hunt, { type: "tick", dtMs: 95 });
    let after = huntReducer(before, { type: "tick", dtMs: 5 });
    let [animal] = after.animals;
    let onEdge =
      animal.pos.x === -TUNING.animals.offFieldPx ||
      animal.pos.x === WORLD_W + TUNING.animals.offFieldPx ||
      animal.pos.y === -TUNING.animals.offFieldPx;
    expect(before.animals).toEqual([]);
    expect(animal.id).toBe(hunt.nextAnimalId);
    expect(after.nextAnimalId).toBe(hunt.nextAnimalId + 1);
    expect(animal.mode.kind).toBe("walk");
    expect(onEdge).toBe(true);
    expect(after.spawnInMs).toBeGreaterThanOrEqual(TUNING.spawn.everyMs[0]);
  });

  test("the field never holds more live animals than the cap", () => {
    let crowd = Array.from({ length: TUNING.spawn.maxLive }, (_, index) => ({ ...DOE, id: index }));
    let full = huntReducer({ ...huntWith(crowd), spawnInMs: 5 }, { type: "tick", dtMs: 10 });
    let cleared = crowd.map((animal) => ({ ...animal, mode: { kind: "gone" as const } }));
    let room = huntReducer({ ...huntWith(cleared), spawnInMs: 5 }, { type: "tick", dtMs: 10 });
    expect(full.animals).toHaveLength(TUNING.spawn.maxLive);
    expect(room.animals).toHaveLength(TUNING.spawn.maxLive + 1);
  });
});

describe("bucks and the rut", () => {
  function arriving(antlers: Animal["antlers"], config: HuntConfig = CONFIG): Animal {
    let walker: Animal = { ...DOE, antlers, mode: { kind: "walk", target: { x: 91, y: 180 } } };
    return huntReducer(huntWith([walker], config), { type: "tick", dtMs: 1000 }).animals[0];
  }

  function grazeEnds(animal: Animal): number {
    return animal.mode.kind === "graze" ? animal.mode.untilMs : 0;
  }

  test("bucks stop for shorter beats than does", () => {
    let longestBuckBeat = 1000 + TUNING.animals.grazeMs[1] * TUNING.animals.buckGrazeScale;
    let bucks = SEEDS.slice(0, 50).map((seed) =>
      grazeEnds(arriving({ kind: "rack", points: 8 }, { ...CONFIG, seed }))
    );
    expect(Math.max(...bucks)).toBeLessThanOrEqual(longestBuckBeat);
    expect(grazeEnds(arriving({ kind: "none" }))).toBeGreaterThanOrEqual(TUNING.animals.grazeMs[0]);
  });

  test("deer walk faster in the rut and other game does not", () => {
    let rut = { ...CONFIG, season: "rut" as const };
    let deer: Animal = {
      ...DOE,
      pos: { x: 40, y: 180 },
      mode: { kind: "walk", target: { x: 150, y: 180 } },
    };
    let rabbit: Animal = { ...deer, species: "rabbit" };
    let after = huntReducer(huntWith([deer, { ...rabbit, id: 2 }], rut), {
      type: "tick",
      dtMs: 1000,
    });
    expect(after.animals[0].pos.x).toBeCloseTo(40 + 14 * TUNING.rut.antleredSpeedScale);
    expect(after.animals[1].pos.x).toBeCloseTo(40 + 22);
  });
});
