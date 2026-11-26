import { createPrep, type PrepState } from "@bow-szn/core";

import { prepMessage } from "./prep-message";

function prepWith(changes: Partial<PrepState>): PrepState {
  return { ...createPrep("easy", 1), ...changes };
}

test("asks for the first arrow before anything is shot", () => {
  expect(prepMessage(prepWith({}))).toBe("TAP TO LOOSE!");
});

test("calls an arrow outside the gold a flier", () => {
  expect(prepMessage(prepWith({ lastTap: "slip", hits: 1 }))).toBe("FLIER!");
});

test("cheers the first arrow in the gold as a clean shot and the second as grouped", () => {
  expect(prepMessage(prepWith({ lastTap: "hit", hits: 1 }))).toBe("CLEAN SHOT!");
  expect(prepMessage(prepWith({ lastTap: "hit", hits: 2 }))).toBe("GROUPED!");
});

test("says DIALED IN! once the third arrow is in the gold", () => {
  expect(prepMessage(prepWith({ lastTap: "hit", hits: 3 }))).toBe("DIALED IN!");
});

test("never says the old waxing words", () => {
  let said = [
    prepWith({}),
    prepWith({ lastTap: "slip" }),
    prepWith({ lastTap: "hit", hits: 1 }),
    prepWith({ lastTap: "hit", hits: 3 }),
  ].map(prepMessage);

  expect(said.join(" ")).not.toMatch(/WAX|SLIPPED|GREEN/);
});
