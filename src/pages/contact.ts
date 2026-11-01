import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { button } from "../components/button.js";
import { pageRegion } from "./shared.js";
import { config } from "../config.js";

/**
 * Contact page: links plus a contact form. The form POSTs to this site's
 * contact endpoint (config.contactApiUrl, api/contact.ts).
 */
export async function contactPage(): Promise<Node> {
  const status = el("p", { class: "form-status", attrs: { role: "status" } });

  const name = field("Name", "text", "contact-name", 100);
  const email = field("Email", "email", "contact-email", 254);
  const message = el("textarea", {
    id: "contact-message",
    class: "form-textarea sunken",
    attrs: { rows: "5", required: "true", maxlength: "4000" },
  }) as HTMLTextAreaElement;

  // Honeypot: hidden from people, but bots fill it in. The backend accepts
  // the request and quietly drops it when this field is not empty.
  const website = el("input", {
    type: "text",
    tabindex: "-1",
    attrs: { name: "website", autocomplete: "off" },
  }) as HTMLInputElement;
  const honeypot = el(
    "div",
    { attrs: { "aria-hidden": "true", style: "position:absolute;left:-9999px;" } },
    el("label", {}, "Website", website),
  );

  const submit = button({ label: "Send Message", type: "submit" });

  const form = el(
    "form",
    { class: "contact-form" },
    name.wrap,
    email.wrap,
    el("label", { class: "form-label", attrs: { for: "contact-message" } }, "Message"),
    message,
    honeypot,
    submit,
    status,
  );

  const setStatus = (text: string, kind: "ok" | "error" | "") => {
    status.textContent = text;
    status.className = kind ? `form-status ${kind}` : "form-status";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      name: name.input.value.trim(),
      email: email.input.value.trim(),
      message: message.value.trim(),
      website: website.value,
    };
    if (!data.name || !data.email || !data.message) {
      setStatus("Please fill in every field.", "error");
      return;
    }

    submit.disabled = true;
    setStatus("Sending...", "");
    try {
      const res = await fetch(config.contactApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("Thanks, your message was sent. I will get back to you soon.", "ok");
        form.reset();
      } else {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus(err?.error ?? "Sorry, the message could not be sent. Please try again.", "error");
      }
    } catch {
      setStatus(
        `Sorry, the message could not be sent. You can email me at ${config.contact.email}.`,
        "error",
      );
    } finally {
      submit.disabled = false;
    }
  });

  const infoPanel = el(
    "div",
    { class: "contact-info" },
    infoRow("&#9993;", "Email", config.contact.email, `mailto:${config.contact.email}`),
    infoRow("GH", "GitHub", "github.com/Alitcher", config.contact.github),
    infoRow("in", "LinkedIn", "linkedin.com/in/aliciagamedev", config.contact.linkedin),
    infoRow("&#128205;", "Location", config.contact.location, ""),
  );

  const win = windowEl(
    { title: ":: CONTACT ME ::", className: "blue-titlebar", controls: [] },
    el("p", { class: "page-intro" }, "Got a question, an idea, or an opportunity? Drop me a line."),
    el("div", { class: "contact-grid" }, infoPanel, form),
  );

  return pageRegion(win);
}

function field(label: string, type: string, id: string, maxLength: number) {
  const input = el("input", {
    id,
    type,
    class: "form-input sunken",
    attrs: { required: "true", maxlength: String(maxLength) },
  }) as HTMLInputElement;
  const wrap = el("div", { class: "form-row" },
    el("label", { class: "form-label", attrs: { for: id } }, label), input);
  return { wrap, input };
}

function infoRow(icon: string, label: string, value: string, href: string): HTMLElement {
  const val = href ? el("a", { href }, value) : el("span", {}, value);
  return el(
    "div",
    { class: "contact-row" },
    el("span", { class: "contact-icon", html: icon }),
    el("span", { class: "contact-label" }, label + ":"),
    val,
  );
}
