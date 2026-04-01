import { describe, expect, it } from "vitest";

import { createExclusionBands, splitAvailableSegments } from "./exclusions.js";
import { layoutParagraph } from "./flow.js";

function makeMeasure(letterWidth = 10) {
  return (text) => text.length * letterWidth;
}

describe("splitAvailableSegments", () => {
  it("removes overlapping exclusion zones from a line span", () => {
    const segments = splitAvailableSegments(
      [{ left: 40, right: 360 }],
      [
        { left: 90, right: 140 },
        { left: 200, right: 260 }
      ]
    );

    expect(segments).toEqual([
      { left: 40, right: 90 },
      { left: 140, right: 200 },
      { left: 260, right: 360 }
    ]);
  });
});

describe("createExclusionBands", () => {
  it("only includes shapes that intersect the current line band", () => {
    const bands = createExclusionBands(
      120,
      32,
      [
        { x: 80, y: 90, width: 40, height: 100 },
        { x: 200, y: 0, width: 50, height: 60 }
      ],
      0
    );

    expect(bands).toEqual([{ left: 80, right: 120 }]);
  });
});

describe("layoutParagraph", () => {
  it("wraps text across multiple available line segments", () => {
    const result = layoutParagraph({
      text: "alpha beta gamma delta epsilon",
      startY: 20,
      lineHeight: 24,
      lineInset: 30,
      pageLeft: 40,
      pageRight: 360,
      measureText: makeMeasure(),
      getLineExclusions: (top) =>
        top < 44 ? [{ left: 110, right: 200 }] : [],
      minSegmentWidth: 40
    });

    expect(result.lines.length).toBeGreaterThanOrEqual(3);
    expect(result.lines[0].x).toBe(40);
    expect(result.lines[1].x).toBe(200);
    expect(result.lineCount).toBe(2);
    expect(result.nextY).toBe(68);
    expect(result.lines.map((line) => line.text).join(" ")).toContain("epsilon");
  });
});
