import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SOUNDS, SOUND_SAMPLE_RATE } from "./registry.ts";
import { render } from "./render.ts";
import { SOUND_IDS } from "./sounds/ids.ts";
import { encodeWav } from "./wav.ts";

const ASSET_DIR = resolve(__dirname, "../../../apps/mobile/assets/sound");

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("generated sound files", () => {
  it.each(SOUND_IDS)("%s.wav is what the registry renders today", (id) => {
    let committed = readFileSync(resolve(ASSET_DIR, `${id}.wav`));
    let fresh = encodeWav(render(SOUNDS[id], SOUND_SAMPLE_RATE), SOUND_SAMPLE_RATE);

    expect(sha256(committed)).toBe(sha256(fresh));
  });
});
