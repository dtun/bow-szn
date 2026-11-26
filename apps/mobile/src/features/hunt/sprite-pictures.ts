import { PALETTE, type Palette, type Sprite } from "@bow-szn/pixels";
import { createPicture, Skia, type SkPicture } from "@shopify/react-native-skia";

import { spriteRuns } from "@/art/sprite-runs";

export type Block = { x: number; y: number; width: number; height: number; color: string };

let pictures = new Map<string, SkPicture>();

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

export function blocksPicture(blocks: Block[]): SkPicture {
  return createPicture((canvas) => {
    let paint = Skia.Paint();
    paint.setAntiAlias(false);
    for (let block of blocks) {
      paint.setColor(Skia.Color(block.color));
      canvas.drawRect(Skia.XYWHRect(block.x, block.y, block.width, block.height), paint);
    }
  });
}

export function cachedPicture(key: string, build: () => Block[]): SkPicture {
  let picture = pictures.get(key);
  if (picture === undefined) {
    picture = blocksPicture(build());
    pictures.set(key, picture);
  }
  return picture;
}

export function spritePicture(sprite: Sprite, tint: string | null): SkPicture {
  return cachedPicture(`sprite:${sprite.name}:${tint}`, () => spriteBlocks(sprite, tint));
}
