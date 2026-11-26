export type DecodedWav = {
  riff: string;
  riffSize: number;
  form: string;
  chunkIds: string[];
  format: number;
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
  dataBytes: number;
  samples: number[];
};

const RIFF_HEADER_BYTES = 12;
const CHUNK_HEADER_BYTES = 8;

type Chunk = { id: string; body: number; size: number };

function readChunks(bytes: Buffer): Chunk[] {
  let chunks: Chunk[] = [];
  let at = RIFF_HEADER_BYTES;
  while (at + CHUNK_HEADER_BYTES <= bytes.length) {
    let size = bytes.readUInt32LE(at + 4);
    chunks.push({ id: bytes.toString("ascii", at, at + 4), body: at + CHUNK_HEADER_BYTES, size });
    at += CHUNK_HEADER_BYTES + size;
  }
  return chunks;
}

export function decodeWav(bytes: Buffer): DecodedWav {
  let chunks = readChunks(bytes);
  let format = chunks.find((chunk) => chunk.id === "fmt ");
  let data = chunks.find((chunk) => chunk.id === "data");
  if (format === undefined || data === undefined) {
    throw new Error("the file has no fmt chunk or no data chunk");
  }
  return {
    riff: bytes.toString("ascii", 0, 4),
    riffSize: bytes.readUInt32LE(4),
    form: bytes.toString("ascii", 8, 12),
    chunkIds: chunks.map((chunk) => chunk.id),
    format: bytes.readUInt16LE(format.body),
    channels: bytes.readUInt16LE(format.body + 2),
    sampleRate: bytes.readUInt32LE(format.body + 4),
    byteRate: bytes.readUInt32LE(format.body + 8),
    blockAlign: bytes.readUInt16LE(format.body + 12),
    bitsPerSample: bytes.readUInt16LE(format.body + 14),
    dataBytes: data.size,
    samples: Array.from({ length: data.size / 2 }, (_, i) => bytes.readInt16LE(data.body + i * 2)),
  };
}
