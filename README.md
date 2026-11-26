# Bow Season

An 8-bit bow-hunting game for iOS, built with Expo.

## Quick Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the mobile app

   ```bash
   cd apps/mobile
   npm run start
   ```

   Press `i` to open the iOS simulator.

## Project Structure

This is an npm workspaces monorepo:

- `apps/mobile/` - Expo React Native app that renders the game with Skia and handles input
- `packages/core/` - pure TypeScript game logic and the shared contract

## Development

Run lint, typecheck, and tests in each workspace you touched before committing:

```bash
cd packages/core && npm run vibecheck
cd apps/mobile && npm run vibecheck
```

See [AGENTS.md](AGENTS.md) for coding conventions and architecture, and `docs/adr/` for the decisions behind them.
