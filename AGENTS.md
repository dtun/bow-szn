# Bow Season Development Guide

Bow Season is an 8-bit bow-hunting game for iOS, built with Expo. Draw the bow by dragging, release to shoot, and fill the journal.

## JavaScript Variable and Function Declarations

Enforced by ESLint (`func-style`, `prefer-const` off); rationale in `docs/adr/0002-let-by-default-const-for-true-constants.md`. What the linter can't check:

- `let` by default; `const` only for true constants (`WORLD_W`, lookup tables that never change).
- Mutation counts as change: a value that gets pushed to or has properties written is `let`, even if never reassigned.
- Use the `function` keyword; assigning an arrow function to a variable needs approval and a stated reason.
- Module-level objects that never change, such as `StyleSheet.create(...)` results and lookup tables, are true constants.
- Double quotes, semicolons, 100 columns. Prettier enforces all three.

## No Comments

Source files carry no comments. The lint rule `bow/no-comments` (an inline plugin in `eslint.config.js`) fails any comment in any `js`, `jsx`, `ts`, `tsx`, `mjs`, or `cjs` file, config files included. It also bans `eslint-disable`, `@ts-ignore`, and `@ts-expect-error`. Fix the code instead of silencing the tool.

When a why is worth keeping, encode it in a name, a type, or a test. A decision that spans files goes in an ADR under `docs/adr/`. Rationale in `docs/adr/0003-no-code-comments.md`.

## Architecture

The repo splits game logic from presentation. The rationale is in `docs/adr/0001-pure-core-skia-render.md`.

- **`packages/core`** (`@bow-szn/core`) is pure TypeScript game logic. It never imports React, React Native, Expo, Skia, or the app. State changes go through reducers shaped `(state, event) => state`. Time arrives as `dtMs` on a `tick` event, randomness is a seed carried in state, and nothing in core reads a clock or calls `Math.random`.
- **`apps/mobile`** (`@bow-szn/mobile`) renders and handles input. It drives the frame loop, turns touches into events, and draws state with Skia. It holds no game rules.
- **`packages/core/src/types.ts`** is the shared contract: the world is a 180x320 logical portrait field in world pixels, and every type the two sides exchange lives there. Change it deliberately, in its own commit.

The core ships as source. `main` and `types` point at `src/index.ts`, and there is no build step. Metro and Jest compile it directly.

### Mobile layout

Every kind of code has one home. Create a folder when you first put a file in it. Do not add placeholder files.

| Path                                  | Holds                                                              |
| ------------------------------------- | ------------------------------------------------------------------ |
| `apps/mobile/app/`                    | Expo Router routes. Thin: a route imports a screen and exports it. |
| `apps/mobile/src/features/<feature>/` | One folder per feature: `title`, `map`, `prep`, `hunt`, `journal`. |
| `apps/mobile/src/ui/`                 | Shared UI primitives and the theme.                                |
| `apps/mobile/src/art/`                | Pixel art and sprites.                                             |
| `apps/mobile/src/platform/`           | Device adapters: storage, haptics, audio.                          |
| `apps/mobile/src/__integration__/`    | Multi-screen flows through the real router.                        |
| `apps/mobile/__mocks__/`              | Jest manual mocks for packages.                                    |

The `@/*` alias maps to `apps/mobile/src/*`. Import with `@/features/title/title-screen`, not a relative path out of a folder.

The journal is the one feature others call. Import `JournalProvider` and `useJournal` from `@/features/journal`. `useJournal()` returns `{ journal, record(harvest), mount(harvestId) }`: the hunt calls `record` when a harvest happens and `mount` from the harvest card. Both are idempotent and save to the device.

### Dependency direction

```
app -> features -> ui, art, platform -> @bow-szn/core
```

- A route in `app/` imports a feature's screen and nothing else.
- A feature imports `ui`, `art`, `platform`, and `@bow-szn/core`. A feature does not import another feature's internals.
- `ui`, `art`, and `platform` never import a feature. ESLint enforces this with `no-restricted-imports`.
- `@bow-szn/core` imports nothing from the app, React, React Native, Expo, or Skia. ESLint enforces this with `no-restricted-imports`.

