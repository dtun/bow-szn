import { SPECIES, type Harvest } from "@bow-szn/core";

const MINUTES_PER_HOUR = 60;
const NOON_HOUR = 12;

export function formatClock(clockMin: number): string {
  let hour = Math.floor(clockMin / MINUTES_PER_HOUR);
  let minute = clockMin % MINUTES_PER_HOUR;
  let period = hour < NOON_HOUR ? "AM" : "PM";
  let hourOnClock = hour % NOON_HOUR === 0 ? NOON_HOUR : hour % NOON_HOUR;
  return `${hourOnClock}:${String(minute).padStart(2, "0")} ${period}`;
}

export function entryTitle(harvest: Harvest): string {
  let species = SPECIES[harvest.species];
  let isElk = harvest.species === "elk";
  switch (harvest.antlers.kind) {
    case "rack":
      return `${harvest.antlers.points} PT ${isElk ? "BULL" : "BUCK"}`;
    case "spike":
      return "SPIKE";
    case "none":
      if (species.headgear.kind === "none") {
        return species.name;
      }
      return isElk ? "COW" : "DOE";
  }
}
