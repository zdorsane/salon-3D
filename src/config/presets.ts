import type { SlotPlacement, Composition } from '@/types/room';

/** Placement d'un produit dans sa variante `productId--suffixe`. */
function place(productId: string, variantSuffix: string): SlotPlacement {
  return { productId, variantId: `${productId}--${variantSuffix}` };
}

/** Salon affiché à la première visite. */
export const DEFAULT_COMPOSITION: Composition = {
  canape: place('canape-angle-oran', 'lin-sable'),
  tableBasse: place('table-ronde-atlas', 'chene'),
  tapis: place('tapis-berbere-atlas', 'ecru-240'),
  fauteuil: place('fauteuil-cocoon-bejaia', 'velours-moutarde'),
  meubleTV: place('meuble-tv-cedre', 'chene'),
  rangement: place('bibliotheque-ksar', 'chene'),
  luminaire1: place('suspension-rotin-ghardaia', 'naturel'),
  luminaire2: place('lampadaire-lin-medea', 'lin-chene'),
  deco1: place('plante-olivier', 'terre-cuite'),
  deco2: place('tableau-sahara', 'dunes-100'),
  deco3: place('plante-monstera', 'blanc'),
};

export const PRESET_IDS = ['origine', 'moderne', 'scandinave', 'oriental', 'classique'] as const;
export type PresetId = (typeof PRESET_IDS)[number];

/** Ambiances prêtes à l'emploi (libellés dans `i18n` : `presets.<id>`). */
export const PRESETS: Record<PresetId, Composition> = {
  origine: DEFAULT_COMPOSITION,
  moderne: {
    canape: place('canape-modulable-sahel', 'boucle-creme-3'),
    tableBasse: place('table-rect-cedre', 'chene-noir'),
    tapis: place('tapis-jute-tassili', 'bord-noir'),
    fauteuil: place('fauteuil-cocoon-bejaia', 'boucle-ivoire'),
    meubleTV: place('meuble-tv-cedre', 'blanc'),
    rangement: place('etagere-murale-tlemcen', 'noir'),
    luminaire1: place('suspension-globe-opale', 'laiton'),
    luminaire2: place('lampadaire-arc-alger', 'laiton'),
    deco1: place('plante-monstera', 'blanc'),
    deco2: place('tableau-sahara', 'nuit-100'),
    deco3: place('vase-kabyle', 'noir'),
  },
  scandinave: {
    canape: place('canape-3p-tipaza', 'lin-naturel'),
    tableBasse: place('table-ronde-atlas', 'chene'),
    tapis: place('tapis-jute-tassili', 'naturel'),
    fauteuil: place('rocking-chair-hoggar', 'chene-lin'),
    meubleTV: place('meuble-tv-cedre', 'chene'),
    rangement: place('bibliotheque-ksar', 'blanc'),
    luminaire1: place('suspension-cone-cirta', 'blanc'),
    luminaire2: place('lampadaire-lin-medea', 'lin-chene'),
    deco1: place('plante-olivier', 'blanc'),
    deco2: place('tableau-sahara', 'dunes-100'),
    deco3: place('plante-monstera', 'rotin'),
  },
  oriental: {
    canape: place('canape-angle-oran', 'velours-olive'),
    tableBasse: place('table-gigogne-djanet', 'marbre-vert'),
    tapis: place('tapis-berbere-atlas', 'terracotta-240'),
    fauteuil: place('chauffeuse-jijel', 'terracotta'),
    meubleTV: place('meuble-tv-casbah', 'noyer-laiton'),
    rangement: place('vaisselier-constantine', 'noyer'),
    luminaire1: place('suspension-rotin-ghardaia', 'naturel'),
    luminaire2: place('lampadaire-tripode-annaba', 'noir-terracotta'),
    deco1: place('plante-olivier', 'terre-cuite'),
    deco2: place('tableau-medina', 'ocre'),
    deco3: place('vase-kabyle', 'terre-cuite'),
  },
  classique: {
    canape: place('canape-3p-tipaza', 'cuir-cognac'),
    tableBasse: place('table-rect-cedre', 'travertin'),
    tapis: place('tapis-laine-mzab', 'bleu'),
    fauteuil: place('fauteuil-cocoon-bejaia', 'velours-bleu'),
    meubleTV: place('console-timgad', 'marbre-laiton'),
    rangement: place('vaisselier-constantine', 'vert'),
    luminaire1: place('suspension-cone-cirta', 'vert'),
    luminaire2: place('lampadaire-tripode-annaba', 'clair-ivoire'),
    deco1: place('vase-nedroma', 'bleu'),
    deco2: place('tableau-calligraphie', 'encre-or'),
    deco3: place('vase-nedroma', 'ivoire'),
  },
};
