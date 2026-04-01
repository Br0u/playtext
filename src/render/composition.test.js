import { describe, expect, it } from "vitest";

import { collectTextFlowBoxes, getArticleTop, getBambooBackdrop, getTitleLayout } from "./composition.js";
import { getMetrics } from "./constants.js";

describe("getMetrics", () => {
  it("uses a taller desktop page to avoid cramped top and bottom spacing", () => {
    const metrics = getMetrics(1440, 1200);

    expect(metrics.pageHeight).toBe(1040);
  });

  it("keeps shorter desktop viewports visually balanced with gentler clipping", () => {
    const metrics = getMetrics(1280, 900);

    expect(metrics.pageHeight).toBe(852);
  });
});

describe("getTitleLayout", () => {
  it("only enlarges the first glyph so the drop cap behaves like a true paragraph initial", () => {
    const metrics = {
      margin: 40,
      lineHeight: 46,
      fontSize: 28,
      isMobile: false
    };
    const pageOrigin = { x: 120, y: 48 };
    const articleTop = getArticleTop(metrics);
    const title = getTitleLayout(metrics, pageOrigin, "匆匆", articleTop);

    expect(title.glyphs).toHaveLength(1);
    expect(title.glyphs[0].glyph).toBe("匆");
    expect(title.y).toBe(pageOrigin.y + articleTop);
    expect(title.fontSize).toBeLessThan(70);
    expect(title.height).toBeGreaterThan(40);
    expect(title.width).toBeGreaterThan(20);
  });
});

describe("getBambooBackdrop", () => {
  it("uses one oversized backdrop image instead of repeated tiles", () => {
    const backdrop = getBambooBackdrop(1320, 900, { width: 908, height: 2612 });

    expect(backdrop.x).toBeLessThan(0);
    expect(backdrop.width).toBeGreaterThan(1320);
    expect(backdrop.height).toBeGreaterThan(900);
    expect(backdrop.alpha).toBeLessThan(0.08);
  });
});

describe("collectTextFlowBoxes", () => {
  it("keeps paragraph flow static by only reserving space for the drop cap", () => {
    const dropcap = { x: 100, y: 120, width: 40, height: 60 };
    const dragonBoxes = [{ x: 180, y: 150, width: 30, height: 30 }];

    expect(collectTextFlowBoxes(dropcap, dragonBoxes)).toEqual([{ x: 98, y: 118, width: 44, height: 64 }]);
  });
});
