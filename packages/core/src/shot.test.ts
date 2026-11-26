import {
  HUNTER_POS,
  huntReducer,
  type Animal,
  type Difficulty,
  type HuntState,
  type ShotOutcome,
} from "./index";
import { CONFIG, DOE, huntWith, play, shootAt } from "./test-support/hunt-scenario";

function untilLanded(state: HuntState): HuntState {
  let next = state;
  while (next.phase.kind === "flight") {
    next = huntReducer(next, { type: "tick", dtMs: 5 });
  }
  return next;
}

const BUCK: Animal = { ...DOE, id: 2, antlers: { kind: "rack", points: 8 } };

function beside(animal: Animal, dx: number): Animal {
  return { ...animal, pos: { x: DOE.pos.x + dx, y: DOE.pos.y } };
}

function shotOn(animals: Animal[], landingDx: number, difficulty: Difficulty = "medium") {
  let landing = { x: DOE.pos.x + landingDx, y: DOE.pos.y };
  return untilLanded(
    play(huntWith(animals, { ...CONFIG, difficulty }), shootAt(landing).slice(0, 3))
  );
}

function outcomeOf(animals: Animal[], landingDx: number, difficulty?: Difficulty): string {
  let after = shotOn(animals, landingDx, difficulty);
  let outcome: ShotOutcome | null = after.phase.kind === "result" ? after.phase.outcome : null;
  if (outcome?.kind === "miss") {
    return outcome.near ? "close" : "whiff";
  }
  return outcome?.kind ?? "none";
}

function modeAfter(animals: Animal[], landingDx: number, id: number, difficulty?: Difficulty) {
  return shotOn(animals, landingDx, difficulty).animals.find((animal) => animal.id === id)?.mode;
}

describe("hit zones", () => {
  test("difficulty grows or shrinks the hit zone", () => {
    expect(outcomeOf([DOE], 6.5, "medium")).toBe("harvest");
    expect(outcomeOf([DOE], 6.5, "hard")).toBe("close");
    expect(outcomeOf([DOE], 8, "easy")).toBe("harvest");
    expect(outcomeOf([DOE], 8, "medium")).toBe("close");
  });

  test("a buck's hit zone is tighter than a doe's", () => {
    expect(outcomeOf([DOE], 6)).toBe("harvest");
    expect(outcomeOf([{ ...BUCK, pos: DOE.pos }], 6)).toBe("close");
  });

  test("outside twice the hit zone is a whiff", () => {
    expect(outcomeOf([DOE], 13.5)).toBe("close");
    expect(outcomeOf([DOE], 14.5)).toBe("whiff");
  });
});

describe("spooking on landing", () => {
  test("a close miss sends that animal running away from the arrow", () => {
    expect(modeAfter([DOE], 10, DOE.id)).toEqual({ kind: "flee", dir: { x: -1, y: 0 } });
  });

  test("a landing spooks animals inside their spook radius and leaves the rest grazing", () => {
    let spooked = beside({ ...DOE, id: 2 }, 20);
    let calm = beside({ ...DOE, id: 3 }, -40);
    expect(modeAfter([spooked, calm], 0, 2)).toEqual({ kind: "flee", dir: { x: 1, y: 0 } });
    expect(modeAfter([spooked, calm], 0, 3)).toEqual(calm.mode);
  });

  test("bucks spook from half again as far as does", () => {
    let buck = beside(BUCK, 30);
    let doe = beside({ ...DOE, id: 3 }, -30);
    expect(modeAfter([buck, doe], 0, buck.id)?.kind).toBe("flee");
    expect(modeAfter([buck, doe], 0, doe.id)?.kind).toBe("graze");
  });

  test("harder levels make game warier", () => {
    let near = beside({ ...DOE, id: 2 }, 24);
    let far = beside({ ...DOE, id: 2 }, 30);
    expect(modeAfter([near], 0, 2, "medium")?.kind).toBe("flee");
    expect(modeAfter([near], 0, 2, "easy")?.kind).toBe("graze");
    expect(modeAfter([far], 0, 2, "hard")?.kind).toBe("flee");
    expect(modeAfter([far], 0, 2, "medium")?.kind).toBe("graze");
  });

  test("a harvest downs the struck animal and still spooks the ones nearby", () => {
    let neighbor = beside({ ...DOE, id: 2 }, 15);
    expect(modeAfter([DOE, neighbor], 0, DOE.id)).toEqual({ kind: "down" });
    expect(modeAfter([DOE, neighbor], 0, 2)?.kind).toBe("flee");
  });
});

describe("spooking on the draw", () => {
  function nearStand(id: number, dy: number, base: Animal = DOE): Animal {
    return { ...base, id, pos: { x: HUNTER_POS.x, y: HUNTER_POS.y - dy } };
  }

  test("starting a draw alerts animals within half their spook radius of the stand", () => {
    let close = nearStand(1, 10);
    let clear = nearStand(2, 20);
    let buck = nearStand(3, 16, BUCK);
    let after = huntReducer(huntWith([close, clear, buck]), { type: "draw-start" });
    expect(after.animals.map((animal) => animal.mode.kind)).toEqual(["alert", "graze", "alert"]);
  });

  test("a fleeing animal keeps running when the draw starts", () => {
    let fleeing: Animal = { ...nearStand(1, 5), mode: { kind: "flee", dir: { x: 1, y: 0 } } };
    let after = huntReducer(huntWith([fleeing]), { type: "draw-start" });
    expect(after.animals[0].mode).toEqual(fleeing.mode);
  });
});
