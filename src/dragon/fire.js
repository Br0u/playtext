const LEAF_INTERVAL = 120;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function spawnFire(cat, particles, now) {
  if (now - cat.fireCooldown < LEAF_INTERVAL) {
    return;
  }

  cat.fireCooldown = now;
  const burst = 2 + Math.floor(Math.random() * 3);
  for (let index = 0; index < burst; index += 1) {
    particles.push({
      x: cat.x + randomBetween(-18, 18) * cat.scale,
      y: cat.y - 24 * cat.scale + randomBetween(-12, 12) * cat.scale,
      vx: randomBetween(1.2, 2.8) * cat.facing,
      vy: randomBetween(-1.6, 0.4),
      size: randomBetween(14, 24) * cat.scale,
      age: 0,
      life: 40 + Math.floor(Math.random() * 24),
      variant: Math.random() > 0.5 ? "leaf" : "paper",
      spin: randomBetween(-0.08, 0.08),
      rotation: randomBetween(-0.6, 0.6)
    });
  }
}

export function updateFire(particles) {
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.age += 1;
    particle.x += particle.vx * 3.2;
    particle.y += particle.vy * 3.2;
    particle.vx *= 0.99;
    particle.vy += 0.018;
    particle.rotation += particle.spin;

    if (particle.age >= particle.life) {
      particles.splice(index, 1);
    }
  }
}

export function getFireBoxes(particles, padding = 10) {
  return particles.map((particle) => ({
    x: particle.x - particle.size / 2 - padding,
    y: particle.y - particle.size / 2 - padding,
    width: particle.size + padding * 2,
    height: particle.size + padding * 2
  }));
}
