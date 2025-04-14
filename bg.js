const canvas = document.getElementById("bg-canvas");
if (!canvas) throw new Error("#bg-canvas not found");

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context not available");

let width, height, imageData, data;
let time = 0;

const RESOLUTION_SCALE = 0.25;

const gradient = [
  [247, 235, 236],
  [221, 189, 213],
  [172, 159, 187]
];
const stopCount = gradient.length - 1;

function resizeCanvas() {
  const docWidth = document.documentElement.scrollWidth;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );

  width = Math.floor(docWidth * RESOLUTION_SCALE);
  height = Math.floor(docHeight * RESOLUTION_SCALE);

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width;
  canvas.style.height = height;

  imageData = ctx.createImageData(width, height);
  data = imageData.data;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Perlin Noise implementation
const permutation = [...Array(256).keys()];
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
}
const p = permutation.concat(permutation);

const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t, a, b) => a + t * (b - a);

function grad(hash, x, y, z) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function noise(x, y, z) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);

  const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
  const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

  return lerp(w,
    lerp(v,
      lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
      lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
    ),
    lerp(v,
      lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
      lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))
    )
  );
}

// Gradient interpolation
function lerpColor(color1, color2, t) {
  return color1.map((c, i) => Math.round(c + (color2[i] - c) * t));
}

function getColor(x, y, t) {
  const scale = 0.001;

  // Oscillating animation speed
  const baseSpeed = 0.0004;
  const speedAmplitude = 0.001;
  const speedFrequency = 0.001;
  const speed = baseSpeed + speedAmplitude * Math.sin(t * speedFrequency);

  const n = Math.min(1, Math.max(0, (noise(x * scale, y * scale, t * speed) + 1) / 2));
  const index = Math.floor(n * stopCount);
  const localT = (n * stopCount) % 1;

  return lerpColor(gradient[index], gradient[index + 1], localT);
}

// Optional: Limit frame rate (e.g. 30 FPS)
let lastFrame = 0;
const fps = 30;
const interval = 1000 / fps;

function draw(now = performance.now()) {
  if (now - lastFrame < interval) {
    requestAnimationFrame(draw);
    return;
  }
  lastFrame = now;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b] = getColor(x, y, time);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  time += 1;
  requestAnimationFrame(draw);
}

draw();
