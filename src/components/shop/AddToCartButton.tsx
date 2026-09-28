import { ShoppingCart } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { localized } from '@/lib/format';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import type { Product, Variant } from '@/types/catalog';

interface AddToCartButtonProps {
  product: Product;
  variant: Variant;
}

/** Bouton principal « Ajouter au panier » (variante choisie), avec message et accès au panier. */
export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);

  const add = () => {
    useCartStore.getState().add([{ productId: product.id, variantId: variant.id }]);
    const { showToast, setCartOpen } = useUIStore.getState();
    showToast({
      message: t('cart.added', { name: localized(product.name, locale) }),
      action: { label: t('cart.view'), run: () => setCartOpen(true) },
    });
  };

  return (
    <button
      type="button"
      onClick={add}
      className="inline-flex min-h-touch flex-1 items-center justify-center gap-2 rounded-full bg-brass px-6 font-medium text-night transition-colors hover:bg-brass-soft"
    >
      <ShoppingCart aria-hidden size={18} />
      {t('cart.add')}
    </button>
  );
}
