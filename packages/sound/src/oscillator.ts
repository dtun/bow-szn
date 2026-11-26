import type { Duty, NoiseMode, Waveform } from "./types.ts";

export type Oscillator = (hz: number, sampleRate: number) => number;

const TRIANGLE_LEVELS = 16;
const NOISE_REGISTER_MASK = 0x7fff;
const NOISE_TOP_BIT = 14;
const NOISE_TAP: Record<NoiseMode, number> = { hiss: 1, buzz: 6 };

function polyBlep(phase: number, step: number): number {
  if (phase < step) {
    let x = phase / step;
    return x + x - x * x - 1;
  }
  if (phase > 1 - step) {
    let x = (phase - 1) / step;
    return x * x + x + x + 1;
  }
  return 0;
}

function createSquare(duty: Duty): Oscillator {
  let phase = 0;
  let offset = 2 * duty - 1;
  let scale = 1 / (2 - 2 * duty);

  function next(hz: number, sampleRate: number): number {
    let step = hz / sampleRate;
    let raw = phase < duty ? 1 : -1;
    raw += polyBlep(phase, step);
    raw -= polyBlep((phase - duty + 1) % 1, step);
    phase = (phase + step) % 1;
    return (raw - offset) * scale;
  }

  return next;
}

function createSaw(): Oscillator {
  let phase = 0;

  function next(hz: number, sampleRate: number): number {
    let step = hz / sampleRate;
    let raw = 2 * phase - 1 - polyBlep(phase, step);
    phase = (phase + step) % 1;
    return raw;
  }

  return next;
}

function createTriangle(): Oscillator {
  let phase = 0;
  let top = TRIANGLE_LEVELS - 1;

  function next(hz: number, sampleRate: number): number {
    let raw = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
    phase = (phase + hz / sampleRate) % 1;
    return (Math.round(((raw + 1) / 2) * top) / top) * 2 - 1;
  }

  return next;
}

function createNoise(mode: NoiseMode, seed: number): Oscillator {
  let register = seed & NOISE_REGISTER_MASK || 1;
  let tap = NOISE_TAP[mode];
  let clockPhase = 0;

  function next(hz: number, sampleRate: number): number {
    clockPhase += hz / sampleRate;
    while (clockPhase >= 1) {
      let feedback = (register ^ (register >> tap)) & 1;
      register = (register >> 1) | (feedback << NOISE_TOP_BIT);
      clockPhase -= 1;
    }
    return register & 1 ? 1 : -1;
  }

  return next;
}

export function createOscillator(wave: Waveform): Oscillator {
  switch (wave.kind) {
    case "square":
      return createSquare(wave.duty);
    case "saw":
      return createSaw();
    case "triangle":
      return createTriangle();
    case "noise":
      return createNoise(wave.mode, wave.seed);
  }
}
