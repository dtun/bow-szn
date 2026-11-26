import type { Harvest, Journal, PersonalBest, SpeciesId } from "./types";

export function recordHarvest(journal: Journal, harvest: Harvest): Journal {
  if (journal.harvests.some((kept) => kept.id === harvest.id)) {
    return journal;
  }
  return { ...journal, harvests: [...journal.harvests, harvest] };
}

export function freezerLb(journal: Journal): number {
  return journal.harvests.reduce((sum, harvest) => sum + harvest.meatLb, 0);
}

export function canMount(harvest: Harvest): boolean {
  return harvest.antlers.kind === "rack";
}

export function mount(journal: Journal, harvestId: string): Journal {
  let harvest = journal.harvests.find((kept) => kept.id === harvestId);
  if (harvest === undefined || !canMount(harvest) || journal.mountedIds.includes(harvestId)) {
    return journal;
  }
  return { ...journal, mountedIds: [...journal.mountedIds, harvestId] };
}

function rackPoints(harvest: Harvest): number {
  return harvest.antlers.kind === "rack" ? harvest.antlers.points : 0;
}

export function trophyScore(harvest: Harvest): number {
  return rackPoints(harvest) * 10 + Math.round(harvest.weightLb / 10);
}

export function trophyRoom(journal: Journal): Harvest[] {
  return journal.harvests
    .filter((harvest) => journal.mountedIds.includes(harvest.id))
    .sort((a, b) => trophyScore(b) - trophyScore(a));
}

function bestOf(harvests: Harvest[]): PersonalBest | null {
  if (harvests.length === 0) {
    return null;
  }
  return {
    count: harvests.length,
    bestWeightLb: Math.max(...harvests.map((harvest) => harvest.weightLb)),
    bestPoints: Math.max(...harvests.map(rackPoints)),
    bestScore: Math.max(...harvests.map(trophyScore)),
  };
}

function bestFor(journal: Journal, species: SpeciesId): PersonalBest | null {
  return bestOf(journal.harvests.filter((harvest) => harvest.species === species));
}

export function personalBests(journal: Journal): Record<SpeciesId, PersonalBest | null> {
  return {
    whitetail: bestFor(journal, "whitetail"),
    turkey: bestFor(journal, "turkey"),
    rabbit: bestFor(journal, "rabbit"),
    elk: bestFor(journal, "elk"),
  };
}
