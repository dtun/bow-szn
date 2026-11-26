import { readPngSize } from "./png-size";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

function pngHeader(width: number, height: number): Uint8Array {
  let bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52], 8);
  let view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes.set([0x08, 0x02, 0x00, 0x00, 0x00], 24);
  return bytes;
}

test("reads the size of a real PNG file", () => {
  expect(readPngSize(ONE_PIXEL_PNG)).toEqual({ width: 1, height: 1 });
});

test("reads width and height as big-endian values in the right order", () => {
  expect(readPngSize(pngHeader(1320, 2868))).toEqual({ width: 1320, height: 2868 });
  expect(readPngSize(pngHeader(2868, 1320))).toEqual({ width: 2868, height: 1320 });
});

test("reads a PNG held in a view into a larger buffer", () => {
  let padded = new Uint8Array(40);
  padded.set(pngHeader(1290, 2796), 7);

  expect(readPngSize(padded.subarray(7))).toEqual({ width: 1290, height: 2796 });
});

test("says nothing about a file that is not a PNG", () => {
  let jpeg = new Uint8Array(33);
  jpeg.set([0xff, 0xd8, 0xff, 0xe0], 0);

  expect(readPngSize(jpeg)).toBe(null);
});

test("says nothing about a PNG whose first chunk is not the header", () => {
  let bytes = pngHeader(1320, 2868);
  bytes.set([0x74, 0x45, 0x58, 0x74], 12);

  expect(readPngSize(bytes)).toBe(null);
});

test("says nothing about a file cut off before the size", () => {
  expect(readPngSize(pngHeader(1320, 2868).subarray(0, 20))).toBe(null);
  expect(readPngSize(new Uint8Array(0))).toBe(null);
});
