# Salon 3D — Showroom e-commerce

> **État du projet, phases et table de routage : lire d'abord [CONTEXT.md](CONTEXT.md).**
> Méthode ICM : chaque phase a son dossier `phases/NN-nom/` avec `plan.md` (validé avant
> de coder) et `bilan.md` (écrit en fin de phase). Mettre à jour l'état dans CONTEXT.md.

Showroom 3D photoréaliste : le client explore un salon, remplace chaque meuble par
d'autres modèles du catalogue (système de **slots**), change les finitions en direct,
voit le prix total évoluer, puis achète (panier, commande, devis, suivi) ou partage
son salon par lien / le voit chez lui en AR. Marché cible : Algérie (DA, 58 wilayas,
paiement à la livraison, CIB/Edahabia plus tard).

## Stack (versions vérifiées sur npm le 2026-09-26)

| Domaine | Paquets |
|---|---|
| Build / app | vite 8, react 19.3 (fiber exige `<19.4`), react-router 8, TypeScript **6.0.x** (typescript-eslint n'accepte pas TS 7) |
| 3D | three, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3 (+ postprocessing 6) |
| État | zustand 5 (+ `persist` : panier, favoris, salon composé) |
| Animation | gsap 3 (caméra, swap), framer-motion 13 (UI) |
| Style | Tailwind CSS 4 via `@tailwindcss/vite` |
| AR | @google/model-viewer 4 |
| Backend | Supabase (Postgres, Storage, Auth, Edge Functions) via @supabase/supabase-js 2 |
| Tests / qualité | vitest 5, eslint 10 + typescript-eslint |
| Pipeline 3D | gltfjsx, @gltf-transform/cli |

## Commandes

```bash
npm run dev          # serveur de dev Vite
npm run build        # tsc --noEmit && vite build
npm run preview      # prévisualiser le build
npm run lint         # eslint
npx tsc --noEmit     # vérification des types
npm run test         # vitest (run)
npm run optimize:glb -- public/models/src/x.glb   # compression Draco/meshopt + textures WebP
npm run db:seed      # régénère supabase/seed.sql depuis src/data/catalog.json (Node ≥ 23)
```

Critère de fin de phase : `npm run dev` démarre, `npx tsc --noEmit`, `npm run lint`
et `npm run test` passent sans erreur.

## Architecture

```
src/
  app/                routes : Showroom, ProductPage, Cart, Checkout, Confirmation, Tracking, Admin
  components/canvas/  Scene, Room, BayWindow, Lighting, Effects, CameraRig, Slot, PlacedProduct,
                      ProductModel, SwapAnimator, DimensionLines, SelectionOutline, PanelViewOffset
  components/shop/    ProductDrawer, ProductSummary, VariantPicker, ProductActions, TrialBar,
                      AlternativesCarousel, Filters, CompareModal, ProductViewer,
                      RoomSummary, CartDrawer, CheckoutForm, StylePresets, ARButton, ShareMenu
  components/ui/      Loader, TopBar, BottomBar, Toast, Modal
  store/              useRoomStore, useCartStore, useFavoritesStore, useUIStore
  config/             project.ts, room.ts, slots.ts, viewpoints.ts, presets.ts, shipping.ts, theme.ts
  data/               catalog.json (mode démo / hors-ligne)
  lib/                supabase.ts, catalog.ts, pricing.ts, urlState.ts, payment/
  types/              catalog.ts, order.ts
  i18n/               fr.ts, en.ts (structure prête pour ar + RTL)
supabase/             migrations/, seed.sql, functions/ (create-order, track-order)
public/models, public/textures
```

## Concepts clés

- **Slot** : emplacement du salon (`canape`, `tableBasse`, `tapis`, `fauteuil`, `meubleTV`,
  `rangement`, `luminaire1`, `luminaire2`, `deco1`, `deco2`, `deco3` : les 3 points déco sont
  3 slots). Défini dans `config/slots.ts` : ancre, rotation, boîte max (m, repère local),
  alignement (`back` = contre le mur), montage (`floor` / `wall` / `ceiling`), catégories.
- **Compatibilité** (`lib/catalog.ts`) : catégorie acceptée puis encombrement de la variante
  (hauteur de pose incluse) → `ok` / `wrongCategory` / `tooLarge` (grisé dans l'UI).
- **Matériaux** : chaque modèle a un matériau par partie (`fabric`, `wood`, `metal`, `accent`,
  `foliage`, `glass`, `light`). Dans un .glb, **nommer les matériaux avec ces parties**. Base
  produit + surcharges variante (`resolveMaterials`), appliquées sans recharger (`usePartMaterials`).
- **Sélection / essai** : clic sur un meuble → `useUIStore.selectSlot` + caméra recentrée
  (`focusViewpoint`) ; la projection est décalée pour laisser la place au panneau
  (`PanelViewOffset`). Un modèle du carrousel est placé **à l'essai** (`tryProduct`) :
  « Garder » / « Revenir » ; fermer le panneau garde l'essai. Remplacer un produit passe
  par `outgoing` (animation de sortie, puis entrée avec rebond) ; changer de variante non.
- **Formes provisoires** : sans `modelUrl`, `components/canvas/placeholders/` dessine une forme
  par catégorie (champ `placeholder` pour varier : globe, cone, arc, tripod, olive…).
- **Product / Variant** : un produit a un `.glb` ; une variante porte le prix, le SKU, le
  stock et des **surcharges de matériaux** appliquées au modèle déjà chargé (pas de
  rechargement).
- **Salon composé** : `Record<SlotId, { productId, variantId } | null>` dans `useRoomStore`
  (persisté). Encodé dans l'URL par `lib/urlState.ts` : `/salon?c=1.SKU.SKU._…` (version,
  un **SKU** par slot dans l'ordre de `SLOT_IDS`, `_` = vide ; slot invalide → valeur par
  défaut). Sur `/salon`, `useSharedRoom` charge le lien puis garde l'adresse à jour.
  **Ne jamais réordonner `SLOT_IDS` ni réutiliser un SKU** : cela casserait les liens partagés.
- **Ambiances** (`config/presets.ts`) : compositions complètes, appliquées par
  `applyComposition` (animations + toast « Annuler »). Total indicatif : `lib/pricing.ts`.
- **Panier** (`useCartStore`) : `{ productId, variantId, quantity }[]` + code promo saisi,
  **sans prix** (recalculés via `useCart` → `cartLines` / `cartTotals` / `evaluatePromo`).
  Remises arrondies à l'inférieur, jamais supérieures au sous-total. Favoris : `useFavoritesStore`.
  CartDrawer et Toast sont montés dans `RootLayout` (toutes les pages).
- **Commande** : le navigateur envoie un `OrderInput` **sans prix** ; `computeOrder`
  (`lib/checkout.ts`) recalcule prix, promo et livraison — c'est ce calcul que l'edge function
  refera. Service `orderService` (`lib/orders/`, local en démo). Livraison : 58 wilayas → 5 zones
  (`config/shipping.ts`), forfait domicile / relais + supplément par meuble volumineux, offerte
  dès 400 000 DA hors Grand Sud. Paiement : `getPaymentProvider` (`lib/payment/`), seul `cod` actif.
- **Source du catalogue** : Supabase si `VITE_SUPABASE_URL` est défini, sinon
  `src/data/catalog.json` (`lib/catalogSource.ts`, repli sur la démo si Supabase échoue).
  Lignes SQL ↔ catalogue : `lib/catalogRows.ts`. Fonctions pures : `lib/catalog.ts`.
- **Backend** : schéma dans `supabase/migrations/` (RLS : catalogue actif en lecture seule,
  codes promo et commandes inaccessibles au navigateur). Logique serveur testable dans
  `src/server/` (validation stricte, `createOrder`, `trackOrder`, dépendances injectées) ;
  `supabase/functions/*/index.ts` ne fait que brancher la base (`_shared/db.ts`).
  `supabase/seed.sql` est **généré** : `npm run db:seed` (un test échoue s'il est périmé).
- **Code partagé navigateur ↔ Deno** : `src/server/**`, `lib/{checkout,pricing,promo,shipping,
  validation,catalog,catalogSchema,catalogRows,units}.ts`, `config/{promo,shipping,shop,slots,
  payment}.ts`, `types/*`. Dans ces fichiers : **imports avec extension `.ts`**, aucune API
  navigateur ni `import.meta.env` (vérifier avec `deno check` dans `supabase/functions`).

## Conventions

- TypeScript strict, **aucun `any`**, pas de code mort, composants < 200 lignes.
- **Commentaires en français.** Identifiants en anglais (sauf ids de slots métier).
- **Rien de codé en dur dans les composants** : prix, couleurs, positions, textes viennent
  de `src/config`, du catalogue ou de `src/i18n`. Couleurs d'UI = tokens Tailwind
  définis dans `src/index.css` (`@theme`).
- Unités 3D : **mètres**, origine au centre du sol, Y vers le haut. Dimensions produit en cm
  dans le catalogue, converties par `lib/units.ts`.
- Modèles `.glb` : échelle en mètres, pivot au sol (au point d'accroche pour une suspension),
  face avant vers **+Z local**, < 2 Mo.
- Prix en **dinars entiers** (pas de flottants). Le total est **toujours recalculé côté
  serveur** (edge function `create-order`) ; le total du navigateur n'est qu'indicatif.
- Aucune donnée de carte ne transite par nos serveurs : redirection vers la passerelle
  via l'interface `PaymentProvider`.
- Tests Vitest obligatoires pour : prix, livraison, codes promo, encodage URL, compatibilité
  produit ↔ slot.
- UI : verre dépoli sombre, accent laiton `#C9A66B`, texte `#F3EEE7` ; Marcellus (titres),
  Manrope (texte), IBM Plex Mono (prix, cotes). Mobile d'abord, cibles ≥ 44 px.

## Variables d'environnement

Voir `.env.example`. Les variables `VITE_*` sont exposées au navigateur : n'y mettre
**jamais** la clé `service_role` (réservée aux edge functions).
