import { createAudioPlayer, type AudioPlayer, type AudioSource } from "expo-audio";

export type SfxId =
  | "ui-select"
  | "tap-hit"
  | "tap-slip"
  | "creak"
  | "full-draw"
  | "twang"
  | "whoosh"
  | "thunk"
  | "hit"
  | "spook"
  | "glint"
  | "whiff"
  | "fanfare";

const SOURCES: Record<SfxId, AudioSource> = {
  "ui-select": require("../../assets/sound/ui-select.wav"),
  "tap-hit": require("../../assets/sound/tap-hit.wav"),
  "tap-slip": require("../../assets/sound/tap-slip.wav"),
  creak: require("../../assets/sound/creak.wav"),
  "full-draw": require("../../assets/sound/full-draw.wav"),
  twang: require("../../assets/sound/twang.wav"),
  whoosh: require("../../assets/sound/whoosh.wav"),
  thunk: require("../../assets/sound/thunk.wav"),
  hit: require("../../assets/sound/hit.wav"),
  spook: require("../../assets/sound/spook.wav"),
  glint: require("../../assets/sound/glint.wav"),
  whiff: require("../../assets/sound/whiff.wav"),
  fanfare: require("../../assets/sound/fanfare.wav"),
};

let players = new Map<SfxId, AudioPlayer>();

function playerFor(id: SfxId): AudioPlayer {
  let player = players.get(id);
  if (!player) {
    player = createAudioPlayer(SOURCES[id]);
    players.set(id, player);
  }
  return player;
}

async function restartAndPlay(id: SfxId): Promise<void> {
  try {
    let player = playerFor(id);
    await player.seekTo(0);
    player.play();
  } catch {
    return;
  }
}

export function preloadSfx(): void {
  try {
    for (let id of Object.keys(SOURCES) as SfxId[]) {
      playerFor(id);
    }
  } catch {
    return;
  }
}

function isSilenced(): boolean {
  return process.env.EXPO_PUBLIC_SFX === "off";
}

export function playSfx(id: SfxId): void {
  if (isSilenced()) {
    return;
  }
  void restartAndPlay(id);
}
