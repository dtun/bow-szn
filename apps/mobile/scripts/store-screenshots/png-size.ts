export type PixelSize = { width: number; height: number };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const IHDR_TYPE = [0x49, 0x48, 0x44, 0x52];
const IHDR_TYPE_OFFSET = 12;
const WIDTH_OFFSET = 16;
const HEIGHT_OFFSET = 20;
const HEADER_LENGTH = 24;

function startsWith(bytes: Uint8Array, expected: number[], offset: number): boolean {
  return expected.every((byte, index) => bytes[offset + index] === byte);
}

export function readPngSize(bytes: Uint8Array): PixelSize | null {
  if (
    bytes.length < HEADER_LENGTH ||
    !startsWith(bytes, PNG_SIGNATURE, 0) ||
    !startsWith(bytes, IHDR_TYPE, IHDR_TYPE_OFFSET)
  ) {
    return null;
  }
  let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(WIDTH_OFFSET), height: view.getUint32(HEIGHT_OFFSET) };
}
