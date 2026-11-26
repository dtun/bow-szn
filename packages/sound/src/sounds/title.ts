import type { Jingle } from "../types.ts";
import { PULSE_12, PULSE_25, TRIANGLE, adsr } from "./build.ts";
import { DRUM_KIT } from "./kit.ts";

const REST_BAR = "r:1 |";

function arpeggioBar(root: string, third: string, fifth: string): string {
  let group = `${root}:16 ${third} ${fifth} ${third}`;
  return `${group} ${group} ${group} ${group} |`;
}

const LEAD_BARS = [
  "r:8 g4 b4 d5 g5:4. d5:8 |",
  "e5:8 d5 b4 a4 d5:4. a4:8 |",
  "g4:8 b4 e5 g5 e5:4. b4:8 |",
  "e5:8 g5 e5 c5 d5:4 c5 |",
  "r:8 g4 b4 d5 g5 a5 b5 d6 |",
  "c6:4. b5:8 a5:4 f#5 |",
  "g5:8 e5 g5 b5 g5:4. e5:8 |",
  "c6:8 b5 a5 g5 a5:4 g5 |",
  "e5:4 g5 c6:2 |",
  "b5:4. a5:8 g5:4 d5 |",
  "e5:8 a5 c6 e6 d6:4. c6:8 |",
  "b5:8 a5 f#5 a5 d6:4 r |",
];

const ARPEGGIO_BARS = [
  REST_BAR,
  REST_BAR,
  arpeggioBar("e4", "g4", "b4"),
  arpeggioBar("c4", "e4", "g4"),
  arpeggioBar("g3", "b3", "d4"),
  arpeggioBar("d4", "f#4", "a4"),
  arpeggioBar("e4", "g4", "b4"),
  arpeggioBar("c4", "e4", "g4"),
  arpeggioBar("c4", "e4", "g4"),
  arpeggioBar("g3", "b3", "d4"),
  arpeggioBar("a3", "c4", "e4"),
  arpeggioBar("d4", "f#4", "a4"),
];

const BASS_BARS = [
  "g2:1 |",
  "d3:1 |",
  "e2:4 r:8 e2 b2:4 e2 |",
  "c3:4 r:8 c3 g2:4 c3 |",
  "g2:4 r:8 g2 d3:4 g2 |",
  "d3:4 r:8 d3 a2:4 d3 |",
  "e2:4 r:8 e2 b2:4 e2 |",
  "c3:4 r:8 c3 g2:4 c3 |",
  "c3:4 r:8 c3 g2:4 c3 |",
  "g2:4 r:8 g2 d3:4 g2 |",
  "a2:4 r:8 a2 e3:4 a2 |",
  "d3:4 r:8 d3 a2:4 d3 |",
];

const DRUM_BARS = [
  REST_BAR,
  REST_BAR,
  REST_BAR,
  REST_BAR,
  "k:4 h:4 s:4 h:4 |",
  "k:4 h:4 s:4 h:4 |",
  "k:4 h:4 s:4 h:4 |",
  "k:4 h:4 s:4 h:4 |",
  "k:8 h s h k h s h |",
  "k:8 h s h k h s h |",
  "k:8 h s h k h s h |",
  "k:8 h s h k s:16 s s:8 s |",
];

export const JINGLE_TITLE: Jingle = {
  kind: "jingle",
  bpm: 140,
  beatsPerBar: 4,
  channels: [
    {
      kind: "melodic",
      timbre: {
        wave: PULSE_25,
        envelope: adsr(0.006, 0.07, 0.65, 0.03),
        vibrato: { rateHz: 5.5, depthCents: 25, delaySec: 0.15 },
        volume: 0.2,
      },
      notation: LEAD_BARS.join(" "),
    },
    {
      kind: "melodic",
      timbre: {
        wave: PULSE_12,
        envelope: adsr(0.002, 0.05, 0.3, 0.02),
        volume: 0.13,
      },
      notation: ARPEGGIO_BARS.join(" "),
    },
    {
      kind: "melodic",
      timbre: {
        wave: TRIANGLE,
        envelope: adsr(0.003, 0.08, 0.75, 0.03),
        volume: 0.23,
      },
      notation: BASS_BARS.join(" "),
    },
    { kind: "percussion", kit: DRUM_KIT, notation: DRUM_BARS.join(" ") },
  ],
};
