import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ShoppingCart, Sofa } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useT } from '@/i18n/useT';
import { slotViewpoint } from '@/lib/focus';
import { formatPrice, localized } from '@/lib/format';
import { roomLines, roomTotal } from '@/lib/pricing';
import { useCatalog } from '@/lib/useCatalog';
import { useIsMobile } from '@/lib/useIsMobile';
import { useCartStore } from '@/store/useCartStore';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import { SLOT_IDS } from '@/types/catalog';
import { PriceTag } from './PriceTag';
import { StylePresets } from './StylePresets';

/** Pastille « Mon salon · N pièces · total » ; ouverte : meubles, ambiances et total indicatif. */
export function RoomSummary() {
  return (
    <Suspense fallback={null}>
      <SummaryPanel />
    </Suspense>
  );
}

function SummaryPanel() {
  const t = useT();
  const catalog = useCatalog();
  const isMobile = useIsMobile();
  const locale = useUIStore((state) => state.locale);
  const composition = useRoomStore((state) => state.composition);
  const [open, setOpen] = useState(false);
  const lines = roomLines(composition, catalog);
  const { total, compareAtTotal, count } = roomTotal(lines);

  // Une ligne de panier par meuble placé
  const addRoomToCart = () => {
    useCartStore.getState().add(lines.map((line) => ({ productId: line.product.id, variantId: line.variant.id })));
    const { showToast, setCartOpen } = useUIStore.getState();
    showToast({
      message: t('cart.roomAdded', { count }),
      action: { label: t('cart.view'), run: () => setCartOpen(true) },
    });
    setOpen(false);
  };

  const focusLine = (index: number) => {
    const line = lines[index];
    if (!line) return;
    const { selectSlot, focusCamera } = useUIStore.getState();
    selectSlot(line.slotId);
    focusCamera(slotViewpoint(line.slotId, line.product, line.variant, isMobile));
    if (isMobile) setOpen(false);
  };

  return (
    <div className="fixed top-20 left-3 z-30 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col items-start gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="room-summary"
        aria-label={t(open ? 'summary.close' : 'summary.open')}
        onClick={() => setOpen((value) => !value)}
        className="glass inline-flex min-h-touch items-center gap-2 rounded-full ps-4 pe-3 text-sm"
      >
        <Sofa aria-hidden size={16} className="text-brass" />
        <span className="hidden sm:inline">{t('summary.title')} ·</span>
        <span className="text-ink-muted">{t(count === 1 ? 'summary.piece' : 'summary.pieces', { count })}</span>
        <span className="font-mono text-brass">{formatPrice(total, locale)}</span>
        <ChevronDown aria-hidden size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="room-summary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass flex max-h-[calc(100dvh-12rem)] w-full flex-col gap-4 overflow-y-auto rounded-3xl p-4"
          >
            <StylePresets />
            <section aria-labelledby="summary-items" className="flex flex-col gap-1">
              <h3 id="summary-items" className="text-sm text-ink-muted">{t('summary.items')}</h3>
              <ul className="flex flex-col">
                {SLOT_IDS.map((slotId) => {
                  const index = lines.findIndex((line) => line.slotId === slotId);
                  const line = lines[index];
                  return (
                    <li key={slotId}>
                      <button
                        type="button"
                        disabled={!line}
                        onClick={() => focusLine(index)}
                        className="grid min-h-touch w-full grid-cols-[1fr_auto] items-center gap-x-3 rounded-xl px-2 text-start text-sm hover:bg-glass-border disabled:hover:bg-transparent"
                      >
                        <span className="min-w-0">
                          <span className="block text-[11px] tracking-wider text-ink-muted uppercase">{t(`slots.${slotId}`)}</span>
                          <span className="block truncate">{line ? localized(line.product.name, locale) : t('summary.empty')}</span>
                        </span>
                        {line && <PriceTag price={line.variant.price} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            <div className="flex flex-col gap-1 border-t border-glass-border pt-3">
              <div className="flex items-baseline justify-between">
                <span>{t('summary.total')}</span>
                <PriceTag price={total} compareAtPrice={compareAtTotal > total ? compareAtTotal : undefined} size="lg" />
              </div>
              {compareAtTotal > total && (
                <p className="text-end text-sm text-success">{t('summary.savings', { amount: formatPrice(compareAtTotal - total, locale) })}</p>
              )}
              <p className="text-xs text-ink-muted">{t('summary.note')}</p>
              <button
                type="button"
                onClick={addRoomToCart}
                disabled={count === 0}
                className="mt-2 inline-flex min-h-touch items-center justify-center gap-2 rounded-full bg-brass px-4 text-sm font-medium text-night hover:bg-brass-soft disabled:opacity-40"
              >
                <ShoppingCart aria-hidden size={16} />
                {t('cart.addRoom')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
