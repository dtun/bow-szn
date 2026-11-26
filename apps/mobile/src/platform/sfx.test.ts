type Sfx = typeof import("./sfx");
type Audio = typeof import("expo-audio");

function freshSfx() {
  jest.resetModules();
  let audio: Audio = jest.requireMock("expo-audio");
  let sfx: Sfx = jest.requireActual("./sfx");
  let createAudioPlayer = jest.mocked(audio.createAudioPlayer);

  function created(index: number) {
    let player = createAudioPlayer.mock.results[index].value;
    return { play: jest.mocked(player.play), seekTo: jest.mocked(player.seekTo) };
  }

  return { sfx, createAudioPlayer, created };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

const SOUND_COUNT = 13;

test("preloading loads every sound once and plays none", () => {
  let { sfx, createAudioPlayer, created } = freshSfx();

  sfx.preloadSfx();
  sfx.preloadSfx();

  expect(createAudioPlayer).toHaveBeenCalledTimes(SOUND_COUNT);
  let plays = Array.from({ length: SOUND_COUNT }, (_, index) => created(index).play.mock.calls);
  expect(plays.flat()).toEqual([]);
});

const HUNT_SOUNDS = [
  "creak",
  "full-draw",
  "twang",
  "whoosh",
  "thunk",
  "hit",
  "spook",
  "glint",
  "whiff",
  "fanfare",
] as const;

test.each(HUNT_SOUNDS)("the hunt sound %s plays", async (id) => {
  let { sfx, created } = freshSfx();

  sfx.playSfx(id);
  await settle();

  expect(created(0).play).toHaveBeenCalledTimes(1);
});

test("a sound plays from the start every time it fires", async () => {
  let { sfx, createAudioPlayer, created } = freshSfx();

  sfx.playSfx("tap-hit");
  await settle();
  sfx.playSfx("tap-hit");
  await settle();

  expect(createAudioPlayer).toHaveBeenCalledTimes(1);
  expect(created(0).seekTo.mock.calls).toEqual([[0], [0]]);
  expect(created(0).play).toHaveBeenCalledTimes(2);
});

test("a sound that cannot load fails quietly", async () => {
  let { sfx, createAudioPlayer } = freshSfx();
  createAudioPlayer.mockImplementationOnce(() => {
    throw new Error("asset missing");
  });

  expect(() => sfx.playSfx("tap-slip")).not.toThrow();
  await settle();
});

test("a player that cannot rewind fails quietly", async () => {
  let { sfx, created } = freshSfx();
  sfx.preloadSfx();
  for (let index of [0, 1, 2]) {
    created(index).seekTo.mockRejectedValueOnce(new Error("player released"));
  }

  expect(() => sfx.playSfx("ui-select")).not.toThrow();
  await settle();
});

describe("with EXPO_PUBLIC_SFX=off", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_SFX = "off";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SFX;
  });

  test("no sound plays", async () => {
    let { sfx, createAudioPlayer } = freshSfx();

    sfx.playSfx("fanfare");
    sfx.playSfx("creak");
    await settle();

    expect(createAudioPlayer).not.toHaveBeenCalled();
  });
});
