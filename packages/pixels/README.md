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
- `ANIMAL_FRAMES[kind]` holds `walk` (two frames), `graze`, `flee`, and `down`. The kinds are `doe`, `spike`, `buck-small`, `buck-medium`, `buck-large`, `elk-cow`, `elk-bull`, `turkey`, and `rabbit`.
- `whitetailKind(antlers)` picks the kind for a whitetail: no antlers is a doe, a spike is a spike, and a rack of 4-6, 7-9, or 10-12 points is a small, medium, or large buck.
- `FX_FRAMES` holds the `dirtPuff` and `glint` frames and the `confetti` pieces.
- `WIND_FLAG_FRAMES` runs from a light wind to a strong one.
- `MOUNT_FRAMES` maps a buck size or the elk bull to its trophy-room mount.

## Props

Props are sprites for the menus and the sighting-in range. They follow the same grid and anchor rules as the animals.

- `bale-target` is an 80 by 44 straw bale seen head-on, ragged at the edges and bound by two twine bands. The scene paints the target face over it.
- `bale-arrow` is a practice arrow stuck in the bale. Its bottom-center pixel is where it entered.
- `pushpin` and `pushpin-picked` mark a spot on the plat map. Their needle tip is the bottom-center pixel. `pencil-ring` circles the picked spot. The `pencil-*` clump, tree, peak, reeds, and house sketch a county in graphite and blue pencil.
- `sign-point-left` and `sign-point-right` are 13-pixel-tall arrow tips for a wooden trail sign. The board's body is drawn beside them. `sign-nail` and `sign-knot` dress a board.
- `stamp-frame` is the inked double border of a rubber stamp, 30 by 16, with notched corners and a little wear. The screen sets text inside it.
- `sight-pin` is the swaying aim dot. Its center pixel is red and is the point that counts.
- `qr-site` is a scannable QR code for `QR_SITE_URL`. See the next section.

## QR code

`qr-site` is 37 by 37: a 29-module code inside a 4-module quiet zone. Dark modules are `S` and light modules, quiet zone included, are `C`, so it scans on the wood wall. Draw it at a whole number of pixels per module. Never resample, tint, or crop it.

`QR_SITE_URL` in `src/qr-site-url.ts` is the link the code carries. `npm run qr` in this package encodes it with the `qrcode` dev dependency at error correction level M and writes `src/sprites/qr.ts`. To change the link, edit the constant, run the script, and commit both. Never edit the rows by hand.

Two tests keep the art and the link in step. One regenerates the rows from `QR_SITE_URL` and expects the committed ones. The other draws the sprite at 3 and 4 pixels per module and decodes it with the `jsqr` dev dependency, expecting the link back.

## Conventions

- Animals face right. The renderer mirrors a sprite when an animal faces left.
- A sprite is anchored by its bottom-center: the feet of an animal or the base of a prop sit on the last row. Every sprite paints its first and last row, so nothing floats.
- All poses of one animal kind share a width, so switching frames never shifts the anchor.
- A grazing buck or bull carries its rack on the lowered head, swept back over the neck.
- A `down` animal lies on its side with its legs out. It is shorter than a standing one and paints no blood. A buck keeps its rack.
- Antlers use the bone colors `A` and `a`. Does and cows have none, spikes have two straight tines, and each larger rack adds tines and height.
- Tests check every sprite as an invariant: row count, row width, and palette membership.
- Snapshot tests print every sprite as its rows, so a change to the art shows up as a visual diff in review.

## Entries

- `@bow-szn/pixels` is pure TypeScript with no Node APIs. The app imports it.
- `@bow-szn/pixels/png` holds `encodePng` and needs `node:zlib`. Only Node scripts and tests import it.
- Imports inside the package carry explicit `.ts` extensions so Node can run the scripts without a build step.

## Brand assets

`npm run brand` in this package, or `node packages/pixels/scripts/generate-brand.ts` from the repo root, composes the scenes in `src/brand.ts` and writes them to `apps/mobile/assets/brand/`.

| File                      | Size      | Color type    | Grid          |
| ------------------------- | --------- | ------------- | ------------- |
| `icon.png`                | 1024x1024 | RGB, no alpha | 64 cells, x16 |
| `splash.png`              | 1024x1024 | RGB           | 128 cells, x8 |
| `adaptive-foreground.png` | 1024x1024 | RGBA          | 64 cells, x16 |
| `adaptive-background.png` | 1024x1024 | RGB           | 64 cells, x16 |
| `favicon.png`             | 48x48     | RGB           | 16 cells, x3  |

The icon is a buck at dawn. `src/dawn.ts` paints the backdrop: sky bands stepped from navy to amber with dithered edges, a low sun whose glow rings lift the sky one shade per ring, a far canopy, and a dark knoll. `brand-icon-buck` stands on the knoll inside the sun. Its rack keeps two cells of sun between prongs so it still reads at 60 px. The adaptive background is the backdrop alone and the adaptive foreground is the buck alone in the same place, so the pair stacks into the icon. The splash crops the icon to a cream-ringed badge above the wordmark. The favicon is the same dawn at 16 cells with `brand-icon-buck-mini`.

Never edit the PNGs by hand. A snapshot test fails when a committed PNG no longer matches what the sprites render.

The same script writes a labeled contact sheet of every sprite at 6x. It goes to `$CONTACT_SHEET_PATH`, or to the system temp folder when that is unset, and it is not committed.

## Judging an icon

Judge an icon on a home screen, not as a flat swatch. `npm run icon:homescreen` renders the icon inside the iOS rounded-square mask (corner radius 22.37% of the side), scaled down by area the way the system scales the 1024 file. It writes two PNGs that are not committed:

- `$ICON_HOMESCREEN_PATH` (or `bow-season-icon-homescreen.png` in the system temp folder) shows the icon at 60 px among seven placeholder apps with labels, on a light and a dark wallpaper, then at 120 px and at 40 px (Spotlight).
- The same path ending in `-1024.png` shows the icon at full size inside the mask.

To weigh a redesign, add entries to the `entries` list in `scripts/icon-homescreen.ts` and each one gets its own column.
