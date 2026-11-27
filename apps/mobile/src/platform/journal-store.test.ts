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

const ARCHIVE_1 = "bow-season.journal.archive.1";
const ARCHIVE_2 = "bow-season.journal.archive.2";

const JOURNAL_1_0_TEXT = `{
  "version": 1,
  "harvests": [
    {"id": "7-2", "species": "whitetail", "antlers": {"kind": "rack", "points": 10},
     "weightLb": 214, "meatLb": 96, "spot": "miller-bottoms", "season": "rut",
     "clockMin": 462, "shotYards": 32},
    {"id": "7-4", "species": "whitetail", "antlers": {"kind": "spike"},
     "weightLb": 148, "meatLb": 67, "spot": "cedar-hollow", "season": "early",
     "clockMin": 390, "shotYards": 21},
    {"id": "7-6", "species": "whitetail", "antlers": {"kind": "none"},
     "weightLb": 126, "meatLb": 57, "spot": "cattail-marsh", "season": "late",
     "clockMin": 880, "shotYards": 27},
    {"id": "9-1", "species": "elk", "antlers": {"kind": "rack", "points": 12},
     "weightLb": 640, "meatLb": 269, "spot": "high-ridge", "season": "rut",
     "clockMin": 540, "shotYards": 41},
    {"id": "9-3", "species": "turkey", "antlers": {"kind": "none"},
     "weightLb": 18, "meatLb": 11, "spot": "cedar-hollow", "season": "early",
     "clockMin": 410, "shotYards": 18},
    {"id": "9-5", "species": "rabbit", "antlers": {"kind": "none"},
     "weightLb": 3, "meatLb": 2, "spot": "cattail-marsh", "season": "late",
     "clockMin": 700, "shotYards": 14}
  ],
  "mountedIds": ["7-2", "9-1"]
}`;

const JOURNAL_1_0: Journal = {
  harvests: [
    {
      id: "7-2",
      species: "whitetail",
      antlers: { kind: "rack", points: 10 },
      weightLb: 214,
      meatLb: 96,
      spot: "miller-bottoms",
      season: "rut",
      clockMin: 462,
      shotYards: 32,
    },
    {
      id: "7-4",
      species: "whitetail",
      antlers: { kind: "spike" },
      weightLb: 148,
      meatLb: 67,
      spot: "cedar-hollow",
      season: "early",
      clockMin: 390,
      shotYards: 21,
    },
    {
      id: "7-6",
      species: "whitetail",
      antlers: { kind: "none" },
      weightLb: 126,
      meatLb: 57,
      spot: "cattail-marsh",
      season: "late",
      clockMin: 880,
      shotYards: 27,
    },
    {
      id: "9-1",
      species: "elk",
      antlers: { kind: "rack", points: 12 },
      weightLb: 640,
      meatLb: 269,
      spot: "high-ridge",
      season: "rut",
      clockMin: 540,
      shotYards: 41,
    },
    {
      id: "9-3",
      species: "turkey",
      antlers: { kind: "none" },
      weightLb: 18,
      meatLb: 11,
      spot: "cedar-hollow",
      season: "early",
      clockMin: 410,
      shotYards: 18,
    },
    {
      id: "9-5",
      species: "rabbit",
      antlers: { kind: "none" },
      weightLb: 3,
      meatLb: 2,
      spot: "cattail-marsh",
      season: "late",
      clockMin: 700,
      shotYards: 14,
    },
  ],
  mountedIds: ["7-2", "9-1"],
};

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

