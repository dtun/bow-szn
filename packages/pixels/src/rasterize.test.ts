import { rasterize } from "./rasterize.ts";
import type { Raster } from "./rasterize.ts";
import type { Palette, Sprite } from "./types.ts";

const PALETTE: Palette = { R: "#ff0000", G: "#00ff00", B: "#0000ff" };

const TINY: Sprite = { name: "tiny", w: 3, h: 2, rows: ["R.G", ".B."] };

function pixelAt(raster: Raster, x: number, y: number): number[] {
  let offset = (y * raster.width + x) * 4;
  return Array.from(raster.rgba.slice(offset, offset + 4));
}

describe("rasterize", () => {
  it("sizes the raster by the scale", () => {
    let raster = rasterize(TINY, PALETTE, 2);

    expect(raster.width).toBe(6);
    expect(raster.height).toBe(4);
    expect(raster.rgba).toHaveLength(6 * 4 * 4);
  });

  it("paints each colored cell opaque at scale 1", () => {
    let raster = rasterize(TINY, PALETTE, 1);

    expect(pixelAt(raster, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(raster, 2, 0)).toEqual([0, 255, 0, 255]);
    expect(pixelAt(raster, 1, 1)).toEqual([0, 0, 255, 255]);
  });

  it("leaves transparent cells fully clear", () => {
    let raster = rasterize(TINY, PALETTE, 1);

    expect(pixelAt(raster, 1, 0)).toEqual([0, 0, 0, 0]);
    expect(pixelAt(raster, 0, 1)).toEqual([0, 0, 0, 0]);
  });

  it("repeats every cell across its whole scaled block", () => {
    let raster = rasterize(TINY, PALETTE, 2);

    for (let [x, y] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      expect(pixelAt(raster, x, y)).toEqual([255, 0, 0, 255]);
    }
    for (let [x, y] of [
      [2, 0],
      [3, 1],
    ]) {
      expect(pixelAt(raster, x, y)).toEqual([0, 0, 0, 0]);
    }
    for (let [x, y] of [
      [2, 2],
      [3, 3],
    ]) {
      expect(pixelAt(raster, x, y)).toEqual([0, 0, 255, 255]);
    }
  });

  it("rejects a character the palette does not define", () => {
    let stray: Sprite = { name: "stray", w: 1, h: 1, rows: ["?"] };

    expect(() => rasterize(stray, PALETTE, 1)).toThrow('stray: no palette color for "?" at 0,0');
  });
});
