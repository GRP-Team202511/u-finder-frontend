// This code was completed by GRP Team 2025.11.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}