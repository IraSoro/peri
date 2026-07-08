/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_TEST_VAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
