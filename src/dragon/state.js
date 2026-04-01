export function createDragon(anchorX, anchorY, scale) {
  return {
    x: anchorX,
    y: anchorY,
    homeX: anchorX,
    homeY: anchorY,
    scale,
    tailPhase: 0,
    facing: 1,
    fireCooldown: 0
  };
}

export function updateDragon(cat, now, pointer, isIdle) {
  const targetX = isIdle ? cat.homeX : pointer.x - 60 * cat.scale;
  const targetY = isIdle ? cat.homeY : pointer.y - 40 * cat.scale;
  cat.x += (targetX - cat.x) * 0.08;
  cat.y += (targetY - cat.y) * 0.08;
  cat.tailPhase = now / 600;
  cat.facing = pointer.x >= cat.x ? 1 : -1;
  return true;
}

export function getDragonBoxes(cat, padding = 12) {
  const width = 170 * cat.scale;
  const height = 110 * cat.scale;
  return [
    {
      x: cat.x - width / 2 - padding,
      y: cat.y - height / 2 - padding,
      width: width + padding * 2,
      height: height + padding * 2
    }
  ];
}
