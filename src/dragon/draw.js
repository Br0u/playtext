import { ACCENT, INK } from "../render/constants.js";

function flipX(point, facing) {
  return { x: point.x * facing, y: point.y };
}

function p(context, point, cat) {
  const flipped = flipX(point, cat.facing);
  return [cat.x + flipped.x, cat.y + flipped.y];
}

function line(context, start, end, width, color) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(start[0], start[1]);
  context.lineTo(end[0], end[1]);
  context.stroke();
}

function quad(context, a, c, b, width, color) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(a[0], a[1]);
  context.quadraticCurveTo(c[0], c[1], b[0], b[1]);
  context.stroke();
}

export function drawDragon(context, cat) {
  const s = cat.scale;
  const sk = cat.skeleton;

  const hip = p(context, sk.hip, cat);
  const body = p(context, sk.body, cat);
  const chest = p(context, sk.chest, cat);
  const head = p(context, sk.head, cat);
  const earA = p(context, sk.earA, cat);
  const earB = p(context, sk.earB, cat);
  const tailBase = p(context, sk.tailBase, cat);
  const tailMid = p(context, sk.tailMid, cat);
  const tailTip = p(context, sk.tailTip, cat);
  const pawFrontA = p(context, sk.pawFrontA, cat);
  const pawFrontB = p(context, sk.pawFrontB, cat);
  const pawBackA = p(context, sk.pawBackA, cat);
  const pawBackB = p(context, sk.pawBackB, cat);

  context.save();
  context.globalAlpha = 0.96;

  quad(context, hip, body, chest, 34 * s, INK);
  quad(context, chest, [cat.x + cat.facing * 52 * s, cat.y - 20 * s], head, 26 * s, INK);
  line(context, body, pawFrontA, 10 * s, INK);
  line(context, chest, pawFrontB, 9 * s, INK);
  line(context, hip, pawBackA, 10 * s, INK);
  line(context, [cat.x + cat.facing * (-10 * s), cat.y + 10 * s], pawBackB, 9 * s, INK);
  quad(context, tailBase, tailMid, tailTip, 8 * s, INK);

  context.fillStyle = INK;
  context.beginPath();
  context.ellipse(head[0], head[1], 24 * s, 20 * s, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.moveTo(earA[0], earA[1]);
  context.lineTo(head[0] - 8 * s * cat.facing, head[1] - 12 * s);
  context.lineTo(head[0] + 2 * s * cat.facing, head[1] - 2 * s);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(earB[0], earB[1]);
  context.lineTo(head[0] + 10 * s * cat.facing, head[1] - 12 * s);
  context.lineTo(head[0] - 2 * s * cat.facing, head[1] - 2 * s);
  context.closePath();
  context.fill();

  context.fillStyle = "#f5f0e4";
  context.beginPath();
  context.arc(head[0] + 8 * s * cat.facing, head[1] - 2 * s, 2.6 * s, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = ACCENT;
  context.lineWidth = 1.8 * s;
  context.beginPath();
  context.moveTo(head[0] + 4 * s * cat.facing, head[1] + 6 * s);
  context.lineTo(head[0] + 18 * s * cat.facing, head[1] + 2 * s);
  context.moveTo(head[0] + 4 * s * cat.facing, head[1] + 8 * s);
  context.lineTo(head[0] + 18 * s * cat.facing, head[1] + 10 * s);
  context.stroke();

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
