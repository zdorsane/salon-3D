import type { ReactNode } from 'react';
import { SelectField, TextField } from '@/components/ui/Field';
import { useT } from '@/i18n/useT';
import type { CheckoutErrors, CheckoutField, CheckoutFormValues } from '@/lib/checkoutForm';
import { DeliveryOptions, WilayaOptions } from './DeliveryOptions';
import { PaymentOptions } from './PaymentOptions';

interface CheckoutFormProps {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  onChange: <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => void;
  /** Livraison offerte sur ce panier */
  freeShipping: boolean;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="glass flex flex-col gap-4 rounded-3xl p-5">
      <legend className="float-left mb-1 w-full font-display text-xl">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Champs de la commande : coordonnées, livraison, paiement (état tenu par la page). */
export function CheckoutForm({ values, errors, onChange, freeShipping }: CheckoutFormProps) {
  const t = useT();
  const error = (field: CheckoutField) => (errors[field] ? t(`checkout.errors.${errors[field]}`) : undefined);
  const text = (field: 'firstName' | 'lastName' | 'phone' | 'email' | 'commune' | 'street' | 'notes') => ({
    id: field,
    value: values[field],
    error: error(field),
    onChange: (event: { target: { value: string } }) => onChange(field, event.target.value),
  });

  return (
    <div className="flex flex-col gap-5">
      <Section title={t('checkout.contact')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...text('firstName')} label={t('checkout.firstName')} autoComplete="given-name" />
          <TextField {...text('lastName')} label={t('checkout.lastName')} autoComplete="family-name" />
        </div>
        <TextField {...text('phone')} label={t('checkout.phone')} hint={t('checkout.phoneHint')} type="tel" inputMode="tel" autoComplete="tel" placeholder="0555 12 34 56" />
        <TextField {...text('email')} label={t('checkout.email')} type="email" autoComplete="email" />
      </Section>

      <Section title={t('checkout.delivery')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="wilayaCode"
            label={t('checkout.wilaya')}
            value={values.wilayaCode}
            error={error('wilayaCode')}
            onChange={(event) => onChange('wilayaCode', Number(event.target.value))}
          >
            <option value={0} disabled>{t('checkout.wilayaPlaceholder')}</option>
            <WilayaOptions />
          </SelectField>
          <TextField {...text('commune')} label={t('checkout.commune')} autoComplete="address-level2" />
        </div>
        <TextField {...text('street')} label={t('checkout.street')} placeholder={t('checkout.streetPlaceholder')} autoComplete="street-address" />
        <TextField {...text('notes')} label={t('checkout.notes')} />
        <DeliveryOptions wilayaCode={values.wilayaCode} value={values.deliveryMethod} onChange={(method) => onChange('deliveryMethod', method)} free={freeShipping} />
      </Section>

      <Section title={t('checkout.payment')}>
        <PaymentOptions value={values.paymentMethod} onChange={(method) => onChange('paymentMethod', method)} />
      </Section>
    </div>
  );
}
