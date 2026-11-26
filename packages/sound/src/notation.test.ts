import { midiToHz } from "./frequency.ts";
import { parseDrums, parseMelody } from "./notation.ts";

describe("parseMelody", () => {
  it("turns a known phrase into exact pitches and beat lengths", () => {
    let { events, bars } = parseMelody("a4:4 c5:8 e5 a5:2 |", 4);

    expect(bars).toBe(1);
    expect(events).toEqual([
      { startBeat: 0, beats: 1, midi: 69 },
      { startBeat: 1, beats: 0.5, midi: 72 },
      { startBeat: 1.5, beats: 0.5, midi: 76 },
      { startBeat: 2, beats: 2, midi: 81 },
    ]);
    expect(events.map((event) => midiToHz(event.midi))).toEqual([
      440,
      expect.closeTo(523.2511306, 6),
      expect.closeTo(659.2551138, 6),
      880,
    ]);
  });

  it("reads sharps and flats against the octave of the letter", () => {
    let { events } = parseMelody("c#4:8 db4 bb3 b3 cb4 e#4 b#3 a4 |", 4);

    expect(events.map((event) => event.midi)).toEqual([61, 61, 58, 59, 59, 65, 60, 69]);
  });

  it("starts at a quarter note and lets each length carry to the notes after it", () => {
    let { events } = parseMelody("c4 d4 e4:8 f4 g4:4 |", 4);

    expect(events.map((event) => event.beats)).toEqual([1, 1, 0.5, 0.5, 1]);
    expect(events.map((event) => event.startBeat)).toEqual([0, 1, 2, 2.5, 3]);
  });

  it("lengthens a dotted note by half", () => {
    let { events } = parseMelody("c4:4. d4:8. e4:16. r:4 r:16 r:32 |", 4);

    expect(events.map((event) => event.beats)).toEqual([1.5, 0.75, 0.375]);
    expect(events.map((event) => event.startBeat)).toEqual([0, 1.5, 2.25]);
  });

  it("advances time over a rest without making an event", () => {
    let { events } = parseMelody("c4:4 r:4 e4:2 |", 4);

    expect(events).toEqual([
      { startBeat: 0, beats: 1, midi: 60 },
      { startBeat: 2, beats: 2, midi: 64 },
    ]);
  });

  it("counts each closed bar and keeps beats running across bars", () => {
    let { events, bars } = parseMelody("c4:2 d4:2 | e4:1 | g4:4 r:4 r:2 |", 4);

    expect(bars).toBe(3);
    expect(events.map((event) => event.startBeat)).toEqual([0, 2, 4, 8]);
    expect(events[2]).toEqual({ startBeat: 4, beats: 4, midi: 64 });
  });

  it("measures bars in the beats of the time signature", () => {
    let { bars } = parseMelody("c4:4. d4:8 e4:4 | c4:2. |", 3);

    expect(bars).toBe(2);
  });

  it("reads an empty source as no bars", () => {
    expect(parseMelody("  ", 4)).toEqual({ events: [], bars: 0 });
  });

  it("rejects a bar that is too short", () => {
    expect(() => parseMelody("c4:4 d4:4 |", 4)).toThrow("bar 1 holds 2 beats, expected 4");
  });

  it("rejects a bar that is too long and names the bar", () => {
    expect(() => parseMelody("c4:1 | c4:1 d4:4 |", 4)).toThrow("bar 2 holds 5 beats, expected 4");
  });

  it("rejects notes after the last closed bar", () => {
    expect(() => parseMelody("c4:1 | d4:2", 4)).toThrow('bar 2 is missing its closing "|"');
  });

  it("rejects a length that is not a note value", () => {
    expect(() => parseMelody("c4:3 |", 4)).toThrow('bad note length in "c4:3"');
  });

  it("rejects a name that is not a note", () => {
    expect(() => parseMelody("h4:1 |", 4)).toThrow('unknown token "h4:1"');
  });

  it("rejects a drum in a melody", () => {
    expect(() => parseMelody("k:1 |", 4)).toThrow('unknown token "k:1"');
  });

  it("rejects a token with two lengths", () => {
    expect(() => parseMelody("c4:4:4 |", 4)).toThrow('bad token "c4:4:4"');
  });
});

describe("parseDrums", () => {
  it("reads kick, snare, hat, and crash on the beat", () => {
    let { events, bars } = parseDrums("k:8 h s h k k s:4 | x:1 |", 4);

    expect(bars).toBe(2);
    expect(events).toEqual([
      { startBeat: 0, beats: 0.5, drum: "kick" },
      { startBeat: 0.5, beats: 0.5, drum: "hat" },
      { startBeat: 1, beats: 0.5, drum: "snare" },
      { startBeat: 1.5, beats: 0.5, drum: "hat" },
      { startBeat: 2, beats: 0.5, drum: "kick" },
      { startBeat: 2.5, beats: 0.5, drum: "kick" },
      { startBeat: 3, beats: 1, drum: "snare" },
      { startBeat: 4, beats: 4, drum: "crash" },
    ]);
  });

  it("rests between hits", () => {
    let { events } = parseDrums("k:4 r s:4 r |", 4);

    expect(events.map((event) => event.startBeat)).toEqual([0, 2]);
  });

  it("rejects a pitched note in a drum track", () => {
    expect(() => parseDrums("c4:1 |", 4)).toThrow('unknown token "c4:1"');
  });
});
