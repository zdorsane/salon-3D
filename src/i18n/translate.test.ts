import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_ORDER, nextLocale } from './locales';
import { translate, type MessageTree } from './translate';

const tree: MessageTree = {
  greeting: 'Bonjour {name}, total {total} DA',
  nested: { deep: { leaf: 'feuille' } },
};

/** Liste triée des clés feuilles d'un arbre, pour comparer les langues. */
function leafKeys(node: MessageTree, prefix = ''): string[] {
  return Object.entries(node)
    .flatMap(([key, value]) =>
      typeof value === 'string' ? [`${prefix}${key}`] : leafKeys(value, `${prefix}${key}.`),
    )
    .sort();
}

describe('translate', () => {
  it('résout une clé imbriquée', () => {
    expect(translate(tree, 'nested.deep.leaf')).toBe('feuille');
  });

  it('remplace les paramètres et conserve ceux qui manquent', () => {
    expect(translate(tree, 'greeting', { name: 'Amina' })).toBe('Bonjour Amina, total {total} DA');
    expect(translate(tree, 'greeting', { name: 'Amina', total: 612000 })).toBe(
      'Bonjour Amina, total 612000 DA',
    );
  });

  it('renvoie la clé si elle est introuvable ou pointe sur un groupe', () => {
    expect(translate(tree, 'nested.absent')).toBe('nested.absent');
    expect(translate(tree, 'nested.deep')).toBe('nested.deep');
    expect(translate(tree, 'greeting.trop.loin')).toBe('greeting.trop.loin');
  });
});

describe('locales', () => {
  it('toutes les langues ont exactement les mêmes clés que le français', () => {
    const reference = leafKeys(LOCALES.fr.messages);
    for (const locale of LOCALE_ORDER) {
      expect(leafKeys(LOCALES[locale].messages)).toEqual(reference);
    }
  });

  it('le sélecteur fait le tour des langues', () => {
    expect(nextLocale('fr')).toBe('en');
    expect(nextLocale('en')).toBe('fr');
  });
});
