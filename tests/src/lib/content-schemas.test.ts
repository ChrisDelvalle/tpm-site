import { z } from "astro/zod";
import { describe, expect, test } from "bun:test";

import {
  articleSchema,
  categorySchema,
  filenameStem,
  pageSchema,
} from "../../../src/lib/content-schemas";

describe("content schemas", () => {
  test("accepts valid article frontmatter and rejects unknown fields", () => {
    const schema = articleSchema({
      image: () =>
        z.object({
          format: z.enum([
            "png",
            "jpg",
            "jpeg",
            "tiff",
            "webp",
            "gif",
            "svg",
            "avif",
          ]),
          height: z.number(),
          src: z.string(),
          width: z.number(),
        }),
    });

    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        image: { format: "jpg", height: 640, src: "/article.jpg", width: 960 },
        title: "Article Title",
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        layout: "default",
        title: "Article Title",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        author: "Author",
        date: "not a date",
        description: "Description",
        title: "Article Title",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        image: {
          format: "jpg",
          height: "bad",
          src: "/article.jpg",
          width: 960,
        },
        title: "Article Title",
      }).success,
    ).toBe(false);
  });

  test("validates category and standalone page frontmatter", () => {
    expect(
      categorySchema().safeParse({
        order: 1,
        title: "History",
      }).success,
    ).toBe(true);
    expect(
      categorySchema().safeParse({
        order: -1,
        title: "History",
      }).success,
    ).toBe(false);
    expect(
      categorySchema().safeParse({
        order: 1,
        slug: "history",
        title: "History",
      }).success,
    ).toBe(false);
    expect(
      pageSchema().safeParse({
        description: "About the site",
        title: "About",
      }).success,
    ).toBe(true);
  });

  test("derives article IDs from Markdown and MDX filenames", () => {
    expect(filenameStem("history/article-title.md")).toBe("article-title");
    expect(filenameStem("history/article-title.mdx")).toBe("article-title");
    expect(filenameStem("history\\article-title.md")).toBe("article-title");
  });
});
