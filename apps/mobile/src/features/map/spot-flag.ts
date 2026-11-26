import type { Sprite } from "@bow-szn/pixels";

function flag(name: string, cloth: string, pole: string): Sprite {
  let rows = [
    `${pole}${cloth.repeat(4)}...`,
    `${pole}${cloth.repeat(6)}.`,
    `${pole}${cloth.repeat(4)}...`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole}.......`,
    `${pole.repeat(3)}.....`,
  ];
  return { name, w: 8, h: rows.length, rows };
}

export const FLAG_IDLE: Sprite = flag("spot-flag", "R", "E");
export const FLAG_PICKED: Sprite = flag("spot-flag-picked", "Y", "W");
