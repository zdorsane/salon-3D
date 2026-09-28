import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from 'three';
import { createRandom } from '@/lib/random';
import { createCanvas } from './canvas';

export interface PlankSpec {
  base: string;
  seam: string;
  variation: number;
  plankWidth: number;
  plankLength: number;
  columns: number;
}

export interface PlankTexture {
  texture: CanvasTexture;
  /** Taille réelle d'une tuile de texture (m) : [largeur, longueur] */
  tileSize: [number, number];
}

const GRAIN_LINES = 12;
const GRAIN_STEPS = 24;

/**
 * Parquet à lames décalées, raccordable dans les deux sens.
 * Les lames suivent l'axe V de la texture ; une tuile contient 2 longueurs de lame.
 */
export function createPlankTexture(spec: PlankSpec, size: number, seed = 7): PlankTexture {
  const { canvas, ctx } = createCanvas(size, size);
  const random = createRandom(seed);
  const columnWidth = size / spec.columns;
  const plankHeight = size / 2;
  const base = new Color(spec.base);
  const shade = new Color();

  for (let column = 0; column < spec.columns; column++) {
    const x = column * columnWidth;
    const offset = random() * plankHeight;
    const shades = [0, 1].map(() =>
      shade
        .copy(base)
        .offsetHSL((random() - 0.5) * 0.01, (random() - 0.5) * 0.06, (random() - 0.5) * spec.variation)
        .getStyle(),
    );
    // Les lames k=0 et k=2 sont la même lame vue de part et d'autre du raccord
    for (let k = 0; k <= 2; k++) {
      const index = k % 2;
      const y = offset + (k - 1) * plankHeight;
      drawPlank(ctx, x, y, columnWidth, plankHeight, shades[index] ?? spec.base, seed * 1000 + column * 2 + index);
    }
  }

  // Joints entre les lames
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = spec.seam;
  ctx.lineWidth = Math.max(1, size / 1024);
  for (let column = 0; column <= spec.columns; column++) {
    ctx.beginPath();
    ctx.moveTo(column * columnWidth, 0);
    ctx.lineTo(column * columnWidth, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return { texture, tileSize: [spec.columns * spec.plankWidth, 2 * spec.plankLength] };
}

/** Une lame : teinte, veinage ondulé et joint de bout. */
function drawPlank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  seed: number,
): void {
  const random = createRandom(seed);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  for (let line = 0; line < GRAIN_LINES; line++) {
    const gx = x + random() * width;
    const phase = random() * Math.PI * 2;
    const amplitude = width * 0.04 * random();
    const dark = random() > 0.4;
    ctx.strokeStyle = dark ? 'rgba(45, 28, 16, 0.18)' : 'rgba(255, 240, 220, 0.12)';
    ctx.lineWidth = 0.5 + random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, y);
    for (let step = 1; step <= GRAIN_STEPS; step++) {
      const t = step / GRAIN_STEPS;
      ctx.lineTo(gx + Math.sin(t * 6 + phase) * amplitude, y + t * height);
    }
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(40, 26, 16, 0.5)';
  ctx.fillRect(x, y, width, Math.max(1, height / 400));
}
