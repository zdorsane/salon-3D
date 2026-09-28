/// <reference types="vite/client" />

// Variables d'environnement exposées au navigateur (voir .env.example)
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STORE_WHATSAPP?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_PAYMENT_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
