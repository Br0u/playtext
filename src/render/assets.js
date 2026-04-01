function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

export async function loadAssets() {
  const [oneko, bamboo] = await Promise.all([
    loadImage("/images/oneko.gif"),
    loadImage("/images/bamboo-ink.jpg")
  ]);

  return { oneko, bamboo };
}
