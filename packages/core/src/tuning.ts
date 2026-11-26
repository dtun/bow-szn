export const TUNING = {
  clock: {
    startMin: 6 * 60,
    endMin: 10 * 60,
    gameMinPerSec: 1,
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
    buckZoneScale: 0.75,
  },
  animals: {
    grazeMs: [2500, 6000],
    buckGrazeScale: 0.5,
    buckWariness: 1.5,
    drawSpookScale: 0.5,
    alertMs: 1500,
    fleeSpeedScale: 3.5,
    meadow: { minX: 24, maxX: 156, minY: 120, maxY: 240 },
    offFieldPx: 10,
  },
  rut: {
    antleredSpeedScale: 1.3,
    antleredGrazeScale: 0.6,
    rackRolls: 2,
  },
  spawn: {
    opening: 2,
    maxLive: 5,
    everyMs: [6000, 12000],
  },
  difficulty: {
    easy: { arrows: 6, speedScale: 0.85, hitZoneScale: 1.25, wariness: 0.85 },
    medium: { arrows: 5, speedScale: 1, hitZoneScale: 1, wariness: 1 },
    hard: { arrows: 4, speedScale: 1.2, hitZoneScale: 0.8, wariness: 1.25 },
  },
} as const;
