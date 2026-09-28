import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { TOAST_DURATION_MS } from '@/config/shop';
import { useT } from '@/i18n/useT';
import { useUIStore } from '@/store/useUIStore';

/** Message court en bas de l'écran, fermé automatiquement, avec action facultative. */
export function Toast() {
  const t = useT();
  const toast = useUIStore((state) => state.toast);
  const dismissToast = useUIStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-24 z-[60] flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
            className="glass-strong pointer-events-auto flex max-w-md items-center gap-2 rounded-full py-1 ps-5 pe-1 text-sm"
          >
            <span className="py-2">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  dismissToast();
                }}
                className="min-h-touch rounded-full px-3 font-medium text-brass hover:bg-glass-border"
              >
                {toast.action.label}
              </button>
            )}
            <button type="button" onClick={dismissToast} aria-label={t('toast.close')} className="grid size-touch place-items-center rounded-full text-ink-muted hover:text-ink">
              <X aria-hidden size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
