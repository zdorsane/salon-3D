import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { productPath } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { localized } from '@/lib/format';
import type { CartLine } from '@/lib/pricing';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useUIStore } from '@/store/useUIStore';
import { PriceTag } from './PriceTag';
import { QuantityStepper } from './QuantityStepper';

interface CartLineItemProps {
  line: CartLine;
  /** Version compacte (tiroir) : sans « Mettre en favoris » */
  compact?: boolean;
  onNavigate?: () => void;
}

const smallAction = 'inline-flex min-h-touch items-center gap-1.5 px-2 text-xs text-ink-muted hover:text-ink';

/** Ligne du panier : pastille, nom, finition, prix, quantité et actions. */
export function CartLineItem({ line, compact = false, onNavigate }: CartLineItemProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const addFavorite = useFavoritesStore((state) => state.add);
  const { product, variant, quantity, lineTotal } = line;
  const name = localized(product.name, locale);

  return (
    <li className="flex gap-3 border-b border-glass-border py-3 last:border-b-0">
      <span aria-hidden className="size-14 shrink-0 rounded-xl ring-1 ring-glass-border" style={{ backgroundColor: variant.swatch }} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={productPath(product.slug)} onClick={onNavigate} className="block truncate hover:text-brass">
              {name}
            </Link>
            <p className="truncate text-xs text-ink-muted">{localized(variant.label, locale)}</p>
          </div>
          <PriceTag price={lineTotal} />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <QuantityStepper value={quantity} onChange={(value) => setQuantity(variant.id, value)} />
          {!compact && (
            <button
              type="button"
              onClick={() => {
                addFavorite(product.id);
                remove(variant.id);
              }}
              className={smallAction}
            >
              <Heart aria-hidden size={14} />
              {t('cart.moveToFavorites')}
            </button>
          )}
          <button type="button" onClick={() => remove(variant.id)} aria-label={t('cart.removeLabel', { name })} className={smallAction}>
            <Trash2 aria-hidden size={14} />
            {!compact && t('cart.remove')}
          </button>
        </div>
      </div>
    </li>
  );
}
