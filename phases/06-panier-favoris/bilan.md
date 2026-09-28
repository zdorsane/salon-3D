# 06 — Panier & favoris : bilan

## Fait
- **Panier** (`useCartStore`, persisté) : une ligne par variante, quantité 1 à 10, code promo
  saisi ; **aucun prix stocké**, tout est recalculé depuis le catalogue (`useCart`).
- **Favoris** (`useFavoritesStore`, persisté) : cœur sur le panneau produit, la fiche produit et
  les cartes d'alternatives ; section « Mes favoris » sur la page panier.
- **Calculs** (`lib/pricing.ts`) : lignes (prix × quantité), sous-total, économies sur prix
  barrés, remise, total indicatif, nombre d'articles ; articles disparus du catalogue ignorés.
- **Codes promo** (`config/promo.ts` + `lib/promo.ts`) : pourcentage ou montant fixe, minimum
  d'achat, minimum d'articles, plafond, expiration ; saisie insensible à la casse et aux espaces ;
  remise arrondie à l'inférieur, jamais supérieure au sous-total ; refus expliqué.
  Démo : `BIENVENUE10` (−10 % dès 50 000 DA, plafond 30 000 DA), `SALUNA5000`
  (−5 000 DA dès 100 000 DA), `SALONCOMPLET` (−15 % dès 8 articles).
- **Ajouter au panier** (panneau produit, fiche, favoris) avec message « Voir le panier ».
- **Tout le salon au panier** dans « Mon salon ».
- **CartDrawer** (toutes les pages, icône avec pastille du nombre d'articles) et **page `/panier`**
  (quantités, retirer, mettre en favoris, code promo, récapitulatif, panier vide).
- Toast et CartDrawer déplacés dans `RootLayout`.

## Résultats
- `npx tsc --noEmit` : 0 erreur · `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : **120 tests** passent (+17) : prix du panier (quantités, prix barrés, remise
  entière et bornée, articles disparus), codes promo (normalisation, arrondi, plafond, fixe borné,
  inconnu / expiré / minimums, codes de démo), stores panier et favoris.
- `npm run build` : OK (page panier en module séparé).
- Vérifié par captures (1280 × 800) : 11 meubles ajoutés d'un clic, tiroir panier, page panier
  avec `bienvenue10` (−30 000 DA, plafond), canapé déplacé en favoris.

## À tester dans le navigateur (http://localhost:5173)
- [ ] Sélectionner un meuble → « Ajouter au panier » → message → « Voir le panier ».
- [ ] « Mon salon » → « Tout le salon au panier » : la pastille du panier affiche 11.
- [ ] Page `/panier` : +/−, retirer, « Mettre en favoris ».
- [ ] Codes : `SALUNA5000`, `SALONCOMPLET` (≥ 8 articles), un code inconnu.
- [ ] Recharger la page : panier et favoris sont conservés.

## Écarts et remarques
- Pas encore de photos produit : les lignes montrent la pastille de couleur de la finition.
- Le bouton « Commander » mène à la page commande provisoire (phase 07).
- La pastille du panier compte les articles enregistrés, même si un produit a disparu du
  catalogue (cas qui n'arrive qu'après une mise à jour du catalogue).
