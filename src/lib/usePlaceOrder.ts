import { useState } from 'react';
import { useNavigate } from 'react-router';
import { confirmationPath } from '@/config/routes';
import { useCartStore } from '@/store/useCartStore';
import type { OrderKind } from '@/types/order';
import { CHECKOUT_FIELD_ORDER, toOrderInput, validateCheckout, type CheckoutErrors, type CheckoutFormValues } from './checkoutForm';
import { OrderError, orderService, type OrderErrorCode } from './orders';
import { getPaymentProvider } from './payment';

export type SubmitError = 'form' | 'generic' | OrderErrorCode;

interface PlaceOrder {
  errors: CheckoutErrors;
  submitError: SubmitError | null;
  sending: OrderKind | null;
  submit: (kind: OrderKind) => Promise<void>;
  clearError: (field: keyof CheckoutErrors) => void;
}

/**
 * Envoi de la commande ou du devis : validation, création par le service, démarrage du
 * paiement (redirection éventuelle vers la passerelle), panier vidé, page de confirmation.
 */
export function usePlaceOrder(values: CheckoutFormValues): PlaceOrder {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [sending, setSending] = useState<OrderKind | null>(null);

  const submit = async (kind: OrderKind) => {
    const found = validateCheckout(values, kind);
    setErrors(found);
    const firstInvalid = CHECKOUT_FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      setSubmitError('form');
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const { items, promoCode, clear } = useCartStore.getState();
    setSubmitError(null);
    setSending(kind);
    try {
      const order = await orderService.create(toOrderInput(values, kind, items, promoCode));
      if (kind === 'quote') {
        // Un devis ne vide pas le panier : le client peut encore commander
        void navigate(confirmationPath(order.id));
        return;
      }
      const provider = getPaymentProvider(order.paymentMethod);
      if (!provider) throw new OrderError('payment');
      const payment = await provider.start(order);
      if (payment.kind === 'redirect') {
        clear();
        window.location.assign(payment.url);
        return;
      }
      // Quitter la page avant de vider le panier (évite l'affichage « panier vide »)
      await navigate(confirmationPath(order.id));
      clear();
    } catch (error) {
      setSubmitError(error instanceof OrderError ? error.code : 'generic');
    } finally {
      setSending(null);
    }
  };

  const clearError = (field: keyof CheckoutErrors) => {
    const remaining = Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field));
    if (errors[field]) setErrors(remaining);
    // Le message général disparaît quand plus aucun champ n'est en erreur
    if (submitError === 'form' && Object.keys(remaining).length === 0) setSubmitError(null);
  };

  return { errors, submitError, sending, submit, clearError };
}