## Development Workflow

### Code Quality Checks

Before committing code, run the vibecheck script in each workspace you touched:

```bash
cd packages/core && npm run vibecheck
cd apps/mobile && npm run vibecheck
```

This script runs the following checks in order:

1. **Lint** (`lint`) - Checks code quality with ESLint
2. **Type check** (`typecheck`) - Validates TypeScript types
3. **Test** (`test:all` in `apps/mobile`, `test` in `packages/core`) - Runs every test tier

Formatting is handled automatically by a PostToolUse hook that runs Prettier after every Write/Edit operation (configured in `.claude/settings.json`). From the root, `npm run format` rewrites everything and `npm run format:check` verifies it.

Individual scripts (run from a workspace):

- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run test` - Run tests (in `apps/mobile`: unit, ui, and integration)
- `npm run test:snapshot` and `npm run test:all` - Run snapshot tests, or every tier (`apps/mobile` only)

### Monorepo Structure

This project uses npm workspaces. The root `package.json` defines workspaces at `apps/*` and `packages/*`.

- **`apps/mobile/`** - Expo React Native app (`@bow-szn/mobile`)
- **`packages/core/`** - Pure game logic and the shared contract (`@bow-szn/core`)

Shared devDeps (prettier, eslint and its configs, husky, commitlint) live at the root. Workspace-specific deps live in each workspace. One `package-lock.json` at the root covers both.

The native `ios/` and `android/` folders are generated by Expo prebuild and ignored. Change native config in `apps/mobile/app.json`, not in those folders.

### Running the App

From `apps/mobile`:

- `npm run start` starts the Expo dev server. Press `i` for the iOS simulator.
- `npm run ios` builds and runs the native iOS app.

Simulator sound plays through the Mac's speakers. Start Metro with `EXPO_PUBLIC_SFX=off npx expo start` for any simulator or Maestro run on a shared machine. The sound-effects adapter then skips every playback, and the switch is read when Metro bundles, so restart Metro to change it.

To run the e2e flow: `npm run sim:prepare <udid>` (hides Expo Go's tools button, which covers the top-right corner, and skips its first-run sheet), start Metro with `EXPO_PUBLIC_SFX=off`, then `JAVA_HOME=$(brew --prefix openjdk) maestro --device <udid> test -e METRO_URL=exp://127.0.0.1:<port> e2e/hunt.yaml` from `apps/mobile`.

npm 12 blocks dependency install scripts until they are approved, and the install script of `@shopify/react-native-skia` is blocked on a fresh `npm install`. Approve it with `npm install-scripts approve @shopify/react-native-skia` so it runs before a native build.

### Store listing and screenshots

From `apps/mobile`:

- `npm run store:check` checks `store.config.json` against the App Store's length limits and fetches every URL in it.
- `npm run store:screenshots` replaces the en-US screenshots on the app's editable App Store Connect version with the PNGs in `store/screenshots/`. Add `-- --dry-run` to print the plan and change nothing.

Each folder under `store/screenshots/` holds PNGs named `NN-name.png`, and the numbers set the order. The folder name picks the App Store display type and the exact size. `iphone-6.9` holds 1320x2868 PNGs for `APP_IPHONE_67`. To support another size, add a row to the table in `scripts/store-screenshots/display-types.ts`. The script checks every PNG's size, name, and count before it contacts Apple. `--dir <folder>` reads screenshots from another folder.

Running the command twice leaves the same screenshots in the same order. The script keeps the leading screenshots whose name, size, and checksum match and replaces the rest, so a changed screenshot also replaces the ones after it. A run that stops partway resumes when you run it again.

Apple's sign-in fails on Node 26 and later, so the script refuses to run there. Run `fnm exec --using=22 npm run store:screenshots`. In a terminal, the script restores the saved Apple session from `~/.app-store/auth/` and falls back to a password and 2FA prompt. Without a terminal it only restores the session, and it stops with a message when none is saved. Set `EXPO_APPLE_ID` to the Apple ID, or let the script prompt for it in a terminal. Set `EXPO_APPLE_TEAM_ID` to choose a team. Keep the Apple ID out of the repo.

### Testing

This project uses **Jest** as the testing framework (not Vitest). Rationale for the tiers in `docs/adr/0004-test-tiers.md`.

The file suffix picks the tier.

| Tier        | Suffix                                      | Location                                         | Asserts                                                                                      | Must not                                          |
| ----------- | ------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| unit        | `*.test.ts`                                 | Next to the code                                 | Pure logic: state out for events in                                                          | Render, or touch the router                       |
| ui          | `*.test.tsx`                                | Next to the component                            | One screen or component, driven like a user                                                  | Cross screens, or use a snapshot                  |
| integration | `*.integration.test.tsx`                    | `apps/mobile/src/__integration__/`               | Flows through the real router via `renderRouter`                                             | Use a snapshot, or reach into component internals |
| snapshot    | `*.snapshot.test.ts`, `*.snapshot.test.tsx` | Next to the code, with a `__snapshots__/` folder | Visual regressions: sprite pixel grids, generated assets                                     | Stand in for a ui or integration test             |
| e2e         | Maestro `*.yaml`                            | `apps/mobile/e2e/`                               | Flows against Expo Go on a simulator: `hunt.yaml` walks title, map, prep, one shot, and MAP. | Run in Jest                                       |

- `packages/core` runs Jest with `ts-jest`. Its tests are all unit tier.
- `apps/mobile` runs Jest `projects` named `unit`, `ui`, `integration`, and `snapshot` from `apps/mobile/jest.config.js`, using the `jest-expo` preset and `@testing-library/react-native`. Setup lives in `apps/mobile/jest.setup.js`. The unit project also runs `*.test.ts` files under `apps/mobile/scripts/`.
- `npm test` runs unit, ui, and integration. `npm run test:snapshot` runs snapshots. `npm run test:all` runs everything. Each project's files list with `npx jest --listTests --selectProjects <name>`.
- Drive a ui test like a user (press, type) and assert what is on screen with `toBeOnTheScreen()`, `not.toBeOnTheScreen()`, and `toHaveTextContent()`. `jest/no-restricted-matchers` bans `toBeTruthy`, `toBeFalsy`, `toBeDefined`, `toBeUndefined`, and the snapshot matchers outside `*.snapshot.test.{ts,tsx}`.
- Never put a test file under `apps/mobile/app/`: Expo Router would treat it as a route.
- Test core logic by feeding events to a reducer and asserting on the resulting state.

**Mock Structure:**

- External package mocks: `apps/mobile/__mocks__/package-name.ts`
- Scoped package mocks: `apps/mobile/__mocks__/@scope/package-name.ts`
- Local module mocks: `apps/mobile/src/path/__mocks__/module.ts`

A mock applies once `jest.setup.js` calls `jest.mock("package-name")` for it. `@shopify/react-native-skia` is mocked that way: `Canvas` renders a plain `View` and the drawing primitives render their children, so a screen that draws a canvas renders in tests. Extend the mock when a feature needs more of Skia.

**testIDs:** every screen carries a root `testID` in camelCase ending in `Screen` (the title screen is `titleScreen`). Every tappable element carries a camelCase, role-suffixed one (`playBtn`). Repeated elements use a template keyed by something stable (`journalEntry-${harvestId}`). Write ids as literals at the call site. Ids name the element's purpose, so they never change when copy changes.

### Code Formatting

This project uses Prettier for consistent code formatting:

- Double quotes for strings
- Semicolons at end of statements
- ES5 trailing commas
- 100 character line width
- 2-space indentation

The format is enforced through Prettier configuration (`.prettierrc.json`).

### Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint in a husky `commit-msg` hook. All commits must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Each commit is structural or behavioral, never both. A structural commit (`refactor:`) leaves behavior unchanged and leaves existing tests untouched and green. A behavioral commit changes what the code does and carries the tests that prove it. When a change is awkward, tidy first in its own structural commit, then make the change.

Commits are small and single-purpose. Each one leaves `npm run vibecheck` green in the workspaces it touches. Push each commit on its own so each gets its own CI run, and run `git fetch origin && git rebase origin/main` before every push. Never force-push.
