import { useT } from '@/i18n/useT';
import { effectiveDimensions } from '@/lib/catalog';
import { formatNumber, localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import type { Product, Variant } from '@/types/catalog';

/** Caractéristiques : dimensions de la variante et matières. */
export function ProductSpecs({ product, variant }: { product: Product; variant: Variant }) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const size = effectiveDimensions(product, variant);

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <dt className="text-ink-muted">{t('product.dimensions')}</dt>
      <dd className="font-mono">
        {t('product.dimensionsValue', {
          width: formatNumber(size.width, locale),
          depth: formatNumber(size.depth, locale),
          height: formatNumber(size.height, locale),
        })}
      </dd>
      <dt className="text-ink-muted">{t('product.materials')}</dt>
      <dd>{localized(product.materialsLabel, locale)}</dd>
    </dl>
  );
}
