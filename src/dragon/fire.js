const FIRE_INTERVAL = 80;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function spawnFire(dragon, particles, now) {
  if (now - dragon.fireCooldown < FIRE_INTERVAL) {
    return;
  }

  dragon.fireCooldown = now;
  const head = dragon.segments[0];
  const originDistance = 35 * dragon.scale;
  const originX = head.x + Math.cos(head.angle) * originDistance;
  const originY = head.y + Math.sin(head.angle) * originDistance;
  const burst = 3 + Math.floor(Math.random() * 3);

  for (let index = 0; index < burst; index += 1) {
    const angle = head.angle + randomBetween(-0.125, 0.125);
    const speed = randomBetween(35, 55) * dragon.scale;
    particles.push({
      x: originX + randomBetween(-4, 4),
      y: originY + randomBetween(-4, 4),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(8, 20) * dragon.scale,
      age: 0,
      life: 12 + Math.floor(Math.random() * 6),
      variant: Math.floor(Math.random() * 3)
    });
  }
}

export function updateFire(particles) {
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.age += 1;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.95;
    particle.vy *= 0.95;
    const lift = Math.max(0, (particle.age - 4) / particle.life);
    particle.vy -= lift * 1.5;

    if (particle.age < 3) {
      particle.size *= 1.15;
    } else if (particle.age / particle.life > 0.75) {
      particle.size *= 0.75;
    }

    if (particle.age >= particle.life || particle.size < 1.5) {
      particles.splice(index, 1);
    }
  }
}

export function getFireBoxes(particles, padding = 8) {
  return particles.map((particle) => ({
    x: particle.x - particle.size / 2 - padding,
    y: particle.y - particle.size / 2 - padding,
    width: particle.size + padding * 2,
    height: particle.size + padding * 2
  }));
}
