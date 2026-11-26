import { HUNTER_POS, TUNING } from "@bow-szn/core";

import { huntConfigFor } from "../src/features/hunt/hunt-config.ts";
import { findStanding, pullForRange } from "../src/features/hunt/test-support/standing-doe.ts";
import { worldScale } from "../src/features/hunt/world-scale.ts";

const SCREEN_PT = { width: 440, height: 956 };

const LONG_GRAZE_SHARE = 0.9;

const SWIPE_MS = 1000;

const PAN_SLOP_PT = 10;

let longestBuckGrazeMs = TUNING.animals.grazeMs[1] * TUNING.animals.buckGrazeScale;
let buck = findStanding(
  {},
  (animal) => animal.species === "whitetail" && animal.antlers.kind === "rack",
  longestBuckGrazeMs * LONG_GRAZE_SHARE
);
let hunt = huntConfigFor({ seed: String(buck.seed) }, 0);
let query = new URLSearchParams({
  seed: String(hunt.seed),
  spot: hunt.spot,
  season: hunt.season,
  difficulty: hunt.difficulty,
});
let scale = worldScale(SCREEN_PT.width, SCREEN_PT.height);
let pullPt = pullForRange(HUNTER_POS.y - buck.pos.y) * scale;
let dragPt = Math.round(pullPt + PAN_SLOP_PT);
let x = SCREEN_PT.width / 2;
let fromY = Math.round((SCREEN_PT.height - dragPt) / 2);
let toY = fromY + dragPt;

console.log(`appId: host.exp.Exponent
---
- openLink: \${METRO_URL || 'exp://127.0.0.1:8081'}/--/hunt?${query}
- assertVisible:
    id: huntScreen
- takeScreenshot: 03-hunt
- swipe:
    start: ${x}, ${fromY}
    end: ${x}, ${toY}
    duration: ${SWIPE_MS}`);
