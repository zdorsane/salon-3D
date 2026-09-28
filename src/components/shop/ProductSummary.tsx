import { Star, Truck } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatNumber, localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import type { Product, Variant } from '@/types/catalog';
import { Badges } from './Badges';
import { PriceTag } from './PriceTag';

interface ProductSummaryProps {
  product: Product;
  variant: Variant;
}

/** En-tête produit : badges, nom, marque, note, prix, stock et délai de livraison. */
export function ProductSummary({ product, variant }: ProductSummaryProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const inStock = variant.stock > 0;

  return (
    <div className="flex flex-col gap-2">
      <Badges badges={product.badges} />
      <div>
        <h2 className="font-display text-2xl leading-tight">{localized(product.name, locale)}</h2>
        <p className="text-sm text-ink-muted">{t('product.by', { brand: product.brand })}</p>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Star aria-hidden size={14} className="fill-brass text-brass" />
        {t('product.rating', { rating: formatNumber(product.rating, locale), count: product.ratingCount })}
      </p>
      <PriceTag price={variant.price} compareAtPrice={variant.compareAtPrice} size="lg" />
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className={inStock ? 'text-success' : 'text-ink-muted'}>
          {t(inStock ? 'product.inStock' : 'product.onOrder')}
        </span>
        <span className="flex items-center gap-1.5 text-ink-muted">
          <Truck aria-hidden size={14} />
          {t('product.delivery', { days: product.deliveryDays })}
        </span>
      </p>
    </div>
  );
}
