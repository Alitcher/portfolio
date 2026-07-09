import { el } from "./dom.js";
import { config } from "../config.js";

/** The bottom footer / status bar. */
export function statusBar(lastUpdated: string): HTMLElement {
  return el(
    "footer",
    { class: "site-footer" },
    el("span", {}, `Last Updated: ${lastUpdated}`),
    el("span", {}, `© 2026 ${config.siteOwner}. All rights reserved.`),
    el(
      "span",
      {},
      "Thanks for visiting! ",
      el("span", { class: "heart", html: "&#10084;" }),
    ),
  );
}

/**
 * A live clock string for the top title bar. Returns the element plus a
 * cleanup function so the router can stop the interval on navigation.
 */
export function liveClock(): { node: HTMLElement; stop: () => void } {
  const node = el("span", { id: "clock" });
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);

  const tick = () => {
    const now = new Date();
    node.textContent =
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}` +
      ` - ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };
  tick();
  const id = window.setInterval(tick, 1000);
  return { node, stop: () => window.clearInterval(id) };
}
