import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { useCart } from '@/lib/useCart';
import { useUIStore } from '@/store/useUIStore';
import { CartLineItem } from './CartLineItem';
import { CartSummary } from './CartSummary';

/** Tiroir panier (toutes les pages) : lignes, quantités, total, accès au panier et à la commande. */
export function CartDrawer() {
  const open = useUIStore((state) => state.cartOpen);
  const setCartOpen = useUIStore((state) => state.setCartOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setCartOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[55] bg-night/60"
          />
          <motion.aside
            key="cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            aria-labelledby="cart-title"
            className="glass-strong fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col sm:inset-y-3 sm:right-3 sm:rounded-3xl"
          >
            <Suspense fallback={null}>
              <CartContent onClose={() => setCartOpen(false)} />
            </Suspense>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartContent({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { lines, totals, promo } = useCart();
  const primary = 'inline-flex min-h-touch flex-1 items-center justify-center rounded-full px-4 text-sm';

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-glass-border p-2 ps-5">
        <h2 id="cart-title" className="font-display text-xl">
          {t('cart.title')}
          <span className="ms-2 font-sans text-sm text-ink-muted">
            {t(totals.itemCount === 1 ? 'cart.item' : 'cart.items', { count: totals.itemCount })}
          </span>
        </h2>
        <button type="button" onClick={onClose} aria-label={t('cart.close')} className="grid size-touch place-items-center rounded-full hover:bg-glass-border">
          <X aria-hidden size={20} />
        </button>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="font-display text-xl">{t('cart.empty')}</p>
          <p className="text-sm text-ink-muted">{t('cart.emptyHint')}</p>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto px-5">
            {lines.map((line) => (
              <CartLineItem key={line.variant.id} line={line} compact onNavigate={onClose} />
            ))}
          </ul>
          <footer className="flex flex-col gap-4 border-t border-glass-border p-5">
            <CartSummary totals={totals} promo={promo} />
            <div className="flex gap-2">
              <Link to={ROUTES.cart} onClick={onClose} className={`${primary} border border-glass-border hover:border-brass`}>
                {t('cart.view')}
              </Link>
              <Link to={ROUTES.checkout} onClick={onClose} className={`${primary} bg-brass font-medium text-night hover:bg-brass-soft`}>
                {t('cart.checkout')}
              </Link>
            </div>
          </footer>
        </>
      )}
    </>
  );
}
