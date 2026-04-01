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

  it("wraps chinese prose without requiring spaces", () => {
    const result = layoutParagraph({
      text: "盼望着盼望着东风来了春天的脚步近了",
      startY: 16,
      lineHeight: 20,
      lineInset: 0,
      pageLeft: 0,
      pageRight: 80,
      measureText: makeMeasure(),
      getLineExclusions: () => [],
      minSegmentWidth: 20
    });

    expect(result.lines.length).toBeGreaterThan(1);
    expect(result.lines[0].text).not.toBe(result.lines[1].text);
    expect(result.lines.map((line) => line.text).join("")).toBe("盼望着盼望着东风来了春天的脚步近了");
  });

  it("keeps ascii skeleton tokens intact when they contain spaces", () => {
    const result = layoutParagraph({
      text: "o==^==o /\\_/\\\\",
      startY: 0,
      lineHeight: 20,
      lineInset: 0,
      pageLeft: 0,
      pageRight: 260,
      measureText: makeMeasure(),
      getLineExclusions: () => [],
      minSegmentWidth: 20
    });

    expect(result.lines[0].text).toBe("o==^==o /\\_/\\\\");
  });

  it("supports a wide first-line exclusion while keeping later chinese lines full width", () => {
    const result = layoutParagraph({
      text: "燕子去了有再来的时候杨柳枯了有再青的时候桃花谢了有再开的时候但是聪明的你告诉我我们的日子为什么一去不复返呢",
      startY: 0,
      lineHeight: 24,
      lineInset: 0,
      pageLeft: 0,
      pageRight: 240,
      measureText: makeMeasure(),
      getLineExclusions: (top) => (top < 48 ? [{ left: 0, right: 90 }] : []),
      minSegmentWidth: 30
    });

    expect(result.lines[0].x).toBe(90);
    expect(result.lines.some((line) => line.x < 90)).toBe(true);
  });
});
