/** Search-result payload returned by Pagefind. */
export interface PagefindData {
  excerpt: string;
  meta: {
    title?: string | undefined;
  };
  url: string;
}

/** Runtime Pagefind module shape loaded from the generated static bundle. */
export interface PagefindModule {
  options(options: { excerptLength: number }): Promise<void> | void;
  search(query: string): Promise<PagefindSearch>;
}

/** Lazy Pagefind result handle. */
export interface PagefindResult {
  data(): Promise<PagefindData>;
}

/** Pagefind search response containing lazy result handles. */
export interface PagefindSearch {
  results: PagefindResult[];
}

interface SearchErrorTarget {
  textContent: null | string;
}

/**
 * Checks the runtime shape of the Pagefind module loaded in the browser.
 *
 * @param value Unknown module value from dynamic import.
 * @returns Whether the module exposes the Pagefind search API.
 */
export function isPagefindModule(value: unknown): value is PagefindModule {
  return (
    typeof value === "object" &&
    value !== null &&
    "options" in value &&
    "search" in value &&
    typeof value.options === "function" &&
    typeof value.search === "function"
  );
}

/**
 * Loads the generated Pagefind module from built static output.
 *
 * @returns Pagefind module with configured search API.
 */
export async function loadPagefind(): Promise<PagefindModule> {
  const pagefindUrl = "/pagefind/pagefind.js";
  const pagefindModule: unknown = await import(/* @vite-ignore */ pagefindUrl);

  if (!isPagefindModule(pagefindModule)) {
    throw new TypeError("Pagefind module has an unexpected shape.");
  }

  return pagefindModule;
}

/**
 * Renders search results into the target container.
 *
 * @param pagefind Search provider.
 * @param results Results container to replace.
 * @param value Search query text.
 */
export async function renderResults(
  pagefind: PagefindModule,
  results: HTMLElement,
  value: string,
): Promise<void> {
  results.replaceChildren();

  if (value.trim() === "") {
    return;
  }

  const search = await pagefind.search(value);
  for (const result of search.results.slice(0, 20)) {
    const data = await result.data();
    const item = document.createElement("a");
    const title = document.createElement("strong");
    const excerpt = document.createElement("span");

    item.className = "search-result";
    item.href = data.url;
    title.textContent = data.meta.title ?? data.url;
    excerpt.textContent = data.excerpt;
    item.append(title, excerpt);
    results.append(item);
  }
}

/**
 * Renders the search error fallback.
 *
 * @param container Element that should display the error.
 */
export function renderSearchError(container: SearchErrorTarget): void {
  container.textContent = "Search is unavailable right now.";
}

/**
 * Initializes the search page UI.
 *
 * @param searchDocument Browser document dependency.
 * @param locationSearch Current location search string.
 * @param pagefindLoader Loader for the Pagefind module.
 */
export async function runSearch(
  searchDocument = document,
  locationSearch = window.location.search,
  pagefindLoader = loadPagefind,
): Promise<void> {
  const container = searchDocument.querySelector("#search");

  if (!(container instanceof HTMLElement)) {
    return;
  }

  const query = searchQuery(locationSearch);
  const input = searchDocument.createElement("input");
  input.type = "search";
  input.value = query;
  input.placeholder = "Search";
  input.className = "search-page-input";
  container.append(input);

  const results = searchDocument.createElement("div");
  results.className = "search-results";
  container.append(results);

  const pagefind = await pagefindLoader();
  await pagefind.options({ excerptLength: 24 });

  input.addEventListener("input", () => {
    renderResults(pagefind, results, input.value).catch(() => {
      renderSearchError(results);
    });
  });
  await renderResults(pagefind, results, query);
}

/**
 * Reads the query parameter used by the search page.
 *
 * @param locationSearch Raw URL search string.
 * @returns Search query text or an empty string.
 */
export function searchQuery(locationSearch: string): string {
  return new URLSearchParams(locationSearch).get("q") ?? "";
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  runSearch().catch(() => {
    const container = document.querySelector("#search");
    if (container instanceof HTMLElement) {
      renderSearchError(container);
    }
  });
}
