import { BRAND_SPRITES } from "./sprites/brand.ts";
import type { BrandSpriteId } from "./sprites/brand.ts";
import { DEER_SPRITES } from "./sprites/deer.ts";
import type { DeerSpriteId } from "./sprites/deer.ts";
import { ELK_SPRITES } from "./sprites/elk.ts";
import type { ElkSpriteId } from "./sprites/elk.ts";
import { FX_SPRITES } from "./sprites/fx.ts";
import type { FxSpriteId } from "./sprites/fx.ts";
import { HUNTER_SPRITES } from "./sprites/hunter.ts";
import type { HunterSpriteId } from "./sprites/hunter.ts";
import { ICON_SPRITES } from "./sprites/icons.ts";
import type { IconSpriteId } from "./sprites/icons.ts";
import { LOGO_SPRITES } from "./sprites/logo.ts";
import type { LogoSpriteId } from "./sprites/logo.ts";
import { MOUNT_SPRITES } from "./sprites/mounts.ts";
import type { MountSpriteId } from "./sprites/mounts.ts";
import { PLAT_MAP_SPRITES } from "./sprites/plat-map.ts";
import type { PlatMapSpriteId } from "./sprites/plat-map.ts";
import { RABBIT_SPRITES } from "./sprites/rabbit.ts";
import type { RabbitSpriteId } from "./sprites/rabbit.ts";
import { SIGHT_IN_SPRITES } from "./sprites/sight-in.ts";
import type { SightInSpriteId } from "./sprites/sight-in.ts";
import { TERRAIN_SPRITES } from "./sprites/terrain.ts";
import type { TerrainSpriteId } from "./sprites/terrain.ts";
import { TRAIL_SIGN_SPRITES } from "./sprites/trail-sign.ts";
import type { TrailSignSpriteId } from "./sprites/trail-sign.ts";
import { TURKEY_SPRITES } from "./sprites/turkey.ts";
import type { TurkeySpriteId } from "./sprites/turkey.ts";
import type { Sprite } from "./types.ts";

export type SpriteId =
  | HunterSpriteId
  | DeerSpriteId
  | ElkSpriteId
  | TurkeySpriteId
  | RabbitSpriteId
  | TerrainSpriteId
  | SightInSpriteId
  | PlatMapSpriteId
  | TrailSignSpriteId
  | FxSpriteId
  | IconSpriteId
  | MountSpriteId
  | LogoSpriteId
  | BrandSpriteId;

export const SPRITES: Record<SpriteId, Sprite> = {
  ...HUNTER_SPRITES,
  ...DEER_SPRITES,
  ...ELK_SPRITES,
  ...TURKEY_SPRITES,
  ...RABBIT_SPRITES,
  ...TERRAIN_SPRITES,
  ...SIGHT_IN_SPRITES,
  ...PLAT_MAP_SPRITES,
  ...TRAIL_SIGN_SPRITES,
  ...FX_SPRITES,
  ...ICON_SPRITES,
  ...MOUNT_SPRITES,
  ...LOGO_SPRITES,
  ...BRAND_SPRITES,
};
