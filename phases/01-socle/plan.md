# 01 — Socle

> Plan reconstruit à partir de CLAUDE.md : à corriger si besoin avant de continuer.

## Objectif
Projet qui démarre, avec l'outillage, le thème et le squelette des routes.

## Livrables
- [x] `package.json` (nom `saluna`, scripts) et dépendances d'exécution installées
- [x] `.env.example`
- [x] Dépendances de dev : vite 8, TypeScript 6.0, @vitejs/plugin-react, Tailwind 4 (`@tailwindcss/vite`), eslint 10 + typescript-eslint, vitest 5, types
- [x] `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`
- [x] `src/index.css` : tokens `@theme` (laiton `#C9A66B`, texte `#F3EEE7`, verre sombre), polices Marcellus / Manrope / IBM Plex Mono
- [x] `src/config/project.ts` (nom Saluna, WhatsApp, URL), `src/i18n/fr.ts` + `en.ts`
- [x] Routes vides : Showroom, ProductPage, Cart, Checkout, Confirmation, Tracking, Admin
- [x] Composants UI de base : TopBar, Loader

## Critère de fin
`npm run dev` démarre ; `npx tsc --noEmit`, `npm run lint`, `npm run test` passent.
