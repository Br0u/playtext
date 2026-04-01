import { article } from "../content/article.js";
import { spawnFire, updateFire, getFireBoxes } from "../dragon/fire.js";
import { drawDragon, drawFire } from "../dragon/draw.js";
import { createDragon, getDragonBoxes, updateDragon } from "../dragon/state.js";
import { drawHeatText } from "../effects/text-heat.js";
import { createExclusionBands } from "../layout/exclusions.js";
import { layoutParagraph } from "../layout/flow.js";
import { createTextMeasurer } from "../layout/measure.js";
import { prepareParagraphs } from "../layout/prepare.js";
import { BASE_PAGE_WIDTH, PAGE_BACKGROUND, INK, getMetrics } from "./constants.js";

function getPageOrigin(width, height, metrics) {
  return {
    x: Math.round((width - metrics.pageWidth) / 2),
    y: Math.round(Math.max(20, (height - metrics.pageHeight) / 2))
  };
}

function getDropcapRect(metrics) {
  const drawHeight = metrics.lineHeight * 7;
  const ratio = 250 / 350;
  const drawWidth = drawHeight * ratio;
  return {
    width: drawWidth + 12,
    height: drawHeight,
    drawWidth,
    drawHeight
  };
}

function drawDropcap(context, assets, metrics, pageOrigin) {
  const rect = getDropcapRect(metrics);
  context.drawImage(
    assets.dropcap,
    pageOrigin.x + metrics.margin,
    pageOrigin.y + metrics.margin,
    rect.drawWidth,
    rect.drawHeight
  );
  return rect;
}

function paragraphLineBoxes(metrics, dropcap, pageOrigin, dragon, fire) {
  const staticBoxes = [
    {
      x: pageOrigin.x + metrics.margin - 4,
      y: pageOrigin.y + metrics.margin - 4,
      width: dropcap.width,
      height: dropcap.height
    },
    ...getDragonBoxes(dragon, 10),
    ...getFireBoxes(fire, 6)
  ];

  return staticBoxes;
}

function renderArticle({
  context,
  metrics,
  pageOrigin,
  measureText,
  paragraphs,
  boxes,
  particles
}) {
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

  let top = metrics.margin;
  const lines = [];

  for (const paragraph of paragraphs) {
    const result = layoutParagraph({
      text: paragraph,
      startY: top,
      lineHeight: metrics.lineHeight,
      lineInset: metrics.fontSize * 0.85,
      pageLeft: metrics.margin,
      pageRight: metrics.pageWidth - metrics.margin,
      measureText: (text) => measureText(metrics.font, text),
      getLineExclusions: (lineTop) =>
        createExclusionBands(
          pageOrigin.y + lineTop,
          metrics.lineHeight,
          boxes,
          pageOrigin.x
        ),
      minSegmentWidth: 40
    });

    lines.push(...result.lines);
    top = result.nextY + Math.round(metrics.lineHeight * 0.55);
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
    pointer: { x: 0, y: 0 },
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
    const dropcap = getDropcapRect(metrics);
    const dragonScale = Math.min(1, metrics.pageWidth / BASE_PAGE_WIDTH);
    const anchorX = pageOrigin.x + metrics.margin + dropcap.width * 0.8;
    const anchorY = pageOrigin.y + metrics.margin - 70 * dragonScale;
    state.dragon = createDragon(anchorX, anchorY, dragonScale);
  }

  function setPointer(x, y) {
    state.pointer.x = x;
    state.pointer.y = y;
    state.pointerActiveUntil = performance.now() + 2000;
  }

  function setPressed(pressed) {
    state.pressed = pressed;
  }

  function renderFrame(now) {
    const metrics = getMetrics(state.width, state.height);
    const pageOrigin = getPageOrigin(state.width, state.height, metrics);
    const dropcap = getDropcapRect(metrics);
    const isIdle = now > state.pointerActiveUntil;

    updateDragon(state.dragon, now, state.pointer, isIdle);
    if (state.pressed) {
      spawnFire(state.dragon, state.fire, now);
    }
    updateFire(state.fire);

    offscreenContext.fillStyle = PAGE_BACKGROUND;
    offscreenContext.fillRect(0, 0, state.width, state.height);

    drawDropcap(offscreenContext, assets, metrics, pageOrigin);

    const boxes = paragraphLineBoxes(metrics, dropcap, pageOrigin, state.dragon, state.fire);
    renderArticle({
      context: offscreenContext,
      metrics,
      pageOrigin,
      measureText,
      paragraphs,
      boxes,
      particles: state.fire
    });

    drawFire(offscreenContext, state.fire, assets);
    drawDragon(offscreenContext, state.dragon, assets, now);

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
