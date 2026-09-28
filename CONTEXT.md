# Saluna — contexte du projet

À lire en premier. Spécification technique détaillée : [CLAUDE.md](CLAUDE.md).

## Objectif

Showroom 3D e-commerce (Algérie, DA) : le client compose son salon en 3D, change
meubles et finitions, voit le prix total, puis commande (paiement à la livraison),
partage son salon par lien ou le voit chez lui en AR.

## Phases (une validation humaine entre chaque phase)

| # | Phase | État |
|---|---|---|
| 01 | [Socle](phases/01-socle/) | ✅ validée |
| 02 | [Scène 3D](phases/02-scene-3d/) | ✅ validée |
| 03 | [Catalogue & slots](phases/03-catalogue-slots/) | ✅ validée |
| 04 | [Configurateur](phases/04-configurateur/) | ✅ validée |
| 05 | [Salon composé & partage](phases/05-salon-compose/) | ✅ validée |
| 06 | [Panier & favoris](phases/06-panier-favoris/) | ✅ validée |
| 07 | [Commande & livraison](phases/07-commande/) | ✅ validée |
| 08 | [Backend Supabase](phases/08-backend-supabase/) | 🟢 terminée, en attente de validation |
| 09 | [Admin & AR](phases/09-admin-ar/) | ⚪ à faire |
| 10 | [Finitions & déploiement](phases/10-finitions/) | ⚪ à faire |

Chaque dossier contient `plan.md` (relu **avant** de coder) et `bilan.md` (écrit
à la fin : ce qui est fait, résultats tsc/lint/test, checklist navigateur).

## Table de routage

| Tâche | Où |
|---|---|
| Ajouter / modifier un produit, un prix, une variante | `src/data/catalog.json` (démo) ou Supabase |
| Ajouter / déplacer un emplacement de meuble | `src/config/slots.ts` |
| Pièce, murs, baie vitrée | `src/config/room.ts`, `src/components/canvas/` |
| Points de vue caméra | `src/config/viewpoints.ts` |
| Tarifs de livraison par wilaya | `src/config/shipping.ts` (zones, 58 wilayas) + `src/lib/shipping.ts` |
| Formulaire de commande, envoi | `src/lib/checkoutForm.ts`, `src/lib/usePlaceOrder.ts`, `src/app/CheckoutPage.tsx` |
| Ambiances prédéfinies | `src/config/presets.ts` |
| Couleurs et polices de l'UI | `src/index.css` (`@theme`), `src/config/theme.ts` |
| Textes de l'interface | `src/i18n/fr.ts`, `src/i18n/en.ts` |
| Calcul des prix (salon, panier) | `src/lib/pricing.ts` (+ tests) |
| Codes promo | `src/config/promo.ts` (démo), règles dans `src/lib/promo.ts` (+ tests) |
| Lien de partage du salon | `src/lib/urlState.ts` (+ tests) |
| Paiement | `src/lib/payment/` (interface `PaymentProvider`) |
| Base de données, règles RLS | `supabase/migrations/` (+ `npm run db:seed` → `supabase/seed.sql`) |
| Logique serveur (commande, suivi) | `src/server/` (testée), branchée par `supabase/functions/` |
| Nouveau modèle 3D | `public/models/` via `npm run optimize:glb` |
| Variables d'environnement | `.env.example` |
