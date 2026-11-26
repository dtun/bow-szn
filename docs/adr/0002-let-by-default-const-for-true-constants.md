# ADR-0002: let by default, const only for true constants

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

JavaScript's `const` prevents _reassignment_, not _mutation_: `const items = []; items.push(1)` is legal. Under the ecosystem-standard `prefer-const`, seeing `const` therefore tells the reader nothing about whether the value changes. This repo inverts that norm, which makes the convention look like an oversight to fix. It isn't.

## Decision

Declaration keywords signal **mutability of the value**, not reassignment of the binding:

- `let` for anything that changes, by reassignment _or_ mutation, even when the reference never changes.
- `const` only for true constants, so it reads as "never changes, in any sense."
- Functions use the `function` keyword. Assigning arrows or function expressions to variables needs a stated technical reason.

```typescript
let items: number[] = [];
const WORLD_W = 180;
function tick(state: HuntState): HuntState {}
```

`items` is mutated, so it is `let` even though it is never reassigned. `WORLD_W` is a true constant. `tick` is a declaration, never `const tick = (state) => {}`.

## Enforcement

`eslint.config.js` sets `func-style: ["error", "declaration"]` and disables `prefer-const`. Never re-enable it or apply its autofix. The let-for-mutated-values rule isn't machine-checkable; it lives in `AGENTS.md`.

## Consequences

- `const` becomes a strong claim readers can trust.
- Copied snippets and generated code arrive `const`-heavy and need adjusting.
- The shared contract in `packages/core/src/types.ts` declares its world dimensions with `const` because they are true constants.
