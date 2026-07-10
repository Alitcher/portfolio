import { defineConfig } from "vite";
import { execSync } from "node:child_process";

// The "Last Updated" line reflects the date of the latest git commit, resolved
// once at build/dev-server start. Falls back to today if git is unavailable.
function lastCommitDate(): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  let d: Date;
  try {
    d = new Date(execSync("git log -1 --format=%cI").toString().trim());
    if (isNaN(d.getTime())) d = new Date();
  } catch {
    d = new Date();
  }
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Static, dependency-light build. The site is a single-page app driven by a
// tiny hash router, so no special rollup input configuration is required.
export default defineConfig({
  base: "./",
  define: {
    __LAST_UPDATED__: JSON.stringify(lastCommitDate()),
  },
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
