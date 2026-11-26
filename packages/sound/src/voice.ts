import { envelopeLevel } from "./envelope.ts";
import { createOscillator } from "./oscillator.ts";
import type { Pitch, Vibrato, Voice } from "./types.ts";

const CENTS_PER_OCTAVE = 1200;
const SAMPLE_ROUNDING_GUARD = 1e-6;

export function voiceSamples(voice: Voice, sampleRate: number): number {
  let seconds = voice.holdSec + voice.envelope.releaseSec;
  return Math.ceil(seconds * sampleRate - SAMPLE_ROUNDING_GUARD);
}

function sweptHz(pitch: Pitch, holdSec: number, t: number): number {
  let progress = holdSec > 0 ? Math.min(t / holdSec, 1) : 1;
  if (pitch.curve === "exponential") {
    return pitch.startHz * Math.pow(pitch.endHz / pitch.startHz, progress);
  }
  return pitch.startHz + (pitch.endHz - pitch.startHz) * progress;
}

function vibratoRatio(vibrato: Vibrato | undefined, t: number): number {
  if (vibrato === undefined || t < vibrato.delaySec) {
    return 1;
  }
  let swing = Math.sin(2 * Math.PI * vibrato.rateHz * (t - vibrato.delaySec));
  return Math.pow(2, (vibrato.depthCents / CENTS_PER_OCTAVE) * swing);
}

export function renderVoice(voice: Voice, sampleRate: number): Float32Array {
  let samples = new Float32Array(voiceSamples(voice, sampleRate));
  let oscillator = createOscillator(voice.wave);
  for (let i = 0; i < samples.length; i++) {
    let t = i / sampleRate;
    let hz = sweptHz(voice.pitch, voice.holdSec, t) * vibratoRatio(voice.vibrato, t);
    let level = envelopeLevel(voice.envelope, voice.holdSec, t) * voice.volume;
    samples[i] = oscillator(hz, sampleRate) * level;
  }
  return samples;
}
