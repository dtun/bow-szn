import { CONCEPT_GRID, ICON_CONCEPTS } from "./icon-concepts.ts";
import { PALETTE, TRANSPARENT } from "./index.ts";

describe.each(ICON_CONCEPTS.map((concept) => [concept.name, concept.scene()] as const))(
  "%s",
  (_name, scene) => {
    it("is a 64 cell square that scales by a whole number to 1024", () => {
      expect([scene.w, scene.h]).toEqual([CONCEPT_GRID, CONCEPT_GRID]);
      expect(scene.rows.every((row) => row.length === CONCEPT_GRID)).toBe(true);
      expect(1024 % CONCEPT_GRID).toBe(0);
    });

    it("paints every cell with a palette color so the icon needs no alpha", () => {
      let cells = [...scene.rows.join("")];

      expect(cells.filter((cell) => cell === TRANSPARENT)).toEqual([]);
      expect([...new Set(cells)].filter((cell) => !(cell in PALETTE))).toEqual([]);
    });
  }
);

describe("ICON_CONCEPTS", () => {
  it("offers four concepts to choose from", () => {
    expect(ICON_CONCEPTS.map((concept) => concept.id)).toEqual(["a", "b", "c", "d"]);
  });
});
