import { describe, expect, it } from "vitest";

import { createDragon, getDragonBoxes, updateDragon } from "./state.js";

describe("ascii cat motion", () => {
  it("moves toward the pointer gradually instead of snapping to it", () => {
    const cat = createDragon(100, 100, 1);

    updateDragon(cat, 16, { x: 420, y: 360 }, false);

    expect(cat.x).toBeGreaterThan(100);
    expect(cat.x).toBeLessThan(420);
    expect(cat.y).toBeGreaterThan(100);
    expect(cat.y).toBeLessThan(360);
  });

  it("returns detailed collision shapes instead of one large block", () => {
    const cat = createDragon(120, 160, 1);
    updateDragon(cat, 16, { x: 240, y: 170 }, false);

    const shapes = getDragonBoxes(cat, 6);

    expect(shapes.length).toBeGreaterThan(5);
    expect(shapes.some((shape) => shape.width < 40)).toBe(true);
  });
});
