import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, test } from "bun:test";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkRehype from "remark-rehype";

import {
  articleImagesFromFrontmatter,
  rehypeArticleImages,
  remarkArticleImageMarkers,
} from "../../../src/rehype-plugins/articleImages";

const standaloneMarkerForTests = "data-article-image-standalone-source";

describe("rehypeArticleImages", () => {
  test("wraps local Markdown images in editorial figure markup", async () => {
    const fixture = imageFixture({ height: 900, width: 900 });
    const result = await processMarkdownImage(
      `![Square diagram](../assets/square.png "Square caption")`,
      fixture.markdownPath,
    );
    const { html } = result;

    expect(html).toContain("data-article-image-figure");
    expect(html).toContain('data-article-image-shape="square"');
    expect(html).toContain('data-article-image-inspectable="false"');
    expect(html).toContain("34rem");
    expect(html).toContain("Square caption");
    expect(html).toContain('alt="Square diagram"');
    expect(html).not.toContain("<p><figure");
    expect(
      articleImagesFromFrontmatter(result.frontmatter).hasInspectableImages,
    ).toBe(false);
  });

  test("renders extra-tall Markdown images as inspectable previews", async () => {
    const fixture = imageFixture({ height: 1200, width: 400 });
    const result = await processMarkdownImage(
      `![Long thread screenshot](../assets/extra-tall.png)`,
      fixture.markdownPath,
    );
    const { html } = result;

    expect(html).toContain('data-article-image-shape="extra-tall"');
    expect(html).toContain('data-article-image-inspectable="true"');
    expect(html).toContain("data-article-image-inspect-trigger");
    expect(html).toContain("View full image");
    expect(html).toContain("24rem");
    expect(html).toContain("34rem");
    expect(html).toContain("70svh");
    expect(
      articleImagesFromFrontmatter(result.frontmatter).hasInspectableImages,
    ).toBe(true);
  });

  test("renders tall Markdown images as inspectable square-height previews", async () => {
    const fixture = imageFixture({ height: 700, width: 400 });
    const html = await renderMarkdownImage(
      `![Tall diagram](../assets/tall.png)`,
      fixture.markdownPath,
    );

    expect(html).toContain('data-article-image-shape="tall"');
    expect(html).toContain('data-article-image-inspectable="true"');
    expect(html).toContain("data-article-image-inspect-trigger");
    expect(html).toContain("26rem");
    expect(html).toContain("34rem");
  });

  test("preserves linked-image intent without nesting interactive elements", async () => {
    const fixture = imageFixture({ height: 1200, width: 400 });
    const html = await renderMarkdownImage(
      `[![Linked long image](../assets/extra-tall.png)](https://example.com/source)`,
      fixture.markdownPath,
    );

    expect(html).toContain('<a href="https://example.com/source"');
    expect(html).toContain("data-article-image-inspect-trigger");
    expect(html).not.toMatch(/<a\b(?:(?!<\/a>).)*<button/su);
  });

  test("uses conservative unknown handling for remote images", async () => {
    const fixture = imageFixture({ height: 900, width: 900 });
    const html = await renderMarkdownImage(
      `![Remote image](https://example.com/image.png)`,
      fixture.markdownPath,
    );

    expect(html).toContain('data-article-image-shape="unknown"');
    expect(html).toContain('data-article-image-inspectable="false"');
    expect(html).toContain("34rem");
  });

  test("does not transform inline prose images into block figures", async () => {
    const fixture = imageFixture({ height: 900, width: 900 });
    const html = await renderMarkdownImage(
      `Inline emoji ![Laughing emoji](https://example.com/emoji.png) inside prose.`,
      fixture.markdownPath,
    );

    expect(html).toContain("<p>Inline emoji");
    expect(html).toContain("<img");
    expect(html).not.toContain("data-article-image-figure");
  });

  test("accepts Astro MDX camel-cased standalone image markers", () => {
    const fixture = imageFixture({ height: 900, width: 900 });
    const image = {
      children: [],
      properties: {
        alt: "MDX square image",
        dataArticleImageStandaloneSource: "true",
        src: "../assets/square.png",
      },
      tagName: "img",
      type: "element" as const,
    };
    const tree = {
      children: [
        {
          children: [image],
          properties: {},
          tagName: "p",
          type: "element" as const,
        },
      ],
      type: "root" as const,
    };

    rehypeArticleImages()(tree, {
      path: pathToFileURL(fixture.markdownPath).href,
    });

    const [figure] = tree.children;
    const figureProperties = figure?.properties as
      | Record<string, unknown>
      | undefined;

    expect(figure?.tagName).toBe("figure");
    expect(figureProperties?.["data-article-image-shape"]).toBe("square");
    expect(image.properties).not.toHaveProperty(
      "dataArticleImageStandaloneSource",
    );
  });

  test("uses image width and height properties when Astro provides them", () => {
    const image = {
      children: [],
      properties: {
        alt: "Remote 4:3 image",
        height: "900",
        src: "https://example.com/four-three.png",
        [standaloneMarkerForTests]: "true",
        width: "1200",
      },
      tagName: "img",
      type: "element" as const,
    };
    const tree = {
      children: [
        {
          children: [image],
          properties: {},
          tagName: "p",
          type: "element" as const,
        },
      ],
      type: "root" as const,
    };

    rehypeArticleImages()(tree, {});

    const [figure] = tree.children;
    const figureProperties = figure?.properties as
      | Record<string, unknown>
      | undefined;

    expect(figureProperties?.["data-article-image-shape"]).toBe("square");
  });
});

async function renderMarkdownImage(
  markdown: string,
  markdownPath: string,
): Promise<string> {
  return (await processMarkdownImage(markdown, markdownPath)).html;
}

async function processMarkdownImage(
  markdown: string,
  markdownPath: string,
): Promise<{ frontmatter: unknown; html: string }> {
  const file = await remark()
    .use(remarkArticleImageMarkers)
    .use(remarkRehype)
    .use(rehypeArticleImages)
    .use(rehypeStringify)
    .process({
      path: pathToFileURL(markdownPath).href,
      value: markdown,
    });

  return {
    frontmatter: frontmatterFromData(file.data),
    html: String(file),
  };
}

function frontmatterFromData(data: Record<string, unknown>): unknown {
  const astro = data["astro"];

  if (!isRecord(astro)) {
    return undefined;
  }

  return astro["frontmatter"];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function imageFixture(dimensions: { height: number; width: number }): {
  markdownPath: string;
} {
  const directory = mkdtempSync(join(tmpdir(), "article-image-plugin-"));
  const contentDirectory = join(directory, "content");
  const assetDirectory = join(directory, "assets");
  mkdirSync(contentDirectory);
  mkdirSync(assetDirectory);
  writeFileSync(
    join(assetDirectory, imageFixtureName(dimensions)),
    pngHeader(dimensions.width, dimensions.height),
  );

  return { markdownPath: join(contentDirectory, "article.md") };
}

function imageFixtureName(dimensions: {
  height: number;
  width: number;
}): string {
  if (dimensions.height > dimensions.width * 2) {
    return "extra-tall.png";
  }

  if (dimensions.height > dimensions.width * 1.5) {
    return "tall.png";
  }

  return "square.png";
}

function pngHeader(width: number, height: number): Uint8Array {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.write("IHDR", 12);
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}
