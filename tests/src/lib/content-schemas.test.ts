import { z } from "astro/zod";
import { describe, expect, test } from "bun:test";

import {
  announcementSchema,
  articleSchema,
  authorSchema,
  categorySchema,
  filenameStem,
  homeFeatureSchema,
  pageSchema,
} from "../../../src/lib/content-schemas";

describe("content schemas", () => {
  const imageSchema = () =>
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
    });

  test("accepts valid article frontmatter and rejects unknown fields", () => {
    const schema = articleSchema({
      image: imageSchema,
    });

    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        image: { format: "jpg", height: 640, src: "/article.jpg", width: 960 },
        tags: ["meme history", "c++"],
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
        tags: ["Meme History"],
        title: "Article Title",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        tags: ["meme history", "meme   history"],
        title: "Article Title",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        author: "Author",
        date: "2022-04-06",
        description: "Description",
        tags: ["/pol/"],
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

  test("accepts announcement frontmatter through the article-like schema", () => {
    const schema = announcementSchema({
      image: imageSchema,
    });

    expect(
      schema.safeParse({
        author: "The Philosopher's Meme",
        date: "2026-05-05",
        description: "Announcement description",
        tags: [],
        title: "Announcement Title",
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        author: "The Philosopher's Meme",
        date: "2026-05-05",
        description: "Announcement description",
        section: "not a supported announcement field",
        tags: [],
        title: "Announcement Title",
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
        startHere: ["what-is-a-meme"],
        title: "About",
      }).success,
    ).toBe(true);
  });

  test("validates homepage featured frontmatter", () => {
    expect(
      homeFeatureSchema().safeParse({
        kind: "article",
        order: 10,
        slug: "what-is-a-meme",
      }).success,
    ).toBe(true);
    expect(
      homeFeatureSchema().safeParse({
        kind: "link",
        link: "https://discord.gg/8MVFRMa",
        linkLabel: "Join Discord",
        order: 20,
        title: "Join Discord",
      }).success,
    ).toBe(true);
    expect(
      homeFeatureSchema().safeParse({
        kind: "link",
        link: "relative/path",
        linkLabel: "Bad",
        order: 20,
        title: "Bad Link",
      }).success,
    ).toBe(false);
    expect(
      homeFeatureSchema().safeParse({
        kind: "article",
        link: "/articles/",
        order: 20,
      }).success,
    ).toBe(false);
  });

  test("validates author metadata frontmatter", () => {
    expect(
      authorSchema().safeParse({
        aliases: ["Seong-Young Her"],
        displayName: "Seong-Young Her",
        socials: [{ href: "https://example.com", label: "Website" }],
        type: "person",
        website: "https://example.com",
      }).success,
    ).toBe(true);
    expect(
      authorSchema().safeParse({
        displayName: "Seong-Young Her",
        handle: "@not-approved-metadata",
        type: "person",
      }).success,
    ).toBe(false);
    expect(
      authorSchema().safeParse({
        displayName: "Seong-Young Her",
        type: "unknown",
      }).success,
    ).toBe(false);
  });

  test("derives article IDs from Markdown and MDX filenames", () => {
    expect(filenameStem("history/article-title.md")).toBe("article-title");
    expect(filenameStem("history/article-title.mdx")).toBe("article-title");
    expect(filenameStem("history\\article-title.md")).toBe("article-title");
  });
});
