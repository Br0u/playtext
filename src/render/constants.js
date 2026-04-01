export const BASE_PAGE_WIDTH = 700;
export const BASE_PAGE_HEIGHT = 1040;
export const BASE_MARGIN = 45;
export const BASE_FONT_SIZE = 26;
export const BASE_LINE_HEIGHT = 44;
export const PAGE_BACKGROUND = "#f5f0e4";
export const INK = "#221a12";
export const ACCENT = "#4f6b43";
export const SEAL = "#b4422e";
export const FONT_STACK = '"Iowan Old Style", "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif';

export function getMetrics(width, height) {
  const isMobile = width <= 768;
  const pageWidth = Math.min(BASE_PAGE_WIDTH, width - (isMobile ? 22 : 40));
  const pageHeight = Math.min(BASE_PAGE_HEIGHT, height - (isMobile ? 24 : 48));
  const scale = pageWidth / BASE_PAGE_WIDTH;
  const fontSize = Math.max(isMobile ? 20 : 22, Math.round(BASE_FONT_SIZE * (isMobile ? 0.52 + 0.38 * scale : 0.48 + 0.52 * scale)));
  const lineHeight = Math.max(isMobile ? 34 : 38, Math.round(BASE_LINE_HEIGHT * (isMobile ? 0.54 + 0.34 * scale : 0.5 + 0.5 * scale)));
  const margin = Math.round(BASE_MARGIN * (isMobile ? 0.72 + 0.2 * scale : scale));
  const font = `${fontSize}px ${FONT_STACK}`;

  return {
    pageWidth,
    pageHeight,
    margin,
    fontSize,
    lineHeight,
    font,
    isMobile
  };
}
