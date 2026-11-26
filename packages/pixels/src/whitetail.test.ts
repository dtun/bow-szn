import { ANIMAL_FRAMES, SPRITES, whitetailKind } from "./index.ts";
import type { AnimalKind, Sprite } from "./index.ts";

const WHITETAIL_KINDS: AnimalKind[] = ["doe", "spike", "buck-small", "buck-medium", "buck-large"];

const ANTLER_CHARS = new Set(["A", "a"]);

function posesOf(kind: AnimalKind): Sprite[] {
  let { walk, graze, flee, down } = ANIMAL_FRAMES[kind];
  return [...walk, graze, flee, down].map((id) => SPRITES[id]);
}

function firstWalkFrame(kind: string): Sprite {
  return SPRITES[ANIMAL_FRAMES[kind as AnimalKind].walk[0]];
}

function antlerCells(sprite: Sprite): Set<string> {
  let cells = new Set<string>();
  sprite.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (ANTLER_CHARS.has(char)) {
        cells.add(`${x},${y}`);
      }
    });
  });
  return cells;
}

function countTines(sprite: Sprite): number {
  let unvisited = antlerCells(sprite);
  let tines = 0;
  while (unvisited.size > 0) {
    let [start] = unvisited;
    let queue = [start];
    unvisited.delete(start);
    tines++;
    while (queue.length > 0) {
      let [x, y] = (queue.pop() as string).split(",").map(Number);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          let key = `${x + dx},${y + dy}`;
          if (unvisited.delete(key)) {
            queue.push(key);
          }
        }
      }
    }
  }
  return tines;
}

describe("whitetail sprites", () => {
  it("draws every pose of every class 14 to 18 px long", () => {
    for (let kind of WHITETAIL_KINDS) {
      for (let pose of posesOf(kind)) {
        expect(pose.w).toBeGreaterThanOrEqual(14);
        expect(pose.w).toBeLessThanOrEqual(18);
      }
    }
  });

  it("gives does no antler pixels in any pose", () => {
    for (let pose of posesOf("doe")) {
      expect(antlerCells(pose).size).toBe(0);
    }
  });

  it("gives spikes exactly two straight tines in the walking poses", () => {
    for (let pose of ANIMAL_FRAMES.spike.walk) {
      expect(countTines(SPRITES[pose])).toBe(2);
    }
  });

  it("grows the antlers from spike to small to medium to large", () => {
    let sizes = ["spike", "buck-small", "buck-medium", "buck-large"].map(
      (kind) => antlerCells(firstWalkFrame(kind)).size
    );

    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(new Set(sizes).size).toBe(sizes.length);
  });

  it("keeps the rack on every spike and buck in every pose, lying down included", () => {
    for (let kind of ["spike", "buck-small", "buck-medium", "buck-large"]) {
      for (let pose of posesOf(kind as AnimalKind)) {
        expect(antlerCells(pose).size).toBeGreaterThan(0);
      }
    }
  });

  it("grows the antlers from spike to small to medium to large when down too", () => {
    let sizes = ["spike", "buck-small", "buck-medium", "buck-large"].map(
      (kind) => antlerCells(SPRITES[ANIMAL_FRAMES[kind as AnimalKind].down]).size
    );

    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(new Set(sizes).size).toBe(sizes.length);
  });

  it("stands each larger rack taller than the one before", () => {
    let heights = ["buck-small", "buck-medium", "buck-large"].map((kind) => firstWalkFrame(kind).h);

    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(new Set(heights).size).toBe(heights.length);
  });
});

describe("whitetailKind", () => {
  it("maps no antlers to a doe and a spike to a spike", () => {
    expect(whitetailKind({ kind: "none" })).toBe("doe");
    expect(whitetailKind({ kind: "spike" })).toBe("spike");
  });

  it.each([
    [4, "buck-small"],
    [6, "buck-small"],
    [7, "buck-medium"],
    [9, "buck-medium"],
    [10, "buck-large"],
    [12, "buck-large"],
  ] as const)("maps a %i point rack to %s", (points, kind) => {
    expect(whitetailKind({ kind: "rack", points })).toBe(kind);
  });
});
