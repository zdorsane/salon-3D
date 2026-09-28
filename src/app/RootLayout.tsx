import { Outlet } from 'react-router';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Toast } from '@/components/ui/Toast';
import { useLocaleSync } from '@/i18n/useT';

/** Racine de toutes les routes : langue du document, tiroir panier et messages communs. */
export function RootLayout() {
  useLocaleSync();
  return (
    <>
      <Outlet />
      <CartDrawer />
      <Toast />
    </>
  );
}
