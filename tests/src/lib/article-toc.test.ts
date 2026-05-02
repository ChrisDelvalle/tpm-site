import { describe, expect, test } from "bun:test";

import {
  articleTableOfContentsHeadings,
  hasUsefulTableOfContents,
} from "../../../src/lib/article-toc";

describe("article table of contents data", () => {
  test("normalizes Astro rendered h2 and h3 headings into hash links", () => {
    expect(
      articleTableOfContentsHeadings([
        { depth: 1, slug: "article-title", text: "Article Title" },
        { depth: 2, slug: "first-section", text: "First Section" },
        { depth: 3, slug: "nested-section", text: "Nested Section" },
        { depth: 4, slug: "too-deep", text: "Too Deep" },
      ]),
    ).toEqual([
      {
        depth: 2,
        href: "#first-section",
        id: "first-section",
        level: 1,
        order: 0,
        text: "First Section",
      },
      {
        depth: 3,
        href: "#nested-section",
        id: "nested-section",
        level: 2,
        order: 1,
        text: "Nested Section",
      },
    ]);
  });

  test("preserves deterministic duplicate heading links from Astro metadata", () => {
    expect(
      articleTableOfContentsHeadings([
        { depth: 2, slug: "repeat", text: "Repeat" },
        { depth: 2, slug: "repeat-1", text: "Repeat" },
      ]),
    ).toEqual([
      {
        depth: 2,
        href: "#repeat",
        id: "repeat",
        level: 1,
        order: 0,
        text: "Repeat",
      },
      {
        depth: 2,
        href: "#repeat-1",
        id: "repeat-1",
        level: 1,
        order: 1,
        text: "Repeat",
      },
    ]);
  });

  test("uses the shallowest included heading as the first displayed level", () => {
    expect(
      articleTableOfContentsHeadings([
        { depth: 3, slug: "first", text: "First" },
        { depth: 3, slug: "second", text: "Second" },
      ]).map((heading) => heading.level),
    ).toEqual([1, 1]);
  });

  test("requires at least two useful headings before rendering", () => {
    const oneHeading = articleTableOfContentsHeadings([
      { depth: 2, slug: "only", text: "Only" },
    ]);
    const twoHeadings = articleTableOfContentsHeadings([
      { depth: 2, slug: "first", text: "First" },
      { depth: 2, slug: "second", text: "Second" },
    ]);

    expect(hasUsefulTableOfContents(oneHeading)).toBe(false);
    expect(hasUsefulTableOfContents(twoHeadings)).toBe(true);
  });
});
