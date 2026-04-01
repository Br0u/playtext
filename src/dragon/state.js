function createSkeleton(scale) {
  const s = scale;
  return {
    spineRear: { x: -34 * s, y: 4 * s },
    spineMid: { x: 0, y: 0 },
    chest: { x: 34 * s, y: -6 * s },
    head: { x: 70 * s, y: -28 * s },
    earA: { x: 56 * s, y: -54 * s },
    earB: { x: 78 * s, y: -56 * s },
    nose: { x: 90 * s, y: -22 * s },
    frontShoulder: { x: 32 * s, y: 10 * s },
    backShoulder: { x: -8 * s, y: 14 * s },
    pawFrontA: { x: 26 * s, y: 46 * s },
    pawFrontB: { x: 54 * s, y: 44 * s },
    pawBackA: { x: -22 * s, y: 48 * s },
    pawBackB: { x: 4 * s, y: 50 * s },
    tailBase: { x: -54 * s, y: -4 * s },
    tailMid: { x: -92 * s, y: -34 * s },
    tailTip: { x: -76 * s, y: -84 * s }
  };
}

function moveToward(current, target, maxStep) {
  const delta = target - current;
  if (Math.abs(delta) <= maxStep) {
    return target;
  }
  return current + Math.sign(delta) * maxStep;
}

function clampMagnitude(dx, dy, maxMagnitude) {
  const magnitude = Math.hypot(dx, dy);
  if (magnitude <= maxMagnitude || magnitude === 0) {
    return { dx, dy };
  }
  const scale = maxMagnitude / magnitude;
  return { dx: dx * scale, dy: dy * scale };
}

function partBox(cat, point, radius, padding) {
  const x = cat.x + point.x * cat.facing;
  const y = cat.y + point.y;
  const r = radius + padding;
  return { x: x - r, y: y - r, width: r * 2, height: r * 2 };
}

function segmentBoxes(cat, start, end, radius, padding, slices = 3) {
  const boxes = [];
  for (let index = 0; index <= slices; index += 1) {
    const t = index / slices;
    const point = {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    };
    boxes.push(partBox(cat, point, radius, padding));
  }
  return boxes;
}

export function createDragon(anchorX, anchorY, scale) {
  return {
    x: anchorX,
    y: anchorY,
    homeX: anchorX,
    homeY: anchorY,
    velocityX: 0,
    velocityY: 0,
    scale,
    facing: 1,
    phase: 0,
    pose: "idle",
    poseUntil: 0,
    fireCooldown: 0,
    skeleton: createSkeleton(scale)
  };
}

function animateSkeleton(cat, pointer, isIdle) {
  const s = cat.scale;
  const targetX = isIdle ? cat.homeX : pointer.x - 48 * s;
  const targetY = isIdle ? cat.homeY : pointer.y - 22 * s;
  const desired = clampMagnitude(targetX - cat.x, targetY - cat.y, (cat.pose === "pounce" ? 12 : 6) * s);

  cat.velocityX = cat.velocityX * 0.82 + desired.dx * 0.18;
  cat.velocityY = cat.velocityY * 0.82 + desired.dy * 0.18;
  cat.x = moveToward(cat.x, targetX, Math.max(1.4 * s, Math.abs(cat.velocityX)));
  cat.y = moveToward(cat.y, targetY, Math.max(1.2 * s, Math.abs(cat.velocityY)));
  cat.phase += cat.pose === "pounce" ? 0.28 : 0.12;

  const pace = Math.sin(cat.phase);
  const counter = Math.sin(cat.phase + Math.PI);
  const bodyRise = Math.max(0, Math.sin(cat.phase * 0.5)) * 4 * s;
  const neckDip = isIdle ? 0 : 4 * s;
  const reach = cat.pose === "pounce" ? 13 * s : 7 * s;

  cat.skeleton = {
    spineRear: { x: -36 * s, y: 4 * s + bodyRise + Math.abs(counter) * 3 * s },
    spineMid: { x: 0, y: bodyRise },
    chest: { x: 34 * s, y: -6 * s + bodyRise - Math.abs(pace) * 4 * s },
    head: { x: 74 * s + (cat.pose === "pounce" ? 8 * s : 0), y: -28 * s + bodyRise - neckDip },
    earA: { x: 58 * s, y: -54 * s + bodyRise - neckDip },
    earB: { x: 80 * s, y: -56 * s + bodyRise - neckDip },
    nose: { x: 94 * s, y: -22 * s + bodyRise - neckDip },
    frontShoulder: { x: 32 * s, y: 10 * s + bodyRise },
    backShoulder: { x: -10 * s, y: 14 * s + bodyRise },
    pawFrontA: { x: 24 * s + pace * reach, y: 46 * s - Math.max(0, pace) * 14 * s },
    pawFrontB: { x: 56 * s + counter * reach, y: 44 * s - Math.max(0, counter) * 14 * s },
    pawBackA: { x: -24 * s + counter * reach * 0.72, y: 48 * s - Math.max(0, counter) * 12 * s },
    pawBackB: { x: 6 * s + pace * reach * 0.72, y: 50 * s - Math.max(0, pace) * 12 * s },
    tailBase: { x: -58 * s, y: -4 * s + bodyRise },
    tailMid: { x: -96 * s, y: -34 * s + Math.sin(cat.phase * 0.7) * 18 * s },
    tailTip: { x: -78 * s, y: -86 * s + Math.cos(cat.phase * 0.7) * 24 * s }
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
  animateSkeleton(cat, pointer, isIdle);
  return true;
}

export function setDragonPounce(cat, now) {
  cat.pose = "pounce";
  cat.poseUntil = now + 420;
}

export function getDragonBoxes(cat, padding = 12) {
  const sk = cat.skeleton;
  return [
    ...segmentBoxes(cat, sk.spineRear, sk.spineMid, 15 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.spineMid, sk.chest, 14 * cat.scale, padding, 2),
    partBox(cat, sk.head, 16 * cat.scale, padding),
    ...segmentBoxes(cat, sk.frontShoulder, sk.pawFrontA, 5 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.chest, sk.pawFrontB, 5 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.backShoulder, sk.pawBackA, 5 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.spineMid, sk.pawBackB, 5 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.tailBase, sk.tailMid, 4 * cat.scale, padding, 2),
    ...segmentBoxes(cat, sk.tailMid, sk.tailTip, 3 * cat.scale, padding, 2)
  ];
}
