export function splitAvailableSegments(segments, exclusions) {
  let available = [...segments];

  for (const exclusion of exclusions) {
    const next = [];
    for (const segment of available) {
      if (exclusion.right <= segment.left || exclusion.left >= segment.right) {
        next.push(segment);
        continue;
      }

      if (exclusion.left > segment.left) {
        next.push({ left: segment.left, right: exclusion.left });
      }
      if (exclusion.right < segment.right) {
        next.push({ left: exclusion.right, right: segment.right });
      }
    }
    available = next;
  }

  return available;
}

export function createExclusionBands(lineTop, lineHeight, boxes, xOffset = 0) {
  const lineBottom = lineTop + lineHeight;

  return boxes
    .filter((box) => lineBottom > box.y && lineTop < box.y + box.height)
    .map((box) => ({
      left: box.x - xOffset,
      right: box.x + box.width - xOffset
    }))
    .sort((left, right) => left.left - right.left);
}
