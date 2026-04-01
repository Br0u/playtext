function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

export async function loadAssets() {
  const [
    head,
    tongue,
    wingFront,
    wingBack,
    dropcap,
    ...rest
  ] = await Promise.all([
    loadImage("/dragon-sprites/head.png"),
    loadImage("/dragon-sprites/tongue.png"),
    loadImage("/dragon-sprites/wing-front.png"),
    loadImage("/dragon-sprites/wing-back.png"),
    loadImage("/images/dropcap.png"),
    ...Array.from({ length: 19 }, (_, index) => loadImage(`/dragon-sprites/body-${index + 1}.png`)),
    ...Array.from({ length: 10 }, (_, index) => loadImage(`/fire-sprites/Layer ${index + 2}.png`))
  ]);

  const body = rest.slice(0, 19);
  const fire = rest.slice(19);

  await new FontFace("Furia", "url(/fonts/furia-iii.ttf)")
    .load()
    .then((font) => document.fonts.add(font));
  await document.fonts.ready;

  return {
    head,
    tongue,
    wingFront,
    wingBack,
    dropcap,
    body,
    fire
  };
}
