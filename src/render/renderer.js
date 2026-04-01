import { article } from "../content/article.js";
import { spawnFire, updateFire, getFireBoxes } from "../dragon/fire.js";
import { drawDragon, drawFire } from "../dragon/draw.js";
import { createDragon, getDragonBoxes, updateDragon } from "../dragon/state.js";
import { drawHeatText } from "../effects/text-heat.js";
import { createExclusionBands } from "../layout/exclusions.js";
import { layoutParagraph } from "../layout/flow.js";
import { createTextMeasurer } from "../layout/measure.js";
import { prepareParagraphs } from "../layout/prepare.js";
import { ACCENT, BASE_PAGE_WIDTH, PAGE_BACKGROUND, INK, SEAL, getMetrics } from "./constants.js";

function getPageOrigin(width, height, metrics) {
  return {
    x: Math.round((width - metrics.pageWidth) / 2),
    y: Math.round(Math.max(20, (height - metrics.pageHeight) / 2))
  };
}

function getStampRect(metrics) {
  return {
    width: metrics.lineHeight * 3.1,
    height: metrics.lineHeight * 4.2
  };
}

function drawStamp(context, metrics, pageOrigin) {
  const rect = getStampRect(metrics);
  const x = pageOrigin.x + metrics.margin;
  const y = pageOrigin.y + metrics.margin + metrics.lineHeight * 1.8;
  context.save();
  context.globalAlpha = 0.82;
  context.fillStyle = "rgba(180, 66, 46, 0.12)";
  context.fillRect(x, y, rect.width, rect.height);
  context.strokeStyle = SEAL;
  context.lineWidth = 2;
  context.strokeRect(x, y, rect.width, rect.height);
  context.fillStyle = SEAL;
  context.font = `bold ${Math.round(metrics.fontSize * 2.1)}px "Songti SC", "STSong", serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(article.title, x + rect.width / 2, y + rect.height / 2);
  context.restore();
  return { ...rect, x, y };
}

function drawTitle(context, metrics, pageOrigin) {
  context.save();
  context.fillStyle = INK;
  context.textBaseline = "top";
  context.font = `600 ${Math.round(metrics.fontSize * 1.35)}px "Songti SC", "STSong", serif`;
  context.fillText(article.title, pageOrigin.x + metrics.margin, pageOrigin.y + metrics.margin * 0.6);
  context.fillStyle = ACCENT;
  context.font = `${Math.round(metrics.fontSize * 0.8)}px "Songti SC", "STSong", serif`;
  context.fillText(article.subtitle, pageOrigin.x + metrics.margin + metrics.fontSize * 3.3, pageOrigin.y + metrics.margin * 0.9);
  context.restore();
}

function drawBamboo(context, assets, width, height) {
  context.save();
  context.globalAlpha = 0.18;
  const bambooWidth = Math.min(260, width * 0.24);
  const ratio = assets.bamboo.height / assets.bamboo.width;
  const bambooHeight = bambooWidth * ratio;
  context.drawImage(assets.bamboo, width - bambooWidth * 0.92, 34, bambooWidth, bambooHeight);
  context.translate(30, height - bambooHeight * 0.52);
  context.rotate(-Math.PI / 2.9);
  context.drawImage(assets.bamboo, 0, 0, bambooWidth * 0.72, bambooHeight * 0.72);
  context.restore();
}

function paragraphLineBoxes(metrics, stamp, cat, leaves) {
  return [
    {
      x: stamp.x - 4,
      y: stamp.y - 4,
      width: stamp.width + 8,
      height: stamp.height + 8
    },
    ...getDragonBoxes(cat, 12),
    ...getFireBoxes(leaves, 10)
  ];
}

function renderArticle({ context, metrics, pageOrigin, measureText, paragraphs, boxes, particles }) {
  context.save();
  context.translate(pageOrigin.x, pageOrigin.y);
  context.font = metrics.font;
  context.fillStyle = INK;
  context.textBaseline = "top";
  const localParticles = particles.map((particle) => ({
    ...particle,
    x: particle.x - pageOrigin.x,
    y: particle.y - pageOrigin.y
  }));

  let top = metrics.margin + metrics.lineHeight * 3.2;
  const lines = [];

  for (const paragraph of paragraphs) {
    const result = layoutParagraph({
      text: paragraph,
      startY: top,
      lineHeight: metrics.lineHeight,
      lineInset: metrics.fontSize * 0.25,
      pageLeft: metrics.margin,
      pageRight: metrics.pageWidth - metrics.margin,
      measureText: (text) => measureText(metrics.font, text),
      getLineExclusions: (lineTop) =>
        createExclusionBands(pageOrigin.y + lineTop, metrics.lineHeight, boxes, pageOrigin.x),
      minSegmentWidth: metrics.fontSize * 3
    });

    lines.push(...result.lines);
    top = result.nextY + Math.round(metrics.lineHeight * 0.72);
  }

  for (const line of lines) {
    if (particles.length > 0) {
      drawHeatText(context, line, metrics.font, INK, localParticles, measureText);
    } else {
      context.fillText(line.text, line.x, line.y);
    }
  }

  context.restore();
}

export function createRenderer(canvas, assets) {
  const context = canvas.getContext("2d");
  const offscreen = document.createElement("canvas");
  const offscreenContext = offscreen.getContext("2d");
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  const measureText = createTextMeasurer(measureContext);
  const paragraphs = prepareParagraphs(article.paragraphs);
  const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    pointer: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    pointerActiveUntil: 0,
    pressed: false,
    dragon: null,
    fire: []
  };

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(state.width * ratio);
    canvas.height = Math.round(state.height * ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    offscreenContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const metrics = getMetrics(state.width, state.height);
    const pageOrigin = getPageOrigin(state.width, state.height, metrics);
    const stamp = getStampRect(metrics);
    const scale = Math.min(1, metrics.pageWidth / BASE_PAGE_WIDTH);
    const anchorX = pageOrigin.x + metrics.margin + stamp.width * 1.25;
    const anchorY = pageOrigin.y + metrics.margin + metrics.lineHeight * 4.3;
    state.dragon = createDragon(anchorX, anchorY, scale);
  }

  function setPointer(x, y) {
    state.pointer.x = x;
    state.pointer.y = y;
    state.pointerActiveUntil = performance.now() + 1800;
  }

  function setPressed(pressed) {
    state.pressed = pressed;
  }

  function renderFrame(now) {
    const metrics = getMetrics(state.width, state.height);
    const pageOrigin = getPageOrigin(state.width, state.height, metrics);
    const isIdle = now > state.pointerActiveUntil;

    updateDragon(state.dragon, now, state.pointer, isIdle);
    if (state.pressed) {
      spawnFire(state.dragon, state.fire, now);
    }
    updateFire(state.fire);

    offscreenContext.fillStyle = PAGE_BACKGROUND;
    offscreenContext.fillRect(0, 0, state.width, state.height);
    drawBamboo(offscreenContext, assets, state.width, state.height);
    drawTitle(offscreenContext, metrics, pageOrigin);
    const stamp = drawStamp(offscreenContext, metrics, pageOrigin);

    const boxes = paragraphLineBoxes(metrics, stamp, state.dragon, state.fire);
    renderArticle({
      context: offscreenContext,
      metrics,
      pageOrigin,
      measureText,
      paragraphs,
      boxes,
      particles: state.fire
    });

    drawFire(offscreenContext, state.fire);
    drawDragon(offscreenContext, state.dragon, assets);

    context.clearRect(0, 0, state.width, state.height);
    context.drawImage(offscreen, 0, 0, state.width, state.height);
    requestAnimationFrame(renderFrame);
  }

  resize();
  requestAnimationFrame(renderFrame);

  return {
    resize,
    setPointer,
    setPressed
  };
}
