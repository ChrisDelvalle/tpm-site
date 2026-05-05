/** Browser dependencies used by the article citation copy enhancement. */
export interface ArticleCitationCopyRuntime {
  document: Document;
  navigator: Navigator;
}

const rootSelector = "[data-article-citation-menu]";
const buttonSelector = "[data-article-citation-copy-button]";
const statusSelector = "[data-article-citation-copy-status]";

/**
 * Installs progressive clipboard copying for article citation blocks.
 *
 * @param runtime Browser DOM dependencies, injected by tests.
 */
export function installArticleCitationCopy(runtime = browserRuntime()): void {
  if (runtime === undefined) {
    return;
  }

  const { document } = runtime;

  if (document.documentElement.dataset["articleCitationCopy"] === "ready") {
    return;
  }

  document.documentElement.dataset["articleCitationCopy"] = "ready";
  document.addEventListener("click", (event) => {
    const target = event.target;
    const elementConstructor = document.defaultView?.Element;

    if (
      elementConstructor === undefined ||
      !(target instanceof elementConstructor)
    ) {
      return;
    }

    const button = target.closest<HTMLButtonElement>(buttonSelector);

    if (button === null) {
      return;
    }

    copyCitation(runtime, button).catch(() => undefined);
  });
}

async function copyCitation(
  runtime: ArticleCitationCopyRuntime,
  button: HTMLButtonElement,
): Promise<void> {
  const root = button.closest<HTMLElement>(rootSelector);
  const targetId = button.dataset["articleCitationCopyTarget"];
  const target =
    root === null || targetId === undefined
      ? undefined
      : Array.from(
          root.querySelectorAll<HTMLElement>("[data-article-citation-text]"),
        ).find((element) => element.id === targetId);
  const textareaConstructor =
    target?.ownerDocument.defaultView?.HTMLTextAreaElement;
  const text =
    textareaConstructor !== undefined && target instanceof textareaConstructor
      ? target.value
      : (target?.textContent ?? "");

  if (text.trim().length === 0) {
    reportCopyStatus(button, "Citation text was not found.", "error");
    return;
  }

  try {
    await runtime.navigator.clipboard.writeText(text);
    reportCopyStatus(button, "Copied.", "copied");
  } catch {
    reportCopyStatus(
      button,
      "Copy failed. Select the citation text manually.",
      "error",
    );
  }
}

function reportCopyStatus(
  button: HTMLButtonElement,
  message: string,
  state: "copied" | "error",
): void {
  const section = button.closest<HTMLElement>("[data-article-citation-format]");
  const status = section?.querySelector<HTMLElement>(statusSelector);

  if (status !== undefined && status !== null) {
    status.textContent = message;
  }

  button.dataset["articleCitationCopyState"] = state;
}

function browserRuntime(): ArticleCitationCopyRuntime | undefined {
  if (typeof document === "undefined" || typeof navigator === "undefined") {
    return undefined;
  }

  return { document, navigator };
}

installArticleCitationCopy();
