import { PALETTE, type Palette, type Sprite } from "@bow-szn/pixels";
import {
  createPicture,
  Skia,
  type SkCanvas,
  type SkImage,
  type SkPicture,
} from "@shopify/react-native-skia";

import { spriteRuns } from "@/art/sprite-runs";

import type { Bounds } from "./hunt-view";

export type Block = { x: number; y: number; width: number; height: number; color: string };

type Layer = { key: string; image: SkImage | null };

let pictures = new Map<string, SkPicture>();
let layers = new Map<string, Layer>();

function tinted(tint: string): Palette {
  return Object.fromEntries(Object.keys(PALETTE).map((char) => [char, tint]));
}

export function spriteBlocks(sprite: Sprite, tint: string | null, x = 0, y = 0): Block[] {
  let palette = tint === null ? PALETTE : tinted(tint);
  return spriteRuns(sprite, palette).map((run) => ({
    x: x + run.x,
    y: y + run.y,
    width: run.width,
    height: 1,
    color: run.color,
  }));
}

function drawBlocks(canvas: SkCanvas, blocks: Block[]) {
  let paint = Skia.Paint();
  paint.setAntiAlias(false);
  for (let block of blocks) {
    paint.setColor(Skia.Color(block.color));
    canvas.drawRect(Skia.XYWHRect(block.x, block.y, block.width, block.height), paint);
  }
}

export function spritePicture(sprite: Sprite, tint: string | null): SkPicture {
  let key = `${sprite.name}:${tint}`;
  let picture = pictures.get(key);
  if (picture === undefined) {
    let blocks = spriteBlocks(sprite, tint);
    picture = createPicture((canvas) => drawBlocks(canvas, blocks));
    pictures.set(key, picture);
  }
  return picture;
}

function rasterize(bounds: Bounds, blocks: Block[]): SkImage | null {
  let surface = Skia.Surface.Make(bounds.right - bounds.left, bounds.bottom - bounds.top);
  if (surface === null) {
    return null;
  }
  let canvas = surface.getCanvas();
  canvas.clear(Skia.Color("transparent"));
  canvas.translate(-bounds.left, -bounds.top);
  drawBlocks(canvas, blocks);
  surface.flush();
  return surface.makeImageSnapshot();
}

export function layerImage(
  layer: string,
  key: string,
  bounds: Bounds,
  build: () => Block[]
): SkImage | null {
  let cached = layers.get(layer);
  if (cached?.key === key) {
    return cached.image;
  }
  let image = rasterize(bounds, build());
  layers.set(layer, { key, image });
  return image;
}
