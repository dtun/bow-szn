import type { Envelope } from "./types.ts";

function gateLevel(envelope: Envelope, t: number): number {
  if (t < envelope.attackSec) {
    return t / envelope.attackSec;
  }
  let sinceAttack = t - envelope.attackSec;
  if (sinceAttack < envelope.decaySec) {
    return 1 - (1 - envelope.sustain) * (sinceAttack / envelope.decaySec);
  }
  return envelope.sustain;
}

export function envelopeLevel(envelope: Envelope, holdSec: number, t: number): number {
  if (t <= holdSec) {
    return gateLevel(envelope, t);
  }
  let progress = (t - holdSec) / envelope.releaseSec;
  return progress >= 1 ? 0 : gateLevel(envelope, holdSec) * (1 - progress);
}
