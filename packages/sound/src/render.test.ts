import { render } from "./render.ts";
import type { Jingle, MelodicChannel, PercussionChannel, Sfx, Timbre, Voice } from "./types.ts";

const SAMPLE_RATE = 44100;

const BLIP: Voice = {
  wave: { kind: "square", duty: 0.5 },
  envelope: { attackSec: 0.001, decaySec: 0, sustain: 1, releaseSec: 0.05 },
  holdSec: 0.1,
  pitch: { startHz: 440, endHz: 440, curve: "linear" },
  volume: 0.5,
};

const TONE: Timbre = {
  wave: { kind: "square", duty: 0.5 },
  envelope: { attackSec: 0.001, decaySec: 0, sustain: 1, releaseSec: 0.01 },
  volume: 0.5,
};

const DRUM_VOICE: Voice = {
  wave: { kind: "noise", mode: "hiss", seed: 3 },
  envelope: { attackSec: 0.001, decaySec: 0, sustain: 1, releaseSec: 0.02 },
  holdSec: 0.05,
  pitch: { startHz: 4000, endHz: 4000, curve: "linear" },
  volume: 0.5,
};

const CRASH_VOICE: Voice = { ...DRUM_VOICE, holdSec: 2 };

const KIT: PercussionChannel["kit"] = {
  kick: DRUM_VOICE,
  snare: DRUM_VOICE,
  hat: DRUM_VOICE,
  crash: CRASH_VOICE,
};

function sfxOf(...voices: { atSec: number; voice: Voice }[]): Sfx {
  return { kind: "sfx", voices };
}

function lead(notation: string, timbre: Timbre = TONE): MelodicChannel {
  return { kind: "melodic", timbre, notation };
}

function drums(notation: string): PercussionChannel {
  return { kind: "percussion", kit: KIT, notation };
}

function jingleOf(bpm: number, ...channels: Jingle["channels"]): Jingle {
  return { kind: "jingle", bpm, beatsPerBar: 4, channels };
}

function peak(samples: Float32Array): number {
  let top = 0;
  for (let sample of samples) {
    top = Math.max(top, Math.abs(sample));
  }
  return top;
}

function risingCrossings(samples: Float32Array, from: number, to: number): number {
  let count = 0;
  for (let i = Math.max(from, 1); i < to; i++) {
    if (samples[i - 1] < 0 && samples[i] >= 0) {
      count += 1;
    }
  }
  return count;
}

function isSilent(samples: Float32Array, from: number, to: number): boolean {
  return samples.slice(from, to).every((sample) => sample === 0);
}

describe("render a sound effect", () => {
  it("lasts until the last voice has released", () => {
    let sfx = sfxOf({ atSec: 0, voice: BLIP }, { atSec: 0.2, voice: BLIP });

    expect(render(sfx, 8000)).toHaveLength(2800);
  });

  it("keeps the same duration at any sample rate", () => {
    let sfx = sfxOf({ atSec: 0, voice: BLIP });

    expect(render(sfx, 22050)).toHaveLength(3308);
    expect(render(sfx, 44100)).toHaveLength(6615);
  });

  it("renders no samples for an effect with no voices", () => {
    expect(render(sfxOf(), SAMPLE_RATE)).toHaveLength(0);
  });

  it("starts each voice at its offset", () => {
    let samples = render(sfxOf({ atSec: 0.1, voice: BLIP }), SAMPLE_RATE);
    let start = Math.round(0.1 * SAMPLE_RATE);

    expect(isSilent(samples, 0, start)).toBe(true);
    expect(peak(samples.slice(start))).toBeCloseTo(0.5, 2);
  });

  it("adds the voices together", () => {
    let one = render(sfxOf({ atSec: 0, voice: BLIP }), SAMPLE_RATE);
    let two = render(sfxOf({ atSec: 0, voice: BLIP }, { atSec: 0, voice: BLIP }), SAMPLE_RATE);

    expect(two).toEqual(one.map((sample) => sample * 2));
  });

  it("renders the same samples every time, noise included", () => {
    let noisy = sfxOf({ atSec: 0, voice: DRUM_VOICE }, { atSec: 0.03, voice: BLIP });

    expect(render(noisy, 22050)).toEqual(render(noisy, 22050));
  });
});

