import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { TrackingResult } from '@/components/shop/TrackingResult';
import { TextField } from '@/components/ui/Field';
import { TopBar } from '@/components/ui/TopBar';
import { useT } from '@/i18n/useT';
import { orderService } from '@/lib/orders';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { OrderTracking } from '@/types/order';

type SearchState = { kind: 'idle' } | { kind: 'searching' } | { kind: 'found'; tracking: OrderTracking } | { kind: 'notFound' } | { kind: 'error' };

/** Suivi de commande : numéro + téléphone (lien direct possible : `/suivi?n=SAL-…`). */
export function TrackingPage() {
  const t = useT();
  const [params] = useSearchParams();
  const [number, setNumber] = useState(params.get('n') ?? '');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });

  const search = async (event: FormEvent) => {
    event.preventDefault();
    setState({ kind: 'searching' });
    try {
      const tracking = await orderService.track(number, phone);
      setState(tracking ? { kind: 'found', tracking } : { kind: 'notFound' });
    } catch {
      setState({ kind: 'error' });
    }
  };

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-28 pb-16">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-4xl">{t('tracking.title')}</h1>
          <p className="text-ink-muted">{t('tracking.intro')}</p>
        </header>

        <form onSubmit={(event) => void search(event)} className="glass flex flex-col gap-4 rounded-3xl p-5">
          <TextField id="order-number" label={t('tracking.number')} value={number} onChange={(event) => setNumber(event.target.value)} placeholder="SAL-2026-XXXXXX" autoComplete="off" required className="font-mono uppercase" />
          <TextField id="order-phone" label={t('tracking.phone')} value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="0555 12 34 56" required />
          <button type="submit" disabled={state.kind === 'searching'} className="inline-flex min-h-touch items-center justify-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft disabled:opacity-60">
            {state.kind === 'searching' ? t('tracking.searching') : t('tracking.submit')}
          </button>
          {!isSupabaseConfigured && <p className="text-xs text-ink-muted">{t('tracking.localNote')}</p>}
        </form>

        <div aria-live="polite">
          {state.kind === 'found' && <TrackingResult tracking={state.tracking} />}
          {state.kind === 'notFound' && <p className="text-center text-ink-muted">{t('tracking.notFound')}</p>}
          {state.kind === 'error' && <p role="alert" className="text-center text-danger">{t('tracking.error')}</p>}
        </div>
      </main>
    </div>
  );
}
