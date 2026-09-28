import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SlotDefinition } from '@/config/slots';
import { useT } from '@/i18n/useT';
import { compatibility, fittingVariant, productsForSlot } from '@/lib/catalog';
import { countActiveFilters, EMPTY_FILTERS, filterProducts } from '@/lib/filters';
import { useCatalog } from '@/lib/useCatalog';
import { useRoomStore } from '@/store/useRoomStore';
import { AlternativeCard } from './AlternativeCard';
import { Filters } from './Filters';

interface AlternativesCarouselProps {
  slot: SlotDefinition;
  currentProductId: string | undefined;
}

/** Carrousel des modèles compatibles avec le slot ; un clic place le modèle à l'essai. */
export function AlternativesCarousel({ slot, currentProductId }: AlternativesCarouselProps) {
  const t = useT();
  const catalog = useCatalog();
  const tryProduct = useRoomStore((state) => state.tryProduct);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const candidates = useMemo(() => productsForSlot(catalog, slot), [catalog, slot]);
  const visible = filterProducts(candidates, filters);
  const activeCount = countActiveFilters(filters);

  return (
    <section aria-labelledby="alternatives-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 id="alternatives-title" className="text-sm text-ink-muted">
          {t('product.alternatives')}
        </h3>
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          className={`inline-flex min-h-touch items-center gap-2 rounded-full px-3 text-sm ${activeCount > 0 ? 'text-brass' : 'text-ink'} hover:bg-glass-border`}
        >
          <SlidersHorizontal aria-hidden size={16} />
          {activeCount > 0 ? t('filters.toggleCount', { count: activeCount }) : t('filters.toggle')}
        </button>
      </div>

      {filtersOpen && <Filters products={candidates} value={filters} onChange={setFilters} />}

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">{t('filters.noResult')}</p>
      ) : (
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
          {visible.map((product) => {
            const variant = fittingVariant(product, slot);
            return (
              <AlternativeCard
                key={product.id}
                product={product}
                current={product.id === currentProductId}
                tooLarge={compatibility(product, slot, variant) === 'tooLarge'}
                onTry={() => variant && tryProduct(slot.id, { productId: product.id, variantId: variant.id })}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
