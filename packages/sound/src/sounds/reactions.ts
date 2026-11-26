import type { PlacedVoice, Sfx } from "../types.ts";
import { PULSE_12, SAW, TRIANGLE, adsr, buzz, glide, hiss, steady } from "./build.ts";

const HOOF_COUNT = 9;
const HOOF_FIRST_AT_SEC = 0.1;
const HOOF_FIRST_GAP_SEC = 0.065;
const HOOF_LAST_GAP_SEC = 0.04;
const HOOF_FIRST_VOLUME = 0.75;
const HOOF_LAST_VOLUME = 0.3;
const HOOF_CLOCKS_HZ = [1500, 2100];

function hoofbeats(): PlacedVoice[] {
  let voices: PlacedVoice[] = [];
  let atSec = HOOF_FIRST_AT_SEC;
  for (let i = 0; i < HOOF_COUNT; i++) {
    let along = i / (HOOF_COUNT - 1);
    voices.push({
      atSec,
      voice: {
        wave: buzz(17 + i),
        envelope: adsr(0.001, 0.03, 0, 0.012),
        holdSec: 0.03,
        pitch: steady(HOOF_CLOCKS_HZ[i % HOOF_CLOCKS_HZ.length]),
        volume: HOOF_FIRST_VOLUME + (HOOF_LAST_VOLUME - HOOF_FIRST_VOLUME) * along,
      },
    });
    atSec += HOOF_FIRST_GAP_SEC + (HOOF_LAST_GAP_SEC - HOOF_FIRST_GAP_SEC) * along;
  }
  return voices;
}

export const SPOOK: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: hiss(23),
        envelope: adsr(0.01, 0.05, 0.3, 0.03),
        holdSec: 0.07,
        pitch: glide(6000, 2500, "exponential"),
        volume: 0.55,
      },
    },
    ...hoofbeats(),
  ],
};

const GLINT_ARPEGGIO_HZ = [1318.51, 1567.98, 1975.53, 2637.02];
const GLINT_STEP_SEC = 0.05;

function glintArpeggio(): PlacedVoice[] {
  return GLINT_ARPEGGIO_HZ.map((hz, i) => ({
    atSec: i * GLINT_STEP_SEC,
    voice: {
      wave: PULSE_12,
      envelope: adsr(0.001, 0.04, 0, 0.02),
      holdSec: 0.04,
      pitch: steady(hz),
      volume: 0.65,
    },
  }));
}

export const GLINT: Sfx = {
  kind: "sfx",
  voices: [
    ...glintArpeggio(),
    {
      atSec: 0.15,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.002, 0.15, 0, 0.08),
        holdSec: 0.12,
        pitch: steady(2637.02),
        vibrato: { rateHz: 12, depthCents: 35, delaySec: 0.02 },
        volume: 0.4,
      },
    },
    {
      atSec: 0.15,
      voice: {
        wave: hiss(91),
        envelope: adsr(0.002, 0.04, 0, 0.02),
        holdSec: 0.05,
        pitch: steady(10000),
        volume: 0.12,
      },
    },
  ],
};

const SAD_TROMBONE_NOTES = [
  { atSec: 0, hz: 293.66, holdSec: 0.11, droop: 0.97 },
  { atSec: 0.12, hz: 277.18, holdSec: 0.11, droop: 0.97 },
  { atSec: 0.24, hz: 261.63, holdSec: 0.11, droop: 0.97 },
  { atSec: 0.36, hz: 246.94, holdSec: 0.34, droop: 0.9 },
];

function sadTrombone(): PlacedVoice[] {
  return SAD_TROMBONE_NOTES.flatMap(({ atSec, hz, holdSec, droop }) => [
    {
      atSec,
      voice: {
        wave: SAW,
        envelope: adsr(0.012, 0.03, 0.75, 0.04),
        holdSec,
        pitch: glide(hz, hz * droop, "exponential"),
        vibrato: { rateHz: 6, depthCents: 70, delaySec: 0.12 },
        volume: 0.45,
      },
    },
    {
      atSec,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.012, 0.03, 0.75, 0.04),
        holdSec,
        pitch: glide(hz / 2, (hz / 2) * droop, "exponential"),
        volume: 0.25,
      },
    },
  ]);
}

export const WHIFF: Sfx = { kind: "sfx", voices: sadTrombone() };
