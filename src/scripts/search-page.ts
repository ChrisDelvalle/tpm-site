interface PagefindData {
  excerpt: string;
  meta: {
    title?: string | undefined;
  };
  url: string;
}

interface PagefindModule {
  options(options: { excerptLength: number }): Promise<void> | void;
  search(query: string): Promise<PagefindSearch>;
}

interface PagefindResult {
  data(): Promise<PagefindData>;
}

interface PagefindSearch {
  results: PagefindResult[];
}

function isPagefindModule(value: unknown): value is PagefindModule {
  return (
    typeof value === "object" &&
    value !== null &&
    "options" in value &&
    "search" in value &&
    typeof value.options === "function" &&
    typeof value.search === "function"
  );
}

async function loadPagefind(): Promise<PagefindModule> {
  const pagefindUrl = "/pagefind/pagefind.js";
  const pagefindModule: unknown = await import(/* @vite-ignore */ pagefindUrl);

  if (!isPagefindModule(pagefindModule)) {
    throw new TypeError("Pagefind module has an unexpected shape.");
  }

  return pagefindModule;
}

async function renderResults(
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

function renderSearchError(container: HTMLElement): void {
  container.textContent = "Search is unavailable right now.";
}

async function runSearch(): Promise<void> {
  const container = document.querySelector("#search");

  if (!(container instanceof HTMLElement)) {
    return;
  }

  const query = searchQuery();
  const input = document.createElement("input");
  input.type = "search";
  input.value = query;
  input.placeholder = "Search";
  input.className = "search-page-input";
  container.append(input);

  const results = document.createElement("div");
  results.className = "search-results";
  container.append(results);

  const pagefind = await loadPagefind();
  await pagefind.options({ excerptLength: 24 });

  input.addEventListener("input", () => {
    renderResults(pagefind, results, input.value).catch(() => {
      renderSearchError(results);
    });
  });
  await renderResults(pagefind, results, query);
}

function searchQuery(): string {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

runSearch().catch(() => {
  const container = document.querySelector("#search");
  if (container instanceof HTMLElement) {
    renderSearchError(container);
  }
});
