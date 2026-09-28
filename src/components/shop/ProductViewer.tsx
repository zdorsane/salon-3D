import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ProductModel } from '@/components/canvas/ProductModel';
import { RENDER, VIEWER_LIGHTS } from '@/config/render';
import { useT } from '@/i18n/useT';
import { effectiveDimensions } from '@/lib/catalog';
import { dimensionsToMeters } from '@/lib/units';
import type { Product, Variant } from '@/types/catalog';

interface ProductViewerProps {
  product: Product;
  variant: Variant;
}

/** Aperçu 3D isolé d'un produit (fiche produit) : rotation libre, ombre au sol. */
export function ProductViewer({ product, variant }: ProductViewerProps) {
  const t = useT();
  const size = dimensionsToMeters(effectiveDimensions(product, variant));
  const span = Math.max(size.width, size.height, size.depth);
  // Les suspensions pendent sous leur point d'accroche : on les remonte au-dessus du sol
  const lift = product.category === 'suspension' ? size.height : 0;

  return (
    <Canvas
      shadows
      dpr={RENDER.dpr.desktop}
      camera={{ fov: 35, position: [span * 1.4, span * 0.9, span * 2.2] }}
      aria-label={t('product.viewer')}
      role="img"
      className="touch-none"
    >
      <hemisphereLight args={[VIEWER_LIGHTS.sky, VIEWER_LIGHTS.ground, VIEWER_LIGHTS.hemisphere]} />
      <directionalLight position={[span * 2, span * 3, span * 2]} intensity={VIEWER_LIGHTS.key} />
      <Suspense fallback={null}>
        <group position={[0, lift, 0]}>
          <ProductModel product={product} variant={variant} />
        </group>
        <ContactShadows opacity={0.5} scale={span * 3} blur={2.4} far={span} />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, size.height / 2, 0]}
        enablePan={false}
        minDistance={span * 0.8}
        maxDistance={span * 5}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
