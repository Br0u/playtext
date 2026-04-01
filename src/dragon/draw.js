import { ACCENT, INK } from "../render/constants.js";

export function drawDragon(context, cat, assets) {
  const width = 180 * cat.scale;
  const height = (assets.cat.height / assets.cat.width) * width;

  context.save();
  context.translate(cat.x, cat.y);
  context.scale(cat.facing, 1);
  context.drawImage(assets.cat, -width / 2, -height / 2, width, height);

  const tailBaseX = -width * 0.28;
  const tailBaseY = -height * 0.08;
  const sway = Math.sin(cat.tailPhase) * 18 * cat.scale;
  context.strokeStyle = INK;
  context.lineWidth = 9 * cat.scale;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(tailBaseX, tailBaseY);
  context.bezierCurveTo(
    tailBaseX - 26 * cat.scale,
    tailBaseY - 34 * cat.scale,
    tailBaseX - 42 * cat.scale,
    tailBaseY + sway,
    tailBaseX - 8 * cat.scale,
    tailBaseY + 54 * cat.scale + sway
  );
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
