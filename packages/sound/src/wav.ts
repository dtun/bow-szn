const HEADER_BYTES = 44;
const FORMAT_CHUNK_BYTES = 16;
const PCM_FORMAT = 1;
const MONO = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const INT16_MAX = 32767;

export function encodeWav(samples: Float32Array, sampleRate: number): Buffer {
  let dataBytes = samples.length * BYTES_PER_SAMPLE;
  let wav = Buffer.alloc(HEADER_BYTES + dataBytes);
  wav.write("RIFF", 0, "ascii");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVE", 8, "ascii");
  wav.write("fmt ", 12, "ascii");
  wav.writeUInt32LE(FORMAT_CHUNK_BYTES, 16);
  wav.writeUInt16LE(PCM_FORMAT, 20);
  wav.writeUInt16LE(MONO, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * BYTES_PER_SAMPLE, 28);
  wav.writeUInt16LE(BYTES_PER_SAMPLE, 32);
  wav.writeUInt16LE(BITS_PER_SAMPLE, 34);
  wav.write("data", 36, "ascii");
  wav.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    let clamped = Math.max(-1, Math.min(1, samples[i]));
    wav.writeInt16LE(Math.round(clamped * INT16_MAX), HEADER_BYTES + i * BYTES_PER_SAMPLE);
  }
  return wav;
}
