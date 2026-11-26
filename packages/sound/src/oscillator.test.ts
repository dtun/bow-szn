import { createOscillator } from "./oscillator.ts";
import type { Waveform } from "./types.ts";

const SAMPLE_RATE = 44100;
const HIGH_LEVEL = 0.5;

function run(wave: Waveform, hz: number, count: number, sampleRate = SAMPLE_RATE): number[] {
  let oscillator = createOscillator(wave);
  let samples: number[] = [];
  for (let i = 0; i < count; i++) {
    samples.push(oscillator(hz, sampleRate));
  }
  return samples;
}

function risingCrossings(samples: number[]): number {
  let count = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i - 1] < 0 && samples[i] >= 0) {
      count += 1;
    }
  }
  return count;
}

function cycleError(samples: number[], cycles: number): number {
  return Math.abs(risingCrossings(samples) - cycles);
}

function mean(samples: number[]): number {
  return samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
}

function runLengths(samples: number[]): number[] {
  let lengths: number[] = [];
  let length = 1;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i] === samples[i - 1]) {
      length += 1;
    } else {
      lengths.push(length);
      length = 1;
    }
  }
  lengths.push(length);
  return lengths;
}

describe("square oscillator", () => {
  it.each([0.125, 0.25, 0.5] as const)("sits high for %s of each period", (duty) => {
    let period = run({ kind: "square", duty }, 441, 100);
    let highCount = period.filter((sample) => sample > HIGH_LEVEL).length;

    expect(Math.abs(highCount - duty * 100)).toBeLessThanOrEqual(1);
  });

  it.each([0.125, 0.25, 0.5] as const)("has no DC offset at %s duty", (duty) => {
    expect(mean(run({ kind: "square", duty }, 441, 10000))).toBeCloseTo(0, 6);
  });

  it.each([0.125, 0.25, 0.5] as const)("tops out at full scale at %s duty", (duty) => {
    let samples = run({ kind: "square", duty }, 441, 10000);

    expect(Math.max(...samples)).toBe(1);
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(-1);
  });

  it("completes one cycle per period", () => {
    let samples = run({ kind: "square", duty: 0.5 }, 440, SAMPLE_RATE);

    expect(cycleError(samples, 440)).toBeLessThanOrEqual(1);
  });
});

describe("saw oscillator", () => {
  it("completes one cycle per period", () => {
    expect(cycleError(run({ kind: "saw" }, 440, SAMPLE_RATE), 440)).toBeLessThanOrEqual(1);
  });

  it("has no DC offset", () => {
    expect(mean(run({ kind: "saw" }, 441, 10000))).toBeCloseTo(0, 6);
  });

  it("stays inside full scale", () => {
    let samples = run({ kind: "saw" }, 440, SAMPLE_RATE);

    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(-1);
  });
});

describe("triangle oscillator", () => {
  it("completes one cycle per period", () => {
    expect(cycleError(run({ kind: "triangle" }, 440, SAMPLE_RATE), 440)).toBeLessThanOrEqual(1);
  });

  it("steps through exactly sixteen levels, the way a 4-bit wave channel does", () => {
    let levels = new Set(run({ kind: "triangle" }, 10, SAMPLE_RATE / 10).map((s) => s.toFixed(6)));

    expect(levels.size).toBe(16);
  });

  it("reaches both ends of full scale", () => {
    let samples = run({ kind: "triangle" }, 440, SAMPLE_RATE);

    expect(Math.max(...samples)).toBe(1);
    expect(Math.min(...samples)).toBe(-1);
  });
});

describe("noise oscillator", () => {
  const HISS = { kind: "noise", mode: "hiss", seed: 7 } as const;
  const BUZZ = { kind: "noise", mode: "buzz", seed: 7 } as const;

  it("produces only full-scale highs and lows", () => {
    let values = new Set(run(HISS, 1000, 2000, 1000));

    expect(Array.from(values).sort()).toEqual([-1, 1]);
  });

  it("repeats exactly for the same seed", () => {
    expect(run(HISS, 5000, 3000)).toEqual(run(HISS, 5000, 3000));
  });

  it("differs for a different seed", () => {
    let other = { kind: "noise", mode: "hiss", seed: 8 } as const;

    expect(run(other, 1000, 200, 1000)).not.toEqual(run(HISS, 1000, 200, 1000));
  });

  it("holds each value for the clock period, so the pitch sets the grain", () => {
    let lengths = runLengths(run(HISS, SAMPLE_RATE / 4, 4000));

    expect(lengths.slice(1, -1).every((length) => length % 4 === 0)).toBe(true);
    expect(Math.max(...lengths)).toBeGreaterThanOrEqual(8);
  });

  it("cycles through 32767 steps in hiss mode", () => {
    let samples = run(HISS, 1000, 32767 + 500, 1000);

    expect(samples.slice(32767)).toEqual(samples.slice(0, 500));
    expect(samples.slice(93, 593)).not.toEqual(samples.slice(0, 500));
  });

  it("cycles through 93 steps in buzz mode, so it rings with a pitch", () => {
    let samples = run(BUZZ, 1000, 93 * 20, 1000);

    expect(samples.slice(93, 186)).toEqual(samples.slice(0, 93));
    expect(samples.slice(31, 124)).not.toEqual(samples.slice(0, 93));
  });

  it("treats seed zero as a usable seed instead of sticking at silence", () => {
    let samples = run({ kind: "noise", mode: "hiss", seed: 0 }, 1000, 2000, 1000);

    expect(new Set(samples).size).toBe(2);
  });
});
