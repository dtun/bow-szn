import { freezerLb, type Antlers, type HuntState, type SpeciesId } from "@bow-szn/core";

export type OverPanel = { title: string; tags: string[]; freezerLb: number };

const NO_TAGS = "NO TAGS THIS MORNING";

export function tagName(harvest: { species: SpeciesId; antlers: Antlers }): string {
  let antlers = harvest.antlers.kind;
  switch (harvest.species) {
    case "whitetail":
      return antlers === "rack" ? "BUCK" : antlers === "spike" ? "SPIKE" : "DOE";
    case "elk":
      return antlers === "rack" ? "BULL" : antlers === "spike" ? "SPIKE" : "COW";
    case "turkey":
      return "TURKEY";
    case "rabbit":
      return "RABBIT";
  }
}

function tally(names: string[]): string[] {
  let counts = new Map<string, number>();
  for (let name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => `${name} ${count}`);
}

export function overPanelFor(hunt: HuntState): OverPanel | null {
  if (hunt.phase.kind !== "over") {
    return null;
  }
  let tags = tally(hunt.harvests.map(tagName));
  return {
    title: hunt.phase.reason === "dusk" ? "LEGAL LIGHT IS DONE" : "OUT OF ARROWS",
    tags: tags.length === 0 ? [NO_TAGS] : tags,
    freezerLb: freezerLb({ harvests: hunt.harvests, mountedIds: [] }),
  };
}
