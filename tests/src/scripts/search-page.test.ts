import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

import {
  isPagefindModule,
  renderResults,
  renderSearchError,
  runSearch,
  searchQuery,
} from "../../../src/scripts/search-page";

describe("search page browser script", () => {
  test("validates Pagefind module shape and parses search queries", () => {
    expect(
      isPagefindModule({
        options: () => undefined,
        search: async () => Promise.resolve({ results: [] }),
      }),
    ).toBe(true);
    expect(isPagefindModule({ search: () => undefined })).toBe(false);
    expect(searchQuery("?q=gamergate")).toBe("gamergate");
    expect(searchQuery("")).toBe("");
  });

  test("renders an unavailable-search fallback", () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const element = window.document.createElement("div");

    renderSearchError(element);

    expect(element.textContent).toBe("Search is unavailable right now.");
  });

  test("renders Pagefind results into DOM links", async () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const results = window.document.createElement("div");
    Reflect.set(globalThis, "document", window.document);

    try {
      await renderResults(
        {
          options: () => undefined,
          search: async () =>
            Promise.resolve({
              results: [
                {
                  data: async () =>
                    Promise.resolve({
                      excerpt: "A result excerpt.",
                      meta: { title: "Result Title" },
                      url: "/articles/result/",
                    }),
                },
              ],
            }),
        },
        browserElement(results),
        "query",
      );

      expect(results.querySelector("a")?.getAttribute("href")).toBe(
        "/articles/result/",
      );
      expect(results.textContent).toContain("Result Title");
    } finally {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  test("initializes the search page from URL query state", async () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const container = window.document.createElement("div");
    container.id = "search";
    window.document.body.append(container);
    Reflect.set(globalThis, "document", window.document);
    Reflect.set(globalThis, "HTMLElement", window.HTMLElement);
    Reflect.set(globalThis, "Element", window.Element);

    try {
      await runSearch(browserDocument(window), "?q=memes", async () =>
        Promise.resolve({
          options: () => undefined,
          search: async () => Promise.resolve({ results: [] }),
        }),
      );

      expect(container.querySelector("input")?.getAttribute("value")).toBe(
        null,
      );
      expect(container.querySelector("input")?.value).toBe("memes");
      expect(container.querySelector(".search-results")).not.toBeNull();
    } finally {
      Reflect.deleteProperty(globalThis, "document");
      Reflect.deleteProperty(globalThis, "Element");
      Reflect.deleteProperty(globalThis, "HTMLElement");
    }
  });
});

function browserDocument(window: Window): Document {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM implements browser Document at runtime but exposes package-local DOM types.
  return window.document as unknown as Document;
}

function browserElement(element: unknown): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM implements browser HTMLElement at runtime but exposes package-local DOM types.
  return element as HTMLElement;
}
