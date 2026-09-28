import { createBrowserRouter } from 'react-router';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/config/routes';
import { PageShell } from './PageShell';
import { RootLayout } from './RootLayout';

/** Les pages 3D (three.js) sont chargées à la demande pour alléger les autres pages. */
const lazyShowroom = async () => ({ Component: (await import('./Showroom')).Showroom });
const lazyCheckoutPage = async () => ({ Component: (await import('./CheckoutPage')).CheckoutPage });
const lazyConfirmationPage = async () => ({ Component: (await import('./ConfirmationPage')).ConfirmationPage });
const lazyTrackingPage = async () => ({ Component: (await import('./TrackingPage')).TrackingPage });
const lazyCartPage = async () => ({ Component: (await import('./CartPage')).CartPage });
const lazyProductPage = async () => ({ Component: (await import('./ProductPage')).ProductPage });

/** Table des routes ; chaque page provisoire sera remplacée par sa vraie page. */
export const router = createBrowserRouter([
  {
    path: ROUTES.showroom,
    element: <RootLayout />,
    hydrateFallbackElement: <Loader />,
    children: [
      { index: true, lazy: lazyShowroom },
      { path: ROUTES.sharedRoom, lazy: lazyShowroom },
      { path: ROUTES.product, lazy: lazyProductPage },
      { path: ROUTES.cart, lazy: lazyCartPage },
      { path: ROUTES.checkout, lazy: lazyCheckoutPage },
      { path: ROUTES.confirmation, lazy: lazyConfirmationPage },
      { path: ROUTES.tracking, lazy: lazyTrackingPage },
      { path: ROUTES.admin, element: <PageShell titleKey="routes.admin" /> },
      { path: '*', element: <PageShell titleKey="routes.notFound" /> },
    ],
  },
]);
