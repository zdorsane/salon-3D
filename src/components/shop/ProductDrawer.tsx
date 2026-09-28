import { AnimatePresence, motion } from 'framer-motion';
import { GitCompareArrows, X } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSelection, type Selection } from '@/lib/useSelection';
import { useIsMobile } from '@/lib/useIsMobile';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import { AddToCartButton } from './AddToCartButton';
import { AlternativesCarousel } from './AlternativesCarousel';
import { CompareModal } from './CompareModal';
import { FavoriteButton } from './FavoriteButton';
import { ProductActions } from './ProductActions';
import { ProductSummary } from './ProductSummary';
import { TrialBar } from './TrialBar';
import { VariantPicker } from './VariantPicker';

/** Panneau du meuble sélectionné : à droite sur ordinateur, en bas sur mobile. */
export function ProductDrawer() {
  return (
    <Suspense fallback={null}>
      <DrawerContainer />
    </Suspense>
  );
}

function DrawerContainer() {
  const selection = useSelection();
  const isMobile = useIsMobile();
  const offscreen = isMobile ? { y: '100%' } : { x: '110%' };

  return (
    <AnimatePresence>
      {selection && (
        <motion.aside
          key="drawer"
          initial={offscreen}
          animate={{ x: 0, y: 0 }}
          exit={offscreen}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          aria-labelledby="drawer-slot"
          className="glass fixed inset-x-0 bottom-0 z-50 flex h-[55vh] flex-col rounded-t-3xl sm:inset-x-auto sm:top-20 sm:right-3 sm:bottom-24 sm:h-auto sm:w-[400px] sm:rounded-3xl"
        >
          <DrawerContent selection={selection} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ selection }: { selection: Selection }) {
  const t = useT();
  const { slotId, slot, product, variant } = selection;
  const selectSlot = useUIStore((state) => state.selectSlot);
  const compareCount = useUIStore((state) => state.compareIds.length);
  const trialHere = useRoomStore((state) => state.trial?.slotId === slotId);
  const setVariant = useRoomStore((state) => state.setVariant);
  const [compareOpen, setCompareOpen] = useState(false);

  // Fermer valide l'essai en cours ; Échap ferme le panneau
  const close = () => {
    useRoomStore.getState().keepTrial();
    selectSlot(null);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-glass-border p-2 ps-5">
        <p id="drawer-slot" className="font-mono text-xs tracking-[0.2em] text-brass uppercase">
          {t(`slots.${slotId}`)}
        </p>
        <button type="button" onClick={close} aria-label={t('product.close')} className="grid size-touch place-items-center rounded-full hover:bg-glass-border">
          <X aria-hidden size={20} />
        </button>
      </header>

      <div className="flex flex-col gap-5 overflow-y-auto p-5">
        {trialHere && <TrialBar />}
        {product && variant ? (
          <>
            <ProductSummary product={product} variant={variant} />
            <VariantPicker product={product} selected={variant} onSelect={(id) => setVariant(slotId, id)} />
            <div className="flex items-center gap-2">
              <AddToCartButton product={product} variant={variant} />
              <FavoriteButton productId={product.id} className="border border-glass-border" />
            </div>
            <ProductActions slotId={slotId} product={product} variant={variant} />
          </>
        ) : (
          <div>
            <h2 className="font-display text-2xl">{t('product.emptySlot')}</h2>
            <p className="text-sm text-ink-muted">{t('product.emptyHint')}</p>
          </div>
        )}
        <AlternativesCarousel slot={slot} currentProductId={product?.id} />
        {compareCount >= 2 && (
          <button type="button" onClick={() => setCompareOpen(true)} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-full border border-brass text-brass hover:bg-brass hover:text-night">
            <GitCompareArrows aria-hidden size={16} />
            {t('compare.open', { count: compareCount })}
          </button>
        )}
      </div>
      {compareOpen && <CompareModal slot={slot} onClose={() => setCompareOpen(false)} />}
    </>
  );
}
