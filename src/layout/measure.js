export function createTextMeasurer(context) {
  const cache = new Map();

  return function measureText(font, text) {
    const key = `${font}::${text}`;
    if (cache.has(key)) {
      return cache.get(key);
    }

    context.save();
    context.font = font;
    const width = context.measureText(text).width;
    context.restore();
    cache.set(key, width);
    return width;
  };
}
