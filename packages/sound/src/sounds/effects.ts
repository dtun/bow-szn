import type { Sfx } from "../types.ts";
import {
  PULSE_12,
  PULSE_25,
  PULSE_50,
  SAW,
  TRIANGLE,
  adsr,
  buzz,
  glide,
  hiss,
  steady,
} from "./build.ts";

export const CREAK: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: SAW,
        envelope: adsr(0.01, 0.06, 0.55, 0.06),
        holdSec: 0.16,
        pitch: glide(92, 128, "exponential"),
        vibrato: { rateHz: 19, depthCents: 700, delaySec: 0.01 },
        volume: 0.42,
      },
    },
    {
      atSec: 0.02,
      voice: {
        wave: PULSE_12,
        envelope: adsr(0.008, 0.05, 0.4, 0.05),
        holdSec: 0.14,
        pitch: glide(520, 690),
        vibrato: { rateHz: 31, depthCents: 380, delaySec: 0.03 },
        volume: 0.3,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: buzz(41),
        envelope: adsr(0.006, 0.04, 0.35, 0.05),
        holdSec: 0.12,
        pitch: glide(260, 340),
        volume: 0.28,
      },
    },
  ],
};

export const FULL_DRAW: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: hiss(5),
        envelope: adsr(0.001, 0.004, 0, 0.004),
        holdSec: 0.006,
        pitch: steady(9000),
        volume: 0.35,
      },
    },
    {
      atSec: 0.004,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.001, 0.04, 0, 0.02),
        holdSec: 0.04,
        pitch: steady(1760),
        volume: 0.45,
      },
    },
    {
      atSec: 0.045,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.001, 0.03, 0, 0.02),
        holdSec: 0.03,
        pitch: steady(2349),
        volume: 0.4,
      },
    },
  ],
};

export const TWANG: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: hiss(77),
        envelope: adsr(0.001, 0.008, 0, 0.006),
        holdSec: 0.01,
        pitch: steady(7000),
        volume: 0.3,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: PULSE_25,
        envelope: adsr(0.001, 0.06, 0.25, 0.04),
        holdSec: 0.07,
        pitch: glide(1400, 210, "exponential"),
        volume: 0.45,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: SAW,
        envelope: adsr(0.002, 0.42, 0, 0.06),
        holdSec: 0.42,
        pitch: glide(215, 170, "exponential"),
        vibrato: { rateHz: 13, depthCents: 220, delaySec: 0 },
        volume: 0.4,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: PULSE_12,
        envelope: adsr(0.002, 0.25, 0, 0.05),
        holdSec: 0.25,
        pitch: glide(430, 340, "exponential"),
        vibrato: { rateHz: 13, depthCents: 220, delaySec: 0 },
        volume: 0.18,
      },
    },
  ],
};

export const WHOOSH: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: hiss(13),
        envelope: adsr(0.05, 0.2, 0.25, 0.09),
        holdSec: 0.32,
        pitch: glide(9000, 2200, "exponential"),
        volume: 0.7,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.04, 0.2, 0.2, 0.08),
        holdSec: 0.3,
        pitch: glide(1100, 420, "exponential"),
        volume: 0.18,
      },
    },
  ],
};

export const THUNK: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.001, 0.1, 0, 0.03),
        holdSec: 0.1,
        pitch: glide(190, 55, "exponential"),
        volume: 0.6,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: hiss(29),
        envelope: adsr(0.001, 0.06, 0, 0.03),
        holdSec: 0.07,
        pitch: glide(2600, 700, "exponential"),
        volume: 0.3,
      },
    },
    {
      atSec: 0.07,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.003, 0.16, 0, 0.04),
        holdSec: 0.16,
        pitch: glide(340, 300),
        vibrato: { rateHz: 28, depthCents: 500, delaySec: 0 },
        volume: 0.14,
      },
    },
  ],
};

export const HIT: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.001, 0.14, 0, 0.04),
        holdSec: 0.14,
        pitch: glide(230, 42, "exponential"),
        volume: 0.5,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: hiss(61),
        envelope: adsr(0.001, 0.1, 0, 0.04),
        holdSec: 0.12,
        pitch: glide(4200, 900, "exponential"),
        volume: 0.26,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: PULSE_25,
        envelope: adsr(0.001, 0.05, 0, 0.02),
        holdSec: 0.05,
        pitch: glide(700, 180, "exponential"),
        volume: 0.18,
      },
    },
    {
      atSec: 0.05,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.002, 0, 1, 0.02),
        holdSec: 0.06,
        pitch: steady(523.25),
        volume: 0.25,
      },
    },
    {
      atSec: 0.11,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.002, 0.1, 0.2, 0.08),
        holdSec: 0.1,
        pitch: steady(783.99),
        volume: 0.25,
      },
    },
  ],
};
