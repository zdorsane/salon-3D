import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { CLICK_TOLERANCE_PX } from '@/config/animation';
import { SLOTS } from '@/config/slots';
import { effectiveDimensions, findProduct, findVariant } from '@/lib/catalog';
import { slotViewpoint } from '@/lib/focus';
import { localBase, placementTransform } from '@/lib/placement';
import { cmToM, dimensionsToMeters } from '@/lib/units';
import { useCatalog } from '@/lib/useCatalog';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';
import type { SlotId } from '@/types/catalog';
import type { SlotPlacement } from '@/types/room';
import { DimensionLines } from './DimensionLines';
import { HoverLabel } from './HoverLabel';
import { ProductModel } from './ProductModel';
import { SelectionOutline } from './SelectionOutline';
import { SwapAnimator } from './SwapAnimator';
import { SwapSpinner } from './SwapSpinner';

interface PlacedProductProps {
  slotId: SlotId;
  placement: SlotPlacement;
  /** Meuble remplacé : animation de sortie, plus d'interaction */
  leaving: boolean;
  onLeft?: () => void;
}

const LABEL_GAP = 0.25;

/** Meuble posé dans un slot : cliquable, survolable, animé à l'entrée et à la sortie. */
export function PlacedProduct({ slotId, placement, leaving, onLeft }: PlacedProductProps) {
  const catalog = useCatalog();
  const selected = useUIStore((state) => state.selectedSlotId === slotId);
  const hovered = useUIStore((state) => state.hoveredSlotId === slotId);
  const dimensionsVisible = useUIStore((state) => state.dimensionsVisible);
  const [appeared, setAppeared] = useState(false);
  const isMobile = useIsMobile();
  const interactive = !leaving;
  useCursor(hovered && interactive);

  const product = findProduct(catalog, placement.productId);
  const variant = product ? findVariant(product, placement.variantId) : undefined;
  if (!product || !variant) return null;

  const slot = SLOTS[slotId];
  const size = dimensionsToMeters(effectiveDimensions(product, variant));
  const transform = placementTransform(slot, size, cmToM(product.elevation ?? 0));
  const base = localBase(slot, size);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    // Un glissé de caméra n'est pas un clic
    if (!interactive || event.delta > CLICK_TOLERANCE_PX) return;
    const { selectSlot, focusCamera } = useUIStore.getState();
    selectSlot(slotId);
    focusCamera(slotViewpoint(slotId, product, variant, isMobile));
  };

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (interactive) useUIStore.getState().hoverSlot(slotId);
  };

  const handleOut = () => {
    if (useUIStore.getState().hoveredSlotId === slotId) useUIStore.getState().hoverSlot(null);
  };

  return (
    <group
      position={transform.position}
      rotation-y={transform.rotationY}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <Suspense fallback={<SwapSpinner y={base + size.height / 2} />}>
        <SwapAnimator leaving={leaving} onAppeared={() => setAppeared(true)} onLeft={() => onLeft?.()}>
          <SelectionOutline active={interactive && (hovered || selected)} size={size} base={base}>
            <ProductModel product={product} variant={variant} />
          </SelectionOutline>
        </SwapAnimator>
      </Suspense>
      {interactive && appeared && hovered && !selected && (
        <HoverLabel product={product} variant={variant} y={base + size.height + LABEL_GAP} />
      )}
      {interactive && selected && dimensionsVisible && <DimensionLines size={size} base={base} />}
    </group>
  );
}
