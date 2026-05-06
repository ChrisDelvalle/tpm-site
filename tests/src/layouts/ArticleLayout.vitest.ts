import { describe, expect, test } from "vitest";

import ArticleLayout from "../../../src/layouts/ArticleLayout.astro";
import { articleTableOfContentsHeadings } from "../../../src/lib/article-toc";
import { getArticles } from "../../../src/lib/content";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";
import { articleReferenceFixture } from "../components/articles/reference-fixtures";

describe("ArticleLayout", () => {
  test("renders article metadata and slotted prose content", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: { article },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: "<p>Rendered article body.</p>",
      },
    });

    expect(view).toContain(article.data.title);
    expect(view).toContain("Rendered article body.");
    expect(view).toContain("application/ld+json");
  });

  test("renders tags as the final article surface after the endcap", async () => {
    const article = (await getArticles()).find(
      (entry) => entry.data.tags.length > 0,
    );

    if (article === undefined) {
      throw new Error("Expected at least one article fixture with tags.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: { article },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: "<p>Rendered article body.</p>",
      },
    });

    const proseIndex = view.indexOf("data-article-prose");
    const endcapIndex = view.indexOf("data-pagefind-ignore");
    const tagsIndex = view.indexOf("data-article-tags-placement");

    expect(proseIndex).toBeGreaterThan(-1);
    expect(endcapIndex).toBeGreaterThan(proseIndex);
    expect(tagsIndex).toBeGreaterThan(endcapIndex);
  });

  test("renders article references after endcap discovery and before final tags", async () => {
    const article = (await getArticles()).find(
      (entry) => entry.data.tags.length > 0,
    );

    if (article === undefined) {
      throw new Error("Expected at least one article fixture with tags.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: {
        article,
        articleReferences: articleReferenceFixture,
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default:
          '<p>Rendered article body with <a id="note-ref-context" href="#note-context" data-article-reference-marker="true" data-reference-kind="note">1</a>.</p>',
      },
    });

    const proseIndex = view.indexOf("data-article-prose");
    const supportIndex = view.indexOf("Support The Philosopher&#39;s Meme");
    const moreInCategoryIndex = view.indexOf("More in");
    const notesIndex = view.indexOf(">Notes<");
    const bibliographyIndex = view.indexOf(">Bibliography<");
    const tagsIndex = view.indexOf("data-article-tags-placement");

    expect(proseIndex).toBeGreaterThan(-1);
    expect(supportIndex).toBeGreaterThan(proseIndex);
    expect(moreInCategoryIndex).toBeGreaterThan(supportIndex);
    expect(notesIndex).toBeGreaterThan(moreInCategoryIndex);
    expect(bibliographyIndex).toBeGreaterThan(notesIndex);
    expect(tagsIndex).toBeGreaterThan(bibliographyIndex);
    expect(view).not.toContain('data-footnotes="true"');
  });

  test("renders article table of contents in the reading rail when headings are useful", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: {
        article,
        tableOfContentsHeadings: [
          {
            depth: 2,
            href: "#first-section",
            id: "first-section",
            level: 1,
            order: 0,
            text: "First Section",
          },
          {
            depth: 2,
            href: "#second-section",
            id: "second-section",
            level: 1,
            order: 1,
            text: "Second Section",
          },
        ],
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: "<p>Rendered article body.</p>",
      },
    });

    expect(view).toContain('data-content-rail="left"');
    expect(view).toContain("data-article-body-flow");
    expect(view).toContain('data-article-toc-placement="rail"');
    expect(view).toContain('data-article-toc-placement="inline"');
    expect(view).toContain("data-toc-inline-heading");
    expect(view).toContain('href="#first-section"');
  });

  test("renders generated reference section links in the article table of contents", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: {
        article,
        articleReferences: articleReferenceFixture,
        tableOfContentsHeadings: articleTableOfContentsHeadings([], {
          references: articleReferenceFixture,
        }),
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: "<p>Rendered article body.</p>",
      },
    });

    expect(view).toContain('href="#article-references-notes-heading"');
    expect(view).toContain('href="#article-references-bibliography-heading"');
    expect(view).toContain('id="article-references-notes-heading"');
    expect(view).toContain('id="article-references-bibliography-heading"');
  });

  test("renders note-only and bibliography-only generated table of contents entries when otherwise useful", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const bodyHeading = {
      depth: 2,
      slug: "body-section",
      text: "Body Section",
    };
    const noteReferences = {
      citations: [],
      notes: articleReferenceFixture.notes,
    };
    const citationReferences = {
      citations: articleReferenceFixture.citations,
      notes: [],
    };
    const container = await createAstroTestContainer();
    const noteOnlyView = await container.renderToString(ArticleLayout, {
      props: {
        article,
        articleReferences: noteReferences,
        tableOfContentsHeadings: articleTableOfContentsHeadings([bodyHeading], {
          references: noteReferences,
        }),
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: '<h2 id="body-section">Body Section</h2>',
      },
    });
    const citationOnlyView = await container.renderToString(ArticleLayout, {
      props: {
        article,
        articleReferences: citationReferences,
        tableOfContentsHeadings: articleTableOfContentsHeadings([bodyHeading], {
          references: citationReferences,
        }),
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: '<h2 id="body-section">Body Section</h2>',
      },
    });
    const noReferencesView = await container.renderToString(ArticleLayout, {
      props: {
        article,
        tableOfContentsHeadings: articleTableOfContentsHeadings([bodyHeading], {
          references: { citations: [], notes: [] },
        }),
      },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: '<h2 id="body-section">Body Section</h2>',
      },
    });

    expect(noteOnlyView).toContain('href="#article-references-notes-heading"');
    expect(noteOnlyView).not.toContain(
      'href="#article-references-bibliography-heading"',
    );
    expect(citationOnlyView).toContain(
      'href="#article-references-bibliography-heading"',
    );
    expect(citationOnlyView).not.toContain(
      'href="#article-references-notes-heading"',
    );
    expect(noReferencesView).not.toContain("data-article-toc");
  });
});
