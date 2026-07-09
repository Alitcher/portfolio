/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend REST API, e.g. "https://api.example.com". Empty = use local mock data. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing markdown blog articles as raw strings.
declare module "*.md?raw" {
  const content: string;
  export default content;
}
