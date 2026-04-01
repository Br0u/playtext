const SPRITE_SIZE = 32;
const NEKO_SPEED = 6.5;

export const spriteSets = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]]
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getViewportBounds() {
  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 1024, height: 768 };
}

function chooseDirection(diffX, diffY, distance) {
  let direction = diffY / distance > 0.5 ? "N" : "";
  direction += diffY / distance < -0.5 ? "S" : "";
  direction += diffX / distance > 0.5 ? "W" : "";
  direction += diffX / distance < -0.5 ? "E" : "";
  return direction || "E";
}

function setSprite(cat, name) {
  cat.spriteName = name;
  const frames = spriteSets[name];
  cat.spriteFrame = frames[cat.frameCount % frames.length];
}

function idle(cat) {
  cat.idleTime += 1;
  if (cat.idleTime > 10 && cat.idleAnimation == null) {
    setSprite(cat, "idle");
    return;
  }
  setSprite(cat, cat.idleAnimation || "idle");
}

export function createDragon(anchorX, anchorY, scale) {
  const cat = {
    x: anchorX,
    y: anchorY,
    homeX: anchorX,
    homeY: anchorY,
    scale,
    frameCount: 0,
    idleTime: 0,
    idleAnimation: null,
    poseUntil: 0,
    spriteName: "idle",
    spriteFrame: spriteSets.idle[0],
    fireCooldown: 0
  };
  return cat;
}

export function updateDragon(cat, now, pointer, isIdle) {
  cat.frameCount += 1;
  const diffX = cat.x - pointer.x;
  const diffY = cat.y - pointer.y;
  const distance = Math.hypot(diffX, diffY);

  if (isIdle || distance < NEKO_SPEED || distance < 48) {
    idle(cat);
    return true;
  }

  if (cat.idleTime > 1) {
    setSprite(cat, "alert");
    cat.idleTime = Math.min(cat.idleTime, 7);
    cat.idleTime -= 1;
    return true;
  }

  cat.idleAnimation = null;
  cat.idleTime = 0;

  const direction = chooseDirection(diffX, diffY, distance);
  setSprite(cat, direction);

  cat.x -= (diffX / distance) * NEKO_SPEED * cat.scale;
  cat.y -= (diffY / distance) * NEKO_SPEED * cat.scale;
  const bounds = getViewportBounds();
  cat.x = clamp(cat.x, 16 * cat.scale, bounds.width - 16 * cat.scale);
  cat.y = clamp(cat.y, 16 * cat.scale, bounds.height - 16 * cat.scale);
  return true;
}

export function setDragonPounce(cat) {
  cat.idleTime = 2;
}

export function getDragonBoxes(cat, padding = 6) {
  const scale = cat.scale;
  return [
    { x: cat.x - 11 * scale - padding, y: cat.y - 12 * scale - padding, width: 14 * scale + padding * 2, height: 12 * scale + padding * 2 },
    { x: cat.x - 1 * scale - padding, y: cat.y - 9 * scale - padding, width: 14 * scale + padding * 2, height: 10 * scale + padding * 2 },
    { x: cat.x - 8 * scale - padding, y: cat.y + 6 * scale - padding, width: 6 * scale + padding * 2, height: 10 * scale + padding * 2 },
    { x: cat.x + 2 * scale - padding, y: cat.y + 6 * scale - padding, width: 6 * scale + padding * 2, height: 10 * scale + padding * 2 }
  ];
}

export { SPRITE_SIZE };
