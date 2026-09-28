import { Heart } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

/** Cœur « favori » : ajoute ou retire le produit des favoris. */
export function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const t = useT();
  const active = useFavoritesStore((state) => state.productIds.includes(productId));
  const toggle = useFavoritesStore((state) => state.toggle);
  const label = t(active ? 'favorites.remove' : 'favorites.add');

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => toggle(productId)}
      className={`grid size-touch shrink-0 place-items-center rounded-full transition-colors ${active ? 'text-brass' : 'text-ink-muted hover:text-ink'} ${className}`}
    >
      <Heart aria-hidden size={18} className={active ? 'fill-brass' : ''} />
    </button>
  );
}
