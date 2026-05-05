import { describe, expect, test } from "bun:test";

import {
  articleBibtexCitation,
  articleCitationMenuViewModel,
  articleMlaCitation,
} from "../../../../src/lib/citations/article-citation";

const publishedAt = new Date("2022-04-06T23:58:10.000Z");

describe("article citation helpers", () => {
  test("generates deterministic BibTeX and MLA citations from structured author data", () => {
    const input = {
      articleId: "wittgensteins-most-beloved-quote-was-real-but-its-fake-now",
      authors: [
        {
          displayName: "Seong-Young Her",
          type: "person",
        },
      ],
      canonicalUrl:
        "https://thephilosophersmeme.com/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
      legacyAuthor: "Fallback Author",
      publishedAt,
      title: "Wittgenstein's Most Beloved Quote Was Real, But It's Fake Now",
    } as const;

    expect(articleBibtexCitation(input)).toContain(
      "@online{tpm-wittgensteins-most-beloved-quote-was-real-but-its-fake-now,",
    );
    expect(articleBibtexCitation(input)).toContain(
      "  author = {Seong-Young Her},",
    );
    expect(articleBibtexCitation(input)).toContain("  date = {2022-04-06},");
    expect(articleMlaCitation(input)).toBe(
      "Her, Seong-Young. \"Wittgenstein's Most Beloved Quote Was Real, But It's Fake Now.\" The Philosopher's Meme, 6 Apr. 2022, https://thephilosophersmeme.com/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/.",
    );
  });

  test("escapes BibTeX fields and falls back to legacy bylines", () => {
    const citation = articleBibtexCitation({
      articleId: "Symbols & Things",
      canonicalUrl: "https://example.com/articles/symbols/",
      legacyAuthor: "A. Writer & B. Writer",
      publishedAt,
      siteTitle: "TPM & Friends",
      title: "Symbols {and} 100% Meme_Tests",
    });

    expect(citation).toContain("@online{tpm-symbols-things,");
    expect(citation).toContain("  author = {A. Writer and B. Writer},");
    expect(citation).toContain(
      "  title = {Symbols \\{and\\} 100\\% Meme\\_Tests},",
    );
    expect(citation).toContain("  organization = {TPM \\& Friends},");
  });

  test("handles organizations, anonymous entries, and more than two authors deterministically", () => {
    expect(
      articleMlaCitation({
        articleId: "organization",
        authors: [
          {
            displayName: "The Philosopher's Meme",
            type: "organization",
          },
        ],
        canonicalUrl: "https://example.com/articles/organization/",
        publishedAt,
        title: "Organizational Writing",
      }).startsWith('The Philosopher\'s Meme. "Organizational Writing."'),
    ).toBe(true);

    expect(
      articleMlaCitation({
        articleId: "many",
        authors: [
          { displayName: "First Author", type: "person" },
          { displayName: "Second Author", type: "person" },
          { displayName: "Third Author", type: "person" },
        ],
        canonicalUrl: "https://example.com/articles/many/",
        publishedAt,
        title: "Many Authors",
      }).startsWith('Author, First, et al. "Many Authors."'),
    ).toBe(true);

    expect(
      articleCitationMenuViewModel({
        articleId: "anonymous",
        canonicalUrl: "https://example.com/articles/anonymous/",
        publishedAt,
        title: "Anonymous Article",
      }).formats.map((format) => format.id),
    ).toEqual(["bibtex", "mla"]);
  });
});
