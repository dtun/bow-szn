import type { Drum, Voice } from "../types.ts";
import { TRIANGLE, adsr, glide, hiss, steady } from "./build.ts";

export const DRUM_KIT: Record<Drum, Voice> = {
  kick: {
    wave: TRIANGLE,
    envelope: adsr(0.001, 0.1, 0, 0.03),
    holdSec: 0.1,
    pitch: glide(140, 40, "exponential"),
    volume: 0.45,
  },
  snare: {
    wave: hiss(3),
    envelope: adsr(0.001, 0.09, 0, 0.03),
    holdSec: 0.09,
    pitch: glide(7000, 3500, "exponential"),
    volume: 0.24,
  },
  hat: {
    wave: hiss(11),
    envelope: adsr(0.001, 0.02, 0, 0.01),
    holdSec: 0.02,
    pitch: steady(10000),
    volume: 0.11,
  },
  crash: {
    wave: hiss(19),
    envelope: adsr(0.002, 1.2, 0, 0.1),
    holdSec: 1.2,
    pitch: glide(9000, 5000, "exponential"),
    volume: 0.24,
  },
};
