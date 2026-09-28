import type { ReactNode } from 'react';
import { useT, useDynamicLabel } from '@/i18n/useT';
import { EMPTY_FILTERS, priceBounds, productColors, productMaterials, type ProductFilters } from '@/lib/filters';
import { formatPrice } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import { PRODUCT_STYLES, type Product } from '@/types/catalog';

interface FiltersProps {
  products: Product[];
  value: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

const chipClass = 'inline-flex min-h-touch items-center rounded-full border px-3 text-sm transition-colors';
const chipState = (active: boolean) =>
  active ? 'border-brass bg-brass text-night' : 'border-glass-border text-ink hover:border-brass';

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

/** Filtres des alternatives : prix max, style, couleur, matière, livraison rapide. */
export function Filters({ products, value, onChange }: FiltersProps) {
  const t = useT();
  const label = useDynamicLabel();
  const locale = useUIStore((state) => state.locale);
  const { min, max } = priceBounds(products);
  const styles = PRODUCT_STYLES.filter((style) => products.some((product) => product.style === style));
  const colors = [...new Set(products.flatMap(productColors))];
  const materials = [...new Set(products.flatMap(productMaterials))];
  const maxPrice = value.maxPrice ?? max;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-glass-border p-4">
      {max > min && (
        <label className="flex flex-col gap-2 text-sm">
          <span className="flex justify-between text-ink-muted">
            {t('filters.price')}
            <span className="font-mono text-brass">{formatPrice(maxPrice, locale)}</span>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={1000}
            value={maxPrice}
            onChange={(event) => {
              const next = Number(event.target.value);
              onChange({ ...value, maxPrice: next >= max ? null : next });
            }}
            className="min-h-touch accent-brass"
          />
        </label>
      )}

      <FilterGroup legend={t('filters.style')}>
        {styles.map((style) => (
          <button key={style} type="button" aria-pressed={value.styles.includes(style)} onClick={() => onChange({ ...value, styles: toggle(value.styles, style) })} className={`${chipClass} ${chipState(value.styles.includes(style))}`}>
            {t(`styles.${style}`)}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup legend={t('filters.color')}>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-pressed={value.colors.includes(color)}
            aria-label={color}
            onClick={() => onChange({ ...value, colors: toggle(value.colors, color) })}
            className={`grid size-touch place-items-center rounded-full border-2 ${value.colors.includes(color) ? 'border-brass' : 'border-transparent'}`}
          >
            <span className="size-7 rounded-full ring-1 ring-glass-border" style={{ backgroundColor: color }} />
          </button>
        ))}
      </FilterGroup>

      {materials.length > 0 && (
        <FilterGroup legend={t('filters.material')}>
          {materials.map((code) => (
            <button key={code} type="button" aria-pressed={value.materials.includes(code)} onClick={() => onChange({ ...value, materials: toggle(value.materials, code) })} className={`${chipClass} ${chipState(value.materials.includes(code))}`}>
              {label('materialCodes', code)}
            </button>
          ))}
        </FilterGroup>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" aria-pressed={value.quickDelivery} onClick={() => onChange({ ...value, quickDelivery: !value.quickDelivery })} className={`${chipClass} ${chipState(value.quickDelivery)}`}>
          {t('filters.quickDelivery')}
        </button>
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="min-h-touch px-2 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          {t('filters.reset')}
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
