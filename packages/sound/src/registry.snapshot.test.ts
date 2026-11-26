import { createHash } from "node:crypto";
import { SOUNDS, SOUND_SAMPLE_RATE } from "./registry.ts";
import { render } from "./render.ts";
import { SOUND_IDS } from "./sounds/ids.ts";
import type { SoundId } from "./sounds/ids.ts";
import { encodeWav } from "./wav.ts";

const WAV_HEADER_BYTES = 44;

function fingerprint(id: SoundId): { samples: number; sha256: string } {
  let wav = encodeWav(render(SOUNDS[id], SOUND_SAMPLE_RATE), SOUND_SAMPLE_RATE);
  return {
    samples: (wav.length - WAV_HEADER_BYTES) / 2,
    sha256: createHash("sha256").update(wav).digest("hex"),
  };
}

describe("rendered sounds", () => {
  it.each(SOUND_IDS)("%s keeps its recorded fingerprint", (id) => {
    expect(fingerprint(id)).toMatchSnapshot();
  });
});
