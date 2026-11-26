import { DEER_SPRITES } from "./sprites/deer.ts";
import type { DeerSpriteId } from "./sprites/deer.ts";
import { HUNTER_SPRITES } from "./sprites/hunter.ts";
import type { HunterSpriteId } from "./sprites/hunter.ts";
import type { Sprite } from "./types.ts";

export type SpriteId = HunterSpriteId | DeerSpriteId;

export const SPRITES: Record<SpriteId, Sprite> = {
  ...HUNTER_SPRITES,
  ...DEER_SPRITES,
};
