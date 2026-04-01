const BODY_WIDTHS = [
  53, 31, 49, 54, 69, 72, 67, 54, 46, 42,
  46, 37, 37, 29, 30, 30, 26, 24, 24, 19
];

const SEGMENT_COUNT = 20;
const SEGMENT_SPACING = 30;

function bodyWidthAt(index, scale) {
  return BODY_WIDTHS[index] * scale;
}

export function computeCurlSegments(anchorX, anchorY, scale) {
  const spacing = SEGMENT_SPACING * scale;
  const segments = [{ x: anchorX, y: anchorY - 2, angle: 0, width: bodyWidthAt(0, scale) }];

  for (let index = 1; index < SEGMENT_COUNT; index += 1) {
    const angle = -((index / (SEGMENT_COUNT - 1)) * (Math.PI / 2) * 1.4);
    const previous = segments[index - 1];
    segments.push({
      x: previous.x - Math.cos(angle) * spacing,
      y: previous.y - Math.sin(angle) * spacing,
      angle,
      width: bodyWidthAt(index, scale)
    });
  }

  return segments;
}

export function createDragon(anchorX, anchorY, scale) {
  return {
    anchorX,
    anchorY,
    scale,
    segments: computeCurlSegments(anchorX, anchorY, scale),
    jitterSeed: Math.random() * 1000,
    lastStepTime: 0,
    stepInterval: 80,
    fireCooldown: 0
  };
}

export function updateDragon(dragon, now, pointer, isIdle) {
  if (now - dragon.lastStepTime < dragon.stepInterval) {
    return false;
  }

  dragon.lastStepTime = now;
  dragon.jitterSeed = Math.random() * 1000;

  if (isIdle) {
    const target = computeCurlSegments(dragon.anchorX, dragon.anchorY, dragon.scale);
    const easing = 0.12;
    dragon.segments.forEach((segment, index) => {
      const next = target[index];
      segment.x += (next.x - segment.x) * easing;
      segment.y += (next.y - segment.y) * easing;
      let delta = next.angle - segment.angle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      segment.angle += delta * easing;
    });
    return true;
  }

  const head = dragon.segments[0];
  const dx = pointer.x - head.x;
  const dy = pointer.y - head.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 4) {
    const step = Math.min(distance, Math.max(12, distance * 0.15));
    head.x += (dx / distance) * step;
    head.y += (dy / distance) * step;
    head.angle = Math.atan2(dy, dx);
  }

  for (let index = 1; index < dragon.segments.length; index += 1) {
    const previous = dragon.segments[index - 1];
    const segment = dragon.segments[index];
    let angle = Math.atan2(previous.y - segment.y, previous.x - segment.x);
    let delta = angle - segment.angle;
    const maxBend = 0.25;

    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    if (delta > maxBend) angle = segment.angle + maxBend;
    if (delta < -maxBend) angle = segment.angle - maxBend;

    segment.angle = angle;
    const spacing = SEGMENT_SPACING * dragon.scale;
    segment.x = previous.x - Math.cos(angle) * spacing;
    segment.y = previous.y - Math.sin(angle) * spacing;
  }

  return true;
}

export function getDragonBoxes(dragon, extraPadding = 10) {
  return dragon.segments.map((segment) => {
    const radius = segment.width / 2 + extraPadding;
    return {
      x: segment.x - radius,
      y: segment.y - radius,
      width: radius * 2,
      height: radius * 2
    };
  });
}
