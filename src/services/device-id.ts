/**
 * A stable, anonymous per-device identifier.
 *
 * This is what makes the visitor count "count the device, not the request":
 * the id is generated once and persisted in localStorage, so every reload and
 * every future visit from the same browser reuses it. The server counts unique
 * ids, so refreshing the page never inflates the total.
 *
 * It carries no personal data - just a random UUID - and if storage is blocked
 * (private mode), we fall back to an ephemeral id for the current session.
 */
const DEVICE_KEY = "alicia.deviceId";

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // Storage unavailable (private mode): a fresh id each session is the best
    // we can do; the count just won't dedupe across sessions on this device.
    return generateId();
  }
}

function generateId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback RFC-4122-ish v4 for very old engines without crypto.randomUUID.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
