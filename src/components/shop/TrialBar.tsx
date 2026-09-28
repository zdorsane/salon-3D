import { Check, Undo2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useRoomStore } from '@/store/useRoomStore';

/** Bandeau d'essai : garder le modèle essayé ou revenir au précédent. */
export function TrialBar() {
  const t = useT();
  const keepTrial = useRoomStore((state) => state.keepTrial);
  const cancelTrial = useRoomStore((state) => state.cancelTrial);

  return (
    <div role="status" className="flex flex-wrap items-center gap-2 rounded-2xl border border-brass/40 bg-brass/10 p-2 ps-4">
      <span className="flex-1 text-sm text-brass">{t('product.trying')}</span>
      <button
        type="button"
        onClick={cancelTrial}
        className="inline-flex min-h-touch items-center gap-2 rounded-full px-4 text-sm text-ink-muted hover:text-ink"
      >
        <Undo2 aria-hidden size={16} />
        {t('product.revert')}
      </button>
      <button
        type="button"
        onClick={keepTrial}
        className="inline-flex min-h-touch items-center gap-2 rounded-full bg-brass px-4 text-sm font-medium text-night hover:bg-brass-soft"
      >
        <Check aria-hidden size={16} />
        {t('product.keep')}
      </button>
    </div>
  );
}
