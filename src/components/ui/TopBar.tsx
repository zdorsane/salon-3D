import { PackageSearch } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { CartButton } from '@/components/shop/CartButton';
import { PROJECT } from '@/config/project';
import { ROUTES } from '@/config/routes';
import { LOCALES, nextLocale } from '@/i18n/locales';
import { useT } from '@/i18n/useT';
import { useUIStore } from '@/store/useUIStore';

const iconLinkClass =
  'grid size-touch place-items-center rounded-full text-ink transition-colors hover:bg-glass-border hover:text-brass';

interface TopBarProps {
  /** Actions propres à la page (ex. partage du salon), avant les liens communs */
  actions?: ReactNode;
}

/** Barre supérieure : logo, actions de la page, suivi de commande, panier et choix de la langue. */
export function TopBar({ actions }: TopBarProps) {
  const t = useT();
  const locale = useUIStore((state) => state.locale);
  const setLocale = useUIStore((state) => state.setLocale);
  const target = LOCALES[nextLocale(locale)];

  return (
    <header className="glass fixed inset-x-3 top-3 z-40 flex items-center justify-between rounded-full py-1 ps-5 pe-1.5">
      <Link
        to={ROUTES.showroom}
        aria-label={t('nav.home')}
        className="font-display text-2xl tracking-wide text-brass"
      >
        {PROJECT.storeName}
      </Link>

      <nav aria-label={t('nav.main')} className="flex items-center gap-1">
        {actions}
        <Link to={ROUTES.tracking} aria-label={t('nav.tracking')} title={t('nav.tracking')} className={iconLinkClass}>
          <PackageSearch aria-hidden size={20} />
        </Link>
        <CartButton className={iconLinkClass} />
        <button
          type="button"
          onClick={() => setLocale(nextLocale(locale))}
          aria-label={t('nav.switchLanguage', { language: target.label })}
          className={`${iconLinkClass} font-mono text-xs`}
        >
          {target.shortLabel}
        </button>
      </nav>
    </header>
  );
}
