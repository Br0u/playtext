export function prepareParagraphs(paragraphs) {
  return paragraphs
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
