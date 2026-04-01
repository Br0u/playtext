import { SPRITE_SIZE } from "./state.js";

export function drawDragon(context, cat, assets) {
  const scale = 2 * cat.scale;
  const frame = cat.spriteFrame || [-3, -3];
  const sourceX = Math.abs(frame[0]) * SPRITE_SIZE;
  const sourceY = Math.abs(frame[1]) * SPRITE_SIZE;
  const drawSize = SPRITE_SIZE * scale;

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    assets.oneko,
    sourceX,
    sourceY,
    SPRITE_SIZE,
    SPRITE_SIZE,
    cat.x - drawSize / 2,
    cat.y - drawSize / 2,
    drawSize,
    drawSize
  );
  context.restore();
}

function drawLeaf(context, particle) {
  context.fillStyle = "#4f6b43";
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
