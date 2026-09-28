import { GitCompareArrows } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { lowestPrice } from '@/lib/filters';
import { localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import type { Product } from '@/types/catalog';
import { FavoriteButton } from './FavoriteButton';
import { PriceTag } from './PriceTag';

interface AlternativeCardProps {
  product: Product;
  current: boolean;
  tooLarge: boolean;
  onTry: () => void;
}

/** Carte d'un modèle alternatif : aperçu des finitions, nom, prix, essai et comparaison. */
export function AlternativeCard({ product, current, tooLarge, onTry }: AlternativeCardProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const inCompare = useUIStore((state) => state.compareIds.includes(product.id));
  const toggleCompare = useUIStore((state) => state.toggleCompare);
  const name = localized(product.name, locale);

  return (
    <li className={`relative flex w-40 shrink-0 snap-start flex-col rounded-2xl border ${current ? 'border-brass' : 'border-glass-border'} ${tooLarge ? 'opacity-45' : ''}`}>
      <button
        type="button"
        onClick={onTry}
        disabled={tooLarge || current}
        aria-current={current || undefined}
        className="flex flex-1 flex-col gap-2 p-3 text-start disabled:cursor-not-allowed"
      >
        {/* Aperçu : une bande par finition disponible (sous les boutons favori / comparer) */}
        <span aria-hidden className="mt-10 flex h-16 overflow-hidden rounded-xl">
          {product.variants.map((variant) => (
            <span key={variant.id} className="flex-1" style={{ backgroundColor: variant.swatch }} />
          ))}
        </span>
        <span className="line-clamp-2 text-sm leading-snug">{name}</span>
        <PriceTag price={lowestPrice(product)} from />
        {current && <span className="text-xs text-brass">{t('product.current')}</span>}
        {tooLarge && <span className="text-xs text-ink-muted">{t('product.tooLarge')}</span>}
      </button>
      <button
        type="button"
        aria-pressed={inCompare}
        aria-label={`${t('product.compare')} : ${name}`}
        title={t('product.compare')}
        onClick={() => toggleCompare(product.id)}
        className={`absolute top-1 end-1 grid size-touch place-items-center rounded-full ${inCompare ? 'text-brass' : 'text-ink-muted hover:text-ink'}`}
      >
        <GitCompareArrows aria-hidden size={16} />
      </button>
      <FavoriteButton productId={product.id} className="absolute top-1 start-1" />
    </li>
  );
}
