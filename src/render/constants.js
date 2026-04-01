export const BASE_PAGE_WIDTH = 700;
export const BASE_PAGE_HEIGHT = 960;
export const BASE_MARGIN = 45;
export const BASE_FONT_SIZE = 24;
export const BASE_LINE_HEIGHT = 38;
export const PAGE_BACKGROUND = "#f5f0e4";
export const INK = "#221a12";
export const ACCENT = "#4f6b43";
export const SEAL = "#b4422e";
export const FONT_STACK = '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif';

export function getMetrics(width, height) {
  const pageWidth = Math.min(BASE_PAGE_WIDTH, width - 40);
  const pageHeight = Math.min(BASE_PAGE_HEIGHT, height - 60);
  const scale = pageWidth / BASE_PAGE_WIDTH;
  const fontSize = Math.max(18, Math.round(BASE_FONT_SIZE * (0.48 + 0.52 * scale)));
  const lineHeight = Math.max(28, Math.round(BASE_LINE_HEIGHT * (0.48 + 0.52 * scale)));
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
