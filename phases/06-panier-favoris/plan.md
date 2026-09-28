# 06 — Panier & favoris

## Livrables
- `store/useCartStore.ts`, `store/useFavoritesStore.ts` (persist)
- CartDrawer, page Cart, « ajouter tout le salon au panier »
- `lib/pricing.ts` + codes promo + tests (dinars entiers)

## Détail

### Données
- Panier : `{ productId, variantId, quantity }[]` (une ligne par variante, quantité 1 à 10),
  code promo saisi. **Aucun prix stocké** : tout est recalculé depuis le catalogue.
- Favoris : liste d'identifiants produit.
- Les deux sont conservés entre les visites (`persist`).

### Calculs (`lib/pricing.ts`, `lib/promo.ts` + tests)
- `cartLines` : lignes valides (produit / variante introuvables ignorés), total par ligne.
- `cartTotals` : sous-total, total avant promotions, remise du code, total, nombre d'articles.
- Codes promo (`config/promo.ts`, démo) : pourcentage ou montant fixe, minimum d'achat,
  nombre d'articles minimum, plafond de remise, date d'expiration. Codes insensibles à la casse.
  Remise arrondie **à l'inférieur** en dinars entiers, jamais supérieure au sous-total.
  Refus expliqué : code inconnu, expiré, minimum non atteint.
  Démo : `BIENVENUE10` (−10 % dès 50 000 DA, plafond 30 000 DA), `SALUNA5000`
  (−5 000 DA dès 100 000 DA), `SALONCOMPLET` (−15 % dès 8 articles).
- Livraison : phase 07.

### Interface
- **Ajouter au panier** : panneau produit (showroom) et fiche produit, avec message
  « Ajouté au panier · Voir le panier ».
- **Tout le salon au panier** : bouton dans « Mon salon » (une ligne par meuble placé).
- **Favoris** : cœur sur le panneau produit, la fiche et les cartes d'alternatives.
- **CartDrawer** : ouvert par l'icône panier (pastille avec le nombre d'articles), sur toutes
  les pages ; lignes, quantités, total, « Voir le panier », « Commander ».
- **Page `/panier`** : lignes (quantité, retirer, déplacer en favoris), code promo, récapitulatif
  (sous-total, économies, remise, total indicatif), favoris avec « Ajouter au panier », panier vide.
- Toast et CartDrawer montés dans la mise en page racine (toutes les pages).

## Critère de fin
tsc, lint, tests (prix du panier, codes promo, stores) OK ; parcours vérifié par captures.
