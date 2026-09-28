import { AnimatePresence, motion } from 'framer-motion';
import { Copy, MessageCircle, Share2 } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { PROJECT } from '@/config/project';
import { useT } from '@/i18n/useT';
import { useCatalog } from '@/lib/useCatalog';
import { sharePath } from '@/lib/urlState';
import { whatsappLink } from '@/lib/whatsapp';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';

const itemClass =
  'flex min-h-touch w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors hover:bg-glass-border';

/** Bouton « Partager mon salon » : lien à copier, WhatsApp, partage natif du téléphone. */
export function ShareMenu() {
  return (
    <Suspense fallback={null}>
      <ShareButton />
    </Suspense>
  );
}

function ShareButton() {
  const t = useT();
  const catalog = useCatalog();
  const composition = useRoomStore((state) => state.composition);
  const showToast = useUIStore((state) => state.showToast);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const url = `${window.location.origin}${sharePath(composition, catalog)}`;
  const message = t('share.message', { store: PROJECT.storeName, url });
  const canShareNatively = typeof navigator.share === 'function';

  // Clic à l'extérieur ou Échap : fermer
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast({ message: t('share.copied') });
      setOpen(false);
    } catch {
      showToast({ message: t('share.copyFailed') });
    }
  };

  const shareNatively = async () => {
    try {
      await navigator.share({ title: PROJECT.storeName, text: message, url });
      setOpen(false);
    } catch {
      // Partage annulé par l'utilisateur : rien à faire
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('share.button')}
        title={t('share.button')}
        onClick={() => setOpen((value) => !value)}
        className="grid size-touch place-items-center rounded-full text-ink transition-colors hover:bg-glass-border hover:text-brass"
      >
        <Share2 aria-hidden size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="menu"
            aria-label={t('share.title')}
            className="glass-strong absolute end-0 top-full mt-3 flex w-72 flex-col gap-1 rounded-2xl p-2"
          >
            <input
              readOnly
              value={url}
              aria-label={t('share.title')}
              onFocus={(event) => event.target.select()}
              className="mb-1 min-h-touch rounded-xl border border-glass-border bg-transparent px-3 font-mono text-xs text-ink-muted"
            />
            <button type="button" role="menuitem" onClick={() => void copy()} className={itemClass}>
              <Copy aria-hidden size={18} className="text-brass" />
              {t('share.copy')}
            </button>
            <a
              role="menuitem"
              href={whatsappLink(message)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <MessageCircle aria-hidden size={18} className="text-brass" />
              {t('share.whatsapp')}
            </a>
            {canShareNatively && (
              <button type="button" role="menuitem" onClick={() => void shareNatively()} className={itemClass}>
                <Share2 aria-hidden size={18} className="text-brass" />
                {t('share.native')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
