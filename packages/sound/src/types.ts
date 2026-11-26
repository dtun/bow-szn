export type Duty = 0.125 | 0.25 | 0.5;

export type NoiseMode = "hiss" | "buzz";

export type Waveform =
  | { kind: "square"; duty: Duty }
  | { kind: "triangle" }
  | { kind: "saw" }
  | { kind: "noise"; mode: NoiseMode; seed: number };

export type Envelope = {
  attackSec: number;
  decaySec: number;
  sustain: number;
  releaseSec: number;
};

export type SweepCurve = "linear" | "exponential";

export type Pitch = { startHz: number; endHz: number; curve: SweepCurve };

export type Vibrato = { rateHz: number; depthCents: number; delaySec: number };

export type Timbre = {
  wave: Waveform;
  envelope: Envelope;
  vibrato?: Vibrato;
  volume: number;
};

export type Voice = Timbre & { holdSec: number; pitch: Pitch };

export type PlacedVoice = { atSec: number; voice: Voice };

export type Sfx = { kind: "sfx"; voices: PlacedVoice[] };

export type Drum = "kick" | "snare" | "hat" | "crash";

export type MelodicChannel = { kind: "melodic"; timbre: Timbre; notation: string };

export type PercussionChannel = {
  kind: "percussion";
  kit: Record<Drum, Voice>;
  notation: string;
};

export type Channel = MelodicChannel | PercussionChannel;

export type Jingle = {
  kind: "jingle";
  bpm: number;
  beatsPerBar: number;
  channels: Channel[];
};

export type Sound = Sfx | Jingle;