describe("render a jingle", () => {
  it("lasts exactly its bars at its tempo", () => {
    let jingle = jingleOf(90, lead("c4:1 | c4:1 |"));

    expect(render(jingle, 22050)).toHaveLength(117600);
  });

  it("plays each note at its pitch for its length", () => {
    let samples = render(jingleOf(120, lead("a4:4 e5:4 r:2 |")), SAMPLE_RATE);
    let half = SAMPLE_RATE / 2;

    expect(Math.abs(risingCrossings(samples, 0, half) - 220)).toBeLessThanOrEqual(2);
    expect(Math.abs(risingCrossings(samples, half, 2 * half) - 329.6)).toBeLessThanOrEqual(2);
    expect(isSilent(samples, 2 * half + 1, samples.length)).toBe(true);
  });

  it("holds a rest as silence", () => {
    let samples = render(jingleOf(120, lead("r:4 a4:4 r:2 |")), SAMPLE_RATE);

    expect(isSilent(samples, 0, SAMPLE_RATE / 2)).toBe(true);
    expect(peak(samples.slice(SAMPLE_RATE / 2, SAMPLE_RATE))).toBeCloseTo(0.5, 2);
  });

  it("lets every note release inside its own length so repeated notes never click", () => {
    let samples = render(jingleOf(120, lead("a4:4 a4:4 r:2 |")), SAMPLE_RATE);
    let seam = SAMPLE_RATE / 2;

    expect(Math.abs(samples[seam - 1])).toBeLessThan(0.01);
    expect(Math.abs(samples[seam])).toBeLessThan(0.01);
    expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.01);
  });

  it("shortens the release of a note that is shorter than the release", () => {
    let slowRelease: Timbre = { ...TONE, envelope: { ...TONE.envelope, releaseSec: 0.5 } };
    let samples = render(jingleOf(120, lead("a4:16 r:16 r:8 r:4 r:2 |", slowRelease)), SAMPLE_RATE);
    let noteEnd = Math.round(0.125 * SAMPLE_RATE);

    expect(Math.abs(samples[noteEnd - 1])).toBeLessThan(0.01);
    expect(isSilent(samples, noteEnd, samples.length)).toBe(true);
  });

  it("plays drum hits on their beats", () => {
    let samples = render(jingleOf(120, drums("k:4 r:4 s:4 r:4 |")), SAMPLE_RATE);
    let snareStart = SAMPLE_RATE;

    expect(peak(samples.slice(0, 2000))).toBeGreaterThan(0.3);
    expect(isSilent(samples, 4000, snareStart - 1)).toBe(true);
    expect(peak(samples.slice(snareStart, snareStart + 2000))).toBeGreaterThan(0.3);
  });

  it("cuts a long drum hit to fit its note so nothing rings past the bar", () => {
    let samples = render(jingleOf(120, drums("x:8 r:8 r:4 r:2 |")), SAMPLE_RATE);
    let windowEnd = Math.round(0.25 * SAMPLE_RATE);

    expect(Math.abs(samples[windowEnd - 1])).toBeLessThan(0.01);
    expect(isSilent(samples, windowEnd, samples.length)).toBe(true);
  });

  it("mixes channels by adding them", () => {
    let samples = render(jingleOf(120, lead("a4:1 |"), lead("a4:1 |")), SAMPLE_RATE);

    expect(peak(samples)).toBeCloseTo(1, 2);
  });

  it("rejects channels with different bar counts", () => {
    let jingle = jingleOf(120, lead("a4:1 |"), lead("a4:1 | a4:1 |"));

    expect(() => render(jingle, SAMPLE_RATE)).toThrow("channels disagree on the bar count: 1, 2");
  });

  it("renders the same samples every time", () => {
    let jingle = jingleOf(120, lead("a4:2 e5:2 |"), drums("k:4 h:4 s:4 h:4 |"));

    expect(render(jingle, 22050)).toEqual(render(jingle, 22050));
  });
});
