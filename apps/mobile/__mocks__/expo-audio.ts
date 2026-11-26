export let createAudioPlayer = jest.fn(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  remove: jest.fn(),
  seekTo: jest.fn(async () => undefined),
}));
