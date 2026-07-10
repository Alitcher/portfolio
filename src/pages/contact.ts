import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { button } from "../components/button.js";
import { pageRegion } from "./shared.js";
import { config } from "../config.js";

/** Contact page: links plus a simple (client-side) contact form. */
export async function contactPage(): Promise<Node> {
  const status = el("p", { class: "form-status", attrs: { role: "status" } });

  const name = field("Name", "text", "contact-name");
  const email = field("Email", "email", "contact-email");
  const message = el("textarea", {
    id: "contact-message",
    class: "form-textarea sunken",
    attrs: { rows: "5", required: "true" },
  }) as HTMLTextAreaElement;

  const form = el(
    "form",
    { class: "contact-form" },
    name.wrap,
    email.wrap,
    el("label", { class: "form-label", attrs: { for: "contact-message" } }, "Message"),
    message,
    button({ label: "Send Message", type: "submit" }),
    status,
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!name.input.value.trim() || !email.input.value.trim() || !message.value.trim()) {
      status.textContent = "Please fill in every field.";
      status.className = "form-status error";
      return;
    }
    // No backend yet: hand off to the user's mail client (mailto), and clearly
    // label this as the current behaviour. A POST /api/contact could replace it.
    const subject = encodeURIComponent(`Portfolio contact from ${name.input.value}`);
    const body = encodeURIComponent(`${message.value}\n\n— ${name.input.value} (${email.input.value})`);
    window.location.href = `mailto:${config.contact.email}?subject=${subject}&body=${body}`;
    status.textContent = "Opening your email client...";
    status.className = "form-status ok";
    form.reset();
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
    { title: ":: CONTACT ME ::", controls: [] },
    el("p", { class: "page-intro" }, "Got a question, an idea, or an opportunity? Drop me a line."),
    el("div", { class: "contact-grid" }, infoPanel, form),
  );

  return pageRegion(win);
}

function field(label: string, type: string, id: string) {
  const input = el("input", {
    id,
    type,
    class: "form-input sunken",
    attrs: { required: "true" },
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
