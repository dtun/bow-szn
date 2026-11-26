import { peak } from "./measure.ts";

describe("peak", () => {
  it("finds the largest magnitude whether it swings up or down", () => {
    expect(peak(Float32Array.from([0.25, -0.75, 0.5]))).toBe(0.75);
    expect(peak(Float32Array.from([-0.25, 0.5, 0.375]))).toBe(0.5);
  });

  it("reads silence and no samples as zero", () => {
    expect(peak(new Float32Array(10))).toBe(0);
    expect(peak(new Float32Array(0))).toBe(0);
  });
});
