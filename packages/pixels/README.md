# @bow-szn/pixels

All of Bow Season's art as data. The game draws it with Skia and the brand generator writes it to PNG files, so both come from the same grids.

## Shape

- `Palette` maps one character to a `#rrggbb` color. `PALETTE` is the only palette. `.` is transparent and never has a color.
- `Sprite` is `{ name; w; h; rows }`. Each row is a string `w` characters wide, one character per pixel.
- `SPRITES` is a `Record<SpriteId, Sprite>`. `SpriteId` is a string-literal union, so a missing sprite is a type error.
- `rasterize(sprite, palette, scale)` returns `{ width; height; rgba }` with nearest-neighbor scaling.

## Conventions

- Animals face right. The renderer mirrors a sprite when an animal faces left.
- A sprite is anchored by its bottom-center: the feet of an animal or the base of a prop sit on the last row.
- Tests check every sprite as an invariant: row count, row width, and palette membership.
- Snapshot tests print every sprite as its rows, so a change to the art shows up as a visual diff in review.

## Entries

- `@bow-szn/pixels` is pure TypeScript with no Node APIs. The app imports it.
- `@bow-szn/pixels/png` holds `encodePng` and needs `node:zlib`. Only Node scripts and tests import it.
