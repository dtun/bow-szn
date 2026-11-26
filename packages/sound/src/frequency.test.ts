import { midiToHz } from "./frequency.ts";

describe("midiToHz", () => {
  it("tunes A4 to 440 Hz", () => {
    expect(midiToHz(69)).toBe(440);
  });

  it("doubles the frequency one octave up and halves it one octave down", () => {
    expect(midiToHz(81)).toBe(880);
    expect(midiToHz(57)).toBe(220);
  });

  it("places middle C at 261.6256 Hz", () => {
    expect(midiToHz(60)).toBeCloseTo(261.6255653, 6);
  });

  it("places E5, a major third above C5, at 659.2551 Hz", () => {
    expect(midiToHz(76)).toBeCloseTo(659.2551138, 6);
  });
});
