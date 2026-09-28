import { ExternalLink, GitCompareArrows, Ruler, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { productPath } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import type { Product, SlotId, Variant } from '@/types/catalog';
import { ProductSpecs } from './ProductSpecs';

interface ProductActionsProps {
  slotId: SlotId;
  product: Product;
  variant: Variant;
}

const actionClass =
  'inline-flex min-h-touch items-center gap-2 rounded-full border border-glass-border px-4 text-sm transition-colors hover:border-brass hover:text-brass';

/** Dimensions, matières et actions : cotes 3D, comparer, retirer, fiche complète. */
export function ProductActions({ slotId, product, variant }: ProductActionsProps) {
  const t = useT();
  const dimensionsVisible = useUIStore((state) => state.dimensionsVisible);
  const toggleDimensions = useUIStore((state) => state.toggleDimensions);
  const inCompare = useUIStore((state) => state.compareIds.includes(product.id));
  const toggleCompare = useUIStore((state) => state.toggleCompare);
  const removeFromSlot = useRoomStore((state) => state.removeFromSlot);

  return (
    <div className="flex flex-col gap-4">
      <ProductSpecs product={product} variant={variant} />

      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={dimensionsVisible} onClick={toggleDimensions} className={actionClass}>
          <Ruler aria-hidden size={16} />
          {t(dimensionsVisible ? 'product.hideDimensions' : 'product.showDimensions')}
        </button>
        <button
          type="button"
          aria-pressed={inCompare}
          onClick={() => toggleCompare(product.id)}
          className={`${actionClass} ${inCompare ? 'border-brass text-brass' : ''}`}
        >
          <GitCompareArrows aria-hidden size={16} />
          {t(inCompare ? 'product.inCompare' : 'product.compare')}
        </button>
        <Link to={productPath(product.slug)} className={actionClass}>
          <ExternalLink aria-hidden size={16} />
          {t('product.viewPage')}
        </Link>
        <button type="button" onClick={() => removeFromSlot(slotId)} className={`${actionClass} text-ink-muted`}>
          <Trash2 aria-hidden size={16} />
          {t('product.remove')}
        </button>
      </div>
    </div>
  );
}
