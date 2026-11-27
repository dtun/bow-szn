import {
  SEASON_IDS,
  SPECIES,
  SPOTS,
  canMount,
  type Antlers,
  type Harvest,
  type Journal,
} from "@bow-szn/core";
import Storage from "expo-sqlite/kv-store";

export const JOURNAL_KEY = "bow-season.journal";
export const JOURNAL_VERSION = 1;

export type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type JournalStore = {
  load(): Journal;
  save(journal: Journal): void;
};

export function emptyJournal(): Journal {
  return { harvests: [], mountedIds: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKeyOf<T extends object>(table: T, value: unknown): value is Extract<keyof T, string> {
  return typeof value === "string" && Object.hasOwn(table, value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function parseAntlers(value: unknown): Antlers | null {
  if (!isRecord(value)) {
    return null;
  }
  if (value.kind === "none" || value.kind === "spike") {
    return { kind: value.kind };
  }
  if (value.kind === "rack" && isCount(value.points)) {
    return { kind: "rack", points: value.points };
  }
  return null;
}

function parseHarvest(value: unknown): Harvest | null {
  if (!isRecord(value)) {
    return null;
  }
  let antlers = parseAntlers(value.antlers);
  let { id, species, weightLb, meatLb, spot, season, clockMin, shotYards } = value;
  let seasonId = SEASON_IDS.find((candidate) => candidate === season);
  if (
    antlers === null ||
    typeof id !== "string" ||
    !isKeyOf(SPECIES, species) ||
    !isKeyOf(SPOTS, spot) ||
    seasonId === undefined ||
    !isCount(weightLb) ||
    !isCount(meatLb) ||
    !isCount(clockMin) ||
    !isCount(shotYards)
  ) {
    return null;
  }
  return {
    id,
    species,
    antlers,
    weightLb,
    meatLb,
    spot,
    season: seasonId,
    clockMin,
    shotYards,
  };
}

function parseHarvests(value: unknown): Harvest[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  let harvests: Harvest[] = [];
  for (let entry of value) {
    let harvest = parseHarvest(entry);
    if (harvest === null) {
      return null;
    }
    harvests.push(harvest);
  }
  return harvests;
}

function mountableIds(harvests: Harvest[], mountedIds: unknown): string[] {
  if (!Array.isArray(mountedIds)) {
    return [];
  }
  let mountable = harvests.filter(canMount).map((harvest) => harvest.id);
  let ids: string[] = [];
  for (let id of mountedIds) {
    if (mountable.includes(id) && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

function parseJournal(raw: string | null): Journal {
  if (raw === null) {
    return emptyJournal();
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return emptyJournal();
  }
  if (!isRecord(payload) || payload.version !== JOURNAL_VERSION) {
    return emptyJournal();
  }
  let harvests = parseHarvests(payload.harvests);
  if (harvests === null) {
    return emptyJournal();
  }
  return { harvests, mountedIds: mountableIds(harvests, payload.mountedIds) };
}

function serializeJournal(journal: Journal): string {
  return JSON.stringify({
    version: JOURNAL_VERSION,
    harvests: journal.harvests,
    mountedIds: journal.mountedIds,
  });
}

export function createJournalStore(storage: KeyValueStorage): JournalStore {
  return {
    load() {
      try {
        return parseJournal(storage.getItem(JOURNAL_KEY));
      } catch {
        return emptyJournal();
      }
    },
    save(journal) {
      try {
        storage.setItem(JOURNAL_KEY, serializeJournal(journal));
      } catch (error) {
        console.warn("The journal could not be saved.", error);
      }
    },
  };
}

const deviceStorage: KeyValueStorage = {
  getItem(key) {
    return Storage.getItemSync(key);
  },
  setItem(key, value) {
    Storage.setItemSync(key, value);
  },
};

export const deviceJournalStore: JournalStore = createJournalStore(deviceStorage);

export function createMemoryStorage(entries: Record<string, string> = {}): KeyValueStorage {
  let kept = new Map(Object.entries(entries));
  return {
    getItem(key) {
      return kept.get(key) ?? null;
    },
    setItem(key, value) {
      kept.set(key, value);
    },
  };
}

export function createMemoryJournalStore(journal: Journal = emptyJournal()): JournalStore {
  return createJournalStore(createMemoryStorage({ [JOURNAL_KEY]: serializeJournal(journal) }));
}
