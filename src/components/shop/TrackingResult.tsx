import { Check } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatDateTime, formatPrice, localized } from '@/lib/format';
import { findWilaya } from '@/lib/shipping';
import { useUIStore } from '@/store/useUIStore';
import type { OrderStatus, OrderTracking } from '@/types/order';

/** Étapes normales d'une commande (une commande annulée sort de ce parcours). */
const STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

/** Résultat du suivi : statut, frise des étapes, historique daté, articles et total. */
export function TrackingResult({ tracking }: { tracking: OrderTracking }) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const reached = STEPS.indexOf(tracking.status);
  const method = t(tracking.deliveryMethod === 'home' ? 'checkout.methodHome' : 'checkout.methodStopDesk');

  return (
    <article className="glass flex flex-col gap-5 rounded-3xl p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg tracking-wider text-brass">{tracking.number}</p>
          <p className="text-sm text-ink-muted">
            {tracking.kind === 'quote' && `${t('tracking.quote')} · `}
            {t('tracking.placedOn', { date: formatDateTime(tracking.createdAt, locale) })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm ${tracking.status === 'cancelled' ? 'border border-danger text-danger' : 'bg-brass text-night'}`}>
          {t(`tracking.statuses.${tracking.status}`)}
        </span>
      </header>

      {tracking.kind === 'order' && tracking.status !== 'cancelled' && (
        <ol className="grid grid-cols-5 gap-1" aria-label={t('tracking.history')}>
          {STEPS.map((step, index) => {
            const done = index <= reached;
            return (
              <li key={step} className="flex flex-col items-center gap-1.5 text-center">
                <span className={`grid size-8 place-items-center rounded-full border ${done ? 'border-brass bg-brass text-night' : 'border-glass-border text-ink-muted'}`}>
                  {done ? <Check aria-hidden size={14} /> : index + 1}
                </span>
                <span className={`text-[11px] leading-tight ${done ? 'text-ink' : 'text-ink-muted'}`}>{t(`tracking.statuses.${step}`)}</span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="flex flex-col gap-2 text-sm">
        <h2 className="text-ink-muted">{t('tracking.history')}</h2>
        <ul className="flex flex-col gap-1">
          {tracking.events.map((event) => (
            <li key={`${event.status}-${event.at}`} className="flex justify-between gap-4">
              <span>{t(`tracking.statuses.${event.status}`)}</span>
              <span className="font-mono text-xs text-ink-muted">{formatDateTime(event.at, locale)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-1.5 border-t border-glass-border pt-3 text-sm">
        <p className="text-ink-muted">{t('tracking.deliveryTo', { method, wilaya: findWilaya(tracking.wilayaCode)?.name ?? '' })}</p>
        {tracking.kind === 'order' && (
          <p className="text-ink-muted">{t('checkout.estimated', { min: tracking.estimatedDays[0], max: tracking.estimatedDays[1] })}</p>
        )}
        <ul className="mt-1 flex flex-col gap-1">
          {tracking.lines.map((line) => (
            <li key={`${line.name.fr}-${line.variantLabel.fr}`}>
              {localized(line.name, locale)} <span className="text-ink-muted">· {localized(line.variantLabel, locale)} × {line.quantity}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 flex justify-between">
          <span>{t('checkout.total')}</span>
          <span className="font-mono text-brass">{formatPrice(tracking.totals.total, locale)}</span>
        </p>
      </section>
    </article>
  );
}
