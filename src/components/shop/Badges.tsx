import { useT } from '@/i18n/useT';
import type { Badge } from '@/types/catalog';

/** Pastilles « Nouveau », « Promo »… d'un produit. */
export function Badges({ badges }: { badges: Badge[] }) {
  const t = useT();
  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <li
          key={badge}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${
            badge === 'promo' ? 'bg-brass text-night' : 'border border-brass/50 text-brass'
          }`}
        >
          {t(`badges.${badge}`)}
        </li>
      ))}
    </ul>
  );
}
