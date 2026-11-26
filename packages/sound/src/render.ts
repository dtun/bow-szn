import { midiToHz } from "./frequency.ts";
import { parseDrums, parseMelody } from "./notation.ts";
import type { Channel, Jingle, PlacedVoice, Sfx, Sound, Timbre, Voice } from "./types.ts";
import { renderVoice } from "./voice.ts";

const SECONDS_PER_MINUTE = 60;

type Placed = { start: number; samples: Float32Array };

function fitToWindow(voice: Voice, windowSec: number): Voice {
  let releaseSec = Math.min(voice.envelope.releaseSec, windowSec / 2);
  let holdSec = Math.min(voice.holdSec, windowSec - releaseSec);
  return { ...voice, holdSec, envelope: { ...voice.envelope, releaseSec } };
}

function noteVoice(timbre: Timbre, midi: number, windowSec: number): Voice {
  let hz = midiToHz(midi);
  let voice: Voice = {
    ...timbre,
    holdSec: windowSec,
    pitch: { startHz: hz, endHz: hz, curve: "linear" },
  };
  return fitToWindow(voice, windowSec);
}

function mix(placed: Placed[], length: number): Float32Array {
  let out = new Float32Array(length);
  for (let { start, samples } of placed) {
    for (let i = 0; i < samples.length && start + i < length; i++) {
      out[start + i] += samples[i];
    }
  }
  return out;
}

function renderPlaced(voices: PlacedVoice[], sampleRate: number): Placed[] {
  return voices.map(({ atSec, voice }) => ({
    start: Math.round(atSec * sampleRate),
    samples: renderVoice(voice, sampleRate),
  }));
}

function renderSfx(sfx: Sfx, sampleRate: number): Float32Array {
  let placed = renderPlaced(sfx.voices, sampleRate);
  let length = Math.max(0, ...placed.map(({ start, samples }) => start + samples.length));
  return mix(placed, length);
}

type ChannelTrack = { bars: number; voices: PlacedVoice[] };

function channelTrack(channel: Channel, beatsPerBar: number, secondsPerBeat: number): ChannelTrack {
  if (channel.kind === "melodic") {
    let { events, bars } = parseMelody(channel.notation, beatsPerBar);
    let voices = events.map((event) => ({
      atSec: event.startBeat * secondsPerBeat,
      voice: noteVoice(channel.timbre, event.midi, event.beats * secondsPerBeat),
    }));
    return { bars, voices };
  }
  let { events, bars } = parseDrums(channel.notation, beatsPerBar);
  let voices = events.map((event) => ({
    atSec: event.startBeat * secondsPerBeat,
    voice: fitToWindow(channel.kit[event.drum], event.beats * secondsPerBeat),
  }));
  return { bars, voices };
}

function renderJingle(jingle: Jingle, sampleRate: number): Float32Array {
  let secondsPerBeat = SECONDS_PER_MINUTE / jingle.bpm;
  let tracks = jingle.channels.map((channel) =>
    channelTrack(channel, jingle.beatsPerBar, secondsPerBeat)
  );
  let bars = tracks.length > 0 ? tracks[0].bars : 0;
  if (tracks.some((track) => track.bars !== bars)) {
    throw new Error(`channels disagree on the bar count: ${tracks.map((t) => t.bars).join(", ")}`);
  }
  let length = Math.round(
    (bars * jingle.beatsPerBar * SECONDS_PER_MINUTE * sampleRate) / jingle.bpm
  );
  let placed = tracks.flatMap((track) => renderPlaced(track.voices, sampleRate));
  return mix(placed, length);
}

export function render(sound: Sound, sampleRate: number): Float32Array {
  return sound.kind === "sfx" ? renderSfx(sound, sampleRate) : renderJingle(sound, sampleRate);
}
