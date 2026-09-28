/** Normalise une variable d'environnement : une chaîne vide vaut « non configurée ». */
function read(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Lecture centralisée des variables d'environnement Vite. */
export const ENV = {
  supabaseUrl: read(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: read(import.meta.env.VITE_SUPABASE_ANON_KEY),
  storeWhatsapp: read(import.meta.env.VITE_STORE_WHATSAPP),
  publicSiteUrl: read(import.meta.env.VITE_PUBLIC_SITE_URL),
} as const;
