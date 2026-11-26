import { SPOTS } from "@bow-szn/core";

import type { StoreShot } from "./store-shot.ts";

export function huntFlowFor({ config, swipe }: StoreShot): string {
  let query = new URLSearchParams({
    seed: String(config.seed),
    spot: config.spot,
    season: config.season,
    difficulty: config.difficulty,
  });
  return `appId: host.exp.Exponent
---
- runFlow:
    when:
      visible:
        id: huntScreen
    commands:
      - tapOn:
          id: mapBtn
      - extendedWaitUntil:
          visible:
            id: mapScreen
          timeout: 10000
- openLink: \${METRO_URL || 'exp://127.0.0.1:8081'}/--/hunt?${query}
- extendedWaitUntil:
    visible:
      id: huntScreen
    timeout: 10000
- extendedWaitUntil:
    notVisible:
      id: mapScreen
    timeout: 5000
- takeScreenshot: 03-hunt
- extendedWaitUntil:
    notVisible: ${SPOTS[config.spot].name}
    timeout: 10000
- swipe:
    start: ${swipe.start.x}, ${swipe.start.y}
    end: ${swipe.end.x}, ${swipe.end.y}
    duration: ${swipe.durationMs}
- extendedWaitUntil:
    visible:
      id: harvestCard
    timeout: 5000
`;
}
