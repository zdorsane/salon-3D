import { PRESET_IDS, PRESETS, type PresetId } from '@/config/presets';
import { useT } from '@/i18n/useT';
import { roomLines, roomTotal } from '@/lib/pricing';
import { useCatalog } from '@/lib/useCatalog';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import { SLOT_IDS } from '@/types/catalog';
import type { Composition } from '@/types/room';
import { PriceTag } from './PriceTag';

/** Nombre de meubles dont la couleur sert d'aperçu à l'ambiance. */
const PREVIEW_SLOTS = 5;

function sameComposition(a: Composition, b: Composition): boolean {
  return SLOT_IDS.every((id) => a[id]?.variantId === b[id]?.variantId);
}

/** Ambiances prêtes à l'emploi : un clic compose tout le salon (annulable). */
export function StylePresets() {
  const t = useT();
  const catalog = useCatalog();
  const composition = useRoomStore((state) => state.composition);

  const apply = (id: PresetId) => {
    const previous = useRoomStore.getState().composition;
    useRoomStore.getState().applyComposition(PRESETS[id]);
    useUIStore.getState().showToast({
      message: t('presets.applied', { name: t(`presets.${id}`) }),
      action: { label: t('toast.undo'), run: () => useRoomStore.getState().applyComposition(previous) },
    });
  };

  return (
    <section aria-labelledby="presets-title" className="flex flex-col gap-2">
      <h3 id="presets-title" className="text-sm text-ink-muted">{t('presets.title')}</h3>
      <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
        {PRESET_IDS.map((id) => {
          const lines = roomLines(PRESETS[id], catalog);
          const active = sameComposition(composition, PRESETS[id]);
          return (
            <li key={id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => apply(id)}
                disabled={active}
                aria-current={active || undefined}
                title={active ? t('presets.current') : undefined}
                className={`flex w-32 flex-col gap-1.5 rounded-2xl border p-2 text-start transition-colors ${active ? 'border-brass' : 'border-glass-border hover:border-brass/60'}`}
              >
                <span aria-hidden className="flex h-10 overflow-hidden rounded-xl">
                  {lines.slice(0, PREVIEW_SLOTS).map((line) => (
                    <span key={line.slotId} className="flex-1" style={{ backgroundColor: line.variant.swatch }} />
                  ))}
                </span>
                <span className="text-sm">{t(`presets.${id}`)}</span>
                <PriceTag price={roomTotal(lines).total} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
