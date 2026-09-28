import type { fr } from './fr';

/** Arbre de messages : feuilles = chaînes, nœuds = groupes. */
export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

export type Messages = typeof fr;

/** Toutes les clés « a.b.c » menant à une chaîne. */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

export type MessageParams = Readonly<Record<string, string | number>>;

/**
 * Résout une clé pointée dans l'arbre et remplace les paramètres `{nom}`.
 * Une clé introuvable est renvoyée telle quelle pour rester visible à l'écran.
 */
export function translate(tree: MessageTree, key: string, params?: MessageParams): string {
  let node: string | MessageTree | undefined = tree;
  for (const part of key.split('.')) {
    if (node === undefined || typeof node === 'string') return key;
    node = node[part];
  }
  if (typeof node !== 'string') return key;
  if (!params) return node;
  return node.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
