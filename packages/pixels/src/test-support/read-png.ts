import { inflateSync } from "node:zlib";

export type PngChunk = { type: string; data: Buffer; storedCrc: number };

export type DecodedPng = {
  signature: number[];
  chunks: PngChunk[];
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  samples: Buffer;
};

const SIGNATURE_LENGTH = 8;

function readChunks(bytes: Buffer): PngChunk[] {
  let chunks: PngChunk[] = [];
  let at = SIGNATURE_LENGTH;
  while (at < bytes.length) {
    let length = bytes.readUInt32BE(at);
    chunks.push({
      type: bytes.toString("ascii", at + 4, at + 8),
      data: bytes.subarray(at + 8, at + 8 + length),
      storedCrc: bytes.readUInt32BE(at + 8 + length),
    });
    at += 12 + length;
  }
  return chunks;
}

function channelsFor(colorType: number): number {
  return colorType === 6 ? 4 : 3;
}

export function decodePng(bytes: Buffer): DecodedPng {
  let chunks = readChunks(bytes);
  let ihdr = chunks[0].data;
  let width = ihdr.readUInt32BE(0);
  let height = ihdr.readUInt32BE(4);
  let colorType = ihdr[9];
  let raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data)));
  let stride = width * channelsFor(colorType) + 1;
  let samples = Buffer.concat(
    Array.from({ length: height }, (_, y) => raw.subarray(y * stride + 1, (y + 1) * stride))
  );
  return {
    signature: Array.from(bytes.subarray(0, SIGNATURE_LENGTH)),
    chunks,
    width,
    height,
    bitDepth: ihdr[8],
    colorType,
    samples,
  };
}

export function bitwiseCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