test("a 1.0 journal holding every species, spot, season, and antler kind loads exactly", () => {
  expect(storedWith(JOURNAL_1_0_TEXT).load()).toEqual(JOURNAL_1_0);
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
  ["mounted ids that are not a list", payload({ mountedIds: "all" })],
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

function watchedStorage(entries: Record<string, string>) {
  let kept = new Map(Object.entries(entries));
  let writtenKeys: string[] = [];
  let storage: KeyValueStorage = {
    getItem(key) {
      return kept.get(key) ?? null;
    },
    setItem(key, value) {
      writtenKeys.push(key);
      kept.set(key, value);
    },
  };
  function everythingStored(): string {
    return [...kept.values()].join("\n");
  }
  function keysStored(): string[] {
    return [...kept.keys()];
  }
  return { storage, everythingStored, keysStored, writtenKeys };
}

test.failing("one bad harvest leaves the good ones in the journal", () => {
  expect(storedWith(payload({ harvests: [BUCK, { id: "x" }, DOE] })).load().harvests).toEqual([
    BUCK,
    DOE,
  ]);
});

test.each([
  ["text that is not JSON", "{not json"],
  ["a version from the future", payload({ version: 2, harvests: [BUCK] })],
  ["a harvest of an unknown species", payload({ harvests: [{ ...BUCK, species: "moose" }] })],
  [
    "a harvest with a field this build does not know",
    payload({ harvests: [{ ...BUCK, nickname: "Big Joe" }] }),
  ],
])("%s is still on the device after the next save", (_name, raw) => {
  let { storage, everythingStored } = watchedStorage({ [JOURNAL_KEY]: raw });
  let store = createJournalStore(storage);

  store.save({ ...store.load(), harvests: [...store.load().harvests, DOE] });

  expect(everythingStored()).toContain(raw);
});

test("a set-aside journal this build can read loads beside the current one, older harvests first", () => {
  let { storage } = watchedStorage({
    [ARCHIVE_1]: payload({ harvests: [BUCK], mountedIds: ["42-3"] }),
    [JOURNAL_KEY]: payload({ harvests: [DOE] }),
  });

  expect(createJournalStore(storage).load()).toEqual({
    harvests: [BUCK, DOE],
    mountedIds: ["42-3"],
  });
});

test("saving over a journal this build wrote sets nothing aside", () => {
  let { storage, keysStored } = watchedStorage({});
  let store = createJournalStore(storage);

  store.save({ harvests: [BUCK], mountedIds: [] });
  store.save(JOURNAL);

  expect(keysStored()).toEqual([JOURNAL_KEY]);
});

test("saving the 1.0 journal back sets nothing aside", () => {
  let { storage, keysStored } = watchedStorage({ [JOURNAL_KEY]: JOURNAL_1_0_TEXT });
  let store = createJournalStore(storage);

  store.save(store.load());

  expect(keysStored()).toEqual([JOURNAL_KEY]);
});

test("saving twice over an unreadable journal sets it aside once", () => {
  let { storage, keysStored } = watchedStorage({ [JOURNAL_KEY]: "{not json" });
  let store = createJournalStore(storage);

  store.save(JOURNAL);
  store.save(JOURNAL);

  expect(storage.getItem(ARCHIVE_1)).toBe("{not json");
  expect(keysStored()).toEqual([JOURNAL_KEY, ARCHIVE_1]);
});

test("a save that stopped after setting aside does not set aside again on retry", () => {
  let warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  let memory = createMemoryStorage({ [JOURNAL_KEY]: "{not json" });
  let mainWritesToFail = 1;
  let storage: KeyValueStorage = {
    getItem(key) {
      return memory.getItem(key);
    },
    setItem(key, value) {
      if (key === JOURNAL_KEY && mainWritesToFail > 0) {
        mainWritesToFail -= 1;
        throw new Error("disk full");
      }
      memory.setItem(key, value);
    },
  };
  let store = createJournalStore(storage);

  store.save(JOURNAL);
  store.save(JOURNAL);

  expect(warn).toHaveBeenCalledTimes(1);
  expect(memory.getItem(ARCHIVE_1)).toBe("{not json");
  expect(memory.getItem(ARCHIVE_2)).toBeNull();
  expect(createJournalStore(memory).load()).toEqual(JOURNAL);
});

test("a second, different unreadable journal is set aside after the first", () => {
  let { storage } = watchedStorage({ [JOURNAL_KEY]: "{not json" });
  let store = createJournalStore(storage);

  store.save(JOURNAL);
  storage.setItem(JOURNAL_KEY, "[1, 2, 3]");
  store.save(JOURNAL);

  expect(storage.getItem(ARCHIVE_1)).toBe("{not json");
  expect(storage.getItem(ARCHIVE_2)).toBe("[1, 2, 3]");
});

test("harvests the journal failed to load survive a save over them", () => {
  let memory = createMemoryStorage({ [JOURNAL_KEY]: payload({ harvests: [BUCK] }) });
  let reads = 0;
  let storage: KeyValueStorage = {
    getItem(key) {
      reads += 1;
      if (reads === 1) {
        throw new Error("disk hiccup");
      }
      return memory.getItem(key);
    },
    setItem(key, value) {
      memory.setItem(key, value);
    },
  };
  let store = createJournalStore(storage);

  let loaded = store.load();
  store.save({ ...loaded, harvests: [...loaded.harvests, DOE] });

  expect(createJournalStore(memory).load()).toEqual({ harvests: [BUCK, DOE], mountedIds: [] });
});

test("a storage that throws on read during a save is never written to", () => {
  let warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  let writes: string[] = [];
  let broken: KeyValueStorage = {
    getItem() {
      throw new Error("disk on fire");
    },
    setItem(key) {
      writes.push(key);
    },
  };

  createJournalStore(broken).save(JOURNAL);

  expect(writes).toEqual([]);
  expect(warn).toHaveBeenCalledTimes(1);
});

test("a journal that cannot be set aside is not saved over", () => {
  let warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  let memory = createMemoryStorage({ [JOURNAL_KEY]: "{not json" });
  let storage: KeyValueStorage = {
    getItem(key) {
      return memory.getItem(key);
    },
    setItem(key, value) {
      if (key === ARCHIVE_1) {
        throw new Error("disk full");
      }
      memory.setItem(key, value);
    },
  };

  createJournalStore(storage).save(JOURNAL);

  expect(memory.getItem(JOURNAL_KEY)).toBe("{not json");
  expect(warn).toHaveBeenCalledTimes(1);
});

test("loading never writes", () => {
  let { storage, writtenKeys } = watchedStorage({
    [ARCHIVE_1]: payload({ harvests: [BUCK] }),
    [JOURNAL_KEY]: "{not json",
  });

  createJournalStore(storage).load();

  expect(writtenKeys).toEqual([]);
});
