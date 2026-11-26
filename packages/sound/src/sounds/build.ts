import type { Envelope, Pitch, SweepCurve, Waveform } from "../types.ts";

export const PULSE_12: Waveform = { kind: "square", duty: 0.125 };
export const PULSE_25: Waveform = { kind: "square", duty: 0.25 };
export const PULSE_50: Waveform = { kind: "square", duty: 0.5 };
export const TRIANGLE: Waveform = { kind: "triangle" };
export const SAW: Waveform = { kind: "saw" };

export function hiss(seed: number): Waveform {
  return { kind: "noise", mode: "hiss", seed };
}

export function buzz(seed: number): Waveform {
  return { kind: "noise", mode: "buzz", seed };
}

export function adsr(
  attackSec: number,
  decaySec: number,
  sustain: number,
  releaseSec: number
): Envelope {
  return { attackSec, decaySec, sustain, releaseSec };
}

export function glide(startHz: number, endHz: number, curve: SweepCurve = "linear"): Pitch {
  return { startHz, endHz, curve };
}

export function steady(hz: number): Pitch {
  return { startHz: hz, endHz: hz, curve: "linear" };
}
