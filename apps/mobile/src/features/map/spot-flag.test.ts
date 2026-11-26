import { PALETTE, rasterize } from "@bow-szn/pixels";

import { FLAG_IDLE, FLAG_PICKED } from "./spot-flag";

test.each([FLAG_IDLE, FLAG_PICKED])(
  "$name is a clean grid that draws with the shared palette",
  (flag) => {
    expect(flag.rows.every((row) => row.length === flag.w)).toBe(true);
    expect(flag.rows).toHaveLength(flag.h);
    expect(() => rasterize(flag, PALETTE, 1)).not.toThrow();
  }
);

test("a chosen flag is a different color from the others", () => {
  expect(FLAG_IDLE.rows[0]).toBe("ERRRR...");
  expect(FLAG_PICKED.rows[0]).toBe("WYYYY...");
});
