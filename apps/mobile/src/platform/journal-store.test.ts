import type { Harvest, Journal } from "@bow-szn/core";

import {
  JOURNAL_KEY,
  JOURNAL_VERSION,
  createJournalStore,
  createMemoryJournalStore,
  createMemoryStorage,
  type KeyValueStorage,
} from "./journal-store";

const BUCK: Harvest = {
  id: "42-3",
  species: "whitetail",
  antlers: { kind: "rack", points: 10 },
  weightLb: 200,
  meatLb: 90,
  spot: "miller-bottoms",
  season: "rut",
  clockMin: 462,
  shotYards: 32,
};

const DOE: Harvest = {
  id: "42-5",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 120,
  meatLb: 54,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 375,
  shotYards: 25,
};

const JOURNAL: Journal = { harvests: [BUCK, DOE], mountedIds: ["42-3"] };

function payload(overrides: Record<string, unknown>): string {
  return JSON.stringify({ version: 1, harvests: [BUCK], mountedIds: [], ...overrides });
}

function storedWith(raw: string) {
  return createJournalStore(createMemoryStorage({ [JOURNAL_KEY]: raw }));
}

test("a journal saved to storage loads back exactly in a fresh store over the same storage", () => {
  let storage = createMemoryStorage();

  createJournalStore(storage).save(JOURNAL);

  expect(createJournalStore(storage).load()).toEqual(JOURNAL);
});

test("a journal seeded into the memory store loads back exactly", () => {
  expect(createMemoryJournalStore(JOURNAL).load()).toEqual(JOURNAL);
});

test("a storage with nothing in it loads an empty journal", () => {
  expect(createJournalStore(createMemoryStorage()).load()).toEqual({
    harvests: [],
    mountedIds: [],
  });
});

test("saving writes the version next to the harvests and the mounted ids", () => {
  let storage = createMemoryStorage();

  createJournalStore(storage).save(JOURNAL);

  expect(JSON.parse(storage.getItem(JOURNAL_KEY) ?? "")).toEqual({
    version: JOURNAL_VERSION,
    harvests: [BUCK, DOE],
    mountedIds: ["42-3"],
  });
  expect(JOURNAL_VERSION).toBe(1);
});

test.each([
  ["text that is not JSON", "{not json"],
  ["JSON that is not an object", "[1, 2, 3]"],
  ["a payload with no version", JSON.stringify({ harvests: [BUCK], mountedIds: [] })],
  ["a version from the future", payload({ version: 2 })],
  ["harvests that are not a list", payload({ harvests: "lots" })],
  ["a harvest of an unknown species", payload({ harvests: [{ ...BUCK, species: "moose" }] })],
  ["a harvest at an unknown spot", payload({ harvests: [{ ...BUCK, spot: "nowhere" }] })],
  ["a harvest in an unknown season", payload({ harvests: [{ ...BUCK, season: "winter" }] })],
  ["a harvest with a negative weight", payload({ harvests: [{ ...BUCK, weightLb: -5 }] })],
  [
    "a harvest with a malformed rack",
    payload({ harvests: [{ ...BUCK, antlers: { kind: "rack" } }] }),
  ],
  ["one good harvest beside a bad one", payload({ harvests: [BUCK, { id: "x" }] })],
])("%s loads as an empty journal", (_name, raw) => {
  expect(storedWith(raw).load()).toEqual({ harvests: [], mountedIds: [] });
});

test("a storage that throws on read loads an empty journal", () => {
  let broken: KeyValueStorage = {
    getItem() {
      throw new Error("disk on fire");
    },
    setItem() {},
  };

  expect(createJournalStore(broken).load()).toEqual({ harvests: [], mountedIds: [] });
});

test("mounted ids that name a doe, a missing harvest, or a repeat are dropped on load", () => {
  let journal = storedWith(
    payload({
      harvests: [BUCK, DOE],
      mountedIds: ["42-5", "nope", "42-3", "42-3"],
    })
  ).load();

  expect(journal.mountedIds).toEqual(["42-3"]);
});

test("mounted ids keep the order the bucks were mounted in", () => {
  let other: Harvest = { ...BUCK, id: "42-9" };
  let journal: Journal = { harvests: [BUCK, DOE, other], mountedIds: ["42-9", "42-3"] };

  expect(createMemoryJournalStore(journal).load()).toEqual(journal);
});

test("a harvest with extra fields loads with only the fields of a harvest", () => {
  let journal = storedWith(payload({ harvests: [{ ...BUCK, nickname: "Big Joe" }] })).load();

  expect(journal.harvests).toEqual([BUCK]);
});

test("a storage that throws on write does not stop the game", () => {
  let warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  let broken: KeyValueStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("disk full");
    },
  };

  expect(() => createJournalStore(broken).save(JOURNAL)).not.toThrow();
  expect(warn).toHaveBeenCalledTimes(1);
});
