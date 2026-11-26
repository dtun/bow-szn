import { huntReducer, type HuntState } from "./index";
import { DOE, huntWith, play, shootAt } from "./test-support/hunt-scenario";

const SIX_AM = 6 * 60;
const TEN_AM = 10 * 60;
const MORNING_MS = (TEN_AM - SIX_AM) * 1000;

function tick(state: HuntState, dtMs: number): HuntState {
  return huntReducer(state, { type: "tick", dtMs });
}

describe("the clock", () => {
  test("runs one game minute per real second from 6:00 AM", () => {
    expect(tick(huntWith([]), 3000).clockMin).toBe(SIX_AM + 3);
  });

  test("the clock ending at 10:00 produces over: dusk", () => {
    let justBefore = tick(huntWith([]), MORNING_MS - 5);
    let atTen = tick(justBefore, 5);
    expect(justBefore.phase).toEqual({ kind: "ready" });
    expect(atTen.phase).toEqual({ kind: "over", reason: "dusk" });
    expect(atTen.clockMin).toBe(TEN_AM);
  });

  test("a draw still held at 10:00 ends at dusk", () => {
    let drawing = huntReducer(tick(huntWith([]), MORNING_MS - 1000), { type: "draw-start" });
    expect(tick(drawing, 1000).phase).toEqual({ kind: "over", reason: "dusk" });
  });

  test("an arrow in the air at 10:00 still lands, and its card closes the hunt", () => {
    let late = tick(huntWith([DOE]), MORNING_MS - 100);
    let landed = play(late, shootAt(DOE.pos));
    let closed = huntReducer(landed, { type: "dismiss" });
    expect(landed.phase.kind).toBe("result");
    expect(landed.clockMin).toBe(TEN_AM);
    expect(closed.phase).toEqual({ kind: "over", reason: "dusk" });
  });
});

describe("the quiver", () => {
  test("dismissing the last arrow's card ends the hunt with an empty quiver", () => {
    let lastArrow = { ...huntWith([DOE]), arrows: 1 };
    let after = play(lastArrow, [...shootAt({ x: 90, y: 240 }), { type: "dismiss" }]);
    expect(after.arrows).toBe(0);
    expect(after.phase).toEqual({ kind: "over", reason: "quiver-empty" });
  });

  test("an ended hunt ignores ticks and draws", () => {
    let over = tick(huntWith([DOE]), MORNING_MS);
    expect(tick(over, 1000)).toBe(over);
    expect(huntReducer(over, { type: "draw-start" })).toBe(over);
  });
});
