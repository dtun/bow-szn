# @bow-szn/pixels

All of Bow Season's art as data. The game draws it with Skia and the brand generator writes it to PNG files, so both come from the same grids.

## Shape

- `Palette` maps one character to a `#rrggbb` color. `PALETTE` is the only palette. `.` is transparent and never has a color.
- `Sprite` is `{ name; w; h; rows }`. Each row is a string `w` characters wide, one character per pixel.
- `SPRITES` is a `Record<SpriteId, Sprite>`. `SpriteId` is a string-literal union, so a missing sprite is a type error.
- `rasterize(sprite, palette, scale)` returns `{ width; height; rgba }` with nearest-neighbor scaling.

## Frames

Frames name the sprites an animated thing cycles through, so the renderer never builds an id by hand.

- `HUNTER_FRAMES` holds `idle` and `draw`.
- `ANIMAL_FRAMES[kind]` holds `walk` (two frames), `graze`, and `flee`. The kinds are `doe`, `spike`, `buck-small`, `buck-medium`, `buck-large`, `elk-cow`, `elk-bull`, `turkey`, and `rabbit`.
- `whitetailKind(antlers)` picks the kind for a whitetail: no antlers is a doe, a spike is a spike, and a rack of 4-6, 7-9, or 10-12 points is a small, medium, or large buck.
- `FX_FRAMES` holds the `dirtPuff` and `glint` frames and the `confetti` pieces.
- `WIND_FLAG_FRAMES` runs from a light wind to a strong one.
- `MOUNT_FRAMES` maps a buck size or the elk bull to its trophy-room mount.

## Conventions

- Animals face right. The renderer mirrors a sprite when an animal faces left.
- A sprite is anchored by its bottom-center: the feet of an animal or the base of a prop sit on the last row. Every sprite paints its first and last row, so nothing floats.
- All poses of one animal kind share a width, so switching frames never shifts the anchor.
- Antlers use the bone colors `A` and `a`. Does and cows have none, spikes have two straight tines, and each larger rack adds tines and height.
- Tests check every sprite as an invariant: row count, row width, and palette membership.
- Snapshot tests print every sprite as its rows, so a change to the art shows up as a visual diff in review.

## Entries

- `@bow-szn/pixels` is pure TypeScript with no Node APIs. The app imports it.
- `@bow-szn/pixels/png` holds `encodePng` and needs `node:zlib`. Only Node scripts and tests import it.
- Imports inside the package carry explicit `.ts` extensions so Node can run the scripts without a build step.

## Brand assets

`npm run brand` in this package, or `node packages/pixels/scripts/generate-brand.ts` from the repo root, composes the scenes in `src/brand.ts` and writes them to `apps/mobile/assets/brand/`.

| File                      | Size      | Color type    |
| ------------------------- | --------- | ------------- |
| `icon.png`                | 1024x1024 | RGB, no alpha |
| `splash.png`              | 1024x1024 | RGB           |
| `adaptive-foreground.png` | 1024x1024 | RGBA          |
| `adaptive-background.png` | 1024x1024 | RGB           |
| `favicon.png`             | 48x48     | RGB           |

Never edit the PNGs by hand. A snapshot test fails when a committed PNG no longer matches what the sprites render.

The same script writes a labeled contact sheet of every sprite at 6x. It goes to `$CONTACT_SHEET_PATH`, or to the system temp folder when that is unset, and it is not committed.
