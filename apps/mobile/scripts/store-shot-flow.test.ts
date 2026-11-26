import { huntFlowFor } from "./store-shot-flow";
import type { StoreShot } from "./store-shot";

let shot: StoreShot = {
  config: { spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 4242 },
  target: { x: 90, y: 220 },
  swipe: { start: { x: 220, y: 443 }, end: { x: 220, y: 513 }, durationMs: 500 },
  slackMs: 2000,
};

let flow = huntFlowFor(shot);

test("opens the planned hunt through the Expo Go link", () => {
  expect(flow).toContain(
    "- openLink: ${METRO_URL || 'exp://127.0.0.1:8081'}/--/hunt?seed=4242&spot=cedar-hollow&season=early&difficulty=easy"
  );
});

test("swipes the planned drag for the planned time", () => {
  expect(flow).toContain("start: 220, 443\n    end: 220, 513\n    duration: 500");
});

test("waits for the spot title to clear before it swipes, and for the card after", () => {
  let order = [
    flow.indexOf("notVisible: CEDAR HOLLOW"),
    flow.indexOf("- swipe:"),
    flow.indexOf("id: harvestCard"),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(order.every((at) => at > 0)).toBe(true);
});

test("takes the field shot only after the map has slid away", () => {
  expect(flow.indexOf("id: mapScreen\n    timeout: 5000")).toBeLessThan(
    flow.indexOf("takeScreenshot: 03-hunt")
  );
});

test("leaves a hunt that is still open before it opens the link again", () => {
  expect(flow.indexOf("id: huntScreen\n    commands:")).toBeLessThan(flow.indexOf("- openLink:"));
  expect(flow).toContain("- tapOn:\n          id: mapBtn");
});
