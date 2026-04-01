function jitter(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function drawDragon(context, dragon, assets, now) {
  const time = now / 1000;
  const segments = dragon.segments;
  const scale = dragon.scale * 0.24;
  const wingIndex = 5;

  if (assets.wingBack) {
    const wingRoot = segments[wingIndex];
    const wobble = Math.sin(time * 3) * 0.4;
    context.save();
    context.translate(wingRoot.x, wingRoot.y);
    context.rotate(wingRoot.angle + wobble);
    context.scale(scale, scale);
    context.drawImage(
      assets.wingBack,
      -assets.wingBack.width,
      -assets.wingBack.height,
      assets.wingBack.width,
      assets.wingBack.height
    );
    context.restore();
  }

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    const offsetX = (jitter(dragon.jitterSeed + index * 37) - 0.5) * 1.5;
    const offsetY = (jitter(dragon.jitterSeed + index * 37 + 100) - 0.5) * 1.5;
    const offsetAngle = (jitter(dragon.jitterSeed + index * 37 + 200) - 0.5) * 0.04;

    context.save();
    context.translate(segment.x + offsetX, segment.y + offsetY);
    context.rotate(segment.angle + offsetAngle);
    context.scale(scale, scale);

    if (index === 0) {
      if (assets.tongue) {
        context.drawImage(
          assets.tongue,
          assets.head.width * 0.3,
          -assets.tongue.height / 2,
          assets.tongue.width,
          assets.tongue.height
        );
      }
      if (assets.head) {
        context.drawImage(
          assets.head,
          -assets.head.width * 0.45,
          -assets.head.height / 2,
          assets.head.width,
          assets.head.height
        );
      }
    } else {
      const bodySprite = assets.body[index - 1];
      if (bodySprite) {
        context.drawImage(
          bodySprite,
          -bodySprite.width / 2,
          -bodySprite.height / 2,
          bodySprite.width,
          bodySprite.height
        );
      }

      if (index === wingIndex && assets.wingFront) {
        const flap = Math.sin(time * 3 + 0.5) * 0.4;
        context.save();
        context.rotate(-flap);
        context.drawImage(
          assets.wingFront,
          -assets.wingFront.width,
          -assets.wingFront.height,
          assets.wingFront.width,
          assets.wingFront.height
        );
        context.restore();
      }
    }

    context.restore();
  }
}

export function drawFire(context, particles, assets) {
  context.save();
  for (const particle of particles) {
    const alpha = Math.min(1, (1 - particle.age / particle.life) * 1.5);
    context.globalAlpha = alpha;
    const frame = assets.fire[particle.age % assets.fire.length];
    const width = particle.size;
    const height = particle.size;
    const angle = Math.atan2(particle.vy, particle.vx);

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(angle);
    if (frame) {
      context.drawImage(frame, -width / 2, -height / 2, width, height);
    } else {
      context.fillStyle = particle.variant === 0 ? "#c4402a" : particle.variant === 1 ? "#e08a30" : "#f0c030";
      context.beginPath();
      context.ellipse(0, 0, width * 0.6, height * 0.4, 0, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
  context.restore();
}
