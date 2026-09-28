import { CanvasTexture, SRGBColorSpace } from 'three';
import type { PanoramaPalette } from '@/config/room';
import { createRandom } from '@/lib/random';
import { createCanvas } from './canvas';


/** Profil de collines : fort sur les bords, mer dégagée au centre. */
function hillProfile(seed: number, amplitude: number, openFrom: number, openTo: number) {
  const random = createRandom(seed);
  const phases = [random(), random(), random()].map((r) => r * Math.PI * 2);
  return (u: number): number => {
    const wave =
      0.55 + 0.25 * Math.sin(u * 9 + (phases[0] ?? 0)) + 0.15 * Math.sin(u * 23 + (phases[1] ?? 0)) +
      0.05 * Math.sin(u * 61 + (phases[2] ?? 0));
    const edge = u < openFrom ? 1 - u / openFrom : u > openTo ? (u - openTo) / (1 - openTo) : 0;
    return Math.max(0, wave * Math.min(1, edge * 1.6)) * amplitude;
  };
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizon: number, profile: (u: number) => number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= width; x += 4) ctx.lineTo(x, horizon - profile(x / width));
  ctx.lineTo(width, horizon);
  ctx.closePath();
  ctx.fill();
}

/**
 * Panorama extérieur (ciel, mer, collines) pour un cylindre vu de l'intérieur.
 * `horizon` : position de l'horizon depuis le haut, entre 0 et 1 ; format 4:1.
 */
export function createPanoramaTexture(
  palette: PanoramaPalette,
  horizon: number,
  width: number,
  seed = 11,
): CanvasTexture {
  const WIDTH = width;
  const HEIGHT = width / 4;
  const { canvas, ctx } = createCanvas(WIDTH, HEIGHT);
  const random = createRandom(seed);
  const horizonPx = horizon * HEIGHT;

  const sky = ctx.createLinearGradient(0, 0, 0, horizonPx);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(1, palette.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, horizonPx);

  for (let i = 0; i < palette.stars; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + random() * 0.7})`;
    const size = (0.8 + random() * 1.6) * (WIDTH / 4096);
    ctx.fillRect(random() * WIDTH, random() * horizonPx * 0.85, size, size);
  }

  const [gx, gy] = palette.glowPosition;
  const glowRadius = palette.glowRadius * HEIGHT;
  const glow = ctx.createRadialGradient(gx * WIDTH, gy * HEIGHT, 0, gx * WIDTH, gy * HEIGHT, glowRadius);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, horizonPx);

  const sea = ctx.createLinearGradient(0, horizonPx, 0, HEIGHT);
  sea.addColorStop(0, palette.seaHorizon);
  sea.addColorStop(1, palette.sea);
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizonPx, WIDTH, HEIGHT - horizonPx);

  const far = hillProfile(seed + 1, HEIGHT * 0.07, 0.3, 0.72);
  const near = hillProfile(seed + 2, HEIGHT * 0.11, 0.18, 0.86);
  drawHills(ctx, WIDTH, horizonPx, far, palette.hillsFar);
  drawHills(ctx, WIDTH, horizonPx + 2, near, palette.hillsNear);

  // Lumières de ville posées sur les collines
  ctx.fillStyle = palette.cityLightColor;
  for (let i = 0; i < palette.cityLights; i++) {
    const u = random();
    const height = Math.max(far(u), near(u));
    if (height < 4) continue;
    ctx.globalAlpha = 0.5 + random() * 0.5;
    ctx.fillRect(u * WIDTH, horizonPx - random() * height * 0.9, 2, 2);
  }
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
