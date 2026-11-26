# ADR-0001: Pure reducer core, Skia rendering on a 180x320 logical world

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

Bow Season is an iOS-first 8-bit hunting game. Its rules (animal behavior, wind, aim, shot resolution, the prep minigame, the journal) are the part most likely to be wrong and the part most worth testing. Its presentation (a canvas, touch input, haptics, audio) is the part that has to run on a device. If the two are written together, every rule change needs a simulator and every test needs a renderer.

Several people and agents will build features in parallel, so the seams between rules and presentation have to be explicit and cheap to code against.

## Decision

Game logic lives in `packages/core` as pure reducers. Presentation lives in `apps/mobile`.

- **Core is pure TypeScript.** It imports no React, React Native, Expo, or Skia. State changes are `(state, event) => state`. `HuntState` advances through `HuntEvent` (`tick`, `draw-start`, `draw-move`, `release`, `cancel`, `dismiss`), and the prep minigame advances through `PrepEvent`.
- **Time and randomness are inputs.** Time arrives as `dtMs` on a `tick` event. Randomness is a seed carried in state (`HuntConfig.seed`, `HuntState.rng`). Core reads no clock and calls no `Math.random`, so a hunt replays exactly from its seed and event list.
- **Derived values are not stored.** `Aim` is computed from the draw's pull vector each time it is needed.
- **The world is 180x320 logical pixels**, a 9:16 portrait field with the origin at the top left. Art is authored at one world pixel per art pixel. The renderer scales the world uniformly to fit the screen and draws without smoothing, so pixels stay crisp.
- **Input crosses the boundary in world units.** The app converts a touch's screen position to world pixels before it builds an event. Core never sees screen coordinates or the scale factor.
- **Skia renders.** `apps/mobile` draws the current state in a `@shopify/react-native-skia` `<Canvas>` and owns the frame loop that dispatches `tick`. It holds no game rules.
- **The contract is one file.** `packages/core/src/types.ts` defines the world constants and every type that crosses the boundary. The core ships as source with no build step.

## Consequences

- Rules are tested by feeding events to a reducer and asserting on state, with no renderer, simulator, or fake timers.
- Features split cleanly by file: a rule change touches core, a visual change touches mobile, and `types.ts` is the only shared edit.
- A hunt is reproducible from `(config, events)`, which makes bug reports and balance work replayable.
- The renderer is replaceable. Nothing in core knows Skia exists.
- Every frame allocates a new state through the reducer. The state is small, so this is accepted until a measurement says otherwise.
- Skia's version is tied to the Expo SDK. Upgrading the SDK means upgrading Skia with it.
