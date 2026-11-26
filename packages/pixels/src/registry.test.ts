import { HUNTER_FRAMES, PALETTE, SPRITES, TRANSPARENT } from "./index.ts";
import type { Sprite } from "./index.ts";

function offenders(broken: (id: string, sprite: Sprite) => boolean): string[] {
  return Object.entries(SPRITES)
    .filter(([id, sprite]) => broken(id, sprite))
    .map(([id]) => id);
}

describe("SPRITES", () => {
  it("names every sprite by its id", () => {
    expect(offenders((id, sprite) => sprite.name !== id)).toEqual([]);
  });

  it("has exactly h rows in every sprite", () => {
    expect(offenders((_id, sprite) => sprite.h < 1 || sprite.rows.length !== sprite.h)).toEqual([]);
  });

  it("makes every row exactly w wide", () => {
    expect(
      offenders((_id, sprite) => sprite.w < 1 || sprite.rows.some((row) => row.length !== sprite.w))
    ).toEqual([]);
  });

  it("draws only with palette colors and transparency", () => {
    let allowed = new Set([...Object.keys(PALETTE), TRANSPARENT]);

    expect(
      offenders((_id, sprite) =>
        sprite.rows
          .join("")
          .split("")
          .some((char) => !allowed.has(char))
      )
    ).toEqual([]);
  });

  it("paints at least one pixel in every sprite", () => {
    expect(
      offenders((_id, sprite) => sprite.rows.join("").replaceAll(TRANSPARENT, "").length === 0)
    ).toEqual([]);
  });
});

describe("HUNTER_FRAMES", () => {
  it("names an idle and a drawing sprite that exist", () => {
    expect(SPRITES[HUNTER_FRAMES.idle].name).toBe("hunter-idle");
    expect(SPRITES[HUNTER_FRAMES.draw].name).toBe("hunter-draw");
  });
});
