import { createHash } from "node:crypto";
import { peak } from "./measure.ts";
import { SOUNDS, SOUND_SAMPLE_RATE } from "./registry.ts";
import { render } from "./render.ts";
import { SOUND_IDS } from "./sounds/ids.ts";
import { JINGLE_TITLE } from "./sounds/title.ts";
import type { SoundId } from "./sounds/ids.ts";

const MIN_PEAK = 0.3;
const MAX_PEAK = 0.98;
const QUIET_EDGE = 0.01;
const LONGEST_EFFECT_SEC = 1;
const LOOP_SEAM = 0.001;

let rendered = new Map<SoundId, Float32Array>();

function digest(samples: Float32Array): string {
  return createHash("sha256").update(samples).digest("hex");
}

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
      expect(digest(render(SOUNDS[id], SOUND_SAMPLE_RATE))).toBe(digest(samplesOf(id)));
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

  describe("jingles", () => {
    it("plays the harvest fanfare for two to three seconds", () => {
      let seconds = samplesOf("fanfare").length / SOUND_SAMPLE_RATE;

      expect(seconds).toBeGreaterThanOrEqual(2);
      expect(seconds).toBeLessThanOrEqual(3);
    });

    describe("the title loop", () => {
      let barSamples = (JINGLE_TITLE.beatsPerBar * 60 * SOUND_SAMPLE_RATE) / JINGLE_TITLE.bpm;

      it("has a bar that is a whole number of samples at its tempo", () => {
        expect(Number.isInteger(barSamples)).toBe(true);
      });

      it("lasts a whole number of bars", () => {
        expect(samplesOf("jingle-title").length % barSamples).toBe(0);
      });

      it("runs 8 to 16 bars", () => {
        let bars = samplesOf("jingle-title").length / barSamples;

        expect(bars).toBeGreaterThanOrEqual(8);
        expect(bars).toBeLessThanOrEqual(16);
      });

      it("meets itself at silence so the loop point cannot click", () => {
        let samples = samplesOf("jingle-title");

        expect(Math.abs(samples[0])).toBeLessThan(LOOP_SEAM);
        expect(Math.abs(samples[samples.length - 1])).toBeLessThan(LOOP_SEAM);
      });
    });
  });
});
