import { envelopeLevel } from "./envelope.ts";
import type { Envelope } from "./types.ts";

const ENVELOPE: Envelope = { attackSec: 0.1, decaySec: 0.1, sustain: 0.5, releaseSec: 0.2 };
const LONG_HOLD = 1;

describe("envelopeLevel", () => {
  it("rises in a straight line from silence to full level over the attack", () => {
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0)).toBe(0);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0.05)).toBeCloseTo(0.5, 10);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0.1)).toBeCloseTo(1, 10);
  });

  it("falls in a straight line to the sustain level over the decay", () => {
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0.15)).toBeCloseTo(0.75, 10);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0.2)).toBeCloseTo(0.5, 10);
  });

  it("holds the sustain level until the hold ends", () => {
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 0.7)).toBe(0.5);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, LONG_HOLD)).toBe(0.5);
  });

  it("falls from the sustain level to silence over the release", () => {
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 1.1)).toBeCloseTo(0.25, 10);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 1.2)).toBeCloseTo(0, 10);
    expect(envelopeLevel(ENVELOPE, LONG_HOLD, 5)).toBe(0);
  });

  it("releases from the level reached when the hold ends mid-attack", () => {
    expect(envelopeLevel(ENVELOPE, 0.05, 0.05)).toBeCloseTo(0.5, 10);
    expect(envelopeLevel(ENVELOPE, 0.05, 0.15)).toBeCloseTo(0.25, 10);
  });

  it("releases from the level reached when the hold ends mid-decay", () => {
    expect(envelopeLevel(ENVELOPE, 0.15, 0.15)).toBeCloseTo(0.75, 10);
    expect(envelopeLevel(ENVELOPE, 0.15, 0.25)).toBeCloseTo(0.375, 10);
  });

  it("decays all the way to silence when the sustain level is zero", () => {
    let plucked: Envelope = { attackSec: 0.01, decaySec: 0.2, sustain: 0, releaseSec: 0.05 };

    expect(envelopeLevel(plucked, LONG_HOLD, 0.11)).toBeCloseTo(0.5, 10);
    expect(envelopeLevel(plucked, LONG_HOLD, 0.21)).toBeCloseTo(0, 10);
    expect(envelopeLevel(plucked, LONG_HOLD, 0.6)).toBe(0);
  });

  it("starts at full level with no attack and cuts at once with no release", () => {
    let blunt: Envelope = { attackSec: 0, decaySec: 0, sustain: 1, releaseSec: 0 };

    expect(envelopeLevel(blunt, 0.5, 0)).toBe(1);
    expect(envelopeLevel(blunt, 0.5, 0.5)).toBe(1);
    expect(envelopeLevel(blunt, 0.5, 0.501)).toBe(0);
  });
});
