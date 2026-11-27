# Store listing and screenshots

Run these from `apps/mobile`.

- `npm run store:check` checks `store.config.json` against the App Store's length limits and fetches every URL in it. It fails on any email address in the config or the fetched pages, except the public support address `support@paperstreetapp.com` (`SUPPORT_EMAIL` in `scripts/store-email.ts`), so a personal address such as the Apple ID stays out of public pages.
- `npm run store:screenshots` replaces the en-US screenshots on the app's editable App Store Connect version with the PNGs in `store/screenshots/`. Add `-- --dry-run` to print the plan and change nothing.

Each folder under `store/screenshots/` holds PNGs named `NN-name.png`, and the numbers set the order. The folder name picks the App Store display type and the exact size. `iphone-6.9` holds 1320x2868 PNGs for `APP_IPHONE_67`. To support another size, add a row to the table in `scripts/store-screenshots/display-types.ts`. The script checks every PNG's size, name, and count before it contacts Apple. `--dir <folder>` reads screenshots from another folder.

Running the command twice leaves the same screenshots in the same order. The script keeps the leading screenshots whose name, size, and checksum match and replaces the rest, so a changed screenshot also replaces the ones after it. A run that stops partway resumes when you run it again.

Apple's sign-in fails on Node 26 and later, so the script refuses to run there. Run `fnm exec --using=22 npm run store:screenshots`. In a terminal, the script restores the saved Apple session from `~/.app-store/auth/` and falls back to a password and 2FA prompt. Without a terminal it only restores the session, and it stops with a message when none is saved. Set `EXPO_APPLE_ID` to the Apple ID, or let the script prompt for it in a terminal. Set `EXPO_APPLE_TEAM_ID` to choose a team. Keep the Apple ID out of the repo.

To retake the `iphone-6.9` set, boot the iPhone 17 Pro Max simulator with Expo Go installed, start Metro with `EXPO_PUBLIC_SFX=off`, put `maestro` on `PATH`, and run `npm run store:capture -- <udid> exp://127.0.0.1:<port>`. It prepares the simulator, clears Expo Go's saved journal, sets a clean status bar, runs `e2e/store-screenshots.yaml`, and writes `01-title.png` through `05-trophy-room.png`. The capture stops with an error unless all five PNGs exist at 1320x2868, so a failed run leaves the previous set untouched.

`npm run store:swipe` prints the hunt sub-flow `store:capture` runs inside a Maestro `retry` of four, and a miss reopens the hunt link on a fresh hunt. Do not edit coordinates. The plan in `scripts/store-shot.ts` picks the first seed whose rack buck stays within the arrow's reach for two seconds either side of the moment the swipe lands, with no other animal near. The flow takes the field shot, waits for the spot title to clear, and swipes. Maestro presses about 3.5 seconds after that wait, and notices the cleared title about a second late. `TITLE_NOTICED_LATE_MS` and `SETTLE_BEFORE_PRESS_MS` hold those two measured delays, so measure them again if Maestro or the machine changes and captures start missing.
