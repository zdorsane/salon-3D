# 05 — Salon composé & partage

## Objectif
Le salon entier est un état partageable, avec son prix total.

## Livrables
- `store/useRoomStore.ts` (persist), `store/useUIStore.ts`
- RoomSummary (prix total indicatif), StylePresets (`config/presets.ts`)
- `lib/urlState.ts` (`/salon?c=…`) + tests, ShareMenu (lien, WhatsApp)

## Détail

### Prix (`lib/pricing.ts` + tests)
- `roomLines(composition, catalog)` : une ligne par slot meublé (produit, variante, prix).
- `roomTotal(lines)` : total en dinars entiers, total « avant promo » (prix barrés), nombre de pièces.
- Indicatif seulement : le total fait foi côté serveur (phase 07/08).

### Lien de partage (`lib/urlState.ts` + tests)
- Format : `/salon?c=1.SKU.SKU._.SKU…` — version, puis **un SKU par slot** dans l'ordre de
  `SLOT_IDS`, `_` = slot vide. Lisible, ~140 caractères, insensible à l'ordre du catalogue.
- Décodage tolérant : SKU inconnu, produit incompatible avec le slot ou trop grand →
  valeur par défaut du slot ; version inconnue → lien ignoré. Le résultat signale les corrections.
- Ouvrir `/salon?c=…` charge le salon partagé (message « Salon partagé chargé ») ; tant qu'on
  reste sur `/salon`, l'adresse suit les modifications (`replaceState`).

### Ambiances (`config/presets.ts`, StylePresets)
- 5 ambiances : Salon d'origine, Moderne, Scandinave, Oriental, Classique (composition complète
  + couleurs d'aperçu). Test : chaque ambiance est valide (produits compatibles et qui tiennent).
- Appliquer une ambiance anime chaque meuble changé ; toast « Ambiance appliquée · Annuler ».

### Store
- `applyComposition(composition)` : remplace tout le salon (sorties animées), annule l'essai en cours.

### Interface
- **RoomSummary** : pastille « Mon salon · N pièces · total » sous la barre du haut ; ouverte,
  elle liste les meubles par slot (clic = sélection du meuble), les ambiances et le total indicatif.
- **ShareMenu** (barre du haut) : copier le lien, WhatsApp (`wa.me`), partage natif si disponible.
- **Toast** (`components/ui/Toast`) : messages courts avec action facultative.
- Textes FR/EN.

## Critère de fin
tsc, lint, tests (prix + encodage URL + ambiances) OK ; parcours vérifié par captures.
