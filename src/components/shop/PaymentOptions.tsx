import { useT } from '@/i18n/useT';
import { getPaymentProvider } from '@/lib/payment';
import { PAYMENT_METHODS, type PaymentMethod } from '@/types/order';

interface PaymentOptionsProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/** Moyens de paiement : seuls ceux dont le provider est branché sont sélectionnables. */
export function PaymentOptions({ value, onChange }: PaymentOptionsProps) {
  const t = useT();

  return (
    <div role="radiogroup" aria-label={t('checkout.payment')} className="flex flex-col gap-2">
      {PAYMENT_METHODS.map((method) => {
        const available = getPaymentProvider(method) !== undefined;
        const active = method === value;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!available}
            onClick={() => onChange(method)}
            className={`flex min-h-touch items-center justify-between gap-3 rounded-2xl border p-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-brass bg-brass/10' : 'border-glass-border hover:border-brass/60'}`}
          >
            <span className="flex flex-col gap-0.5">
              <span>{t(`checkout.${method}`)}</span>
              {method === 'cod' && <span className="text-xs text-ink-muted">{t('checkout.codHint')}</span>}
            </span>
            {!available && (
              <span className="shrink-0 rounded-full border border-glass-border px-2 py-0.5 text-[11px] text-ink-muted">{t('checkout.soon')}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
