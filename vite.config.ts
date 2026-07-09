import { defineConfig } from "vite";

// Static, dependency-light build. The site is a single-page app driven by a
// tiny hash router, so no special rollup input configuration is required.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
