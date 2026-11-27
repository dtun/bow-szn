import { sprite } from "./compose.ts";
import type { Sprite } from "./types.ts";

export type SkyBand = { char: string; from: number };
export type Sun = { cx: number; cy: number; r: number; rim: number; glow: readonly number[] };
export type Canopy = { base: number; char: string; phase: number };
export type Knoll = { crest: number; spread: number; char: string };

export type Dawn = {
  size: number;
  bands: readonly SkyBand[];
  dither: boolean;
  sun: Sun;
  canopy: Canopy | null;
  knoll: Knoll;
};

const GLOW_STEP: Readonly<Record<string, string>> = {
  N: "i",
  i: "v",
  v: "r",
  r: "q",
  q: "c",
  c: "O",
  O: "o",
};

function bandAt(bands: readonly SkyBand[], y: number): number {
  let index = 0;
  bands.forEach((band, at) => {
    if (y >= band.from) {
      index = at;
    }
  });
  return index;
}

function skyCell(bands: readonly SkyBand[], dither: boolean, x: number, y: number): string {
  let index = bandAt(bands, y);
  let next = bands[index + 1];
  if (!dither) {
    return bands[index].char;
  }
  if (next && next.from - y === 1 && (x + y) % 2 === 0) {
    return next.char;
  }
  if (next && next.from - y === 2 && (x + y) % 4 === 0) {
    return next.char;
  }
  if (index > 0 && y === bands[index].from && (x + y + 1) % 4 === 0) {
    return bands[index - 1].char;
  }
  return bands[index].char;
}

function glowing(char: string, steps: number): string {
  let out = char;
  for (let step = 0; step < steps; step++) {
    out = GLOW_STEP[out] ?? out;
  }
  return out;
}

function sunCell(sun: Sun, sky: string, x: number, y: number): string {
  let d = Math.hypot(x + 0.5 - sun.cx, y + 0.5 - sun.cy);
  if (d <= sun.r) {
    return d <= sun.r - sun.rim ? "u" : "Y";
  }
  let ring = sun.glow.findIndex((reach) => d <= sun.r + reach);
  return ring === -1 ? sky : glowing(sky, sun.glow.length - ring);
}

function underCanopy(canopy: Canopy | null, x: number, y: number): boolean {
  if (!canopy) {
    return false;
  }
  let crown =
    2.2 + 1.6 * Math.sin(x / 2.3 + canopy.phase) + 1.1 * Math.sin(x / 5.1 + canopy.phase * 2);
  return y >= canopy.base - Math.round(crown);
}

function onKnoll(knoll: Knoll, size: number, x: number, y: number): boolean {
  return y >= knoll.crest + Math.floor(((x - size / 2) / knoll.spread) ** 2);
}

export function dawn(name: string, spec: Dawn): Sprite {
  return sprite(
    name,
    Array.from({ length: spec.size }, (_, y) =>
      Array.from({ length: spec.size }, (_, x) => {
        if (onKnoll(spec.knoll, spec.size, x, y)) {
          return spec.knoll.char;
        }
        if (spec.canopy && underCanopy(spec.canopy, x, y)) {
          return spec.canopy.char;
        }
        return sunCell(spec.sun, skyCell(spec.bands, spec.dither, x, y), x, y);
      }).join("")
    )
  );
}
