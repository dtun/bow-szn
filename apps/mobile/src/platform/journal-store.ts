import {
  SEASON_IDS,
  SPECIES,
  SPOTS,
  mount,
  recordHarvest,
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

type Page = { journal: Journal; whole: boolean };

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

function parseHarvests(rows: unknown[]): Harvest[] {
  let harvests: Harvest[] = [];
  for (let row of rows) {
    let harvest = parseHarvest(row);
    if (harvest !== null) {
      harvests.push(harvest);
    }
  }
  return harvests;
}

function sameJson(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => sameJson(item, b[index]))
    );
  }
  if (isRecord(a) && isRecord(b)) {
    let keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => Object.hasOwn(b, key) && sameJson(a[key], b[key]))
    );
  }
  return a === b;
}

function unreadablePage(): Page {
  return { journal: emptyJournal(), whole: false };
}

function readPage(text: string): Page {
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return unreadablePage();
  }
  if (!isRecord(payload) || payload.version !== JOURNAL_VERSION) {
    return unreadablePage();
  }
  if (!Array.isArray(payload.harvests) || !Array.isArray(payload.mountedIds)) {
    return unreadablePage();
  }
  let harvests = parseHarvests(payload.harvests);
  let mountedIds = payload.mountedIds.filter((id): id is string => typeof id === "string");
  return {
    journal: { harvests, mountedIds },
    whole: sameJson(payload, { version: JOURNAL_VERSION, harvests, mountedIds }),
  };
}

function writePage(journal: Journal): string {
  return JSON.stringify({
    version: JOURNAL_VERSION,
    harvests: journal.harvests,
    mountedIds: journal.mountedIds,
  });
}

function absorb(journal: Journal, other: Journal): Journal {
  return other.mountedIds.reduce(mount, other.harvests.reduce(recordHarvest, journal));
}

function holdsEverything(journal: Journal, text: string): boolean {
  let page = readPage(text);
  return page.whole && absorb(journal, page.journal) === journal;
}

function archiveKey(position: number): string {
  return `${JOURNAL_KEY}.archive.${position}`;
}

function archivedTexts(storage: KeyValueStorage): string[] {
  let texts: string[] = [];
  let text = storage.getItem(archiveKey(1));
  while (text !== null) {
    texts.push(text);
    text = storage.getItem(archiveKey(texts.length + 1));
  }
  return texts;
}

function setAside(storage: KeyValueStorage, text: string): void {
  let archived = archivedTexts(storage);
  if (!archived.includes(text)) {
    storage.setItem(archiveKey(archived.length + 1), text);
  }
}

export function createJournalStore(storage: KeyValueStorage): JournalStore {
  return {
    load() {
      try {
        let texts = archivedTexts(storage);
        let current = storage.getItem(JOURNAL_KEY);
        if (current !== null) {
          texts.push(current);
        }
        return texts.reduce(
          (journal, text) => absorb(journal, readPage(text).journal),
          emptyJournal()
        );
      } catch {
        return emptyJournal();
      }
    },
    save(journal) {
      try {
        let current = storage.getItem(JOURNAL_KEY);
        if (current !== null && !holdsEverything(journal, current)) {
          setAside(storage, current);
        }
        storage.setItem(JOURNAL_KEY, writePage(journal));
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
  return createJournalStore(createMemoryStorage({ [JOURNAL_KEY]: writePage(journal) }));
}
