import { HUNTER_POS, WORLD_H, WORLD_W } from "./index";

describe("world", () => {
  it("places the hunter inside the logical field", () => {
    expect(HUNTER_POS.x).toBeGreaterThanOrEqual(0);
    expect(HUNTER_POS.x).toBeLessThanOrEqual(WORLD_W);
    expect(HUNTER_POS.y).toBeGreaterThanOrEqual(0);
    expect(HUNTER_POS.y).toBeLessThanOrEqual(WORLD_H);
  });
});
