import { ShoppingBag } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

/** Icône panier de la barre du haut, avec le nombre d'articles ; ouvre le tiroir panier. */
export function CartButton({ className }: { className: string }) {
  const t = useT();
  // Nombre d'articles enregistrés (sans le catalogue, pour rester disponible partout)
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const setCartOpen = useUIStore((state) => state.setCartOpen);

  return (
    <button type="button" onClick={() => setCartOpen(true)} aria-label={t('cart.open', { count })} title={t('nav.cart')} className={`relative ${className}`}>
      <ShoppingBag aria-hidden size={20} />
      {count > 0 && (
        <span aria-hidden className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-brass px-1 font-mono text-[10px] leading-4 text-night">
          {count}
        </span>
      )}
    </button>
  );
}
