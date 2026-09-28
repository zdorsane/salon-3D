# 04 — Configurateur : bilan

## Fait
- **Sélection 3D** : clic sur un meuble (un glissé de caméra n'est pas un clic), survol avec
  curseur main et étiquette « nom · prix », **contour doré** (effet Outline sur ordinateur,
  arêtes de boîte sur mobile), clic dans le vide ou Échap = désélection.
- **Recentrage caméra** sur le meuble choisi (`focusViewpoint`, recul plus grand sur mobile) et
  **décalage de projection** (`PanelViewOffset`) pour que le meuble reste dans la zone visible
  à côté du panneau (ordinateur) ou au-dessus du tiroir (mobile).
- **ProductDrawer** (à droite sur ordinateur, tiroir de 55 % sur mobile) : badges, nom, marque,
  note, prix (et ancien prix barré), stock, délai, **finitions en direct** (sans recharger le
  modèle), dimensions et matières, **cotes 3D** (L/P/H en cm, visibles par-dessus les meubles),
  comparer, retirer, fiche complète.
- **Alternatives** : carrousel des modèles compatibles avec le slot, grisés si trop grands
  (on propose la première variante qui tient). Un clic **met le modèle à l'essai** :
  « Garder celui-ci » / « Revenir au précédent » (même après plusieurs essais).
- **Remplacement animé** (gsap) : l'ancien meuble rétrécit, le nouveau apparaît avec un rebond ;
  anneau laiton pendant le chargement d'un .glb.
- **Filtres** : prix max, style, couleur, matière, livrable en 7 jours, compteur, réinitialiser.
- **Comparateur** (3 modèles d'un même slot) : prix, dimensions, matières, délai, note, « Essayer dans le salon ».
- **Page produit** `/produit/:slug` : aperçu 3D orientable, finitions, description, caractéristiques,
  « Voir dans le showroom » (place le produit à l'essai dans le bon slot et ouvre le panneau).
- Textes FR/EN complets (slots, badges, styles, matières, comparateur).

## Résultats
- `npx tsc --noEmit` : 0 erreur · `npm run lint` : 0 erreur, 0 avertissement
- `npm run test` : **81 tests** passent (+16) : essai / garder / revenir / essai sur un autre
  slot / variante sans animation / retrait (store), filtres, format des prix, première variante
  qui tient, cadrage caméra, décalage de projection.
- `npm run build` : OK — la fiche produit est un module séparé (7 ko gzip).
- Vérifié par captures, ordinateur (1280 × 800) et mobile (390 × 844) : sélection, finition
  anthracite, cotes, essai du canapé Tipaza, filtres, comparateur, fiche produit.

## À tester dans le navigateur (http://localhost:5173)
- [ ] Survoler puis cliquer un meuble : contour doré, panneau, caméra qui se recentre.
- [ ] Changer de finition : couleur et prix changent instantanément.
- [ ] « Afficher les cotes » : trois cotes en cm autour du meuble.
- [ ] Cliquer un autre modèle dans le carrousel : animation, bandeau d'essai, Garder / Revenir.
- [ ] Le canapé XXL Kabylie est grisé « Trop grand pour cet espace ».
- [ ] Filtres, puis comparateur (cocher 2 à 3 modèles avec l'icône ⇄).
- [ ] « Voir la fiche complète » puis « Voir dans le showroom ».
- [ ] Sur téléphone : tiroir en bas, meuble visible au-dessus.

## Écarts et remarques
- Les cartes d'alternatives montrent les **couleurs des finitions** faute de photos produit
  (le champ `images` du catalogue est prêt, les vignettes viendront avec les vrais visuels).
- Fermer le panneau pendant un essai **garde** le modèle essayé.
- Le comparateur se vide quand on change de slot (il ne compare que des modèles interchangeables).
- Serveur de dev : relancé avec ses fichiers temporaires sur D: (C: est plein).
