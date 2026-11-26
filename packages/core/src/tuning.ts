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
  animals: {
    grazeMs: [2500, 6000],
    alertMs: 1500,
    fleeSpeedScale: 3.5,
    meadow: { minX: 24, maxX: 156, minY: 120, maxY: 240 },
    offFieldPx: 10,
  },
  difficulty: {
    easy: { arrows: 6, speedScale: 0.85 },
    medium: { arrows: 5, speedScale: 1 },
    hard: { arrows: 4, speedScale: 1.2 },
  },
} as const;
