import { blank, hstack, overlay, scaled, shadowed, sprite } from "./compose.ts";
import { dawn } from "./dawn.ts";
import type { Dawn } from "./dawn.ts";
import { SPRITES } from "./registry.ts";
import type { Sprite } from "./types.ts";

export const ICON_GRID = 64;
export const SPLASH_GRID = 128;
export const FAVICON_GRID = 16;

type Cell = { x: number; y: number };

export const ICON_BUCK_AT: Cell = { x: 13, y: 18 };

const ICON_DAWN: Dawn = {
  size: ICON_GRID,
  bands: [
    { char: "N", from: 0 },
    { char: "i", from: 7 },
    { char: "v", from: 14 },
    { char: "r", from: 20 },
    { char: "q", from: 26 },
    { char: "c", from: 32 },
    { char: "O", from: 38 },
    { char: "o", from: 44 },
  ],
  dither: true,
  sun: { cx: 32, cy: 34, r: 20, rim: 3, glow: [2, 4] },
  canopy: { base: 51, char: "v", phase: 0.6 },
  knoll: { crest: 53, spread: 9, char: "K" },
};

const FAVICON_DAWN: Dawn = {
  size: FAVICON_GRID,
  bands: [
    { char: "N", from: 0 },
    { char: "v", from: 4 },
    { char: "q", from: 7 },
    { char: "O", from: 10 },
  ],
  dither: false,
  sun: { cx: 8, cy: 8.5, r: 7, rim: 1, glow: [] },
  canopy: null,
  knoll: { crest: 14, spread: 3, char: "K" },
};

const FAVICON_BUCK_AT: Cell = { x: 2, y: 3 };

export function iconScene(): Sprite {
  return overlay(
    "icon",
    dawn("icon", ICON_DAWN),
    SPRITES["brand-icon-buck"],
    ICON_BUCK_AT.x,
    ICON_BUCK_AT.y
  );
}

export function adaptiveBackgroundScene(): Sprite {
  return dawn("adaptive-background", ICON_DAWN);
}

export function adaptiveForegroundScene(): Sprite {
  return overlay(
    "adaptive-foreground",
    blank("adaptive-foreground", ICON_GRID, ICON_GRID),
    SPRITES["brand-icon-buck"],
    ICON_BUCK_AT.x,
    ICON_BUCK_AT.y
  );
}

export function faviconScene(): Sprite {
  return overlay(
    "favicon",
    dawn("favicon", FAVICON_DAWN),
    SPRITES["brand-icon-buck-mini"],
    FAVICON_BUCK_AT.x,
    FAVICON_BUCK_AT.y
  );
}

function centered(outer: number, inner: number): number {
  return Math.floor((outer - inner) / 2);
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

const WORDMARK_SCALE = 2;

function wordLine(name: string, letters: readonly Sprite[]): Sprite {
  return scaled(name, shadowed(name, hstack(name, letters, 1), "R"), WORDMARK_SCALE);
}

const SPLASH_BADGE_Y = 6;
const SPLASH_BOW_Y = 78;
const SPLASH_SEASON_Y = 100;

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
