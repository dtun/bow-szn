import { DEER_SPRITES } from "./sprites/deer.ts";
import type { DeerSpriteId } from "./sprites/deer.ts";
import { ELK_SPRITES } from "./sprites/elk.ts";
import type { ElkSpriteId } from "./sprites/elk.ts";
import { HUNTER_SPRITES } from "./sprites/hunter.ts";
import type { HunterSpriteId } from "./sprites/hunter.ts";
import { RABBIT_SPRITES } from "./sprites/rabbit.ts";
import type { RabbitSpriteId } from "./sprites/rabbit.ts";
import { TERRAIN_SPRITES } from "./sprites/terrain.ts";
import type { TerrainSpriteId } from "./sprites/terrain.ts";
import { TURKEY_SPRITES } from "./sprites/turkey.ts";
import type { TurkeySpriteId } from "./sprites/turkey.ts";
import type { Sprite } from "./types.ts";

export type SpriteId =
  | HunterSpriteId
  | DeerSpriteId
  | ElkSpriteId
  | TurkeySpriteId
  | RabbitSpriteId
  | TerrainSpriteId;

export const SPRITES: Record<SpriteId, Sprite> = {
  ...HUNTER_SPRITES,
  ...DEER_SPRITES,
  ...ELK_SPRITES,
  ...TURKEY_SPRITES,
  ...RABBIT_SPRITES,
  ...TERRAIN_SPRITES,
};
