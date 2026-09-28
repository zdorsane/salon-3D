import { useT } from '@/i18n/useT';
import { localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import type { Product, Variant } from '@/types/catalog';

interface VariantPickerProps {
  product: Product;
  selected: Variant;
  onSelect: (variantId: string) => void;
}

/** Pastilles de finition : changer de variante met à jour le modèle en direct. */
export function VariantPicker({ product, selected, onSelect }: VariantPickerProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm text-ink-muted">
        {t('product.finish')} · <span className="text-ink">{localized(selected.label, locale)}</span>
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {product.variants.map((variant) => {
          const active = variant.id === selected.id;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={localized(variant.label, locale)}
              title={localized(variant.label, locale)}
              onClick={() => onSelect(variant.id)}
              className={`grid size-touch place-items-center rounded-full border-2 transition-colors ${
                active ? 'border-brass' : 'border-transparent hover:border-glass-border'
              }`}
            >
              <span className="size-8 rounded-full ring-1 ring-glass-border" style={{ backgroundColor: variant.swatch }} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
