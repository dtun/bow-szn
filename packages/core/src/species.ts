import type { Headgear, SeasonId, Species, SpeciesId } from "./types";

const ANTLERED_ODDS = {
  early: { doe: 0.55, spike: 0.25, buck: 0.2 },
  rut: { doe: 0.4, spike: 0.2, buck: 0.4 },
  late: { doe: 0.6, spike: 0.2, buck: 0.2 },
};

const ALL_SEASONS: readonly SeasonId[] = ["early", "rut", "late"];

const NO_HEADGEAR: Headgear = { kind: "none" };

export const SPECIES: Record<SpeciesId, Species> = {
  whitetail: {
    id: "whitetail",
    name: "WHITETAIL",
    hitRadius: 7,
    speed: 14,
    spookRadius: 26,
    weightLb: [110, 260],
    meatYield: 0.45,
    headgear: { kind: "antlered", odds: ANTLERED_ODDS, rackPoints: [4, 12] },
    seasons: ALL_SEASONS,
    rarity: 5,
  },
  turkey: {
    id: "turkey",
    name: "TURKEY",
    hitRadius: 4,
    speed: 10,
    spookRadius: 22,
    weightLb: [12, 25],
    meatYield: 0.6,
    headgear: NO_HEADGEAR,
    seasons: ["early", "rut", "late"],
    rarity: 1,
  },
  rabbit: {
    id: "rabbit",
    name: "RABBIT",
    hitRadius: 3,
    speed: 22,
    spookRadius: 16,
    weightLb: [2, 4],
    meatYield: 0.5,
    headgear: NO_HEADGEAR,
    seasons: ALL_SEASONS,
    rarity: 6,
  },
  elk: {
    id: "elk",
    name: "ELK",
    hitRadius: 10,
    speed: 12,
    spookRadius: 30,
    weightLb: [500, 800],
    meatYield: 0.42,
    headgear: { kind: "antlered", odds: ANTLERED_ODDS, rackPoints: [10, 16] },
    seasons: ["rut", "late"],
    rarity: 2,
  },
};
