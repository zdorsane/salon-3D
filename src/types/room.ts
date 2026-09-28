import type { SlotId } from './catalog.ts';

/** Meuble placé dans un slot. */
export interface SlotPlacement {
  productId: string;
  variantId: string;
}

/** Salon composé : un meuble (ou rien) par slot. */
export type Composition = Record<SlotId, SlotPlacement | null>;
