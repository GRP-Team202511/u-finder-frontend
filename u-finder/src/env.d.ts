/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_TERMS_URL: string
  readonly VITE_PRIVACY_URL: string
  readonly VITE_LICENSE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
