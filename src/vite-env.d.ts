/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDFLARE_ENDPOINT: string
  readonly VITE_CLOUDFLARE_ACCESS_KEY_ID: string
  readonly VITE_CLOUDFLARE_SECRET_KEY: string
  readonly VITE_CLOUDFLARE_BUCKET_NAME: string
  readonly VITE_IMAGE_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
