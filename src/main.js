import { loadAssets } from "./render/assets.js";
import { createRenderer } from "./render/renderer.js";

const canvas = document.getElementById("manuscript");

function bindPointer(renderer) {
  window.addEventListener("resize", renderer.resize);

  canvas.addEventListener("mousemove", (event) => {
    renderer.setPointer(event.clientX, event.clientY);
  });

  canvas.addEventListener("mousedown", (event) => {
    renderer.setPointer(event.clientX, event.clientY);
    renderer.setPressed(true);
  });

  window.addEventListener("mouseup", () => {
    renderer.setPressed(false);
  });

  canvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      renderer.setPointer(touch.clientX, touch.clientY);
      renderer.setPressed(true);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      renderer.setPointer(touch.clientX, touch.clientY);
    },
    { passive: false }
  );

  window.addEventListener("touchend", () => {
    renderer.setPressed(false);
  });
}

loadAssets().then((assets) => {
  const renderer = createRenderer(canvas, assets);
  bindPointer(renderer);
});
