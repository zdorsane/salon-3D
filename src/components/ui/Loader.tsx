import { PROJECT } from '@/config/project';
import { useT } from '@/i18n/useT';

interface LoaderProps {
  /** Progression 0–100 ; absente = chargement indéterminé */
  progress?: number;
}

/** Écran de chargement plein écran aux couleurs du magasin. */
export function Loader({ progress }: LoaderProps) {
  const t = useT();
  const determinate = progress !== undefined;
  const label = determinate
    ? t('common.loadingProgress', { progress: Math.round(progress) })
    : t('common.loading');

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 grid place-items-center bg-night">
      <div className="flex w-64 flex-col items-center gap-4">
        <span className="font-display text-4xl tracking-wide text-brass">{PROJECT.storeName}</span>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-glass-border">
          {determinate ? (
            <div className="h-full bg-brass transition-[width] duration-300" style={{ width: `${progress}%` }} />
          ) : (
            <div className="h-full w-1/3 animate-loader bg-brass motion-reduce:animate-none" />
          )}
        </div>
        <p className="font-mono text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
