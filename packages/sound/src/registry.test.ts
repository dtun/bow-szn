import { peak } from "./measure.ts";
import { SOUNDS, SOUND_SAMPLE_RATE } from "./registry.ts";
import { render } from "./render.ts";
import { SOUND_IDS } from "./sounds/ids.ts";
import type { SoundId } from "./sounds/ids.ts";

const MIN_PEAK = 0.3;
const MAX_PEAK = 0.98;
const QUIET_EDGE = 0.01;
const LONGEST_EFFECT_SEC = 1;

let rendered = new Map<SoundId, Float32Array>();

function samplesOf(id: SoundId): Float32Array {
  let samples = rendered.get(id) ?? render(SOUNDS[id], SOUND_SAMPLE_RATE);
  rendered.set(id, samples);
  return samples;
}

describe("the sound registry", () => {
  it("has a sound for every id and no others", () => {
    expect(Object.keys(SOUNDS).sort()).toEqual([...SOUND_IDS].sort());
  });

  it("renders at 22050 Hz", () => {
    expect(SOUND_SAMPLE_RATE).toBe(22050);
  });

  describe.each(SOUND_IDS)("%s", (id) => {
    it("renders without a NaN or an infinity", () => {
      expect(samplesOf(id).every((sample) => Number.isFinite(sample))).toBe(true);
    });

    it("is loud enough to hear and never clips", () => {
      let top = peak(samplesOf(id));

      expect(top).toBeGreaterThanOrEqual(MIN_PEAK);
      expect(top).toBeLessThanOrEqual(MAX_PEAK);
    });

    it("starts at near-zero amplitude so it cannot click", () => {
      expect(Math.abs(samplesOf(id)[0])).toBeLessThan(QUIET_EDGE);
    });

    it("ends at near-zero amplitude so it cannot click", () => {
      let samples = samplesOf(id);

      expect(Math.abs(samples[samples.length - 1])).toBeLessThan(QUIET_EDGE);
    });

    it("renders the same samples every time", () => {
      expect(render(SOUNDS[id], SOUND_SAMPLE_RATE)).toEqual(samplesOf(id));
    });
  });

  describe("effects", () => {
    it.each(SOUND_IDS.filter((id) => SOUNDS[id].kind === "sfx"))("%s stays short", (id) => {
      expect(samplesOf(id).length / SOUND_SAMPLE_RATE).toBeLessThanOrEqual(LONGEST_EFFECT_SEC);
    });

    it("keeps the arrow in flight about 400 ms", () => {
      let seconds = samplesOf("whoosh").length / SOUND_SAMPLE_RATE;

      expect(seconds).toBeGreaterThanOrEqual(0.35);
      expect(seconds).toBeLessThanOrEqual(0.45);
    });
  });
});
