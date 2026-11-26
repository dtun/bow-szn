import type { Sprite } from "./types.ts";

export function sprite(name: string, rows: readonly string[]): Sprite {
  return { name, w: rows[0].length, h: rows.length, rows };
}

export function defineSprites<Id extends string>(
  art: Record<Id, readonly string[]>
): Record<Id, Sprite> {
  let sprites = {} as Record<Id, Sprite>;
  for (let name of Object.keys(art) as Id[]) {
    sprites[name] = sprite(name, art[name]);
  }
  return sprites;
}
