import { Moon, Sun } from 'lucide-react';
import { VIEWPOINT_IDS } from '@/config/viewpoints';
import { useT } from '@/i18n/useT';
import { useUIStore } from '@/store/useUIStore';

const chipClass =
  'inline-flex min-h-touch shrink-0 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors';

/** Barre inférieure : points de vue et bascule jour / nuit. */
export function BottomBar() {
  const t = useT();
  const viewpointId = useUIStore((state) => state.viewpointId);
  const goToViewpoint = useUIStore((state) => state.goToViewpoint);
  const timeOfDay = useUIStore((state) => state.timeOfDay);
  const toggleTimeOfDay = useUIStore((state) => state.toggleTimeOfDay);
  const isDay = timeOfDay === 'day';

  return (
    <nav
      aria-label={t('bottomBar.label')}
      className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-3xl items-center gap-1 rounded-full p-1.5"
    >
      <div
        role="group"
        aria-label={t('bottomBar.viewpoints')}
        className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]"
      >
        {VIEWPOINT_IDS.map((id) => {
          const active = id === viewpointId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => goToViewpoint(id)}
              className={`${chipClass} ${active ? 'bg-brass text-night' : 'text-ink hover:bg-glass-border'}`}
            >
              {t(`viewpoints.${id}`)}
            </button>
          );
        })}
      </div>

      <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-glass-border" />

      <button
        type="button"
        onClick={toggleTimeOfDay}
        aria-label={t(isDay ? 'bottomBar.toNight' : 'bottomBar.toDay')}
        title={t(isDay ? 'bottomBar.toNight' : 'bottomBar.toDay')}
        className={`${chipClass} gap-2 text-brass hover:bg-glass-border`}
      >
        {isDay ? <Moon aria-hidden size={18} /> : <Sun aria-hidden size={18} />}
        <span className="hidden sm:inline">{t(isDay ? 'bottomBar.night' : 'bottomBar.day')}</span>
      </button>
    </nav>
  );
}
