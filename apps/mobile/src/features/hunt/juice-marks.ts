import { createRoller, TUNING, type HuntState, type Vec2 } from "@bow-szn/core";
import { FX_FRAMES, PALETTE, SPRITES } from "@bow-szn/pixels";

import { burstAge, burstLife, type Burst, type Juice } from "./hunt-session";
import { CREAM, label, rect, sprite, YELLOW, type Label, type Mark } from "./scene-marks";

const CONFETTI_COLORS = FX_FRAMES.confetti.map((id) => PALETTE[SPRITES[id].rows[0][0]]);
const CONFETTI_SPREAD = 2.6;
const BLINK_FROM = 0.75;
const BLINK_MS = 60;
const SHAKE_X_RATE = 0.09;
const SHAKE_Y_RATE = 0.13;
const ARROW_IN_GROUND = 8;
const POP_RISE_MAX = 12;
const POP_LIFT = 14;
const LONG_LINE = 10;
const LONG_LINE_SIZE = 6;

const POP_STYLE = {
  buck: { size: 10, color: YELLOW },
  snack: { size: 7, color: CREAM },
  near: { size: 6, color: YELLOW },
  miss: { size: 6, color: CREAM },
};

function blinkedOut(age: number, life: number): boolean {
  return age / life > BLINK_FROM && Math.floor(age / BLINK_MS) % 2 === 1;
}

export function shakeOffset(juice: Juice): Vec2 {
  let x = 0;
  let y = 0;
  for (let burst of juice.bursts) {
    let age = burstAge(juice, burst);
    if (burst.kind !== "shake" || age < 0 || age >= burstLife(burst)) {
      continue;
    }
    let reach = burst.px * (1 - age / burstLife(burst));
    x += reach * Math.sin(age * SHAKE_X_RATE);
    y += reach * Math.cos(age * SHAKE_Y_RATE);
  }
  return { x: Math.round(x), y: Math.round(y) };
}

function confettiMarks(burst: Extract<Burst, { kind: "confetti" }>, age: number): Mark[] {
  let roller = createRoller(burst.seed);
  let seconds = age / 1000;
  let [slowest, fastest] = TUNING.juice.confettiSpeed;
  let marks: Mark[] = [];
  for (let index = 0; index < burst.count; index++) {
    let angle = -Math.PI / 2 + (roller.float() - 0.5) * CONFETTI_SPREAD;
    let speed = roller.between(slowest, fastest);
    let tall = roller.chance(0.5);
    let x = burst.at.x + Math.cos(angle) * speed * seconds;
    let y =
      burst.at.y -
      4 +
      Math.sin(angle) * speed * seconds +
      (TUNING.juice.confettiGravity * seconds ** 2) / 2;
    let color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    marks.push(
      rect(`confetti-${burst.seed}-${index}`, Math.round(x), Math.round(y), 2, tall ? 2 : 1, color)
    );
  }
  return marks;
}

function puffMarks(key: string, at: Vec2, age: number, life: number): Mark[] {
  let frames = FX_FRAMES.dirtPuff;
  let frame = frames[Math.min(frames.length - 1, Math.floor((age / life) * frames.length))];
  return [sprite(key, frame, { x: at.x, y: at.y + 2 })];
}

function stuckMarks(burst: Extract<Burst, { kind: "stuck" }>): Mark[] {
  let anchor = {
    x: burst.at.x - Math.sin(burst.heading) * ARROW_IN_GROUND,
    y: burst.at.y + Math.cos(burst.heading) * ARROW_IN_GROUND,
  };
  return [sprite(`stuck-${burst.startMs}`, "arrow", anchor, { rotate: burst.heading })];
}

export function burstMarks(juice: Juice): Mark[] {
  return juice.bursts.flatMap((burst): Mark[] => {
    let age = burstAge(juice, burst);
    let life = burstLife(burst);
    if (age < 0 || blinkedOut(age, life)) {
      return [];
    }
    switch (burst.kind) {
      case "confetti":
        return confettiMarks(burst, age);
      case "dirt":
        return puffMarks(`dirt-${burst.startMs}`, burst.at, age, life);
      case "dust":
        return puffMarks(`dust-${burst.startMs}-${burst.at.x}-${burst.at.y}`, burst.at, age, life);
      case "stuck":
        return stuckMarks(burst);
      case "shake":
      case "callout":
        return [];
    }
  });
}

export function popLabel(hunt: HuntState, juice: Juice): Label | null {
  let pop = juice.pop;
  if (pop === null || hunt.phase.kind !== "result") {
    return null;
  }
  let style = POP_STYLE[pop.tone];
  let size = pop.text.length > LONG_LINE ? Math.min(style.size, LONG_LINE_SIZE) : style.size;
  let age = Math.max(0, juice.nowMs - pop.startMs);
  let rise = Math.min(POP_RISE_MAX, (TUNING.juice.popRisePxPerSec * age) / 1000);
  let half = (pop.text.length * size) / 2;
  let x = half >= 88 ? 90 : Math.min(178 - half, Math.max(2 + half, pop.at.x));
  let at = { x, y: pop.at.y - POP_LIFT - size - rise };
  return { ...label("pop", pop.text, at, size, style.color, "center"), testID: "shotResult" };
}
