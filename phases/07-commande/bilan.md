# 07 — Commande & livraison : bilan

## Fait
- **Livraison** (`config/shipping.ts`, `lib/shipping.ts`) : les 58 wilayas (codes 1–58) réparties
  en 5 zones (Centre, Nord, Hauts Plateaux, Sud, Grand Sud). Par zone : forfait à domicile /
  point relais, supplément par meuble volumineux, délai de transport. Livraison offerte dès
  400 000 DA (après remise), hors Grand Sud. Délai estimé = fabrication la plus longue + transport.
  **Tarifs de démonstration** à remplacer par ceux du transporteur.
- **Commande** (`types/order.ts`, `lib/checkout.ts`) : `OrderInput` sans aucun prix ;
  `computeOrder` recalcule tout (prix, code promo, livraison) — même calcul pour le serveur en 08.
  Lignes figées (SKU, libellés, prix unitaire). Numéros `SAL-AAAA-XXXXXX` / `DEV-AAAA-XXXXXX`
  (sans 0/O ni 1/I, pour la dictée au téléphone).
- **Validation** (`lib/validation.ts`, `lib/checkoutForm.ts`) : téléphone algérien (mobiles
  05/06/07, fixes, formats +213 / 00213 normalisés), e-mail facultatif, champs obligatoires ;
  un devis n'exige pas d'adresse. Focus sur le premier champ en erreur.
- **Paiement** (`lib/payment/`) : interface `PaymentProvider` (paiement à la livraison ou
  redirection vers une passerelle), provider `cod` actif ; CIB / Edahabia « bientôt disponible ».
- **Service de commandes** (`lib/orders/`) : interface `OrderService`, implémentation locale
  (commandes gardées dans le navigateur, `useOrdersStore`) ; Supabase en phase 08.
- **Page `/commande`** : coordonnées, wilaya / commune / adresse, domicile ou relais (prix de la
  zone), paiement, récapitulatif en direct (remise, livraison, total, délai), « Confirmer la
  commande », « Demander un devis », « Commander par WhatsApp » (message pré-rempli).
- **Page `/confirmation/:id`** : numéro, prochaines étapes (appel, livraison, paiement au livreur
  ou rappel pour un devis), récapitulatif, contact WhatsApp. Le panier est vidé après une
  commande (pas après un devis).

## Résultats
- `npx tsc --noEmit` : 0 erreur · `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : **152 tests** passent (+32) : 58 wilayas, tarifs par zone, supplément
  volumineux, livraison offerte / Grand Sud, délai ; calcul de commande (promo avant seuil de
  livraison, code refusé), lignes figées, numéros ; téléphones valides / invalides ; formulaire
  (champs manquants, devis sans adresse, données nettoyées) ; service de commandes (création,
  devis, panier vide, wilaya inconnue).
- `npm run build` : OK (pages commande et confirmation en modules séparés).
- Vérifié par captures, ordinateur et mobile : erreurs du formulaire, formulaire rempli (Oran :
  2 500 DA + 2 000 DA canapé, code −30 000 DA, total 299 500 DA, délai 23–26 jours),
  confirmation `SAL-2026-…`, panier vidé.

## À tester dans le navigateur (http://localhost:5173)
- [ ] Panier → Commander → valider à vide : erreurs, focus sur « Prénom ».
- [ ] Téléphone `+213 555 12 34 56` accepté ; `0855…` refusé.
- [ ] Changer de wilaya (Alger / Tamanrasset) et de mode : livraison et total changent.
- [ ] Panier > 400 000 DA : livraison « Offerte » (sauf Grand Sud).
- [ ] Confirmer : page de confirmation, panier vide.
- [ ] Demander un devis sans adresse : numéro `DEV-…`, panier conservé.
- [ ] « Commander par WhatsApp » : message avec les articles.

## Écarts et remarques
- Les commandes sont gardées **dans le navigateur** (démo) : la page de confirmation n'est
  lisible que sur l'appareil qui a commandé. Enregistrement serveur en phase 08.
- Le numéro WhatsApp du magasin vient de `VITE_STORE_WHATSAPP` (valeur de démo sinon).
- La page `/suivi` reste provisoire (suivi branché avec Supabase en phase 08).
