import { blank, hstack, overlay, shadowed, sprite } from "./compose.ts";
import { SPRITES } from "./registry.ts";
import type { Sprite } from "./types.ts";

export const ICON_GRID = 32;
export const SPLASH_GRID = 64;
export const FAVICON_GRID = 16;

type SkyBand = { rows: number; chars: readonly [string, string] };

const ICON_SKY: readonly SkyBand[] = [
  { rows: 7, chars: ["O", "O"] },
  { rows: 2, chars: ["O", "P"] },
  { rows: 6, chars: ["P", "P"] },
  { rows: 2, chars: ["P", "Y"] },
  { rows: 15, chars: ["Y", "Y"] },
];

const FAVICON_SKY: readonly SkyBand[] = [
  { rows: 5, chars: ["O", "O"] },
  { rows: 1, chars: ["O", "P"] },
  { rows: 4, chars: ["P", "P"] },
  { rows: 1, chars: ["P", "Y"] },
  { rows: 5, chars: ["Y", "Y"] },
];

const SUN_CENTER = { x: 26, y: 19 };
const SUN_RADIUS = 6;
const SUN_CORE_RADIUS = 3;
const DEER_AT = { x: 21, y: 14 };
const ICON_BOW_AT = { x: 1, y: 2 };

function centered(outer: number, inner: number): number {
  return Math.floor((outer - inner) / 2);
}

function dawnSky(name: string, size: number, bands: readonly SkyBand[]): Sprite {
  let rows: string[] = [];
  for (let band of bands) {
    for (let i = 0; i < band.rows; i++) {
      let y = rows.length;
      rows.push(Array.from({ length: size }, (_, x) => band.chars[(x + y) % 2]).join(""));
    }
  }
  return sprite(name, rows);
}

function disc(name: string, size: number, cx: number, cy: number, r: number, char: string): Sprite {
  return sprite(
    name,
    Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => (Math.hypot(x - cx, y - cy) <= r ? char : ".")).join(
        ""
      )
    )
  );
}

function dawnBackground(name: string): Sprite {
  let trees = SPRITES["brand-treeline"];
  let sky = dawnSky(name, ICON_GRID, ICON_SKY);
  let sun = overlay(
    name,
    sky,
    disc("sun", ICON_GRID, SUN_CENTER.x, SUN_CENTER.y, SUN_RADIUS, "C"),
    0,
    0
  );
  let core = overlay(
    name,
    sun,
    disc("core", ICON_GRID, SUN_CENTER.x, SUN_CENTER.y, SUN_CORE_RADIUS, "W"),
    0,
    0
  );
  let wooded = overlay(name, core, trees, 0, ICON_GRID - trees.h);
  return overlay(name, wooded, SPRITES["brand-deer"], DEER_AT.x, DEER_AT.y);
}

export function iconScene(): Sprite {
  return overlay(
    "icon",
    dawnBackground("icon"),
    SPRITES["brand-bow"],
    ICON_BOW_AT.x,
    ICON_BOW_AT.y
  );
}

export function adaptiveBackgroundScene(): Sprite {
  return dawnBackground("adaptive-background");
}

export function adaptiveForegroundScene(): Sprite {
  let bow = SPRITES["brand-bow-compact"];
  return overlay(
    "adaptive-foreground",
    blank("adaptive-foreground", ICON_GRID, ICON_GRID),
    bow,
    centered(ICON_GRID, bow.w),
    centered(ICON_GRID, bow.h)
  );
}

export function faviconScene(): Sprite {
  let trees = SPRITES["brand-treeline-mini"];
  let bow = SPRITES["brand-bow-mini"];
  let sky = dawnSky("favicon", FAVICON_GRID, FAVICON_SKY);
  let wooded = overlay("favicon", sky, trees, 0, FAVICON_GRID - trees.h);
  return overlay("favicon", wooded, bow, 2, 2);
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
