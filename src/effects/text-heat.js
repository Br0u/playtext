function influenceFromFire(particles, x, y) {
  let dx = 0;
  let dy = 0;
  let strength = 0;

  for (const particle of particles) {
    const offsetX = x - particle.x;
    const offsetY = y - particle.y;
    const distance = Math.hypot(offsetX, offsetY);

    if (distance > 60 || distance < 0.1) {
      continue;
    }

    const local = 1 - distance / 60;
    const weighted = local * local * (1 - particle.age / particle.life);
    dx += (offsetX / distance) * weighted;
    dy += (offsetY / distance) * weighted;
    strength += weighted;
  }

  const normal = Math.hypot(dx, dy);
  return {
    dx: normal > 0 ? dx / normal : 0,
    dy: normal > 0 ? dy / normal : 0,
    strength: Math.min(strength, 1.5)
  };
}

function chunkLine(text) {
  return text.match(/\S+\s*/g) ?? [text];
}

export function drawHeatText(context, line, font, color, particles, measure) {
  context.save();
  context.font = font;
  context.textBaseline = "top";

  let x = line.x;
  const chunks = chunkLine(line.text);

  for (const chunk of chunks) {
    const width = measure(font, chunk);
    const influence = influenceFromFire(particles, x + width / 2, line.y + 10);

    if (influence.strength < 0.01) {
      context.globalAlpha = 1;
      context.fillStyle = color;
      context.fillText(chunk, x, line.y);
    } else {
      const force = influence.strength;
      context.save();
      context.translate(
        x + width / 2 + influence.dx * force * 45,
        line.y + 10 + influence.dy * force * 45
      );
      context.rotate(force * (influence.dx > 0 ? 1 : -1) * 1.2);
      context.globalAlpha = Math.max(0, 1 - force * 0.8);
      context.fillStyle = `rgb(${Math.round(42 + force * 200)}, ${Math.round(26 + force * 80)}, 10)`;
      context.fillText(chunk, -width / 2, -10);
      context.restore();
    }

    x += width;
  }

  context.restore();
}
