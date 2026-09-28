import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useT } from '@/i18n/useT';
import { formatPrice } from '@/lib/format';
import type { PromoResult } from '@/lib/promo';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

/** Saisie du code promo, avec le résultat (remise ou raison du refus). */
export function PromoCodeField({ promo }: { promo: PromoResult | null }) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const promoCode = useCartStore((state) => state.promoCode);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPromoCode(draft);
    setDraft('');
  };

  const message = (() => {
    if (!promo || !promoCode) return null;
    if (promo.ok) return t('promo.applied', { code: promo.promo.code, amount: formatPrice(promo.discount, locale) });
    if (promo.reason === 'minSubtotal') return t('promo.minSubtotal', { amount: formatPrice(promo.promo?.minSubtotal ?? 0, locale) });
    if (promo.reason === 'minItems') return t('promo.minItems', { count: promo.promo?.minItems ?? 0 });
    return t(`promo.${promo.reason}`);
  })();

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={submit} className="flex gap-2">
        <label className="sr-only" htmlFor="promo-code">{t('promo.label')}</label>
        <input
          id="promo-code"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('promo.label')}
          autoComplete="off"
          className="min-h-touch min-w-0 flex-1 rounded-full border border-glass-border bg-transparent px-4 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case placeholder:text-ink-muted focus:border-brass focus:outline-none"
        />
        <button type="submit" disabled={draft.trim() === ''} className="min-h-touch rounded-full border border-brass px-4 text-sm text-brass hover:bg-brass hover:text-night disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brass">
          {t('promo.apply')}
        </button>
      </form>
      {message && (
        <p role="status" className={`flex items-center justify-between gap-2 text-sm ${promo?.ok ? 'text-success' : 'text-ink-muted'}`}>
          <span>{message}</span>
          <button type="button" onClick={() => setPromoCode(null)} aria-label={t('promo.remove')} className="grid size-touch shrink-0 place-items-center rounded-full hover:bg-glass-border">
            <X aria-hidden size={14} />
          </button>
        </p>
      )}
    </div>
  );
}
