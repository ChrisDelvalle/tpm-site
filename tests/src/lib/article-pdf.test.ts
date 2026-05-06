import { describe, expect, test } from "bun:test";

import {
  articlePdfEnabled,
  articlePdfHref,
  articlePdfOutputPath,
  articlePdfViewModel,
  articleScholarMetaViewModel,
  scholarPublicationDate,
} from "../../../src/lib/article-pdf";
import { articleEntry } from "../../helpers/content";

describe("article PDF helpers", () => {
  test("build same-directory public and output paths from article slugs", () => {
    expect(articlePdfHref("what-is-a-meme")).toBe(
      "/articles/what-is-a-meme/what-is-a-meme.pdf",
    );
    expect(articlePdfOutputPath("what-is-a-meme")).toBe(
      "articles/what-is-a-meme/what-is-a-meme.pdf",
    );
  });

  test("formats Scholar publication dates with UTC calendar fields", () => {
    expect(scholarPublicationDate(new Date("2021-11-30T23:58:10.000Z"))).toBe(
      "2021/11/30",
    );
  });

  test("builds Scholar metadata and PDF data from structured authors when available", () => {
    const article = articleEntry({
      data: {
        author: "Legacy Author",
        title: "What Is A Meme?",
      },
      date: new Date("2021-11-30T23:58:10.000Z"),
      id: "what-is-a-meme",
    });

    expect(
      articleScholarMetaViewModel({
        article,
        authors: [
          {
            displayName: "Claudia Vulliamy",
            href: "/authors/claudia-vulliamy/",
            id: "claudia-vulliamy",
            type: "person",
          },
        ],
        site: "https://thephilosophersmeme.com",
      }),
    ).toEqual({
      authors: ["Claudia Vulliamy"],
      pdf: {
        articleUrl: "https://thephilosophersmeme.com/articles/what-is-a-meme/",
        authors: ["Claudia Vulliamy"],
        citationPdfUrl:
          "https://thephilosophersmeme.com/articles/what-is-a-meme/what-is-a-meme.pdf",
        pdfHref: "/articles/what-is-a-meme/what-is-a-meme.pdf",
        pdfOutputPath: "articles/what-is-a-meme/what-is-a-meme.pdf",
        publicationDate: new Date("2021-11-30T23:58:10.000Z"),
        publicationDateForScholar: "2021/11/30",
        title: "What Is A Meme?",
      },
      publicationDate: new Date("2021-11-30T23:58:10.000Z"),
      publicationDateForScholar: "2021/11/30",
      title: "What Is A Meme?",
    });
  });

  test("falls back to the legacy byline when structured authors are unavailable", () => {
    const article = articleEntry({
      data: {
        author: "Legacy Author",
      },
      id: "legacy-byline",
    });

    expect(articlePdfViewModel({ article })?.authors).toEqual([
      "Legacy Author",
    ]);
  });

  test("omits PDF data when an article explicitly disables generated PDFs", () => {
    const article = articleEntry({
      data: {
        author: "Legacy Author",
        pdf: false,
      },
      id: "web-only",
    });

    expect(articlePdfEnabled(article)).toBe(false);
    expect(articlePdfViewModel({ article })).toBeUndefined();
    expect(articleScholarMetaViewModel({ article })).toMatchObject({
      authors: ["Legacy Author"],
      pdf: undefined,
      title: "Sample Article",
    });
  });
});
