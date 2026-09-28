import { ArrowLeft, Box } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { FavoriteButton } from '@/components/shop/FavoriteButton';
import { ProductSpecs } from '@/components/shop/ProductSpecs';
import { ProductSummary } from '@/components/shop/ProductSummary';
import { ProductViewer } from '@/components/shop/ProductViewer';
import { VariantPicker } from '@/components/shop/VariantPicker';
import { Loader } from '@/components/ui/Loader';
import { TopBar } from '@/components/ui/TopBar';
import { ROUTES } from '@/config/routes';
import { SLOTS } from '@/config/slots';
import { useT } from '@/i18n/useT';
import { compatibility, defaultVariant, findVariant } from '@/lib/catalog';
import { localized } from '@/lib/format';
import { useCatalog } from '@/lib/useCatalog';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import { SLOT_IDS, type Product } from '@/types/catalog';

/** Fiche produit : aperçu 3D, finitions, dimensions, description et essai dans le salon. */
export function ProductPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      <Suspense fallback={<Loader />}>
        <ProductDetails />
      </Suspense>
    </div>
  );
}

function ProductDetails() {
  const t = useT();
  const { slug } = useParams();
  const catalog = useCatalog();
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 pt-40 text-center">
        <p className="text-ink-muted">{t('product.notFound')}</p>
        <Link to={ROUTES.showroom} className="min-h-touch text-brass underline-offset-4 hover:underline">
          {t('common.backToShowroom')}
        </Link>
      </main>
    );
  }
  return <ProductBody key={product.id} product={product} />;
}

function ProductBody({ product }: { product: Product }) {
  const t = useT();
  const navigate = useNavigate();
  const locale = useUIStore((state) => state.locale);
  const [variantId, setVariantId] = useState(() => defaultVariant(product)?.id ?? '');
  const variant = findVariant(product, variantId);
  if (!variant) return null;

  // Premier slot où la variante choisie tient
  const slotId = SLOT_IDS.find((id) => compatibility(product, SLOTS[id], variant) === 'ok');

  const seeInShowroom = () => {
    if (!slotId) return;
    useRoomStore.getState().tryProduct(slotId, { productId: product.id, variantId: variant.id });
    useUIStore.getState().selectSlot(slotId);
    void navigate(ROUTES.showroom);
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 pt-24 pb-16 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <Link to={ROUTES.showroom} className="inline-flex min-h-touch items-center gap-2 self-start text-sm text-ink-muted hover:text-ink">
          <ArrowLeft aria-hidden size={16} />
          {t('common.backToShowroom')}
        </Link>
        <div className="glass aspect-square overflow-hidden rounded-3xl lg:aspect-[4/3]">
          <ProductViewer product={product} variant={variant} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ProductSummary product={product} variant={variant} />
        <VariantPicker product={product} selected={variant} onSelect={setVariantId} />
        <div className="flex items-center gap-2">
          <AddToCartButton product={product} variant={variant} />
          <FavoriteButton productId={product.id} className="border border-glass-border" />
        </div>
        <p className="leading-relaxed text-ink-muted">{localized(product.description, locale)}</p>
        {slotId && (
          <button type="button" onClick={seeInShowroom} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-full border border-brass px-6 text-brass hover:bg-brass hover:text-night">
            <Box aria-hidden size={18} />
            {t('product.seeInShowroom')}
          </button>
        )}
        <ProductSpecs product={product} variant={variant} />
      </div>
    </main>
  );
}
