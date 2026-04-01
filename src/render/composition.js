export function getPageOrigin(width, height, metrics) {
  const spareHeight = Math.max(0, height - metrics.pageHeight);

  return {
    x: Math.round((width - metrics.pageWidth) / 2),
    y: Math.round(Math.max(18, spareHeight * 0.44))
  };
}

export function getArticleTop(metrics) {
  return metrics.margin + metrics.lineHeight * (metrics.isMobile ? 2.54 : 2.7);
}

export function getTitleLayout(metrics, pageOrigin, title, articleTop = getArticleTop(metrics)) {
  const fontSize = Math.round(metrics.fontSize * (metrics.isMobile ? 1.5 : 1.72));
  const paddingRight = Math.round(fontSize * (metrics.isMobile ? 0.2 : 0.26));
  const x = pageOrigin.x + metrics.margin + Math.round(fontSize * 0.06);
  const y = pageOrigin.y + articleTop;
  const glyph = Array.from(title)[0] ?? "";
  const glyphs = [{ glyph, x, y }];
  const width = Math.round(fontSize * 0.94) + paddingRight;
  const height = Math.round(fontSize * 1.5);

  return {
    fontSize,
    x,
    y,
    width,
    height,
    glyphs
  };
}

export function getBambooBackdrop(width, height, image) {
  const scale = width <= 768 ? 1.12 : 1.08;
  const drawWidth = Math.round(width * scale);
  const ratio = image.height / image.width;
  const drawHeight = Math.round(drawWidth * ratio);

  return {
    x: Math.round((width - drawWidth) / 2),
    y: Math.round(Math.min(0, height * 0.08 - drawHeight * 0.12)),
    width: drawWidth,
    height: drawHeight,
    alpha: width <= 768 ? 0.05 : 0.062
  };
}

export function collectTextFlowBoxes(dropcap) {
  return [
    {
      x: dropcap.x - 2,
      y: dropcap.y - 2,
      width: dropcap.width + 4,
      height: dropcap.height + 4
    }
  ];
}
