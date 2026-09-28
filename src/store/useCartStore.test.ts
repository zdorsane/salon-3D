import { beforeEach, describe, expect, it } from 'vitest';
import { CART_MAX_QUANTITY } from '@/config/shop';
import { useCartStore } from './useCartStore';
import { useFavoritesStore } from './useFavoritesStore';

const SOFA = { productId: 'canape-angle-oran', variantId: 'canape-angle-oran--lin-sable' };
const TABLE = { productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene' };

describe('useCartStore', () => {
  beforeEach(() => useCartStore.setState({ items: [], promoCode: null }));

  it('ajoute une variante déjà présente en augmentant sa quantité', () => {
    const { add } = useCartStore.getState();
    add([SOFA]);
    add([SOFA, TABLE]);
    expect(useCartStore.getState().items).toEqual([
      { ...SOFA, quantity: 2 },
      { ...TABLE, quantity: 1 },
    ]);
  });

  it('borne la quantité entre 1 et le maximum', () => {
    const { add, setQuantity } = useCartStore.getState();
    add([SOFA], 50);
    expect(useCartStore.getState().items[0]?.quantity).toBe(CART_MAX_QUANTITY);
    setQuantity(SOFA.variantId, 0);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });

  it('retire une ligne et vide le panier (code promo compris)', () => {
    const { add, remove, setPromoCode, clear } = useCartStore.getState();
    add([SOFA, TABLE]);
    remove(SOFA.variantId);
    expect(useCartStore.getState().items).toEqual([{ ...TABLE, quantity: 1 }]);
    setPromoCode(' bienvenue10 ');
    expect(useCartStore.getState().promoCode).toBe('BIENVENUE10');
    clear();
    expect(useCartStore.getState()).toMatchObject({ items: [], promoCode: null });
  });

  it('un code vide efface le code promo', () => {
    useCartStore.getState().setPromoCode('   ');
    expect(useCartStore.getState().promoCode).toBeNull();
  });
});

describe('useFavoritesStore', () => {
  beforeEach(() => useFavoritesStore.setState({ productIds: [] }));

  it('ajoute puis retire un favori', () => {
    const { toggle, add } = useFavoritesStore.getState();
    toggle('a');
    add('a');
    expect(useFavoritesStore.getState().productIds).toEqual(['a']);
    toggle('a');
    expect(useFavoritesStore.getState().productIds).toEqual([]);
  });
});
