import type { ProductCategory, SlotId } from '@/types/catalog.ts';
import type { Vec3 } from '@/types/geometry.ts';

/**
 * - floor : produit posé au sol (pivot au sol)
 * - wall : produit accroché au mur, à sa hauteur de pose `elevation`
 * - ceiling : produit suspendu (pivot au point d'accroche, il descend sous le plafond)
 */
export type SlotMount = 'floor' | 'wall' | 'ceiling';

export interface SlotDefinition {
  id: SlotId;
  /** Point d'ancrage : centre au sol de la boîte max (au plafond pour `ceiling`) */
  position: Vec3;
  /** Rotation Y (rad) appliquée au produit, dont la face avant est +Z local */
  rotationY: number;
  /** Boîte d'encombrement max en mètres, dans le repère local du produit */
  maxSize: { width: number; depth: number; height: number };
  /** back : dos du produit plaqué au fond de la boîte (contre le mur) */
  align: 'center' | 'back';
  mount: SlotMount;
  categories: ProductCategory[];
}

/** Rotation qui oriente la face avant d'un produit posé en (x, z) vers un point cible. */
function facing(from: [number, number], to: [number, number]): number {
  return Math.atan2(to[0] - from[0], to[1] - from[1]);
}

const ROOM_CENTER: [number, number] = [0.6, -0.35];

export const SLOTS: Record<SlotId, SlotDefinition> = {
  canape: {
    id: 'canape',
    position: [1.95, 0, -0.3],
    rotationY: -Math.PI / 2,
    maxSize: { width: 2.6, depth: 1.9, height: 1 },
    align: 'back',
    mount: 'floor',
    categories: ['canapeAngle', 'canape3Places', 'canapeModulable'],
  },
  tableBasse: {
    id: 'tableBasse',
    position: [0.6, 0, -0.35],
    rotationY: -Math.PI / 2,
    maxSize: { width: 1.4, depth: 0.9, height: 0.5 },
    align: 'center',
    mount: 'floor',
    categories: ['tableRonde', 'tableRectangulaire', 'tableGigogne'],
  },
  tapis: {
    id: 'tapis',
    position: [0.5, 0, -0.2],
    rotationY: -Math.PI / 2,
    maxSize: { width: 3, depth: 2.2, height: 0.03 },
    align: 'center',
    mount: 'floor',
    categories: ['tapis'],
  },
  fauteuil: {
    id: 'fauteuil',
    position: [-1.7, 0, 1.5],
    rotationY: facing([-1.7, 1.5], ROOM_CENTER),
    maxSize: { width: 1, depth: 1, height: 1.1 },
    align: 'center',
    mount: 'floor',
    categories: ['fauteuil', 'chauffeuse', 'rockingChair'],
  },
  meubleTV: {
    id: 'meubleTV',
    position: [-2.75, 0, -0.35],
    rotationY: Math.PI / 2,
    maxSize: { width: 2.2, depth: 0.5, height: 0.8 },
    align: 'back',
    mount: 'floor',
    categories: ['meubleTV', 'console'],
  },
  rangement: {
    id: 'rangement',
    position: [-1.95, 0, -2.275],
    rotationY: 0,
    maxSize: { width: 1.6, depth: 0.45, height: 2.2 },
    align: 'back',
    mount: 'floor',
    categories: ['bibliotheque', 'vaisselier', 'etagereMurale'],
  },
  luminaire1: {
    id: 'luminaire1',
    position: [0.6, 2.8, -0.35],
    rotationY: 0,
    maxSize: { width: 0.9, depth: 0.9, height: 1.4 },
    align: 'center',
    mount: 'ceiling',
    categories: ['suspension'],
  },
  luminaire2: {
    id: 'luminaire2',
    position: [-2.45, 0, 2],
    rotationY: facing([-2.45, 2], ROOM_CENTER),
    maxSize: { width: 0.7, depth: 0.7, height: 1.95 },
    align: 'center',
    mount: 'floor',
    categories: ['lampadaire'],
  },
  deco1: {
    id: 'deco1',
    position: [2.5, 0, 1.95],
    rotationY: facing([2.5, 1.95], ROOM_CENTER),
    maxSize: { width: 0.65, depth: 0.65, height: 1.8 },
    align: 'center',
    mount: 'floor',
    categories: ['plante', 'vase'],
  },
  deco2: {
    id: 'deco2',
    position: [2.97, 0, -0.3],
    rotationY: -Math.PI / 2,
    maxSize: { width: 1.6, depth: 0.06, height: 2.5 },
    align: 'back',
    mount: 'wall',
    categories: ['tableau'],
  },
  deco3: {
    id: 'deco3',
    position: [0.05, 0, -2.05],
    rotationY: facing([0.05, -2.05], ROOM_CENTER),
    maxSize: { width: 0.65, depth: 0.65, height: 1.8 },
    align: 'center',
    mount: 'floor',
    categories: ['plante', 'vase'],
  },
};
