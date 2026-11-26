import { createAudioPlayer, type AudioPlayer } from "expo-audio";

const SOURCES = {
  "ui-select": require("../../assets/sound/ui-select.wav"),
  "tap-hit": require("../../assets/sound/tap-hit.wav"),
  "tap-slip": require("../../assets/sound/tap-slip.wav"),
};

export type SfxId = keyof typeof SOURCES;

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

export function playSfx(id: SfxId): void {
  void restartAndPlay(id);
}
