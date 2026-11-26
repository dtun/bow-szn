# ADR-0004: Test tiers selected by file suffix

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

One undifferentiated test suite makes failures hard to read. A broken reducer, a broken screen, a broken navigation flow, and a changed sprite all look like "tests failed". Snapshot tests make it worse when they stand in for behavior: a snapshot passes until anything changes, then gets regenerated without anyone deciding the change was right.

Hollow assertions have the same flaw. React Native Testing Library's `getBy*` queries already throw when nothing matches, so `expect(getByText("x")).toBeTruthy()` cannot fail on its own.

## Decision

Tests fall into five tiers. The file suffix picks the tier, so a tier is a glob, never a convention to remember.

| Tier        | Suffix                                     | Location                           | Asserts                                             |
| ----------- | ------------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| unit        | `*.test.ts`                                | next to the code                   | Pure logic: state out for events in. No rendering.  |
| ui          | `*.test.tsx`                               | next to the component              | One screen or component, driven like a user.        |
| integration | `*.integration.test.tsx`                   | `apps/mobile/src/__integration__`  | Multi-screen flows through the real router.         |
| snapshot    | `*.snapshot.test.ts`, `.snapshot.test.tsx` | next to the code, `__snapshots__/` | Visual regressions: sprite grids, generated assets. |
| e2e         | Maestro `*.yaml`                           | `apps/mobile/e2e`                  | Flows against a simulator build. Later wave.        |

- `apps/mobile` runs Jest `projects` named `unit`, `ui`, `integration`, and `snapshot`, each with its own `testMatch`. The `ui` project ignores `.integration.` and `.snapshot.` files, so every `.tsx` test lands in exactly one tier.
- `npm test` runs unit, ui, and integration. `npm run test:snapshot` runs snapshots. `npm run test:all` runs everything and backs `vibecheck`.
- CI runs `test-core`, `test-mobile`, and `test-mobile-snapshot` as separate jobs. A red snapshot job reads as a visual change, and a red behavior job reads as a broken behavior.
- ESLint restricts the matchers. In every test file, `jest/no-restricted-matchers` bans the hollow matchers (`toBeTruthy`, `toBeFalsy`, `toBeDefined`, `toBeUndefined`, and their `not.` forms) and the snapshot matchers. A later config block for `*.snapshot.test.{ts,tsx}` re-declares the rule with only the hollow matchers, because flat config replaces rule options instead of merging them.
- Existence assertions use `toBeOnTheScreen()` or `not.toBeOnTheScreen()`. Content assertions use `toHaveTextContent` or an exact matcher on the value the contract promises.
- Snapshots never stand in for ui or integration tests. A snapshot of a rendered tree is allowed only as a visual-regression check beside real behavior tests.

## Consequences

- A failing tier names the kind of break. Behavior, flow, and visual changes are reviewed separately.
- Adding a tier-shaped test needs no config change. Name the file correctly and it runs.
- The `snapshot` project may hold no tests, so its script passes with no tests. No placeholder snapshot is committed.
- Core tests stay unit-only. Core does not render, so it has no ui, integration, or snapshot tier.
