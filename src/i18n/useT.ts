import { useCallback, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { LOCALES } from './locales';
import { translate, type MessageKey, type MessageParams } from './translate';

/** Fonction de traduction typée pour la langue active. */
export function useT(): (key: MessageKey, params?: MessageParams) => string {
  const locale = useUIStore((state) => state.locale);
  return useCallback(
    (key: MessageKey, params?: MessageParams) => translate(LOCALES[locale].messages, key, params),
    [locale],
  );
}

/** Synchronise `lang`, `dir` et le titre du document avec la langue active. */
export function useLocaleSync(): void {
  const locale = useUIStore((state) => state.locale);
  const t = useT();
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = LOCALES[locale].dir;
    document.title = t('meta.title');
  }, [locale, t]);
}

/** Libellé traduit d'une valeur connue seulement à l'exécution (code de matière…), sinon le code. */
export function useDynamicLabel(): (group: 'materialCodes', code: string) => string {
  const locale = useUIStore((state) => state.locale);
  return useCallback(
    (group: 'materialCodes', code: string) => {
      const key = `${group}.${code}`;
      const label = translate(LOCALES[locale].messages, key);
      return label === key ? code : label;
    },
    [locale],
  );
}
