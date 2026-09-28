# 02 — Scène 3D : bilan

## Fait
- **Config** : `config/room.ts` (pièce 6 × 5 × 2,80 m, baie, rideaux, terrasse, panorama,
  parquet, matériaux, palettes jour/nuit), `config/viewpoints.ts` (5 points de vue + limites
  caméra), `config/lighting.ts` (ambiances jour/nuit, spots encastrés 2700 K, ombres),
  `config/render.ts` (réglages mobile/ordinateur, post-traitement).
- **Pièce** (`Room`, `Floor`) : murs, plafond, plinthes (interrompues devant la baie),
  corniche ; parquet chêne **procédural** (lames décalées, veinage, raccord sans couture).
- **Baie vitrée** (`BayWindow`, `Curtains`, `Outdoor`, `Panorama`) : menuiserie alu noir
  3 vantaux, vitrage, rideaux en lin ondulés (sheen) sur tringle, terrasse en pierre avec
  garde-corps vitré, panorama méditerranéen procédural (collines, mer, étoiles et
  lumières de ville la nuit).
- **Éclairage** (`Lighting`, `SunLight`, `RecessedSpots`) : IBL par Lightformers
  (panneau côté baie + plafond), soleil avec ombres douces qui entre par la baie
  (2048 px ordinateur / 1024 px mobile), la nuit : lune, 5 spots encastrés 2700 K.
- **Post-traitement** (`Effects`, ordinateur seulement) : N8AO, Bloom la nuit, tone mapping ACES, SMAA.
- **Caméra** (`CameraRig`) : CameraControls ; murs, sol, plafond et vitrage bloquent la
  caméra, cible bornée à la pièce ; transitions **gsap** entre points de vue, interrompues
  dès que le client touche la caméra ; FOV 50° ordinateur / 62° mobile.
- **Interface** : `BottomBar` (5 points de vue, bascule Jour/Nuit), `SceneLoader`
  (écran de chargement avec fondu), page `Showroom` chargée à la demande (`/` et `/salon`).
- **Mobile** : DPR plafonné à 1,5, ombres 1024, textures réduites, pas de post-traitement.

## Résultats
- `npx tsc --noEmit` : 0 erreur
- `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : 18 tests passent (géométrie de la pièce, limites caméra, 5 points de vue dans la pièce, i18n)
- `npm run build` : OK. Page d'accueil 104 ko gzip ; module Showroom (three + drei +
  postprocessing) 502 ko gzip, chargé à la demande. Découpage plus fin prévu en phase 10.
- Vérifié par capture Chrome headless : jour, nuit, transition de point de vue, mobile 390 px.

## À tester dans le navigateur (http://localhost:5173)
- [ ] Le salon apparaît après l'écran de chargement « Saluna » (fondu).
- [ ] Glisser pour tourner, molette / pincer pour zoomer : impossible de sortir par les murs, le sol, le plafond ou la baie.
- [ ] Les 5 boutons de points de vue déplacent la caméra en douceur ; toucher la scène pendant le vol l'interrompt et désactive le bouton.
- [ ] **Nuit** : ciel étoilé, lumières de ville, spots chauds au plafond avec halo (bloom) ; **Jour** : tache de soleil sur le parquet avec l'ombre des meneaux.
- [ ] Mobile (ou DevTools 390 px) : champ de vision plus large, barre du bas qui défile, fluidité correcte.
- [ ] FR/EN : les libellés de la barre du bas changent.

## Écarts et remarques
- Parquet et panorama **procéduraux** (aucune image fournie) : seront remplacés par des
  textures PBR / photos 360° en phase 10 si tu en fournis.
- Choix de la couleur des murs et du sol : reporté à la phase 10 (finitions).
- `THREE.Clock deprecated` dans la console : vient de @react-three/fiber, pas de notre code.
