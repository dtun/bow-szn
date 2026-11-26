import type { Sfx } from "../types.ts";
import { PULSE_25, PULSE_50, TRIANGLE, adsr, buzz, glide, hiss, steady } from "./build.ts";

export const TAP_HIT: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.001, 0.03, 0, 0.01),
        holdSec: 0.03,
        pitch: glide(300, 180, "exponential"),
        volume: 0.35,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.002, 0, 1, 0.015),
        holdSec: 0.05,
        pitch: steady(987.77),
        volume: 0.5,
      },
    },
    {
      atSec: 0.06,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.002, 0.12, 0.25, 0.08),
        holdSec: 0.1,
        pitch: steady(1318.51),
        volume: 0.5,
      },
    },
    {
      atSec: 0.06,
      voice: {
        wave: PULSE_25,
        envelope: adsr(0.002, 0.08, 0, 0.03),
        holdSec: 0.08,
        pitch: steady(2637.02),
        volume: 0.15,
      },
    },
  ],
};

export const TAP_SLIP: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: PULSE_25,
        envelope: adsr(0.004, 0.05, 0.7, 0.04),
        holdSec: 0.22,
        pitch: glide(392, 110, "exponential"),
        vibrato: { rateHz: 14, depthCents: 180, delaySec: 0 },
        volume: 0.5,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: buzz(33),
        envelope: adsr(0.004, 0.06, 0.2, 0.04),
        holdSec: 0.12,
        pitch: glide(700, 300, "exponential"),
        volume: 0.25,
      },
    },
    {
      atSec: 0.2,
      voice: {
        wave: TRIANGLE,
        envelope: adsr(0.001, 0.05, 0, 0.03),
        holdSec: 0.05,
        pitch: glide(120, 60, "exponential"),
        volume: 0.5,
      },
    },
  ],
};

export const UI_SELECT: Sfx = {
  kind: "sfx",
  voices: [
    {
      atSec: 0,
      voice: {
        wave: hiss(8),
        envelope: adsr(0.001, 0.003, 0, 0.003),
        holdSec: 0.004,
        pitch: steady(8000),
        volume: 0.25,
      },
    },
    {
      atSec: 0,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.001, 0, 1, 0.012),
        holdSec: 0.035,
        pitch: steady(880),
        volume: 0.5,
      },
    },
    {
      atSec: 0.04,
      voice: {
        wave: PULSE_50,
        envelope: adsr(0.001, 0.05, 0.3, 0.03),
        holdSec: 0.05,
        pitch: steady(1320),
        volume: 0.5,
      },
    },
  ],
};
