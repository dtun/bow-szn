import { PALETTE, TRANSPARENT } from "./index.ts";

const DESIGN_COLORS = [
  "#f08a4b",
  "#2b6cd9",
  "#3e8e2f",
  "#5fae3a",
  "#2d6b24",
  "#c9a36b",
  "#13214a",
  "#e23b3b",
  "#f7d44a",
  "#f4efe1",
  "#0b0f1a",
];

describe("PALETTE", () => {
  it("keys every color by one character", () => {
    for (let char of Object.keys(PALETTE)) {
      expect(char).toHaveLength(1);
    }
  });

  it("keeps the transparent character free of a color", () => {
    expect(Object.keys(PALETTE)).not.toContain(TRANSPARENT);
  });

  it("writes every color as a lowercase six-digit hex", () => {
    for (let hex of Object.values(PALETTE)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("gives each character its own color", () => {
    let colors = Object.values(PALETTE);

    expect(new Set(colors).size).toBe(colors.length);
  });

  it("includes every color the design names", () => {
    expect(Object.values(PALETTE)).toEqual(expect.arrayContaining(DESIGN_COLORS));
  });
});
