import { Suspense } from 'react';
import { SLOT_IDS } from '@/types/catalog';
import { Slot } from './Slot';

/** Tous les meubles : chaque slot a son propre Suspense et apparaît dès qu'il est prêt. */
export function Furniture() {
  return (
    <group>
      {SLOT_IDS.map((slotId) => (
        <Suspense key={slotId} fallback={null}>
          <Slot slotId={slotId} />
        </Suspense>
      ))}
    </group>
  );
}
