import { FX_FRAMES, SPRITES } from "./index.ts";

describe("FX_FRAMES", () => {
  it("expands the dirt puff on every frame", () => {
    let widths = FX_FRAMES.dirtPuff.map((id) => SPRITES[id].w);

    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(new Set(widths).size).toBe(widths.length);
  });

  it("swells the glint to its biggest on the middle frame", () => {
    let [first, middle, last] = FX_FRAMES.glint.map((id) => SPRITES[id].w);

    expect(middle).toBeGreaterThan(first);
    expect(middle).toBeGreaterThan(last);
  });

  it("makes confetti two pixels square in four different colors", () => {
    let sprites = FX_FRAMES.confetti.map((id) => SPRITES[id]);

    expect(sprites).toHaveLength(4);
    for (let confetti of sprites) {
      expect([confetti.w, confetti.h]).toEqual([2, 2]);
    }
    expect(new Set(sprites.map((confetti) => confetti.rows[0][0])).size).toBe(4);
  });
});
