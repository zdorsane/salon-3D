# 01 — Socle : bilan

## Fait
- **Outillage** : Vite 8, React 19.3, TypeScript 6.0 (strict, `noUncheckedIndexedAccess`),
  Tailwind 4 (`@tailwindcss/vite`), ESLint 10 (typescript-eslint strict, react-hooks, react-refresh),
  Vitest 5. Alias `@/` → `src/`.
- **Versions fixées** : `three ~0.183` (exigé par @google/model-viewer), `react ~19.3`
  (exigé par @react-three/fiber), `typescript ~6.0` (exigé par typescript-eslint).
- **Thème** (`src/index.css`) : jetons `brass`, `ink`, `night`, `glass`, utilitaire `glass`
  (verre dépoli), polices Marcellus / Manrope / IBM Plex Mono servies en local (@fontsource),
  cible tactile `size-touch` = 44 px, focus visible laiton.
- **Config** : `config/project.ts` (Saluna, WhatsApp, URL, devise), `config/routes.ts`
  (chemins uniques), `lib/env.ts` (lecture des variables `VITE_*`).
- **i18n** : `fr.ts` (référence), `en.ts` (typé sur fr), `translate()` avec paramètres
  `{nom}`, `useT()`, synchronisation `lang`/`dir`/titre ; `dir` prévu pour l'arabe.
- **Store** : `useUIStore` (langue, persistée).
- **Routes** (toutes sur un gabarit provisoire `PageShell`) : `/`, `/salon`,
  `/produit/:slug`, `/panier`, `/commande`, `/confirmation/:id`, `/suivi`, `/admin`, 404.
- **UI** : `TopBar` (logo, suivi, panier, FR/EN), `Loader` (déterminé ou indéterminé).

## Résultats
- `npx tsc --noEmit` : 0 erreur
- `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : 5 tests passent (traduction, parité des clés FR/EN, cycle des langues)
- `npm run dev` : démarre en ~0,6 s ; `npm run build` : OK (JS 103 ko gzip)

## À tester dans le navigateur (http://localhost:5173)
- [ ] La page d'accueil affiche la barre du haut en verre avec « Saluna » en laiton (Marcellus).
- [ ] Le bouton **EN** passe l'interface en anglais (titre de l'onglet compris) ; recharger la page conserve la langue.
- [ ] Les icônes Suivi et Panier mènent à `/suivi` et `/panier` ; « Retour au showroom » ramène à `/`.
- [ ] `/produit/test`, `/confirmation/123`, `/admin` et une URL inconnue affichent chacune leur titre.
- [ ] Navigation au clavier (Tab) : contour laiton visible sur chaque élément.
- [ ] Sur mobile (DevTools, 375 px) : pas de défilement horizontal, boutons faciles à toucher.

## Écarts par rapport au plan
- Ajout de `config/routes.ts` et `lib/env.ts` (pour ne coder aucun chemin ni aucune variable en dur).
- Ajout de `lucide-react` pour les icônes.
