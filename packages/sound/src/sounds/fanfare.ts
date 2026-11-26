import type { Jingle } from "../types.ts";
import { PULSE_25, PULSE_50, TRIANGLE, adsr } from "./build.ts";
import { DRUM_KIT } from "./kit.ts";

export const FANFARE: Jingle = {
  kind: "jingle",
  bpm: 180,
  beatsPerBar: 4,
  channels: [
    {
      kind: "melodic",
      timbre: {
        wave: PULSE_25,
        envelope: adsr(0.004, 0.05, 0.7, 0.05),
        vibrato: { rateHz: 6, depthCents: 40, delaySec: 0.2 },
        volume: 0.24,
      },
      notation: "g4:16 c5 e5 g5 c6:4. g5:8 a5 g5 | e5:8 g5 c6:2. |",
    },
    {
      kind: "melodic",
      timbre: {
        wave: PULSE_50,
        envelope: adsr(0.004, 0.05, 0.6, 0.05),
        volume: 0.13,
      },
      notation: "e4:16 g4 c5 e5 g5:4. e5:8 f5 e5 | c5:8 e5 g5:2. |",
    },
    {
      kind: "melodic",
      timbre: {
        wave: TRIANGLE,
        envelope: adsr(0.003, 0.1, 0.8, 0.04),
        volume: 0.27,
      },
      notation: "c3:4 c3:8 c3 g2:4 g2 | c3:4 g2 c3:2 |",
    },
    {
      kind: "percussion",
      kit: DRUM_KIT,
      notation: "k:4 s:8 s k:4 s:16 s s s | k:4 s x:2 |",
    },
  ],
};
