import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link } from 'react-router';
import { CheckoutForm } from '@/components/shop/CheckoutForm';
import { OrderSummary } from '@/components/shop/OrderSummary';
import { Loader } from '@/components/ui/Loader';
import { TopBar } from '@/components/ui/TopBar';
import { PROJECT } from '@/config/project';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { computeOrder } from '@/lib/checkout';
import { EMPTY_CHECKOUT_FORM, type CheckoutField, type CheckoutFormValues } from '@/lib/checkoutForm';
import { formatPrice, localized } from '@/lib/format';
import { useCatalog } from '@/lib/useCatalog';
import { usePlaceOrder } from '@/lib/usePlaceOrder';
import { whatsappLink } from '@/lib/whatsapp';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

/** Page commande : formulaire, récapitulatif, commande ferme, devis ou WhatsApp. */
export function CheckoutPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,var(--color-night-soft),var(--color-night)_70%)]">
      <TopBar />
      <Suspense fallback={<Loader />}>
        <CheckoutBody />
      </Suspense>
    </div>
  );
}

function CheckoutBody() {
  const t = useT();
  const catalog = useCatalog();
  const locale = useUIStore((state) => state.locale);
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);
  const [values, setValues] = useState<CheckoutFormValues>(EMPTY_CHECKOUT_FORM);
  const { errors, submitError, sending, submit, clearError } = usePlaceOrder(values);

  const computation = computeOrder(items, catalog, { wilayaCode: values.wilayaCode, method: values.deliveryMethod }, promoCode ?? undefined);
  const onChange = <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  if (computation.lines.length === 0) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 pt-40 text-center">
        <p className="font-display text-2xl">{t('checkout.errors.emptyCart')}</p>
        <Link to={ROUTES.showroom} className="inline-flex min-h-touch items-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft">
          {t('common.backToShowroom')}
        </Link>
      </main>
    );
  }

  const whatsappMessage = [
    t('checkout.whatsappIntro', { store: PROJECT.storeName }),
    ...computation.lines.map((line) =>
      t('checkout.whatsappLine', { name: localized(line.product.name, locale), variant: localized(line.variant.label, locale), quantity: line.quantity }),
    ),
    t('checkout.whatsappTotal', { total: formatPrice(computation.totals.subtotal - computation.totals.discount, locale) }),
  ].join('\n');

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-24 pb-16">
      <div className="flex flex-col gap-1">
        <Link to={ROUTES.cart} className="inline-flex min-h-touch items-center gap-2 self-start text-sm text-ink-muted hover:text-ink">
          <ArrowLeft aria-hidden size={16} />
          {t('checkout.back')}
        </Link>
        <h1 className="font-display text-4xl">{t('checkout.title')}</h1>
      </div>

      <form noValidate onSubmit={(event) => { event.preventDefault(); void submit('order'); }} className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <CheckoutForm values={values} errors={errors} onChange={onChange} freeShipping={computation.shipping?.free ?? false} />

        <aside className="glass flex flex-col gap-5 rounded-3xl p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">{t('checkout.summary')}</h2>
          <OrderSummary computation={computation} />
          {submitError && <p role="alert" className="text-sm text-danger">{t(`checkout.errors.${submitError}`)}</p>}
          <button type="submit" disabled={sending !== null} className="inline-flex min-h-touch items-center justify-center rounded-full bg-brass px-6 font-medium text-night hover:bg-brass-soft disabled:opacity-60">
            {sending === 'order' ? t('checkout.sending') : t('checkout.confirm')}
          </button>
          <p className="-mt-2 text-center text-xs text-ink-muted">{t('checkout.legal')}</p>
          <div className="flex flex-col gap-2 border-t border-glass-border pt-4">
            <button type="button" disabled={sending !== null} onClick={() => void submit('quote')} className="inline-flex min-h-touch items-center justify-center rounded-full border border-brass px-6 text-brass hover:bg-brass hover:text-night disabled:opacity-60">
              {sending === 'quote' ? t('checkout.sending') : t('checkout.quote')}
            </button>
            <p className="text-xs text-ink-muted">{t('checkout.quoteHint')}</p>
            <a href={whatsappLink(whatsappMessage, PROJECT.whatsappNumber)} target="_blank" rel="noreferrer" className="inline-flex min-h-touch items-center justify-center gap-2 rounded-full px-6 text-sm text-ink-muted hover:text-ink">
              <MessageCircle aria-hidden size={16} />
              {t('checkout.whatsapp')}
            </a>
          </div>
        </aside>
      </form>
    </main>
  );
}
