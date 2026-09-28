import { useT } from '@/i18n/useT';
import { formatPrice } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | undefined;
  /** Affiche « dès … » (prix le plus bas d'un produit) */
  from?: boolean;
  size?: 'sm' | 'lg';
}

/** Prix en DA, avec l'ancien prix barré en cas de promotion. */
export function PriceTag({ price, compareAtPrice, from = false, size = 'sm' }: PriceTagProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const formatted = formatPrice(price, locale);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 font-mono">
      <span className={`text-brass ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
        {from ? t('product.fromPrice', { price: formatted }) : formatted}
      </span>
      {compareAtPrice !== undefined && (
        <s className="text-xs text-ink-muted">{formatPrice(compareAtPrice, locale)}</s>
      )}
    </span>
  );
}
