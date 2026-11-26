import { SPRITES } from "./index.ts";

describe("sprite art", () => {
  it.each(Object.entries(SPRITES))("%s", (_id, sprite) => {
    expect(`\n${sprite.rows.join("\n")}\n`).toMatchSnapshot();
  });
});
