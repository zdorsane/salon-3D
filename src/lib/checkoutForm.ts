import type { DeliveryMethod } from '@/config/shipping';
import type { OrderInput, OrderItemInput, OrderKind, PaymentMethod } from '@/types/order';
import { findWilaya } from './shipping';
import { checkRequiredText, isValidEmail, MAX_FIELD_LENGTH, normalizeAlgerianPhone, type FieldError } from './validation';

/** Valeurs brutes du formulaire de commande (telles que saisies). */
export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  /** Code de wilaya, 0 = non choisie */
  wilayaCode: number;
  commune: string;
  street: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
}

export type CheckoutField = keyof CheckoutFormValues;
export type CheckoutErrors = Partial<Record<CheckoutField, FieldError>>;

export const EMPTY_CHECKOUT_FORM: CheckoutFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  wilayaCode: 0,
  commune: '',
  street: '',
  notes: '',
  deliveryMethod: 'home',
  paymentMethod: 'cod',
};

/** Ordre d'affichage des champs (le premier en erreur reçoit le focus). */
export const CHECKOUT_FIELD_ORDER: CheckoutField[] = ['firstName', 'lastName', 'phone', 'email', 'wilayaCode', 'commune', 'street', 'notes'];

/** Une demande de devis n'exige ni commune ni adresse. */
export function validateCheckout(values: CheckoutFormValues, kind: OrderKind): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const required = (field: 'firstName' | 'lastName' | 'commune' | 'street') => {
    const error = checkRequiredText(values[field]);
    if (error) errors[field] = error;
  };
  required('firstName');
  required('lastName');
  if (values.phone.trim() === '') errors.phone = 'required';
  else if (!normalizeAlgerianPhone(values.phone)) errors.phone = 'phone';
  if (values.email.trim() !== '' && !isValidEmail(values.email)) errors.email = 'email';
  if (!findWilaya(values.wilayaCode)) errors.wilayaCode = 'required';
  if (kind === 'order') {
    required('commune');
    required('street');
  }
  if (values.notes.length > MAX_FIELD_LENGTH) errors.notes = 'tooLong';
  return errors;
}

/** Données envoyées au service de commandes (à appeler seulement sans erreur). */
export function toOrderInput(
  values: CheckoutFormValues,
  kind: OrderKind,
  items: OrderItemInput[],
  promoCode: string | null,
): OrderInput {
  const email = values.email.trim();
  const notes = values.notes.trim();
  return {
    kind,
    customer: {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: normalizeAlgerianPhone(values.phone) ?? values.phone,
      ...(email ? { email } : {}),
    },
    address: {
      wilayaCode: values.wilayaCode,
      commune: values.commune.trim(),
      street: values.street.trim(),
      ...(notes ? { notes } : {}),
    },
    deliveryMethod: values.deliveryMethod,
    paymentMethod: values.paymentMethod,
    items,
    ...(promoCode ? { promoCode } : {}),
  };
}
