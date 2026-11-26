import { SPRITES, type Sprite, type SpriteId } from "@bow-szn/pixels";

import type { SceneLayer, SceneSprite } from "@/art/scene";

import { CLOUD } from "./dawn-cloud";
import type { Facing, TitleAmbience } from "./title-ambience";

export type AmbientGeometry = { rows: number; horizonRow: number };

const DOE_FEET_BELOW_HORIZON = 14;
const RABBIT_FEET_DEPTH = 0.8;

let mirroredSprites = new Map<SpriteId, Sprite>();

function mirroredRow(row: string): string {
  return [...row].reverse().join("");
}

function facing(id: SpriteId, direction: Facing): Sprite {
  let sprite = SPRITES[id];
  if (direction === 1) {
    return sprite;
  }
  let mirrored = mirroredSprites.get(id);
  if (!mirrored) {
    mirrored = { ...sprite, name: `${sprite.name}-mirrored`, rows: sprite.rows.map(mirroredRow) };
    mirroredSprites.set(id, mirrored);
  }
  return mirrored;
}

export function ambientLayer(
  { clouds, doe, rabbit }: TitleAmbience,
  { rows, horizonRow }: AmbientGeometry
): SceneLayer {
  let sprites: SceneSprite[] = clouds.map(({ x, down }) => ({
    sprite: CLOUD,
    x,
    y: Math.round(horizonRow * down) - 1,
  }));

  let doeSprite = facing(doe.frame, doe.facing);
  sprites.push({
    sprite: doeSprite,
    x: doe.x,
    y: horizonRow + DOE_FEET_BELOW_HORIZON - doeSprite.h,
  });

  if (rabbit) {
    let rabbitSprite = facing(rabbit.frame, rabbit.facing);
    let feetRow = horizonRow + Math.round((rows - horizonRow) * RABBIT_FEET_DEPTH);
    sprites.push({ sprite: rabbitSprite, x: rabbit.x, y: feetRow - rabbitSprite.h - rabbit.lift });
  }

  return { rects: [], sprites };
}
