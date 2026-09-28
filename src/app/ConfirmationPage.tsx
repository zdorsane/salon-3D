import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { TopBar } from '@/components/ui/TopBar';
import { PROJECT } from '@/config/project';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { formatPrice, localized } from '@/lib/format';
import { findWilaya } from '@/lib/shipping';
import { formatAlgerianPhone } from '@/lib/validation';
import { whatsappLink } from '@/lib/whatsapp';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useUIStore } from '@/store/useUIStore';

/** Confirmation d'une commande ou d'un devis : numéro, prochaines étapes, récapitulatif. */
export function ConfirmationPage() {
  const t = useT();
  const { id } = useParams();
  const locale = useUIStore((state) => state.locale);
  const order = useOrdersStore((state) => state.orders.find((entry) => entry.id === id));
  const price = (value: number) => formatPrice(value, locale);

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      {!order ? (
        <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 pt-40 text-center">
          <p className="text-ink-muted">{t('confirmation.notFound')}</p>
          <Link to={ROUTES.showroom} className="min-h-touch text-brass underline-offset-4 hover:underline">{t('common.backToShowroom')}</Link>
        </main>
      ) : (
        <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-28 pb-16">
          <header className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 aria-hidden size={48} className="text-brass" />
            <h1 className="font-display text-3xl sm:text-4xl">{t(order.kind === 'quote' ? 'confirmation.titleQuote' : 'confirmation.titleOrder')}</h1>
            <p className="flex flex-col items-center gap-1">
              <span className="text-sm text-ink-muted">{t('confirmation.number')}</span>
              <span className="rounded-full border border-brass px-4 py-1 font-mono text-xl tracking-wider text-brass">{order.number}</span>
            </p>
            <p className="text-sm text-ink-muted">{t('confirmation.keepNumber')}</p>
          </header>

          <section aria-labelledby="next-steps" className="glass flex flex-col gap-3 rounded-3xl p-5">
            <h2 id="next-steps" className="font-display text-xl">{t('confirmation.nextSteps')}</h2>
            <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm">
              {order.kind === 'quote' ? (
                <li>{t('confirmation.stepQuote', { phone: formatAlgerianPhone(order.customer.phone) })}</li>
              ) : (
                <>
                  <li>{t('confirmation.stepCall', { phone: formatAlgerianPhone(order.customer.phone) })}</li>
                  <li>{t('confirmation.stepDelivery', { min: order.estimatedDays[0], max: order.estimatedDays[1], wilaya: findWilaya(order.address.wilayaCode)?.name ?? '' })}</li>
                  <li>{t('confirmation.stepPay', { total: price(order.totals.total) })}</li>
                </>
              )}
            </ol>
          </section>

          <section className="glass flex flex-col gap-3 rounded-3xl p-5 text-sm">
            <ul className="flex flex-col gap-1.5">
              {order.lines.map((line) => (
                <li key={line.variantId} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {localized(line.name, locale)} <span className="text-ink-muted">· {localized(line.variantLabel, locale)} × {line.quantity}</span>
                  </span>
                  <span className="font-mono">{price(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-1 border-t border-glass-border pt-2">
              {order.totals.discount > 0 && (
                <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.discount', { code: order.appliedPromo ?? '' })}</dt><dd className="font-mono text-success">−{price(order.totals.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-ink-muted">{t('checkout.shipping')}</dt><dd className="font-mono">{order.totals.shipping === 0 ? t('checkout.free') : price(order.totals.shipping)}</dd></div>
              <div className="flex justify-between text-base"><dt>{t('checkout.total')}</dt><dd className="font-mono text-brass">{price(order.totals.total)}</dd></div>
            </dl>
          </section>

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <a href={whatsappLink(t('confirmation.whatsappMessage', { store: PROJECT.storeName, number: order.number }), PROJECT.whatsappNumber)} target="_blank" rel="noreferrer" className="inline-flex min-h-touch items-center gap-2 rounded-full border border-glass-border px-5 text-sm hover:border-brass">
              <MessageCircle aria-hidden size={16} />
              {t('confirmation.contact')}
            </a>
            {order.kind === 'order' && (
              <Link to={`${ROUTES.tracking}?n=${encodeURIComponent(order.number)}`} className="inline-flex min-h-touch items-center rounded-full border border-glass-border px-5 text-sm hover:border-brass">
                {t('tracking.link')}
              </Link>
            )}
            <Link to={ROUTES.showroom} className="inline-flex min-h-touch items-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft">{t('common.backToShowroom')}</Link>
          </div>
        </main>
      )}
    </div>
  );
}
