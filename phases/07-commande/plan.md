# 07 — Commande & livraison

## Livrables
- `config/shipping.ts` : 58 wilayas, tarifs de démo + tests
- CheckoutForm, pages Checkout et Confirmation, demande de devis
- `lib/payment/` : interface `PaymentProvider`, provider `simulated` (paiement à la livraison)
- `types/order.ts`

## Détail

### Livraison (`config/shipping.ts`, `lib/shipping.ts` + tests)
- 58 wilayas (code officiel 1–58, nom), chacune rattachée à une **zone** : Centre, Nord,
  Hauts Plateaux, Sud, Grand Sud.
- Par zone (démo) : tarif **à domicile** et **en point relais** (stop desk), supplément par
  **meuble volumineux** (canapés, meubles TV, rangements), délai de transport min–max.
- Livraison offerte dès 400 000 DA (hors Grand Sud). Délai estimé = fabrication la plus longue
  du panier + délai de la zone.

### Commande (`types/order.ts`, `lib/checkout.ts` + tests)
- `OrderInput` : client (prénom, nom, téléphone, e-mail facultatif), adresse (wilaya, commune,
  adresse, précisions), mode de livraison, mode de paiement, articles, code promo, type
  (`order` | `quote`).
- `computeOrderTotals` : sous-total, remise, livraison, total — **même calcul que le serveur
  appellera en phase 08** (le navigateur n'est jamais cru sur parole).
- Validation (`lib/validation.ts` + tests) : téléphone algérien (05/06/07 + 8 chiffres,
  fixe 0XX, formats +213 / 00213 acceptés et normalisés), champs obligatoires, e-mail.
- Numéros : `SAL-AAAA-XXXXXX` (commande), `DEV-AAAA-XXXXXX` (devis).

### Paiement (`lib/payment/`)
- Interface `PaymentProvider` (`id`, `isAvailable`, `start(order)` → paiement à la livraison
  ou redirection vers une passerelle). Provider `simulated` = paiement à la livraison.
- CIB / Edahabia affichés « bientôt disponible » (aucune donnée de carte ne transite chez nous).

### Service de commandes (`lib/orders/`)
- Interface `OrderService` (`create`, `get`). Implémentation démo **locale** (commandes
  gardées dans le navigateur) ; la phase 08 branchera l'edge function `create-order`.

### Interface
- **Page `/commande`** : coordonnées, livraison (wilaya, commune, adresse, domicile / relais
  avec prix), paiement ; récapitulatif (lignes, remise, livraison, total, délai estimé) ;
  « Confirmer la commande », « Demander un devis » (adresse facultative), « Commander par WhatsApp ».
- **Page `/confirmation/:id`** : numéro, récapitulatif, prochaines étapes (appel de
  confirmation, paiement à la livraison), contact WhatsApp. Le panier est vidé après une commande.
- Textes FR/EN.

## Critère de fin
tsc, lint, tests (livraison, validation, totaux de commande) OK ; parcours vérifié par captures.
