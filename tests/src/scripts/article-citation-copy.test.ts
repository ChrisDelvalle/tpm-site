import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

import { installArticleCitationCopy } from "../../../src/scripts/article-citation-copy";

describe("article citation copy browser script", () => {
  test("copies the requested citation text and reports success", async () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const copiedText: string[] = [];
    const document = window.document;

    document.body.innerHTML = `
      <details data-article-citation-menu>
        <section data-article-citation-format="bibtex">
          <button
            data-article-citation-copy-button
            data-article-citation-copy-target="citation-bibtex"
          >Copy</button>
          <textarea id="citation-bibtex" data-article-citation-text>@online{source}</textarea>
          <p data-article-citation-copy-status></p>
        </section>
      </details>
    `;

    installArticleCitationCopy({
      document: browserDocument(document),
      navigator: browserNavigator({
        clipboard: {
          writeText: async (value: string) => {
            await Promise.resolve();
            copiedText.push(value);
          },
        },
      }),
    });

    document
      .querySelector("button")
      ?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await settledPromises();

    expect(copiedText).toEqual(["@online{source}"]);
    expect(
      document.querySelector("[data-article-citation-copy-status]")
        ?.textContent,
    ).toBe("Copied.");
    expect(
      document.querySelector("button")?.dataset["articleCitationCopyState"],
    ).toBe("copied");
  });

  test("reports a copy failure without hiding manual citation text", async () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const document = window.document;

    document.body.innerHTML = `
      <details data-article-citation-menu>
        <section data-article-citation-format="mla">
          <button
            data-article-citation-copy-button
            data-article-citation-copy-target="citation-mla"
          >Copy</button>
          <textarea id="citation-mla" data-article-citation-text>Visible citation.</textarea>
          <p data-article-citation-copy-status></p>
        </section>
      </details>
    `;

    installArticleCitationCopy({
      document: browserDocument(document),
      navigator: browserNavigator({
        clipboard: {
          writeText: async () => {
            await Promise.resolve();
            throw new Error("Permission denied.");
          },
        },
      }),
    });

    document
      .querySelector("button")
      ?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await settledPromises();

    expect(
      document.querySelector("[data-article-citation-text]")?.textContent,
    ).toBe("Visible citation.");
    expect(
      document.querySelector("[data-article-citation-copy-status]")
        ?.textContent,
    ).toBe("Copy failed. Select the citation text manually.");
    expect(
      document.querySelector("button")?.dataset["articleCitationCopyState"],
    ).toBe("error");
  });
});

function browserDocument(document: unknown): Document {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM implements the browser Document shape used by the script.
  return document as Document;
}

function browserNavigator(navigator: unknown): Navigator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Tests provide the clipboard subset required by the script.
  return navigator as Navigator;
}

async function settledPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
