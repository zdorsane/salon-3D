import { describe, expect, it } from 'vitest';
import { DEFAULT_COMPOSITION } from '@/config/presets';
import { SLOTS } from '@/config/slots';
import catalogData from '@/data/catalog.json';
import { SLOT_IDS, type Product } from '@/types/catalog';
import {
  compatibility,
  defaultVariant,
  findProduct,
  findVariant,
  fitsSlot,
  fittingVariant,
  productsForSlot,
  resolveMaterials,
} from './catalog';
import { CatalogError, parseCatalog } from './catalogSchema';

const catalog = parseCatalog(catalogData);

function product(id: string): Product {
  const found = findProduct(catalog, id);
  if (!found) throw new Error(`Produit ${id} absent du catalogue démo`);
  return found;
}

describe('compatibilité produit ↔ slot', () => {
  it('refuse une catégorie non acceptée par le slot', () => {
    expect(compatibility(product('table-ronde-atlas'), SLOTS.canape)).toBe('wrongCategory');
    expect(compatibility(product('canape-3p-tipaza'), SLOTS.fauteuil)).toBe('wrongCategory');
  });

  it('accepte un produit qui tient dans la boîte max', () => {
    expect(compatibility(product('canape-angle-oran'), SLOTS.canape)).toBe('ok');
    expect(compatibility(product('tableau-sahara'), SLOTS.deco2)).toBe('ok');
  });

  it('signale un produit trop grand pour l’espace', () => {
    expect(compatibility(product('canape-angle-kabylie'), SLOTS.canape)).toBe('tooLarge');
  });

  it('évalue la taille propre à chaque variante', () => {
    const modular = product('canape-modulable-sahel');
    const small = findVariant(modular, 'canape-modulable-sahel--boucle-creme-3');
    const large = findVariant(modular, 'canape-modulable-sahel--boucle-creme-4');
    expect(compatibility(modular, SLOTS.canape, small)).toBe('ok');
    expect(compatibility(modular, SLOTS.canape, large)).toBe('tooLarge');
  });

  it('propose la première variante qui tient dans le slot', () => {
    const modular = product('canape-modulable-sahel');
    const variant = fittingVariant(modular, SLOTS.canape);
    expect(variant && compatibility(modular, SLOTS.canape, variant)).toBe('ok');
    expect(fittingVariant(product('canape-angle-kabylie'), SLOTS.canape)).toBeDefined();
  });

  it('compte la hauteur de pose des objets muraux', () => {
    const slot = { ...SLOTS.deco2, maxSize: { ...SLOTS.deco2.maxSize, height: 1.5 } };
    expect(fitsSlot({ width: 100, depth: 3, height: 70 }, slot, 0)).toBe(true);
    expect(fitsSlot({ width: 100, depth: 3, height: 70 }, slot, 130)).toBe(false);
  });

  it('ignore la hauteur de pose pour une suspension', () => {
    expect(fitsSlot({ width: 45, depth: 45, height: 90 }, SLOTS.luminaire1, 500)).toBe(true);
  });
});

describe('catalogue démo', () => {
  it.each(SLOT_IDS)('le slot « %s » propose au moins 3 produits qui tiennent', (slotId) => {
    const fitting = productsForSlot(catalog, SLOTS[slotId]).filter(
      (item) => compatibility(item, SLOTS[slotId], defaultVariant(item)) === 'ok',
    );
    expect(fitting.length).toBeGreaterThanOrEqual(3);
  });

  it('chaque produit a 3 à 6 variantes aux identifiants uniques', () => {
    const ids = new Set<string>();
    for (const item of catalog.products) {
      expect(item.variants.length).toBeGreaterThanOrEqual(3);
      expect(item.variants.length).toBeLessThanOrEqual(6);
      for (const variant of item.variants) {
        expect(ids.has(variant.id)).toBe(false);
        ids.add(variant.id);
      }
    }
  });

  it('le prix barré est toujours supérieur au prix', () => {
    for (const variant of catalog.products.flatMap((item) => item.variants)) {
      if (variant.compareAtPrice !== undefined) expect(variant.compareAtPrice).toBeGreaterThan(variant.price);
    }
  });

  it.each(SLOT_IDS)('le salon par défaut place un produit valide dans « %s »', (slotId) => {
    const placement = DEFAULT_COMPOSITION[slotId];
    expect(placement).not.toBeNull();
    if (!placement) return;
    const item = product(placement.productId);
    const variant = findVariant(item, placement.variantId);
    expect(variant).toBeDefined();
    expect(compatibility(item, SLOTS[slotId], variant)).toBe('ok');
  });
});

describe('resolveMaterials', () => {
  it('la variante surcharge la base partie par partie', () => {
    const sofa = product('canape-angle-oran');
    const charcoal = findVariant(sofa, 'canape-angle-oran--anthracite');
    const materials = resolveMaterials(sofa, charcoal);
    expect(materials.fabric?.color).toBe(charcoal?.materials.fabric?.color);
    expect(materials.wood?.color).toBe(charcoal?.materials.wood?.color);
    expect(resolveMaterials(sofa).wood).toEqual(sofa.materials.wood);
  });
});

describe('parseCatalog', () => {
  it('rejette une catégorie inconnue en indiquant le champ', () => {
    const broken = structuredClone(catalogData) as { products: { category: string }[] };
    const first = broken.products[0];
    if (first) first.category = 'hamac';
    expect(() => parseCatalog(broken)).toThrow(CatalogError);
    expect(() => parseCatalog(broken)).toThrow('products[0].category');
  });

  it('rejette un prix non entier', () => {
    const broken = structuredClone(catalogData) as { products: { variants: { price: number }[] }[] };
    const variant = broken.products[0]?.variants[0];
    if (variant) variant.price = 1999.5;
    expect(() => parseCatalog(broken)).toThrow('price');
  });
});
