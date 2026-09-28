# 08 — Backend Supabase : bilan

## Fait
- **Schéma** (`supabase/migrations/`) :
  - `products`, `variants`, `promo_codes` : contraintes alignées sur les types (catégories,
    styles, prix entiers ≥ 0, prix barré > prix, codes en majuscules, % ≤ 100) ;
  - `orders` (total = sous-total − remise + livraison vérifié par la base, wilaya 1–58,
    téléphone au format national) et `order_events` (historique rempli par déclencheur) ;
  - **RLS** : lecture publique des seuls produits / variantes actifs ; codes promo et commandes
    **inaccessibles au navigateur** (seules les edge functions, clé service_role, y accèdent) ;
    droits `grant` / `revoke` explicites.
- **Seed** (`supabase/seed.sql`) **généré** depuis `src/data/catalog.json` et `src/config/promo.ts`
  par `npm run db:seed` ; ré-exécutable (upsert). Un test échoue si le fichier est périmé.
- **Code serveur testable** (`src/server/`) : validation stricte des commandes reçues
  (quantités, téléphone, wilaya, adresse, 50 lignes max, variantes en double fusionnées),
  `createOrder` (prix / promo / livraison recalculés depuis la base, article retiré → refus,
  carte refusée tant que la passerelle n'est pas branchée, renumérotation en cas de collision),
  `trackOrder` (numéro + téléphone, réponse identique si l'un des deux est faux, aucune donnée
  personnelle renvoyée), CORS / JSON.
- **Edge functions** (`supabase/functions/create-order`, `track-order`) : quelques lignes qui
  branchent Supabase (`_shared/db.ts`) sur `src/server/`. Le calcul est **le même code** que
  dans le navigateur (import map `@/` → `src/`).
- **Navigateur** : `lib/supabase.ts` (client si `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`),
  `lib/catalogSource.ts` (Supabase, sinon JSON ; repli sur la démo en cas d'erreur),
  `lib/orders/supabase.ts` (appel des edge functions, erreurs traduites), bascule automatique.
- **Page `/suivi`** : numéro + téléphone (lien direct `/suivi?n=…` depuis la confirmation),
  statut, frise des étapes, historique daté, articles, total. En démo : commandes de cet appareil.

## Résultats
- `npx tsc --noEmit` : 0 erreur · `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : **173 tests** passent (+21) : conversion
  catalogue ↔ lignes, validation serveur, create-order, track-order, HTTP / CORS, seed à jour,
  suivi local).
- **Postgres 18 réel** (instance temporaire isolée sur D:, port 54329) : migrations + seed
  appliqués, seed ré-exécutable ; contraintes vérifiées (total incohérent, wilaya 59, prix
  barré trop bas refusés) ; historique de statuts automatique ; **RLS vérifiée** avec les droits
  par défaut de Supabase simulés (anon : 31/32 produits quand un produit est désactivé, 101
  variantes, aucun accès aux codes promo ni aux commandes, aucune écriture).
- **Deno 2.9** : `deno check` des deux edge functions OK ; lignes exportées de Postgres →
  catalogue → calcul de commande exécutés sous Deno (Oran, BIENVENUE10 : 225 000 DA, identique
  au navigateur).

## Mise en service (à faire par toi, avec ton compte Supabase)
1. Créer un projet sur supabase.com (région la plus proche : Europe, ex. Francfort).
2. Installer la CLI Supabase, puis dans le dossier du projet :
   `supabase link --project-ref <ref>` → `supabase db push` → `supabase db seed`
   (ou coller migrations puis `seed.sql` dans l'éditeur SQL du tableau de bord).
3. Déployer : `supabase functions deploy create-order` et `supabase functions deploy track-order`.
4. Dans `.env.local` : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (Paramètres → API).
   **Jamais** la clé service_role côté navigateur (Supabase la fournit seule aux fonctions).
5. Relancer `npm run dev` : catalogue et commandes passent par Supabase.

## Écarts et remarques
- Je n'ai **pas pu déployer ni exécuter** les edge functions sur l'infrastructure Supabase
  (pas de compte, pas de CLI ni Docker ici). Le code est vérifié par Deno et par les tests, mais
  **un point est à confirmer au premier déploiement** : que le bundler Supabase suive bien les
  imports vers `src/` (en dehors de `supabase/functions`). Si ce n'est pas le cas, je proposerai
  une étape de copie avant déploiement.
- Pas de limitation du nombre de requêtes sur `track-order` / `create-order` : à ajouter avant
  l'ouverture publique (ex. règle au niveau de Supabase ou d'un proxy), noté pour la phase 10.
- Les produits restent modifiables via `catalog.json` + `npm run db:seed` ; l'administration
  arrive en phase 09.
- Outils de test installés uniquement sur D: (`node_modules/.cache/` : Deno, base Postgres
  temporaire) : rien n'a été installé globalement ni écrit sur C:.
