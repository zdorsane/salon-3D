import { useT } from '@/i18n/useT';
import type { OrderComputation } from '@/lib/checkout';
import { formatPrice, localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';

/** Récapitulatif de commande : lignes, sous-total, remise, livraison, total, délai estimé. */
export function OrderSummary({ computation }: { computation: OrderComputation }) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const { lines, totals, shipping, appliedPromo } = computation;
  const row = 'flex items-baseline justify-between gap-4 text-sm';
  const price = (value: number) => formatPrice(value, locale);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {lines.map(({ product, variant, quantity, lineTotal }) => (
          <li key={variant.id} className="flex items-center gap-3 text-sm">
            <span aria-hidden className="size-9 shrink-0 rounded-lg ring-1 ring-glass-border" style={{ backgroundColor: variant.swatch }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{localized(product.name, locale)}</span>
              <span className="block truncate text-xs text-ink-muted">
                {localized(variant.label, locale)} × {quantity}
              </span>
            </span>
            <span className="font-mono text-brass">{price(lineTotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-1.5 border-t border-glass-border pt-3">
        <div className={row}>
          <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
          <dd className="font-mono">{price(totals.subtotal)}</dd>
        </div>
        {appliedPromo && totals.discount > 0 && (
          <div className={row}>
            <dt className="text-ink-muted">{t('cart.discount', { code: appliedPromo })}</dt>
            <dd className="font-mono text-success">−{price(totals.discount)}</dd>
          </div>
        )}
        <div className={row}>
          <dt className="text-ink-muted">
            {t('checkout.shipping')}
            {shipping && shipping.bulkyCount > 0 && !shipping.free && (
              <span className="block text-xs">{t('checkout.bulky', { count: shipping.bulkyCount })}</span>
            )}
          </dt>
          <dd className={`font-mono ${shipping?.free ? 'text-success' : ''}`}>
            {!shipping ? <span className="font-sans text-ink-muted">{t('checkout.shippingPending')}</span> : shipping.free ? t('checkout.free') : price(shipping.fee)}
          </dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-glass-border pt-2">
          <dt>{t('checkout.total')}</dt>
          <dd className="font-mono text-2xl text-brass">{price(totals.total)}</dd>
        </div>
      </dl>

      {shipping && (
        <p className="text-sm text-ink-muted">
          {t('checkout.estimated', { min: shipping.estimatedDays[0], max: shipping.estimatedDays[1] })}
        </p>
      )}
    </div>
  );
}
