import type { SpeciesId } from "@bow-szn/core";
import { ANIMAL_FRAMES, SPRITES, TRANSPARENT, type Sprite, type SpriteId } from "@bow-szn/pixels";

export const SPECIES_ORDER: readonly SpeciesId[] = ["whitetail", "elk", "turkey", "rabbit"];

const CARD_FRAMES: Record<SpeciesId, SpriteId> = {
  whitetail: ANIMAL_FRAMES["buck-medium"].graze,
  elk: ANIMAL_FRAMES["elk-bull"].graze,
  turkey: ANIMAL_FRAMES.turkey.graze,
  rabbit: ANIMAL_FRAMES.rabbit.graze,
};

const SILHOUETTE_CHAR = "h";
const ART_WIDTH_PX = 96;

function silhouetteOf(sprite: Sprite): Sprite {
  return {
    ...sprite,
    rows: sprite.rows.map((row) =>
      [...row].map((cell) => (cell === TRANSPARENT ? TRANSPARENT : SILHOUETTE_CHAR)).join("")
    ),
  };
}

export function speciesSprite(species: SpeciesId, unlocked: boolean): Sprite {
  let sprite = SPRITES[CARD_FRAMES[species]];
  return unlocked ? sprite : silhouetteOf(sprite);
}

export function speciesScale(species: SpeciesId): number {
  return Math.floor(ART_WIDTH_PX / SPRITES[CARD_FRAMES[species]].w);
}
