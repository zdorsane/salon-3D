/** Chemins des pages : seule source de vérité pour le routeur et les liens. */
export const ROUTES = {
  showroom: '/',
  sharedRoom: '/salon',
  product: '/produit/:slug',
  cart: '/panier',
  checkout: '/commande',
  confirmation: '/confirmation/:id',
  tracking: '/suivi',
  admin: '/admin',
} as const;

/** Lien vers la fiche d'un produit. */
export function productPath(slug: string): string {
  return ROUTES.product.replace(':slug', encodeURIComponent(slug));
}

/** Lien vers la confirmation d'une commande ou d'un devis. */
export function confirmationPath(orderId: string): string {
  return ROUTES.confirmation.replace(':id', encodeURIComponent(orderId));
}
