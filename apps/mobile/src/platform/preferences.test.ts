import Storage from "expo-sqlite/kv-store";

import {
  DEFAULT_PREFERENCES,
  nextDifficulty,
  nextSeason,
  readPreferences,
  updatePreferences,
} from "./preferences";

test("a fresh install starts on easy, early season, at Cedar Hollow", () => {
  expect(readPreferences()).toEqual({
    difficulty: "easy",
    season: "early",
    spot: "cedar-hollow",
  });
});

test("an update changes only the fields it names", () => {
  updatePreferences({ season: "rut" });
  updatePreferences({ spot: "high-ridge" });

  expect(readPreferences()).toEqual({
    difficulty: "easy",
    season: "rut",
    spot: "high-ridge",
  });
});

test("choices saved by an earlier launch come back", () => {
  Storage.setItemSync(
    "preferences",
    JSON.stringify({ difficulty: "hard", season: "late", spot: "cattail-marsh" })
  );

  expect(readPreferences()).toEqual({
    difficulty: "hard",
    season: "late",
    spot: "cattail-marsh",
  });
});

test("a saved update is written for the next launch", () => {
  updatePreferences({ difficulty: "medium", spot: "miller-bottoms" });

  expect(JSON.parse(Storage.getItemSync("preferences") ?? "")).toEqual({
    difficulty: "medium",
    season: "early",
    spot: "miller-bottoms",
  });
});

test("unreadable saved data falls back to the defaults", () => {
  Storage.setItemSync("preferences", "{not json");

  expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
});

test("each saved field is checked on its own", () => {
  Storage.setItemSync(
    "preferences",
    JSON.stringify({ difficulty: "nightmare", season: "rut", spot: "toString" })
  );

  expect(readPreferences()).toEqual({
    difficulty: "easy",
    season: "rut",
    spot: "cedar-hollow",
  });
});

test("saved data that is not an object falls back to the defaults", () => {
  Storage.setItemSync("preferences", "[1, 2, 3]");

  expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
});

test("the level cycles easy, medium, hard, and around", () => {
  expect(nextDifficulty("easy")).toBe("medium");
  expect(nextDifficulty("medium")).toBe("hard");
  expect(nextDifficulty("hard")).toBe("easy");
});

test("the season cycles early, rut, late, and around", () => {
  expect(nextSeason("early")).toBe("rut");
  expect(nextSeason("rut")).toBe("late");
  expect(nextSeason("late")).toBe("early");
});
