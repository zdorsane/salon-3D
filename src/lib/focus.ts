import { ROOM } from '@/config/room';
import { SLOTS } from '@/config/slots';
import { CAMERA_LIMITS, FOCUS_DISTANCE_SCALE, type Viewpoint } from '@/config/viewpoints';
import type { Product, SlotId, Variant } from '@/types/catalog';
import { cameraBounds, focusViewpoint } from './camera';
import { effectiveDimensions } from './catalog';
import { placementTransform, worldCenter } from './placement';
import { cmToM, dimensionsToMeters } from './units';

/** Point de vue qui cadre le meuble d'un slot. */
export function slotViewpoint(slotId: SlotId, product: Product, variant: Variant, isMobile: boolean): Viewpoint {
  const slot = SLOTS[slotId];
  const size = dimensionsToMeters(effectiveDimensions(product, variant));
  const transform = placementTransform(slot, size, cmToM(product.elevation ?? 0));
  const scale = isMobile ? FOCUS_DISTANCE_SCALE.mobile : FOCUS_DISTANCE_SCALE.desktop;
  return focusViewpoint(worldCenter(slot, transform, size), slot.rotationY, size, cameraBounds(ROOM, CAMERA_LIMITS), scale);
}
