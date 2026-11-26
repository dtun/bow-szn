import type { Drum } from "./types.ts";

export type TimedEvent = { startBeat: number; beats: number };
export type NoteEvent = TimedEvent & { midi: number };
export type DrumEvent = TimedEvent & { drum: Drum };
export type Track<E> = { events: E[]; bars: number };

const BAR_LINE = "|";
const REST = "r";
const WHOLE_NOTE_BEATS = 4;
const DOTTED = 1.5;
const FIRST_LENGTH_BEATS = 1;
const NOTE_VALUES = [1, 2, 4, 8, 16, 32];
const SEMITONES_PER_OCTAVE = 12;
const NOTE_NAME = /^([a-g])([#b]?)(\d)$/;
const LENGTH = /^(\d+)(\.?)$/;

const PITCH_CLASS: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const ACCIDENTAL: Record<string, number> = { "": 0, "#": 1, b: -1 };
const DRUM_NAMES: Record<string, Drum> = { k: "kick", s: "snare", h: "hat", x: "crash" };

function readNote(name: string): { midi: number } | undefined {
  let match = NOTE_NAME.exec(name);
  if (match === null) {
    return undefined;
  }
  let [, letter, accidental, octave] = match;
  let midi =
    (Number(octave) + 1) * SEMITONES_PER_OCTAVE + PITCH_CLASS[letter] + ACCIDENTAL[accidental];
  return { midi };
}

function readDrum(name: string): { drum: Drum } | undefined {
  let drum = DRUM_NAMES[name];
  return drum === undefined ? undefined : { drum };
}

function readLength(text: string, token: string): number {
  let match = LENGTH.exec(text);
  let value = match === null ? NaN : Number(match[1]);
  if (!NOTE_VALUES.includes(value)) {
    throw new Error(`bad note length in "${token}"`);
  }
  let beats = WHOLE_NOTE_BEATS / value;
  return match?.[2] === "." ? beats * DOTTED : beats;
}

function parseTrack<S extends object>(
  source: string,
  beatsPerBar: number,
  readSymbol: (name: string) => S | undefined
): Track<TimedEvent & S> {
  let events: (TimedEvent & S)[] = [];
  let beat = 0;
  let barStart = 0;
  let bars = 0;
  let lengthBeats = FIRST_LENGTH_BEATS;

  for (let token of source.split(/\s+/)) {
    if (token === "") {
      continue;
    }
    if (token === BAR_LINE) {
      if (beat - barStart !== beatsPerBar) {
        throw new Error(`bar ${bars + 1} holds ${beat - barStart} beats, expected ${beatsPerBar}`);
      }
      barStart = beat;
      bars += 1;
      continue;
    }
    let [name, lengthText, ...extra] = token.split(":");
    if (extra.length > 0) {
      throw new Error(`bad token "${token}"`);
    }
    if (lengthText !== undefined) {
      lengthBeats = readLength(lengthText, token);
    }
    if (name !== REST) {
      let symbol = readSymbol(name);
      if (symbol === undefined) {
        throw new Error(`unknown token "${token}"`);
      }
      events.push({ startBeat: beat, beats: lengthBeats, ...symbol });
    }
    beat += lengthBeats;
  }

  if (beat !== barStart) {
    throw new Error(`bar ${bars + 1} is missing its closing "${BAR_LINE}"`);
  }
  return { events, bars };
}

export function parseMelody(source: string, beatsPerBar: number): Track<NoteEvent> {
  return parseTrack(source, beatsPerBar, readNote);
}

export function parseDrums(source: string, beatsPerBar: number): Track<DrumEvent> {
  return parseTrack(source, beatsPerBar, readDrum);
}
