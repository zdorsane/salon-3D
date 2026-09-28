import { DELIVERY_METHODS, WILAYAS, ZONE_RATES, type DeliveryMethod } from '@/config/shipping';
import { useT } from '@/i18n/useT';
import { formatPrice } from '@/lib/format';
import { findWilaya } from '@/lib/shipping';
import { useUIStore } from '@/store/useUIStore';

interface DeliveryOptionsProps {
  wilayaCode: number;
  value: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
  /** Livraison offerte sur ce panier */
  free: boolean;
}

const LABELS = {
  home: { title: 'checkout.methodHome', hint: 'checkout.methodHomeHint' },
  stopDesk: { title: 'checkout.methodStopDesk', hint: 'checkout.methodStopDeskHint' },
} as const satisfies Record<DeliveryMethod, { title: string; hint: string }>;

/** Choix à domicile / point relais, avec le forfait de la zone de la wilaya choisie. */
export function DeliveryOptions({ wilayaCode, value, onChange, free }: DeliveryOptionsProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const zone = findWilaya(wilayaCode)?.zone;

  return (
    <div role="radiogroup" aria-label={t('checkout.delivery')} className="grid gap-2 sm:grid-cols-2">
      {DELIVERY_METHODS.map((method) => {
        const active = method === value;
        const price = zone ? ZONE_RATES[zone].base[method] : null;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(method)}
            className={`flex min-h-touch flex-col gap-0.5 rounded-2xl border p-3 text-start transition-colors ${active ? 'border-brass bg-brass/10' : 'border-glass-border hover:border-brass/60'}`}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span>{t(LABELS[method].title)}</span>
              {price !== null && (
                <span className={`font-mono text-sm ${free ? 'text-success' : 'text-brass'}`}>
                  {free ? t('checkout.free') : formatPrice(price, locale)}
                </span>
              )}
            </span>
            <span className="text-xs text-ink-muted">{t(LABELS[method].hint)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Options du menu des wilayas : « 16 · Alger ». */
export function WilayaOptions() {
  return WILAYAS.map((wilaya) => (
    <option key={wilaya.code} value={wilaya.code}>
      {String(wilaya.code).padStart(2, '0')} · {wilaya.name}
    </option>
  ));
}
