import { decodeWav } from "./test-support/read-wav.ts";
import { encodeWav } from "./wav.ts";

const SAMPLE_RATE = 22050;

describe("encodeWav", () => {
  it("wraps the samples in a RIFF WAVE container with a format chunk, then a data chunk", () => {
    let wav = decodeWav(encodeWav(Float32Array.from([0, 0.25]), SAMPLE_RATE));

    expect(wav.riff).toBe("RIFF");
    expect(wav.form).toBe("WAVE");
    expect(wav.chunkIds).toEqual(["fmt ", "data"]);
  });

  it("describes 16-bit mono PCM at the sample rate it was given", () => {
    let wav = decodeWav(encodeWav(Float32Array.from([0, 0.25]), SAMPLE_RATE));

    expect(wav.format).toBe(1);
    expect(wav.channels).toBe(1);
    expect(wav.sampleRate).toBe(22050);
    expect(wav.bitsPerSample).toBe(16);
    expect(wav.byteRate).toBe(44100);
    expect(wav.blockAlign).toBe(2);
  });

  it("sizes the file as a 44-byte header plus two bytes per sample", () => {
    let samples = new Float32Array(1000);
    let bytes = encodeWav(samples, SAMPLE_RATE);
    let wav = decodeWav(bytes);

    expect(bytes).toHaveLength(44 + 2000);
    expect(wav.dataBytes).toBe(2000);
    expect(wav.samples).toHaveLength(1000);
  });

  it("records the RIFF size as every byte after the size field", () => {
    let bytes = encodeWav(new Float32Array(321), SAMPLE_RATE);

    expect(decodeWav(bytes).riffSize).toBe(bytes.length - 8);
  });

  it("scales a full-scale sample to the 16-bit limits", () => {
    let wav = decodeWav(encodeWav(Float32Array.from([0, 1, -1, 0.25, -0.25]), SAMPLE_RATE));

    expect(wav.samples).toEqual([0, 32767, -32767, 8192, -8192]);
  });

  it("clamps samples beyond full scale instead of wrapping", () => {
    let wav = decodeWav(encodeWav(Float32Array.from([2, -3]), SAMPLE_RATE));

    expect(wav.samples).toEqual([32767, -32767]);
  });

  it("keeps samples in order", () => {
    let wav = decodeWav(encodeWav(Float32Array.from([0.1, 0.2, 0.3, 0.4]), SAMPLE_RATE));

    expect(wav.samples).toEqual([3277, 6553, 9830, 13107]);
  });

  it("encodes no samples as a header-only file", () => {
    let bytes = encodeWav(new Float32Array(0), SAMPLE_RATE);

    expect(bytes).toHaveLength(44);
    expect(decodeWav(bytes).dataBytes).toBe(0);
  });
});
