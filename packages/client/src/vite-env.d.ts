/// <reference types="vite/client" />

// define available .env file values
interface ImportMetaEnv {
  readonly PUBLIC_SERVER_HOST: string;
  readonly PUBLIC_SERVER_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
