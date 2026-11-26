export const TUNING = {
  clock: {
    startMin: 6 * 60,
  },
  aim: {
    deadZonePx: 8,
    maxPullPx: 60,
    maxRangePx: 140,
  },
  arrow: {
    baseFlightMs: 150,
    speedPxPerSec: 220,
    arcHeightPerPx: 0.25,
  },
  wind: {
    driftPerStrength: 0.03,
  },
  hit: {
    nearScale: 2,
  },
  difficulty: {
    easy: { arrows: 6 },
    medium: { arrows: 5 },
    hard: { arrows: 4 },
  },
} as const;
