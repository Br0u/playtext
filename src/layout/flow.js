import { splitAvailableSegments } from "./exclusions.js";

function tokenize(text) {
  const normalized = text.trim();
  if (!normalized) {
    return { tokens: [], separator: " " };
  }

  if (/\s/.test(normalized)) {
    return {
      tokens: normalized.split(/\s+/).filter(Boolean),
      separator: " "
    };
  }

  return {
    tokens: Array.from(normalized),
    separator: ""
  };
}

function fitWordsIntoSegment(words, separator, measureText, maxWidth) {
  if (words.length === 0) {
    return { fittedText: "", usedWords: 0, width: 0 };
  }

  let candidate = words[0];
  let usedWords = 1;
  let width = measureText(candidate);

  if (width > maxWidth) {
    return { fittedText: candidate, usedWords: 1, width };
  }

  for (let index = 1; index < words.length; index += 1) {
    const nextCandidate = `${candidate}${separator}${words[index]}`;
    const nextWidth = measureText(nextCandidate);
    if (nextWidth > maxWidth) {
      break;
    }
    candidate = nextCandidate;
    width = nextWidth;
    usedWords = index + 1;
  }

  return { fittedText: candidate, usedWords, width };
}

export function layoutParagraph({
  text,
  startY,
  lineHeight,
  lineInset,
  pageLeft,
  pageRight,
  measureText,
  getLineExclusions,
  minSegmentWidth = 48
}) {
  const { tokens: words, separator } = tokenize(text);
  const lines = [];
  let cursor = 0;
  let top = startY;

  while (cursor < words.length) {
    const baseSegments = [
      {
        left: pageLeft,
        right: pageRight
      }
    ];
    const exclusions = getLineExclusions(top);
    const available = splitAvailableSegments(baseSegments, exclusions).filter(
      (segment) => segment.right - segment.left >= minSegmentWidth
    );

    if (available.length === 0) {
      top += lineHeight;
      continue;
    }

    let consumedOnRow = 0;
    for (const segment of available) {
      if (cursor >= words.length) {
        break;
      }

      const maxWidth = segment.right - segment.left - lineInset;
      if (maxWidth < minSegmentWidth) {
        continue;
      }

      const fitted = fitWordsIntoSegment(words.slice(cursor), separator, measureText, maxWidth);
      lines.push({
        text: fitted.fittedText,
        x: Math.round(segment.left),
        y: Math.round(top),
        width: fitted.width
      });
      cursor += fitted.usedWords;
      consumedOnRow += fitted.usedWords;
    }

    if (consumedOnRow === 0) {
      cursor += 1;
    }

    top += lineHeight;
  }

  return {
    lines,
    lineCount: Math.ceil((top - startY) / lineHeight),
    nextY: top
  };
}
