import { SLOTS } from '@/config/slots';
import type { SlotDefinition } from '@/config/slots';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import type { Product, SlotId, Variant } from '@/types/catalog';
import { findProduct, findVariant } from './catalog';
import { useCatalog } from './useCatalog';

export interface Selection {
  slotId: SlotId;
  slot: SlotDefinition;
  /** Absent si le slot est vide */
  product?: Product;
  variant?: Variant;
}

/** Slot sélectionné et le meuble qu'il contient (null si rien n'est sélectionné). */
export function useSelection(): Selection | null {
  const catalog = useCatalog();
  const slotId = useUIStore((state) => state.selectedSlotId);
  const placement = useRoomStore((state) => (slotId ? state.composition[slotId] : null));
  if (!slotId) return null;

  const product = placement ? findProduct(catalog, placement.productId) : undefined;
  const variant = product && placement ? findVariant(product, placement.variantId) : undefined;
  return { slotId, slot: SLOTS[slotId], ...(product && variant ? { product, variant } : {}) };
}
