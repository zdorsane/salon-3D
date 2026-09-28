import { describe, expect, it } from 'vitest';
import { ROOM } from '@/config/room';
import { SLOTS } from '@/config/slots';
import { SLOT_IDS } from '@/types/catalog';
import { placementTransform } from './placement';

describe('placementTransform', () => {
  it('plaque le dos du canapé contre le fond de sa boîte (côté mur de droite)', () => {
    const slot = SLOTS.canape;
    const { position } = placementTransform(slot, { width: 2.2, depth: 0.95, height: 0.82 });
    const back = position[0] + 0.95 / 2;
    expect(back).toBeCloseTo(slot.position[0] + slot.maxSize.depth / 2);
  });

  it('centre les produits des slots « center »', () => {
    const slot = SLOTS.tableBasse;
    const { position } = placementTransform(slot, { width: 0.9, depth: 0.9, height: 0.38 });
    expect(position).toEqual(slot.position);
  });

  it('surélève les objets muraux mais pas les suspensions', () => {
    expect(placementTransform(SLOTS.deco2, { width: 1, depth: 0.03, height: 0.7 }, 1.3).position[1]).toBeCloseTo(1.3);
    expect(placementTransform(SLOTS.luminaire1, { width: 0.45, depth: 0.45, height: 0.9 }, 1.3).position[1]).toBeCloseTo(
      ROOM.height,
    );
  });

  it.each(SLOT_IDS)('la boîte max du slot « %s » reste dans la pièce', (slotId) => {
    const slot = SLOTS[slotId];
    const { width, depth } = slot.maxSize;
    const cos = Math.abs(Math.cos(slot.rotationY));
    const sin = Math.abs(Math.sin(slot.rotationY));
    // Demi-emprise au sol de la boîte tournée
    const alongX = (cos * width + sin * depth) / 2;
    const alongZ = (sin * width + cos * depth) / 2;
    const [x, , z] = slot.position;
    expect(Math.abs(x) + alongX).toBeLessThanOrEqual(ROOM.width / 2 + 1e-6);
    expect(Math.abs(z) + alongZ).toBeLessThanOrEqual(ROOM.depth / 2 + 1e-6);
  });
});
