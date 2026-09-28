import type { Dimensions } from '@/types/catalog.ts';

/** Dimensions en mètres (unité de la scène 3D). */
export interface DimensionsM {
  width: number;
  depth: number;
  height: number;
}

export function cmToM(cm: number): number {
  return cm / 100;
}

export function dimensionsToMeters({ width, depth, height }: Dimensions): DimensionsM {
  return { width: cmToM(width), depth: cmToM(depth), height: cmToM(height) };
}
