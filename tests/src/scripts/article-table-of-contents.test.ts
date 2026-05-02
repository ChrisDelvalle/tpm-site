import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

describe("article table of contents browser script", () => {
  test("marks the current heading link from the hash target", async () => {
    const window = new Window({
      url: "https://example.com/articles/post/#second-section",
    });
    Reflect.set(window, "SyntaxError", SyntaxError);
    const document = window.document;

    document.documentElement.style.setProperty("--site-header-height", "72px");
    document.body.innerHTML = `
      <nav data-article-toc>
        <a href="#first-section">First</a>
        <a href="#second-section">Second</a>
      </nav>
      <h2 id="first-section">First</h2>
      <h2 id="second-section">Second</h2>
    `;

    const firstHeading = document.getElementById("first-section");
    const secondHeading = document.getElementById("second-section");

    if (firstHeading === null || secondHeading === null) {
      throw new Error("Expected table-of-contents heading fixtures.");
    }

    Reflect.set(firstHeading, "getBoundingClientRect", () =>
      domRect({ top: 40 }),
    );
    Reflect.set(secondHeading, "getBoundingClientRect", () =>
      domRect({ top: 120 }),
    );
    Reflect.set(
      window,
      "requestAnimationFrame",
      (callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      },
    );

    await withBrowserGlobals(window, async () => {
      await import("../../../src/scripts/article-table-of-contents");
    });

    const current = browserAnchor(
      document.querySelector('a[href="#second-section"]'),
    );
    const previous = browserAnchor(
      document.querySelector('a[href="#first-section"]'),
    );

    if (current === null || previous === null) {
      throw new Error("Expected table-of-contents link fixtures.");
    }

    expect(current.outerHTML).toContain('data-current="true"');
    expect(current.outerHTML).toContain('aria-current="location"');
    expect(previous.outerHTML).not.toContain("data-current");
  });
});

function domRect({ top }: { top: number }): DOMRect {
  return {
    bottom: top + 20,
    height: 20,
    left: 0,
    right: 400,
    toJSON: () => ({}),
    top,
    width: 400,
    x: 0,
    y: top,
  };
}

function browserAnchor(element: unknown): HTMLAnchorElement | null {
  if (element === null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM implements browser anchor elements at runtime but exposes package-local DOM types.
  return element as HTMLAnchorElement;
}

async function withBrowserGlobals(
  window: Window,
  callback: () => Promise<void>,
): Promise<void> {
  Reflect.set(globalThis, "document", window.document);
  Reflect.set(globalThis, "HTMLElement", window.HTMLElement);
  Reflect.set(
    globalThis,
    "getComputedStyle",
    window.getComputedStyle.bind(window),
  );
  Reflect.set(globalThis, "window", window);

  try {
    await callback();
  } finally {
    Reflect.deleteProperty(globalThis, "document");
    Reflect.deleteProperty(globalThis, "HTMLElement");
    Reflect.deleteProperty(globalThis, "getComputedStyle");
    Reflect.deleteProperty(globalThis, "window");
  }
}
