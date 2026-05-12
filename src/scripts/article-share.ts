/** Browser dependencies used by the article share enhancement. */
export interface ArticleShareRuntime {
  document: Document;
  navigator: Navigator;
  window: {
    open: (url: string, target?: string, features?: string) => unknown;
  };
}

const buttonSelector = "[data-article-share-copy-button]";
const openButtonSelector = "[data-article-share-open-button]";
const rootSelector = "[data-article-share-menu]";
const statusSelector = "[data-article-share-copy-status]";

/**
 * Installs progressive clipboard copying for article share menus.
 *
 * @param runtime Browser DOM dependencies, injected by tests.
 */
export function installArticleShare(runtime = browserRuntime()): void {
  if (runtime === undefined) {
    return;
  }

  const { document } = runtime;

  if (document.documentElement.dataset["articleShare"] === "ready") {
    return;
  }

  document.documentElement.dataset["articleShare"] = "ready";
  document.addEventListener("click", (event) => {
    const target = event.target;
    const elementConstructor = document.defaultView?.Element;

    if (
      elementConstructor === undefined ||
      !(target instanceof elementConstructor)
    ) {
      return;
    }

    const copyButton = target.closest<HTMLButtonElement>(buttonSelector);

    if (copyButton !== null) {
      copyArticleLink(runtime, copyButton).catch(() => undefined);
      return;
    }

    const openButton = target.closest<HTMLButtonElement>(openButtonSelector);

    if (openButton !== null) {
      openShareTarget(runtime, openButton);
    }
  });
}

function openShareTarget(
  runtime: ArticleShareRuntime,
  button: HTMLButtonElement,
): void {
  const href = parseSharePayload(button.dataset["articleShareOpenUrl"]);

  if (href === undefined || href.trim().length === 0) {
    return;
  }

  runtime.window.open(href, "_blank", "noopener,noreferrer");
}

async function copyArticleLink(
  runtime: ArticleShareRuntime,
  button: HTMLButtonElement,
): Promise<void> {
  const text = parseSharePayload(button.dataset["articleShareCopyText"]);

  if (text === undefined || text.trim().length === 0) {
    reportCopyStatus(button, "Article URL was not found.", "error");
    return;
  }

  try {
    await runtime.navigator.clipboard.writeText(text);
    reportCopyStatus(button, "Copied.", "copied");
  } catch {
    reportCopyStatus(
      button,
      "Copy failed. Copy the URL from your address bar.",
      "error",
    );
  }
}

function parseSharePayload(encoded: string | undefined): string | undefined {
  if (encoded === undefined) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(encoded);

    return typeof parsed === "string" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function reportCopyStatus(
  button: HTMLButtonElement,
  message: string,
  state: "copied" | "error",
): void {
  const root = button.closest<HTMLElement>(rootSelector);
  const status = root?.querySelector<HTMLElement>(statusSelector);

  if (status !== undefined && status !== null) {
    status.textContent = message;
  }

  button.dataset["articleShareCopyState"] = state;
}

function browserRuntime(): ArticleShareRuntime | undefined {
  if (
    typeof document === "undefined" ||
    typeof navigator === "undefined" ||
    typeof window === "undefined"
  ) {
    return undefined;
  }

  return { document, navigator, window };
}

installArticleShare();
