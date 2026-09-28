import { Html } from '@react-three/drei';
import { formatPrice, localized } from '@/lib/format';
import { useUIStore } from '@/store/useUIStore';
import type { Product, Variant } from '@/types/catalog';

interface HoverLabelProps {
  product: Product;
  variant: Variant;
  /** Hauteur locale de l'étiquette */
  y: number;
}

/** Étiquette « Nom · prix » affichée au survol d'un meuble. */
export function HoverLabel({ product, variant, y }: HoverLabelProps) {
  const locale = useUIStore((state) => state.locale);

  return (
    <Html position={[0, y, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div className="glass rounded-full px-4 py-1.5 text-sm whitespace-nowrap text-ink">
        {localized(product.name, locale)}
        <span className="mx-2 text-ink-muted">·</span>
        <span className="font-mono text-brass">{formatPrice(variant.price, locale)}</span>
      </div>
    </Html>
  );
}
