import { renderVoice, voiceSamples } from "./voice.ts";
import type { Voice } from "./types.ts";

const SAMPLE_RATE = 44100;

const STEADY: Voice = {
  wave: { kind: "square", duty: 0.5 },
  envelope: { attackSec: 0.001, decaySec: 0, sustain: 1, releaseSec: 0.01 },
  holdSec: 1,
  pitch: { startHz: 440, endHz: 440, curve: "linear" },
  volume: 0.5,
};

function risingCrossings(samples: Float32Array, from = 0, to = samples.length): number {
  let count = 0;
  for (let i = Math.max(from, 1); i < to; i++) {
    if (samples[i - 1] < 0 && samples[i] >= 0) {
      count += 1;
    }
  }
  return count;
}

function peak(samples: Float32Array): number {
  let top = 0;
  for (let sample of samples) {
    top = Math.max(top, Math.abs(sample));
  }
  return top;
}

describe("voiceSamples", () => {
  it("covers the hold and the release", () => {
    let voice: Voice = {
      ...STEADY,
      holdSec: 0.1,
      envelope: { ...STEADY.envelope, releaseSec: 0.05 },
    };

    expect(voiceSamples(voice, 8000)).toBe(1200);
  });

  it("rounds up to a whole sample", () => {
    let voice: Voice = {
      ...STEADY,
      holdSec: 0.00015,
      envelope: { ...STEADY.envelope, releaseSec: 0 },
    };

    expect(voiceSamples(voice, 8000)).toBe(2);
  });
});

describe("renderVoice", () => {
  it("renders exactly the voice length", () => {
    expect(renderVoice(STEADY, SAMPLE_RATE)).toHaveLength(voiceSamples(STEADY, SAMPLE_RATE));
  });

  it("scales the wave by the volume", () => {
    expect(peak(renderVoice(STEADY, SAMPLE_RATE))).toBeCloseTo(0.5, 2);
    expect(peak(renderVoice({ ...STEADY, volume: 0.2 }, SAMPLE_RATE))).toBeCloseTo(0.2, 2);
  });

  it("starts silent and fades to silence at the end of the release", () => {
    let samples = renderVoice(STEADY, SAMPLE_RATE);

    expect(samples[0]).toBeCloseTo(0, 10);
    expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.01);
  });

  it("renders the same samples every time", () => {
    let noisy: Voice = { ...STEADY, wave: { kind: "noise", mode: "hiss", seed: 99 } };

    expect(renderVoice(noisy, 22050)).toEqual(renderVoice(noisy, 22050));
  });

  it("plays the pitch it is given", () => {
    let samples = renderVoice(STEADY, SAMPLE_RATE);

    expect(Math.abs(risingCrossings(samples, 0, SAMPLE_RATE) - 440)).toBeLessThanOrEqual(2);
  });

  it("sweeps linearly, so the cycle count is the average of the two pitches", () => {
    let voice: Voice = { ...STEADY, pitch: { startHz: 200, endHz: 800, curve: "linear" } };
    let samples = renderVoice(voice, SAMPLE_RATE);

    expect(Math.abs(risingCrossings(samples, 0, SAMPLE_RATE) - 500)).toBeLessThanOrEqual(2);
  });

  it("sweeps exponentially, so each octave takes the same time", () => {
    let voice: Voice = { ...STEADY, pitch: { startHz: 200, endHz: 800, curve: "exponential" } };
    let samples = renderVoice(voice, SAMPLE_RATE);
    let expectedCycles = (800 - 200) / Math.log(800 / 200);

    expect(Math.abs(risingCrossings(samples, 0, SAMPLE_RATE) - expectedCycles)).toBeLessThanOrEqual(
      2
    );
  });

  it("holds the end pitch through the release", () => {
    let voice: Voice = {
      ...STEADY,
      holdSec: 0.5,
      envelope: { ...STEADY.envelope, releaseSec: 0.5 },
      pitch: { startHz: 400, endHz: 100, curve: "linear" },
    };
    let samples = renderVoice(voice, SAMPLE_RATE);
    let releaseStart = Math.round(0.5 * SAMPLE_RATE);

    expect(Math.abs(risingCrossings(samples, releaseStart) - 50)).toBeLessThanOrEqual(2);
  });

  it("leaves the pitch alone until the vibrato delay has passed", () => {
    let wobbly: Voice = {
      ...STEADY,
      vibrato: { rateHz: 6, depthCents: 300, delaySec: 0.5 },
    };
    let plain = renderVoice(STEADY, SAMPLE_RATE);
    let samples = renderVoice(wobbly, SAMPLE_RATE);
    let delayed = Math.round(0.5 * SAMPLE_RATE);

    expect(samples.slice(0, delayed)).toEqual(plain.slice(0, delayed));
    expect(samples.slice(delayed + 100)).not.toEqual(plain.slice(delayed + 100));
  });

  it("swings the pitch above the base first and below it next", () => {
    let wobbly: Voice = {
      ...STEADY,
      vibrato: { rateHz: 1, depthCents: 600, delaySec: 0 },
    };
    let samples = renderVoice(wobbly, SAMPLE_RATE);
    let half = SAMPLE_RATE / 2;

    expect(risingCrossings(samples, 0, half)).toBeGreaterThan(250);
    expect(risingCrossings(samples, half, SAMPLE_RATE)).toBeLessThan(200);
  });

  it("keeps the base pitch on average over whole vibrato cycles", () => {
    let wobbly: Voice = {
      ...STEADY,
      vibrato: { rateHz: 5, depthCents: 50, delaySec: 0 },
    };
    let samples = renderVoice(wobbly, SAMPLE_RATE);

    expect(Math.abs(risingCrossings(samples, 0, SAMPLE_RATE) - 440)).toBeLessThanOrEqual(2);
  });
});
