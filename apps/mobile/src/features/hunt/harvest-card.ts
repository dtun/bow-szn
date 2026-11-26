import { canMount, SPECIES, type Harvest } from "@bow-szn/core";
import { ANIMAL_FRAMES, type SpriteId } from "@bow-szn/pixels";

import { animalKind } from "./animal-art";
import { tagName } from "./hunt-over";

export type HarvestCard = {
  harvestId: string;
  title: string;
  name: string;
  classLine: string;
  meatLine: string;
  shotLine: string;
  canMount: boolean;
  sprite: SpriteId;
};

function classLine(harvest: Harvest): string {
  let weight = `${harvest.weightLb} LB`;
  if (harvest.antlers.kind === "rack") {
    return `${harvest.antlers.points} POINTS · ${weight}`;
  }
  return SPECIES[harvest.species].headgear.kind === "antlered"
    ? `${tagName(harvest)} · ${weight}`
    : weight;
}

export function harvestCardFor(harvest: Harvest): HarvestCard {
  let mountable = canMount(harvest);
  return {
    harvestId: harvest.id,
    title: `${tagName(harvest)}${mountable ? "!!" : "!"}`,
    name: SPECIES[harvest.species].name,
    classLine: classLine(harvest),
    meatLine: `+${harvest.meatLb} LB MEAT`,
    shotLine: `SHOT AT ${harvest.shotYards} YDS`,
    canMount: mountable,
    sprite: ANIMAL_FRAMES[animalKind(harvest)].walk[0],
  };
}
