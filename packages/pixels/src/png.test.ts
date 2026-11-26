import { encodePng } from "./png.ts";
import { bitwiseCrc32, decodePng } from "./test-support/read-png.ts";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const COLOR_TYPE_RGB = 2;
const COLOR_TYPE_RGBA = 6;

const TWO_BY_ONE = Uint8Array.from([255, 0, 0, 255, 0, 128, 255, 40]);

describe("encodePng", () => {
  it("starts with the PNG signature", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: true }));

    expect(png.signature).toEqual(PNG_SIGNATURE);
  });

  it("records the size and an 8-bit RGBA color type when alpha is on", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: true }));

    expect(png.chunks[0].type).toBe("IHDR");
    expect([png.width, png.height, png.bitDepth, png.colorType]).toEqual([
      2,
      1,
      8,
      COLOR_TYPE_RGBA,
    ]);
  });

  it("records an 8-bit RGB color type when alpha is off", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: false }));

    expect([png.width, png.height, png.bitDepth, png.colorType]).toEqual([2, 1, 8, COLOR_TYPE_RGB]);
  });

  it("round-trips every RGBA byte when alpha is on", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: true }));

    expect(Array.from(png.samples)).toEqual([255, 0, 0, 255, 0, 128, 255, 40]);
  });

  it("drops the alpha bytes when alpha is off", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: false }));

    expect(Array.from(png.samples)).toEqual([255, 0, 0, 0, 128, 255]);
  });

  it("keeps rows in order for a taller image", () => {
    let rgba = Uint8Array.from([1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255]);
    let png = decodePng(encodePng(1, 3, rgba, { alpha: false }));

    expect(Array.from(png.samples)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("ends with an empty IEND chunk", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: true }));
    let last = png.chunks[png.chunks.length - 1];

    expect(last.type).toBe("IEND");
    expect(last.data).toHaveLength(0);
    expect(last.storedCrc).toBe(0xae426082);
  });

  it("stores a valid CRC-32 for every chunk", () => {
    let png = decodePng(encodePng(2, 1, TWO_BY_ONE, { alpha: true }));

    for (let { type, data, storedCrc } of png.chunks) {
      expect(storedCrc).toBe(bitwiseCrc32(Buffer.concat([Buffer.from(type, "ascii"), data])));
    }
  });

  it("rejects a buffer whose length does not match the size", () => {
    expect(() => encodePng(3, 1, TWO_BY_ONE, { alpha: true })).toThrow(
      "rgba holds 8 bytes, expected 12"
    );
  });
});
