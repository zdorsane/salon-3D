# 03 — Catalogue & slots : bilan

## Fait
- **Types** (`types/catalog.ts`, `types/room.ts`) : Product, Variant, Dimensions (cm),
  MaterialSpec / MaterialSet par partie, badges, styles, options de variante, Composition.
- **Catalogue démo** (`data/catalog.json`) : **32 produits, 104 variantes** (3 à 5 chacun),
  prix réalistes en DA, prix barrés, badges, notes, délais, matières FR/EN. Un canapé
  XXL (320 × 220) et une variante 4 modules sont volontairement **trop grands** pour tester le grisage.
- **Validation** (`lib/catalogSchema.ts`) : le JSON (et plus tard Supabase) est vérifié à
  l'exécution ; toute erreur indique le champ fautif (`products[3].variants[1].price`).
- **Logique** (`lib/catalog.ts`, `lib/units.ts`, `lib/placement.ts`) : chargement, recherche,
  variante par défaut, dimensions effectives, fusion des matériaux, **compatibilité produit ↔ slot**
  (catégorie puis encombrement, hauteur de pose comprise), placement dans le slot.
- **Slots** (`config/slots.ts`) : 11 emplacements (les 3 points déco sont `deco1..3`),
  ancre, orientation (face avant vers le centre de la pièce), boîte max, alignement mur, montage sol / mur / plafond.
- **Salon par défaut** (`config/presets.ts`) et **store** `useRoomStore` (persisté).
- **3D** : `Furniture` (un Suspense par slot), `Slot`, `ProductModel` :
  - .glb via `useGLTF` (Draco + meshopt, cache), matériaux nommés par partie remplacés ;
  - sinon **formes provisoires arrondies** par catégorie (`placeholders/`) : canapés droit /
    d'angle / modulable, fauteuil, chauffeuse, rocking-chair, tables ronde / rectangulaire /
    gigognes, tapis (berbère, rayures, uni), meuble TV, console, bibliothèque, vaisselier,
    étagère murale, suspensions (globe, dôme, cône), lampadaires (tambour, arc, trépied),
    plantes (olivier, monstera), vases, tableaux (dunes, arche, calligraphie) ;
  - **un matériau PBR par partie** mis à jour en place au changement de variante (pas de rechargement).

## Résultats
- `npx tsc --noEmit` : 0 erreur
- `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : **65 tests** passent, dont compatibilité produit ↔ slot (catégorie, taille,
  taille par variante, hauteur de pose), ≥ 3 produits valides par slot, salon par défaut valide,
  boîtes des slots dans la pièce, validation du catalogue.
- `npm run build` : OK (catalogue en module séparé : 9,6 ko gzip).
- Vérifié par captures : vue d'ensemble (ordinateur), coin TV et coin lecture (mobile).

## À tester dans le navigateur (http://localhost:5173)
- [ ] Le salon apparaît, puis les meubles se posent : canapé d'angle, table ronde, tapis berbère,
      fauteuil moutarde, meuble TV, bibliothèque, suspension rotin, lampadaire, olivier, monstera, tableau.
- [ ] Aucun meuble ne traverse un mur ; le tableau est accroché au-dessus du canapé.
- [ ] Vue de nuit : les meubles restent lisibles.
- [ ] Remarque : changer de meuble ou de variante n'a pas encore d'interface (phase 04) ;
      on peut le simuler en modifiant `config/presets.ts` puis en vidant le stockage local.

## Écarts et remarques
- `deco` devient **3 slots** (`deco1` sol, `deco2` mur, `deco3` sol) pour garder « un meuble par slot ».
- Champ `slots compatibles` du produit : **déduit** de la catégorie (évite les incohérences).
- Champ ajouté `placeholder` (forme provisoire) : inutile dès qu'un .glb est fourni.
- La lumière réelle des luminaires la nuit sera branchée en phase 10 (rendu final).
- ⚠️ Le disque **C: est plein** (0 octet libre) : cela a interrompu un script ; le projet est sur D: et n'est pas touché.
