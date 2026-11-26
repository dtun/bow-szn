import { SPECIES } from "./species";
import type { Animal } from "./types";

export function isLive(animal: Animal): boolean {
  return animal.mode.kind !== "down" && animal.mode.kind !== "gone";
}

export function hitRadius(animal: Animal): number {
  return SPECIES[animal.species].hitRadius;
}
