/**
 * A tiny hash-based router. Hash routing means the site works as pure static
 * files on any host (GitHub Pages, Netlify, S3) with no server rewrites.
 *
 * Routes are matched most-specific-first; the first pattern that matches wins.
 * `:param` segments are captured and passed to the handler.
 */

export interface RouteContext {
  readonly path: string;
  readonly params: Readonly<Record<string, string>>;
}

/** A handler renders the page into the given container. May be async. */
export type RouteHandler = (ctx: RouteContext) => Node | Promise<Node>;

interface CompiledRoute {
  readonly pattern: string;
  readonly regex: RegExp;
  readonly keys: string[];
  readonly handler: RouteHandler;
}

export class Router {
  private routes: CompiledRoute[] = [];
  private notFound: RouteHandler = () => document.createTextNode("Not found");
  private onNavigate: ((ctx: RouteContext) => void) | null = null;

  add(pattern: string, handler: RouteHandler): this {
    const keys: string[] = [];
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\/$/, "")
          .replace(/:[^/]+/g, (m) => {
            keys.push(m.slice(1));
            return "([^/]+)";
          }) +
        "/?$",
    );
    this.routes.push({ pattern, regex, keys, handler });
    return this;
  }

  setNotFound(handler: RouteHandler): this {
    this.notFound = handler;
    return this;
  }

  /** Called after each successful resolution (e.g. to update the active nav). */
  setOnNavigate(cb: (ctx: RouteContext) => void): this {
    this.onNavigate = cb;
    return this;
  }

  start(render: (node: Node, ctx: RouteContext) => void): void {
    const resolve = async () => {
      const ctx = this.currentContext();
      let node: Node;
      const route = this.routes.find((r) => r.regex.test(ctx.path));
      try {
        if (route) {
          const match = route.regex.exec(ctx.path)!;
          const params: Record<string, string> = {};
          route.keys.forEach((k, i) => (params[k] = decodeURIComponent(match[i + 1] ?? "")));
          node = await route.handler({ path: ctx.path, params });
        } else {
          node = await this.notFound(ctx);
        }
      } catch (err) {
        node = errorNode(err);
      }
      render(node, ctx);
      this.onNavigate?.(ctx);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", resolve);
    if (!location.hash) location.replace("#/");
    resolve();
  }

  private currentContext(): RouteContext {
    const path = (location.hash.replace(/^#/, "") || "/").split("?")[0];
    return { path, params: {} };
  }
}

/** Programmatic navigation helper. */
export function navigate(route: string): void {
  location.hash = route.startsWith("#") ? route : `#${route}`;
}

function errorNode(err: unknown): Node {
  const div = document.createElement("div");
  div.className = "route-error";
  div.textContent = `Something went wrong: ${err instanceof Error ? err.message : String(err)}`;
  return div;
}
