import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import { Link } from 'react-router';
import { CartLineItem } from '@/components/shop/CartLineItem';
import { CartSummary } from '@/components/shop/CartSummary';
import { FavoritesList } from '@/components/shop/FavoritesList';
import { PromoCodeField } from '@/components/shop/PromoCodeField';
import { Loader } from '@/components/ui/Loader';
import { TopBar } from '@/components/ui/TopBar';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { useCart } from '@/lib/useCart';

/** Page panier : lignes, code promo, récapitulatif, favoris. */
export function CartPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      <Suspense fallback={<Loader />}>
        <CartBody />
      </Suspense>
    </div>
  );
}

function CartBody() {
  const t = useT();
  const { lines, totals, promo } = useCart();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-24 pb-16">
      <div className="flex flex-col gap-1">
        <Link to={ROUTES.showroom} className="inline-flex min-h-touch items-center gap-2 self-start text-sm text-ink-muted hover:text-ink">
          <ArrowLeft aria-hidden size={16} />
          {t('cart.continue')}
        </Link>
        <h1 className="font-display text-4xl">
          {t('cart.title')}
          <span className="ms-3 font-sans text-base text-ink-muted">
            {t(totals.itemCount === 1 ? 'cart.item' : 'cart.items', { count: totals.itemCount })}
          </span>
        </h1>
      </div>

      {lines.length === 0 ? (
        <section className="glass flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
          <p className="font-display text-2xl">{t('cart.empty')}</p>
          <p className="text-ink-muted">{t('cart.emptyHint')}</p>
          <Link to={ROUTES.showroom} className="mt-2 inline-flex min-h-touch items-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft">
            {t('common.backToShowroom')}
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <ul className="glass rounded-3xl px-5">
            {lines.map((line) => (
              <CartLineItem key={line.variant.id} line={line} />
            ))}
          </ul>
          <aside className="glass flex flex-col gap-5 rounded-3xl p-5 lg:sticky lg:top-24">
            <PromoCodeField promo={promo} />
            <CartSummary totals={totals} promo={promo} />
            <Link to={ROUTES.checkout} className="inline-flex min-h-touch items-center justify-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft">
              {t('cart.checkout')}
            </Link>
          </aside>
        </div>
      )}

      <FavoritesList />
    </main>
  );
}
