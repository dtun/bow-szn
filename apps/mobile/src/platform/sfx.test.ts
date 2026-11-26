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

test("preloading loads every sound once and plays none", () => {
  let { sfx, createAudioPlayer, created } = freshSfx();

  sfx.preloadSfx();
  sfx.preloadSfx();

  expect(createAudioPlayer).toHaveBeenCalledTimes(3);
  expect([0, 1, 2].map((index) => created(index).play.mock.calls.length)).toEqual([0, 0, 0]);
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
