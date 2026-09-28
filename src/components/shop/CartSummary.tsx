import { useT } from '@/i18n/useT';
import { formatPrice } from '@/lib/format';
import type { CartTotals } from '@/lib/pricing';
import type { PromoResult } from '@/lib/promo';
import { useUIStore } from '@/store/useUIStore';

interface CartSummaryProps {
  totals: CartTotals;
  promo: PromoResult | null;
}

/** Récapitulatif chiffré : sous-total, économies, remise du code, total indicatif. */
export function CartSummary({ totals, promo }: CartSummaryProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const savings = totals.compareAtSubtotal - totals.subtotal;
  const row = 'flex items-baseline justify-between gap-4 text-sm';

  return (
    <dl className="flex flex-col gap-1.5">
      <div className={row}>
        <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
        <dd className="font-mono">{formatPrice(totals.subtotal, locale)}</dd>
      </div>
      {savings > 0 && (
        <div className={row}>
          <dt className="text-ink-muted">{t('cart.savings')}</dt>
          <dd className="font-mono text-success">−{formatPrice(savings, locale)}</dd>
        </div>
      )}
      {promo?.ok && totals.discount > 0 && (
        <div className={row}>
          <dt className="text-ink-muted">{t('cart.discount', { code: promo.promo.code })}</dt>
          <dd className="font-mono text-success">−{formatPrice(totals.discount, locale)}</dd>
        </div>
      )}
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-glass-border pt-2">
        <dt>{t('cart.total')}</dt>
        <dd className="font-mono text-2xl text-brass">{formatPrice(totals.total, locale)}</dd>
      </div>
      <p className="text-xs text-ink-muted">{t('cart.note')}</p>
    </dl>
  );
}
