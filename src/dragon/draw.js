import { ACCENT, INK } from "../render/constants.js";

function world(cat, point) {
  return {
    x: cat.x + point.x * cat.facing,
    y: cat.y + point.y
  };
}

function drawAsciiGlyph(context, glyph, x, y, rotation, size, color) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = color;
  context.font = `${size}px "SFMono-Regular", "Menlo", "Monaco", monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(glyph, 0, 0);
  context.restore();
}

function drawAsciiStroke(context, start, end, glyph, spacing, size, color) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const steps = Math.max(1, Math.floor(length / spacing));

  for (let index = 0; index <= steps; index += 1) {
    const t = steps === 0 ? 0 : index / steps;
    drawAsciiGlyph(
      context,
      glyph,
      start.x + dx * t,
      start.y + dy * t,
      angle,
      size,
      color
    );
  }
}

export function drawDragon(context, cat) {
  const s = cat.scale;
  const sk = cat.skeleton;
  const spineRear = world(cat, sk.spineRear);
  const spineMid = world(cat, sk.spineMid);
  const chest = world(cat, sk.chest);
  const head = world(cat, sk.head);
  const earA = world(cat, sk.earA);
  const earB = world(cat, sk.earB);
  const nose = world(cat, sk.nose);
  const frontShoulder = world(cat, sk.frontShoulder);
  const backShoulder = world(cat, sk.backShoulder);
  const pawFrontA = world(cat, sk.pawFrontA);
  const pawFrontB = world(cat, sk.pawFrontB);
  const pawBackA = world(cat, sk.pawBackA);
  const pawBackB = world(cat, sk.pawBackB);
  const tailBase = world(cat, sk.tailBase);
  const tailMid = world(cat, sk.tailMid);
  const tailTip = world(cat, sk.tailTip);

  context.save();
  context.globalAlpha = 0.96;

  drawAsciiStroke(context, spineRear, spineMid, "@", 12 * s, 18 * s, INK);
  drawAsciiStroke(context, spineMid, chest, "@", 12 * s, 18 * s, INK);
  drawAsciiStroke(context, chest, head, "+", 10 * s, 14 * s, INK);
  drawAsciiStroke(context, frontShoulder, pawFrontA, "¥", 10 * s, 14 * s, INK);
  drawAsciiStroke(context, chest, pawFrontB, "¥", 10 * s, 14 * s, INK);
  drawAsciiStroke(context, backShoulder, pawBackA, "¥", 10 * s, 14 * s, INK);
  drawAsciiStroke(context, spineMid, pawBackB, "¥", 10 * s, 14 * s, INK);
  drawAsciiStroke(context, tailBase, tailMid, "~", 10 * s, 12 * s, INK);
  drawAsciiStroke(context, tailMid, tailTip, "*", 10 * s, 12 * s, INK);

  drawAsciiGlyph(context, "@", head.x, head.y, 0, 24 * s, INK);
  drawAsciiGlyph(context, "*", earA.x, earA.y, -0.8, 14 * s, INK);
  drawAsciiGlyph(context, "*", earB.x, earB.y, 0.8, 14 * s, INK);
  drawAsciiGlyph(context, "-", nose.x, nose.y, 0, 12 * s, INK);
  drawAsciiGlyph(context, "+", spineMid.x, spineMid.y, 0, 14 * s, ACCENT);
  drawAsciiGlyph(context, "+", chest.x, chest.y, 0, 14 * s, ACCENT);

  drawAsciiGlyph(context, ".", head.x + 6 * s * cat.facing, head.y - 2 * s, 0, 12 * s, "#f5f0e4");
  drawAsciiGlyph(context, "-", head.x + 16 * s * cat.facing, head.y + 5 * s, 0.1, 10 * s, ACCENT);
  drawAsciiGlyph(context, "-", head.x + 16 * s * cat.facing, head.y + 9 * s, -0.05, 10 * s, ACCENT);

  context.restore();
}

function drawLeaf(context, particle) {
  context.fillStyle = ACCENT;
  context.beginPath();
  context.moveTo(0, -particle.size * 0.45);
  context.quadraticCurveTo(particle.size * 0.48, 0, 0, particle.size * 0.45);
  context.quadraticCurveTo(-particle.size * 0.32, 0, 0, -particle.size * 0.45);
  context.fill();
  context.strokeStyle = "rgba(34, 26, 18, 0.25)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, -particle.size * 0.35);
  context.lineTo(0, particle.size * 0.35);
  context.stroke();
}

function drawPaper(context, particle) {
  context.fillStyle = "rgba(244, 238, 226, 0.95)";
  context.strokeStyle = "rgba(100, 76, 44, 0.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.rect(-particle.size * 0.32, -particle.size * 0.22, particle.size * 0.64, particle.size * 0.44);
  context.fill();
  context.stroke();
}

export function drawFire(context, particles) {
  context.save();
  for (const particle of particles) {
    const alpha = 1 - particle.age / particle.life;
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = alpha;
    if (particle.variant === "leaf") {
      drawLeaf(context, particle);
    } else {
      drawPaper(context, particle);
    }
    context.restore();
  }
  context.restore();
}
