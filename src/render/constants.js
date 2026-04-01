export const BASE_PAGE_WIDTH = 700;
export const BASE_PAGE_HEIGHT = 960;
export const BASE_MARGIN = 45;
export const BASE_FONT_SIZE = 21;
export const BASE_LINE_HEIGHT = 34;
export const PAGE_BACKGROUND = "#f4eee0";
export const INK = "#2a1a0a";
export const FONT_STACK = '"Furia", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';

export function getMetrics(width, height) {
  const pageWidth = Math.min(BASE_PAGE_WIDTH, width - 40);
  const pageHeight = Math.min(BASE_PAGE_HEIGHT, height - 60);
  const scale = pageWidth / BASE_PAGE_WIDTH;
  const fontSize = Math.max(14, Math.round(BASE_FONT_SIZE * (0.4 + 0.6 * scale)));
  const lineHeight = Math.max(22, Math.round(BASE_LINE_HEIGHT * (0.4 + 0.6 * scale)));
  const margin = Math.round(BASE_MARGIN * scale);
  const font = `${fontSize}px ${FONT_STACK}`;

  return {
    pageWidth,
    pageHeight,
    margin,
    fontSize,
    lineHeight,
    font
  };
}
