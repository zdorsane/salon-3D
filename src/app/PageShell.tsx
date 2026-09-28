import { Link } from 'react-router';
import { TopBar } from '@/components/ui/TopBar';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import type { MessageKey } from '@/i18n/translate';

interface PageShellProps {
  titleKey: MessageKey;
}

/** Gabarit provisoire des pages : remplacé page par page au fil des phases. */
export function PageShell({ titleKey }: PageShellProps) {
  const t = useT();

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-40 pb-16 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-brass uppercase">{t('brand.tagline')}</p>
        <h1 className="font-display text-4xl sm:text-5xl">{t(titleKey)}</h1>
        <p className="text-ink-muted">{t('common.comingSoon')}</p>
        <Link
          to={ROUTES.showroom}
          className="inline-flex min-h-touch items-center rounded-full border border-brass px-6 text-brass transition-colors hover:bg-brass hover:text-night"
        >
          {t('common.backToShowroom')}
        </Link>
      </main>
    </div>
  );
}
