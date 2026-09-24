/**
 * Capture committed screenshots of live project sites.
 *
 * We snapshot each site *once* (with a render delay so JS maps/charts finish
 * drawing) and commit the image, so the portfolio loads it instantly with no
 * runtime dependency on any screenshot service.
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs          # only capture missing ones
 *   node scripts/capture-screenshots.mjs --force  # re-capture everything
 *
 * Add a project by giving it an entry below whose `out` matches the
 * `screenshot` path in src/content/projects.json.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const TARGETS = [
  { url: "https://cosoraatlas.vercel.app/", out: "public/assets/screenshots/cosoraatlas.png" },
];

// thum.io render options: wait N seconds for JS to settle, capture a 1280-wide
// viewport, then crop to a clean above-the-fold banner.
const WAIT_SECONDS = 12;
const WIDTH = 1280;
const CROP_HEIGHT = 720;
const MAX_ATTEMPTS = 8;
const RETRY_DELAY_MS = 5000;

const force = process.argv.includes("--force");

/** thum.io serves a GIF "loading" placeholder until the real PNG is ready. */
function isRealScreenshot(bytes) {
  // PNG magic number: 89 50 4E 47
  return bytes.length > 10000 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

async function capture({ url, out }) {
  if (existsSync(out) && !force) {
    console.log(`✓ skip (already exists): ${out}`);
    return;
  }

  const shotUrl = `https://image.thum.io/get/wait/${WAIT_SECONDS}/width/${WIDTH}/crop/${CROP_HEIGHT}/${url}`;
  console.log(`→ capturing ${url}`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(shotUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (portfolio screenshot script)" },
    });
    const bytes = new Uint8Array(await res.arrayBuffer());

    if (isRealScreenshot(bytes)) {
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, bytes);
      console.log(`✓ saved ${out} (${(bytes.length / 1024).toFixed(0)} KB)`);
      return;
    }

    console.log(`  attempt ${attempt}/${MAX_ATTEMPTS}: still rendering, retrying…`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }

  throw new Error(`Failed to capture ${url} after ${MAX_ATTEMPTS} attempts`);
}

let failed = false;
for (const target of TARGETS) {
  try {
    await capture(target);
  } catch (err) {
    failed = true;
    console.error(`✗ ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);
