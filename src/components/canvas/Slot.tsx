import { useRoomStore } from '@/store/useRoomStore';
import type { SlotId } from '@/types/catalog';
import { PlacedProduct } from './PlacedProduct';

interface SlotProps {
  slotId: SlotId;
}

/**
 * Emplacement du salon. Lors d'un remplacement, l'ancien meuble rétrécit d'abord,
 * puis le nouveau apparaît avec un léger rebond.
 */
export function Slot({ slotId }: SlotProps) {
  const placement = useRoomStore((state) => state.composition[slotId]);
  const outgoing = useRoomStore((state) => state.outgoing[slotId]);
  const clearOutgoing = useRoomStore((state) => state.clearOutgoing);

  if (outgoing) {
    return (
      <PlacedProduct
        key={`out:${outgoing.productId}`}
        slotId={slotId}
        placement={outgoing}
        leaving
        onLeft={() => clearOutgoing(slotId)}
      />
    );
  }

  if (!placement) return null;
  return <PlacedProduct key={placement.productId} slotId={slotId} placement={placement} leaving={false} />;
}
