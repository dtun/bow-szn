import type { Harvest, Journal } from "@bow-szn/core";

export const BIG_BUCK: Harvest = {
  id: "big-buck",
  species: "whitetail",
  antlers: { kind: "rack", points: 10 },
  weightLb: 200,
  meatLb: 90,
  spot: "miller-bottoms",
  season: "rut",
  clockMin: 462,
  shotYards: 32,
};

export const DOE: Harvest = {
  id: "doe",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 120,
  meatLb: 54,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 375,
  shotYards: 25,
};

export const RIDGE_BUCK: Harvest = {
  id: "ridge-buck",
  species: "whitetail",
  antlers: { kind: "rack", points: 6 },
  weightLb: 160,
  meatLb: 72,
  spot: "high-ridge",
  season: "late",
  clockMin: 540,
  shotYards: 40,
};

export const UNMOUNTED_BUCK: Harvest = {
  id: "unmounted-buck",
  species: "whitetail",
  antlers: { kind: "rack", points: 8 },
  weightLb: 180,
  meatLb: 81,
  spot: "cattail-marsh",
  season: "early",
  clockMin: 480,
  shotYards: 28,
};

export const BULL_ELK: Harvest = {
  id: "bull-elk",
  species: "elk",
  antlers: { kind: "rack", points: 14 },
  weightLb: 600,
  meatLb: 252,
  spot: "high-ridge",
  season: "rut",
  clockMin: 570,
  shotYards: 55,
};

export const TURKEY: Harvest = {
  id: "turkey",
  species: "turkey",
  antlers: { kind: "none" },
  weightLb: 20,
  meatLb: 12,
  spot: "cattail-marsh",
  season: "early",
  clockMin: 420,
  shotYards: 18,
};

export const RABBIT: Harvest = {
  id: "rabbit",
  species: "rabbit",
  antlers: { kind: "none" },
  weightLb: 4,
  meatLb: 2,
  spot: "miller-bottoms",
  season: "early",
  clockMin: 390,
  shotYards: 12,
};

export const SMALL_RABBIT: Harvest = {
  id: "small-rabbit",
  species: "rabbit",
  antlers: { kind: "none" },
  weightLb: 2,
  meatLb: 1,
  spot: "cedar-hollow",
  season: "late",
  clockMin: 725,
  shotYards: 9,
};

export const EMPTY_JOURNAL: Journal = { harvests: [], mountedIds: [] };

export const SEEDED_JOURNAL: Journal = {
  harvests: [BIG_BUCK, DOE, RIDGE_BUCK, UNMOUNTED_BUCK, BULL_ELK, TURKEY, RABBIT, SMALL_RABBIT],
  mountedIds: ["ridge-buck", "big-buck", "bull-elk"],
};
