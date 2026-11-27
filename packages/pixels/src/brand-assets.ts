import {
  adaptiveBackgroundScene,
  adaptiveForegroundScene,
  faviconScene,
  iconScene,
  splashScene,
} from "./brand.ts";
import { PALETTE } from "./palette.ts";
import { encodePng } from "./png.ts";
import { rasterize } from "./rasterize.ts";
import type { Sprite } from "./types.ts";

export type BrandFile = { name: string; bytes: Buffer };

type BrandSpec = { name: string; scene: Sprite; scale: number; alpha: boolean };

const BRAND_SPECS: readonly BrandSpec[] = [
  { name: "icon.png", scene: iconScene(), scale: 16, alpha: false },
  { name: "splash.png", scene: splashScene(), scale: 8, alpha: false },
  { name: "adaptive-foreground.png", scene: adaptiveForegroundScene(), scale: 16, alpha: true },
  { name: "adaptive-background.png", scene: adaptiveBackgroundScene(), scale: 16, alpha: false },
  { name: "favicon.png", scene: faviconScene(), scale: 3, alpha: false },
];

export function renderBrandFiles(): BrandFile[] {
  return BRAND_SPECS.map(({ name, scene, scale, alpha }) => {
    let { width, height, rgba } = rasterize(scene, PALETTE, scale);
    return { name, bytes: encodePng(width, height, rgba, { alpha }) };
  });
}
