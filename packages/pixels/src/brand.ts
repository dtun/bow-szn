import { blank, disc, hstack, overlay, shadowed, sprite } from "./compose.ts";
import { SPRITES } from "./registry.ts";
import type { Sprite } from "./types.ts";

export const ICON_GRID = 32;
export const SPLASH_GRID = 64;
export const FAVICON_GRID = 16;

const ADAPTIVE_GRID = 64;

type Cell = { x: number; y: number };

const ICON_SUN_RADIUS = ICON_GRID / 2 - 0.5;
const ICON_BUCK_AT: Cell = { x: 5, y: 4 };
const FAVICON_SUN_RADIUS = FAVICON_GRID / 2 - 0.5;
const ADAPTIVE_SUN_RADIUS = 17.5;
const ADAPTIVE_BUCK_AT: Cell = { x: 21, y: 20 };

function centered(outer: number, inner: number): number {
  return Math.floor((outer - inner) / 2);
}

function sunWithBuck(name: string, field: Sprite, radius: number, buck: Sprite, at: Cell): Sprite {
  let center = (field.w - 1) / 2;
  let sun = disc("sun", field.w, center, center, radius, "O");
  return overlay(name, overlay(name, field, sun, 0, 0), buck, at.x, at.y);
}

export function iconScene(): Sprite {
  return sunWithBuck(
    "icon",
    blank("icon", ICON_GRID, ICON_GRID, "N"),
    ICON_SUN_RADIUS,
    SPRITES["brand-icon-buck"],
    ICON_BUCK_AT
  );
}

export function adaptiveBackgroundScene(): Sprite {
  return blank("adaptive-background", ICON_GRID, ICON_GRID, "N");
}

export function adaptiveForegroundScene(): Sprite {
  return sunWithBuck(
    "adaptive-foreground",
    blank("adaptive-foreground", ADAPTIVE_GRID, ADAPTIVE_GRID),
    ADAPTIVE_SUN_RADIUS,
    SPRITES["brand-icon-buck"],
    ADAPTIVE_BUCK_AT
  );
}

export function faviconScene(): Sprite {
  let buck = SPRITES["brand-icon-buck-mini"];
  return sunWithBuck(
    "favicon",
    blank("favicon", FAVICON_GRID, FAVICON_GRID, "N"),
    FAVICON_SUN_RADIUS,
    buck,
    { x: centered(FAVICON_GRID, buck.w), y: centered(FAVICON_GRID, buck.h) }
  );
}

const BADGE_RING = 1;

function badge(source: Sprite): Sprite {
  let size = source.w + 2 * BADGE_RING;
  let center = (size - 1) / 2;
  let radius = source.w / 2;
  return sprite(
    "badge",
    Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        let distance = Math.hypot(x - center, y - center);
        if (distance <= radius) {
          return source.rows[y - BADGE_RING][x - BADGE_RING];
        }
        return distance <= radius + BADGE_RING ? "C" : ".";
      }).join("")
    )
  );
}

function wordLine(name: string, letters: readonly Sprite[]): Sprite {
  return shadowed(name, hstack(name, letters, 1), "R");
}

const SPLASH_BADGE_Y = 3;
const SPLASH_BOW_Y = 39;
const SPLASH_SEASON_Y = 50;

export function splashScene(): Sprite {
  let bow = wordLine("bow", [SPRITES["logo-b"], SPRITES["logo-o"], SPRITES["logo-w"]]);
  let season = wordLine("season", [
    SPRITES["logo-s"],
    SPRITES["logo-e"],
    SPRITES["logo-a"],
    SPRITES["logo-s"],
    SPRITES["logo-o"],
    SPRITES["logo-n"],
  ]);
  let emblem = badge(iconScene());
  let wall = blank("splash", SPLASH_GRID, SPLASH_GRID, "S");
  let withBadge = overlay("splash", wall, emblem, centered(SPLASH_GRID, emblem.w), SPLASH_BADGE_Y);
  let withBow = overlay("splash", withBadge, bow, centered(SPLASH_GRID, bow.w), SPLASH_BOW_Y);
  return overlay("splash", withBow, season, centered(SPLASH_GRID, season.w), SPLASH_SEASON_Y);
}
