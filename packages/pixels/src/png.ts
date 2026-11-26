import { crc32, deflateSync } from "node:zlib";

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const BIT_DEPTH = 8;
const COLOR_TYPE_RGB = 2;
const COLOR_TYPE_RGBA = 6;
const FILTER_NONE = 0;

export type PngOptions = { alpha: boolean };

function chunk(type: string, data: Uint8Array): Buffer {
  let body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  let length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  let checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function header(width: number, height: number, colorType: number): Buffer {
  let data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = BIT_DEPTH;
  data[9] = colorType;
  return chunk("IHDR", data);
}

function scanlines(width: number, height: number, rgba: Uint8Array, alpha: boolean): Buffer {
  let channels = alpha ? 4 : 3;
  let stride = width * channels + 1;
  let out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    let at = y * stride;
    out[at++] = FILTER_NONE;
    for (let x = 0; x < width; x++) {
      let from = (y * width + x) * 4;
      for (let c = 0; c < channels; c++) {
        out[at++] = rgba[from + c];
      }
    }
  }
  return out;
}

export function encodePng(
  width: number,
  height: number,
  rgba: Uint8Array,
  { alpha }: PngOptions
): Buffer {
  if (rgba.length !== width * height * 4) {
    throw new Error(`rgba holds ${rgba.length} bytes, expected ${width * height * 4}`);
  }
  let colorType = alpha ? COLOR_TYPE_RGBA : COLOR_TYPE_RGB;
  return Buffer.concat([
    Buffer.from(SIGNATURE),
    header(width, height, colorType),
    chunk("IDAT", deflateSync(scanlines(width, height, rgba, alpha), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
