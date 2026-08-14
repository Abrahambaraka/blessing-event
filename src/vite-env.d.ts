/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYMENT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
