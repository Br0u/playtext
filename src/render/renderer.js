import { article } from "../content/article.js";
import { spawnFire, updateFire } from "../dragon/fire.js";
import { drawDragon, drawFire } from "../dragon/draw.js";
import { createDragon, setDragonPounce, updateDragon } from "../dragon/state.js";
import { drawHeatText } from "../effects/text-heat.js";
import { createExclusionBands } from "../layout/exclusions.js";
import { layoutParagraph } from "../layout/flow.js";
import { createTextMeasurer } from "../layout/measure.js";
import { prepareParagraphs } from "../layout/prepare.js";
import { collectTextFlowBoxes, getArticleTop, getBambooBackdrop, getDragonTextFlowBox, getPageOrigin, getTitleLayout } from "./composition.js";
import { ACCENT, BASE_PAGE_WIDTH, PAGE_BACKGROUND, INK, getMetrics } from "./constants.js";

function getDropcapRect(metrics) {
  return {
    width: metrics.lineHeight * (metrics.isMobile ? 1.18 : 1.26),
    height: metrics.lineHeight * (metrics.isMobile ? 2.5 : 2.72)
  };
}

function drawDropcap(context, metrics, pageOrigin) {
  const title = getTitleLayout(metrics, pageOrigin, article.title, getArticleTop(metrics));
  context.save();
  context.fillStyle = `rgba(34, 26, 18, ${metrics.isMobile ? 0.74 : 0.68})`;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = `600 ${title.fontSize}px "Iowan Old Style", "Songti SC", "STSong", serif`;
  for (const glyph of title.glyphs) {
    context.fillText(glyph.glyph, glyph.x, glyph.y);
  }
  context.restore();
  return { x: title.x, y: title.y, width: title.width, height: title.height };
}

function drawTitle(context, metrics, pageOrigin) {
  context.save();
  context.fillStyle = ACCENT;
  context.textBaseline = "top";
  context.font = `${Math.round(metrics.fontSize * (metrics.isMobile ? 0.68 : 0.74))}px "Iowan Old Style", "Songti SC", "STSong", serif`;
  context.fillText(article.subtitle, pageOrigin.x + metrics.margin, pageOrigin.y + metrics.margin * 0.68);
  context.restore();
}

function drawBamboo(context, assets, width, height) {
  const backdrop = getBambooBackdrop(width, height, assets.bamboo);

  context.save();
  context.globalAlpha = backdrop.alpha;
  context.drawImage(assets.bamboo, backdrop.x, backdrop.y, backdrop.width, backdrop.height);
  context.restore();
}

function paragraphLineBoxes(dropcap, cat, metrics, pageOrigin) {
  return collectTextFlowBoxes(dropcap, getDragonTextFlowBox(cat, metrics, pageOrigin));
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

  let top = getArticleTop(metrics);
  const lines = [];

  for (const paragraph of paragraphs) {
    const result = layoutParagraph({
      text: paragraph,
      startY: top,
      lineHeight: metrics.lineHeight,
      linePadding: 0,
      pageLeft: metrics.margin,
      pageRight: metrics.pageWidth - metrics.margin,
      measureText: (text) => measureText(metrics.font, text),
      getLineExclusions: (lineTop) =>
        createExclusionBands(pageOrigin.y + lineTop, metrics.lineHeight, boxes, pageOrigin.x),
      minSegmentWidth: metrics.fontSize * (metrics.isMobile ? 2.2 : 3)
    });

    lines.push(...result.lines);
    top = result.nextY + Math.round(metrics.lineHeight * (metrics.isMobile ? 0.54 : 0.72));
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
    const dropcap = getDropcapRect(metrics);
    const scale = Math.min(1, metrics.pageWidth / BASE_PAGE_WIDTH);
    const anchorX = metrics.isMobile
      ? pageOrigin.x + metrics.pageWidth - metrics.margin - 34
      : pageOrigin.x + metrics.margin + dropcap.width * 1.25;
    const anchorY = metrics.isMobile
      ? pageOrigin.y + metrics.margin + metrics.lineHeight * 4.2
      : pageOrigin.y + metrics.margin + metrics.lineHeight * 4.3;
    state.dragon = createDragon(anchorX, anchorY, scale);
  }

  function setPointer(x, y) {
    state.pointer.x = x;
    state.pointer.y = y;
    state.pointerActiveUntil = performance.now() + 1800;
  }

  function setPressed(pressed) {
    state.pressed = pressed;
    if (pressed) {
      setDragonPounce(state.dragon, performance.now());
    }
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
    const dropcap = drawDropcap(offscreenContext, metrics, pageOrigin);

    const boxes = paragraphLineBoxes(dropcap, state.dragon, metrics, pageOrigin);
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
    setTimeout(() => requestAnimationFrame(renderFrame), 34);
  }

  resize();
  requestAnimationFrame(renderFrame);

  return {
    resize,
    setPointer,
    setPressed
  };
}
