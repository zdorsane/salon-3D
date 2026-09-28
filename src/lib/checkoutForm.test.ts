import { describe, expect, it } from 'vitest';
import { EMPTY_CHECKOUT_FORM, toOrderInput, validateCheckout, type CheckoutFormValues } from './checkoutForm';

const VALID: CheckoutFormValues = {
  ...EMPTY_CHECKOUT_FORM,
  firstName: ' Amina ',
  lastName: 'Benali',
  phone: '+213 555 12 34 56',
  wilayaCode: 16,
  commune: 'Hydra',
  street: '5 rue Didouche',
};

describe('formulaire de commande', () => {
  it('accepte un formulaire complet', () => {
    expect(validateCheckout(VALID, 'order')).toEqual({});
  });

  it('signale chaque champ manquant ou invalide', () => {
    expect(validateCheckout(EMPTY_CHECKOUT_FORM, 'order')).toEqual({
      firstName: 'required',
      lastName: 'required',
      phone: 'required',
      wilayaCode: 'required',
      commune: 'required',
      street: 'required',
    });
    expect(validateCheckout({ ...VALID, phone: '0855', email: 'x@' }, 'order')).toEqual({ phone: 'phone', email: 'email' });
  });

  it('un devis n’exige pas d’adresse', () => {
    expect(validateCheckout({ ...VALID, commune: '', street: '' }, 'quote')).toEqual({});
  });

  it('prépare les données : textes nettoyés, téléphone normalisé, champs vides omis', () => {
    const items = [{ productId: 'p', variantId: 'p--v', quantity: 1 }];
    const input = toOrderInput(VALID, 'order', items, 'BIENVENUE10');
    expect(input.customer).toEqual({ firstName: 'Amina', lastName: 'Benali', phone: '0555123456' });
    expect(input.address).toEqual({ wilayaCode: 16, commune: 'Hydra', street: '5 rue Didouche' });
    expect(input.promoCode).toBe('BIENVENUE10');
    expect(toOrderInput(VALID, 'order', items, null)).not.toHaveProperty('promoCode');
  });
});
