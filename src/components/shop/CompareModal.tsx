import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { SlotDefinition } from '@/config/slots';
import { useT } from '@/i18n/useT';
import { compatibility, effectiveDimensions, findProduct, fittingVariant } from '@/lib/catalog';
import { lowestPrice } from '@/lib/filters';
import { formatNumber, localized } from '@/lib/format';
import { useCatalog } from '@/lib/useCatalog';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import type { Product } from '@/types/catalog';
import { PriceTag } from './PriceTag';

interface CompareModalProps {
  slot: SlotDefinition;
  onClose: () => void;
}

/** Comparateur côte à côte (3 modèles au plus) : prix, dimensions, matières, délai, note. */
export function CompareModal({ slot, onClose }: CompareModalProps) {
  const t = useT();
  const catalog = useCatalog();
  const locale = useUIStore((state) => state.locale);
  const compareIds = useUIStore((state) => state.compareIds);
  const toggleCompare = useUIStore((state) => state.toggleCompare);
  const tryProduct = useRoomStore((state) => state.tryProduct);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const products = compareIds.map((id) => findProduct(catalog, id)).filter((p): p is Product => p !== undefined);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const rows: { label: string; value: (product: Product) => ReactNode }[] = [
    { label: t('compare.price'), value: (p) => <PriceTag price={lowestPrice(p)} from /> },
    {
      label: t('compare.dimensions'),
      value: (p) => {
        const d = effectiveDimensions(p, fittingVariant(p, slot));
        const f = (n: number) => formatNumber(n, locale);
        return <span className="font-mono text-xs">{t('product.dimensionsValue', { width: f(d.width), depth: f(d.depth), height: f(d.height) })}</span>;
      },
    },
    { label: t('compare.materials'), value: (p) => localized(p.materialsLabel, locale) },
    { label: t('compare.delivery'), value: (p) => t('compare.deliveryValue', { days: p.deliveryDays }) },
    { label: t('compare.rating'), value: (p) => `${formatNumber(p.rating, locale)} / 5` },
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="compare-title"
      className="glass m-auto w-[min(56rem,calc(100vw-2rem))] rounded-3xl p-0 text-ink backdrop:bg-night/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-2">
        <div>
          <h2 id="compare-title" className="font-display text-2xl">{t('compare.title')}</h2>
          <p className="text-sm text-ink-muted">{t('compare.hint')}</p>
        </div>
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('compare.close')} className="grid size-touch place-items-center rounded-full hover:bg-glass-border">
          <X aria-hidden size={20} />
        </button>
      </div>
      <div className="overflow-x-auto p-5 pt-2">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr>
              <td />
              {products.map((p) => (
                <th key={p.id} scope="col" className="p-2 text-start align-top font-normal">
                  <span className="block font-display text-base">{localized(p.name, locale)}</span>
                  <button type="button" onClick={() => toggleCompare(p.id)} className="min-h-touch text-xs text-ink-muted hover:text-ink">
                    {t('compare.remove')}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-glass-border">
                <th scope="row" className="p-2 text-start font-normal text-ink-muted">{row.label}</th>
                {products.map((p) => <td key={p.id} className="p-2 align-top">{row.value(p)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-glass-border">
              <td />
              {products.map((p) => {
                const variant = fittingVariant(p, slot);
                const fits = variant !== undefined && compatibility(p, slot, variant) === 'ok';
                return (
                  <td key={p.id} className="p-2">
                    <button
                      type="button"
                      disabled={!fits}
                      onClick={() => {
                        if (!variant) return;
                        tryProduct(slot.id, { productId: p.id, variantId: variant.id });
                        dialogRef.current?.close();
                      }}
                      className="min-h-touch rounded-full bg-brass px-4 text-sm font-medium text-night hover:bg-brass-soft disabled:opacity-40"
                    >
                      {fits ? t('compare.tryInRoom') : t('product.tooLarge')}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </dialog>
  );
}
