function createSkeleton(scale) {
  const s = scale;
  return {
    body: { x: 0, y: 0 },
    chest: { x: 28 * s, y: -6 * s },
    head: { x: 60 * s, y: -32 * s },
    earA: { x: 48 * s, y: -58 * s },
    earB: { x: 70 * s, y: -60 * s },
    hip: { x: -36 * s, y: 0 },
    tailBase: { x: -54 * s, y: -6 * s },
    tailMid: { x: -86 * s, y: -40 * s },
    tailTip: { x: -72 * s, y: -86 * s },
    pawFrontA: { x: 30 * s, y: 42 * s },
    pawFrontB: { x: 52 * s, y: 42 * s },
    pawBackA: { x: -18 * s, y: 44 * s },
    pawBackB: { x: 2 * s, y: 44 * s }
  };
}

export function createDragon(anchorX, anchorY, scale) {
  return {
    x: anchorX,
    y: anchorY,
    homeX: anchorX,
    homeY: anchorY,
    scale,
    facing: 1,
    phase: 0,
    pose: "idle",
    poseUntil: 0,
    fireCooldown: 0,
    skeleton: createSkeleton(scale)
  };
}

function animateSkeleton(cat, now, pointer, isIdle) {
  const s = cat.scale;
  const speed = cat.pose === "pounce" ? 0.22 : 0.11;
  const targetX = isIdle ? cat.homeX : pointer.x - 44 * s;
  const targetY = isIdle ? cat.homeY : pointer.y - 34 * s;
  cat.x += (targetX - cat.x) * speed;
  cat.y += (targetY - cat.y) * speed;
  cat.phase += cat.pose === "pounce" ? 0.32 : 0.17;

  const step = Math.sin(cat.phase);
  const counter = Math.sin(cat.phase + Math.PI);
  const lift = Math.max(0, Math.sin(cat.phase * 0.5)) * 4 * s;
  const reach = cat.pose === "pounce" ? 10 * s : 4 * s;

  cat.skeleton = {
    body: { x: 0, y: lift },
    chest: { x: 28 * s, y: -8 * s + lift - Math.abs(step) * 3 * s },
    head: {
      x: 62 * s + (cat.pose === "pounce" ? 10 * s : 0),
      y: -34 * s + lift - (isIdle ? 0 : 6 * s)
    },
    earA: { x: 48 * s, y: -58 * s + lift },
    earB: { x: 70 * s, y: -60 * s + lift },
    hip: { x: -38 * s, y: 2 * s + lift + Math.abs(counter) * 2 * s },
    tailBase: { x: -58 * s, y: -4 * s + lift },
    tailMid: { x: -92 * s, y: -36 * s + Math.sin(cat.phase * 0.8) * 16 * s },
    tailTip: { x: -70 * s, y: -88 * s + Math.cos(cat.phase * 0.8) * 22 * s },
    pawFrontA: { x: 28 * s + step * reach, y: 44 * s - Math.max(0, step) * 10 * s },
    pawFrontB: { x: 52 * s + counter * reach, y: 42 * s - Math.max(0, counter) * 10 * s },
    pawBackA: { x: -16 * s + counter * reach * 0.7, y: 45 * s - Math.max(0, counter) * 9 * s },
    pawBackB: { x: 4 * s + step * reach * 0.7, y: 46 * s - Math.max(0, step) * 9 * s }
  };
}

export function updateDragon(cat, now, pointer, isIdle) {
  if (now < cat.poseUntil) {
    cat.pose = "pounce";
  } else if (!isIdle) {
    cat.pose = "prowl";
  } else {
    cat.pose = "idle";
  }

  cat.facing = pointer.x >= cat.x ? 1 : -1;
  animateSkeleton(cat, now, pointer, isIdle);
  return true;
}

export function setDragonPounce(cat, now) {
  cat.pose = "pounce";
  cat.poseUntil = now + 420;
}

export function getDragonBoxes(cat, padding = 12) {
  const width = 176 * cat.scale;
  const height = 128 * cat.scale;
  return [
    {
      x: cat.x - width / 2 - padding,
      y: cat.y - height / 2 - padding,
      width: width + padding * 2,
      height: height + padding * 2
    }
  ];
}
