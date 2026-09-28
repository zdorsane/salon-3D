import { Link } from 'react-router';
import { productPath } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { defaultVariant, findProduct } from '@/lib/catalog';
import { lowestPrice } from '@/lib/filters';
import { localized } from '@/lib/format';
import { useCatalog } from '@/lib/useCatalog';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useUIStore } from '@/store/useUIStore';
import type { Product } from '@/types/catalog';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { PriceTag } from './PriceTag';

/** Liste des favoris : aperçu des finitions, prix, ajout au panier (variante par défaut). */
export function FavoritesList() {
  const t = useT();
  const catalog = useCatalog();
  const locale = useUIStore((state) => state.locale);
  const productIds = useFavoritesStore((state) => state.productIds);
  const products = productIds.map((id) => findProduct(catalog, id)).filter((p): p is Product => p !== undefined);

  return (
    <section aria-labelledby="favorites-title" className="flex flex-col gap-3">
      <h2 id="favorites-title" className="font-display text-2xl">{t('favorites.title')}</h2>
      {products.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('favorites.empty')}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const variant = defaultVariant(product);
            return (
              <li key={product.id} className="glass flex flex-col gap-3 rounded-3xl p-4">
                <span aria-hidden className="flex h-16 overflow-hidden rounded-2xl">
                  {product.variants.map((v) => (
                    <span key={v.id} className="flex-1" style={{ backgroundColor: v.swatch }} />
                  ))}
                </span>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={productPath(product.slug)} className="block truncate hover:text-brass">{localized(product.name, locale)}</Link>
                    <PriceTag price={lowestPrice(product)} from />
                  </div>
                  <FavoriteButton productId={product.id} />
                </div>
                {variant && <AddToCartButton product={product} variant={variant} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
