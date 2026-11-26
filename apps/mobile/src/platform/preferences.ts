import { SPOTS, type Difficulty, type SeasonId, type SpotId } from "@bow-szn/core";
import Storage from "expo-sqlite/kv-store";
import { useSyncExternalStore } from "react";

export type Preferences = {
  difficulty: Difficulty;
  season: SeasonId;
  spot: SpotId;
};

export const DEFAULT_PREFERENCES: Preferences = {
  difficulty: "easy",
  season: "early",
  spot: "cedar-hollow",
};

const NEXT_DIFFICULTY: Record<Difficulty, Difficulty> = {
  easy: "medium",
  medium: "hard",
  hard: "easy",
};

const NEXT_SEASON: Record<SeasonId, SeasonId> = {
  early: "rut",
  rut: "late",
  late: "early",
};

const STORAGE_KEY = "preferences";

export function nextDifficulty(difficulty: Difficulty): Difficulty {
  return NEXT_DIFFICULTY[difficulty];
}

export function nextSeason(season: SeasonId): SeasonId {
  return NEXT_SEASON[season];
}

function isKeyOf<T extends object>(table: T, value: unknown): value is keyof T {
  return typeof value === "string" && Object.hasOwn(table, value);
}

function parseStored(raw: string | null): Preferences {
  let stored: Record<string, unknown> = {};
  try {
    let parsed: unknown = JSON.parse(raw ?? "{}");
    if (typeof parsed === "object" && parsed !== null) {
      stored = parsed as Record<string, unknown>;
    }
  } catch {
    stored = {};
  }
  return {
    difficulty: isKeyOf(NEXT_DIFFICULTY, stored.difficulty)
      ? stored.difficulty
      : DEFAULT_PREFERENCES.difficulty,
    season: isKeyOf(NEXT_SEASON, stored.season) ? stored.season : DEFAULT_PREFERENCES.season,
    spot: isKeyOf(SPOTS, stored.spot) ? stored.spot : DEFAULT_PREFERENCES.spot,
  };
}

let listeners = new Set<() => void>();
let lastRaw: string | null | undefined;
let lastParsed = DEFAULT_PREFERENCES;

export function readPreferences(): Preferences {
  let raw = Storage.getItemSync(STORAGE_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseStored(raw);
  }
  return lastParsed;
}

export function updatePreferences(patch: Partial<Preferences>): void {
  Storage.setItemSync(STORAGE_KEY, JSON.stringify({ ...readPreferences(), ...patch }));
  for (let listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, readPreferences);
}
