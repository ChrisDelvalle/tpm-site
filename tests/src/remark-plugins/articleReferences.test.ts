import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";
import type { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import type { ArticleReferenceData } from "../../../src/lib/article-references/model";
import {
  articleReferencesFromFrontmatter,
  remarkArticleReferences,
  type RemarkArticleReferencesOptions,
} from "../../../src/remark-plugins/articleReferences";

describe("remarkArticleReferences", () => {
  test("normalizes a valid explanatory note and suppresses default footnotes", () => {
    const result = processMarkdown(`
Claim with context.[^note-context]

[^note-context]: This note preserves \`inline code\`.
`);

    expect(result.references.notes).toHaveLength(1);
    expect(result.references.citations).toHaveLength(0);
    expect(result.references.notes[0]?.label).toBe("note-context");
    expect(result.html).toContain("data-article-reference-marker");
    expect(result.html).not.toContain('data-footnotes="true"');
  });

  test("normalizes repeated citations with display labels and rich content", () => {
    const result = processMarkdown(`
First claim.[^cite-baudrillard-1981] Later claim.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: [@Baudrillard 1981] Baudrillard, Jean. _Simulacra and Simulation_. [Archive](https://example.com/source). \`1981\`.

    Continued citation paragraph with **publisher context**.
`);

    const citation = result.references.citations[0];

    expect(citation?.label).toBe("cite-baudrillard-1981");
    expect(citation?.displayLabel).toBe("Baudrillard 1981");
    expect(citation?.references).toHaveLength(2);
    expect(
      citation?.references.map((reference) => reference.displayText),
    ).toEqual(["Baudrillard 1981", "Baudrillard 1981"]);
    expect(citation?.definition.children).toHaveLength(2);
    const firstDefinitionBlock = citation?.definition.children[0];

    if (firstDefinitionBlock?.kind !== "paragraph") {
      throw new Error("Expected paragraph citation definition.");
    }

    expect(firstDefinitionBlock.text).toContain("Baudrillard, Jean.");
    expect(
      firstDefinitionBlock.children.some((child) => child.kind === "emphasis"),
    ).toBe(true);
    expect(
      firstDefinitionBlock.children.some((child) => child.kind === "link"),
    ).toBe(true);
    expect(
      firstDefinitionBlock.children.some(
        (child) => child.kind === "inlineCode",
      ),
    ).toBe(true);
    expect(result.html).toContain("Baudrillard 1981");
    expect(result.html).not.toContain("[@Baudrillard 1981]");
  });

  test("normalizes mixed notes and citations into separate sections", () => {
    const result = processMarkdown(`
Claim.[^cite-source] Context.[^note-context]

[^note-context]: Explanatory note.
[^cite-source]: Bibliography entry.
`);

    expect(result.references.notes.map((entry) => entry.label)).toEqual([
      "note-context",
    ]);
    expect(result.references.citations.map((entry) => entry.label)).toEqual([
      "cite-source",
    ]);
  });

  test("keeps noncanonical legacy footnotes untouched until strict validation is enabled", () => {
    const result = processMarkdown(`
Legacy claim.[^old-source]

[^old-source]: Legacy source.
`);

    expect(result.references.notes).toHaveLength(0);
    expect(result.references.citations).toHaveLength(0);
    expect(result.html).toContain("data-footnotes");
  });

  test("fails repeated notes", () => {
    expect(() =>
      processMarkdown(`
First note.[^note-repeat] Second note.[^note-repeat]

[^note-repeat]: Repeated note.
`),
    ).toThrow("referenced more than once");
  });

  test("fails malformed display labels", () => {
    expect(() =>
      processMarkdown(`
Bad citation.[^cite-bad-display-label]

[^cite-bad-display-label]: [@] Missing display label.
`),
    ).toThrow("Malformed display label");
  });

  test("fails invalid labels when strict validation is enabled", () => {
    expect(() =>
      processMarkdown(
        `
Legacy claim.[^Old-Source]

[^Old-Source]: Legacy source.
`,
        { validateLegacyFootnotes: true },
      ),
    ).toThrow("Invalid article reference label");
  });

  test("fails missing definitions when the parsed AST exposes a reference", () => {
    expect(() => transformTreeWithPlugin(missingDefinitionTree())).toThrow(
      "has no matching definition",
    );
  });

  test("fails unreferenced and duplicate definitions", () => {
    expect(() => processMarkdown("[^cite-unused]: Unused source.")).toThrow(
      "is never used",
    );
    expect(() =>
      processMarkdown(`
Claim.[^cite-duplicate]

[^cite-duplicate]: First.
[^cite-duplicate]: Second.
`),
    ).toThrow("Duplicate article reference definition");
  });

  test("fails the invalid repeated-note fixture before it can become published content", async () => {
    const markdown = await readFile(
      "tests/fixtures/article-references-invalid/repeated-note.md",
      "utf8",
    );

    expect(() => processMarkdown(markdown)).toThrow(
      "referenced more than once",
    );
  });
});

function transformTreeWithPlugin(tree: Root): void {
  remarkArticleReferences()(tree, {
    data: { astro: { frontmatter: {} } },
    fail: (message: string): never => {
      throw new Error(message);
    },
    message: () => undefined,
  });
}

function missingDefinitionTree(): Root {
  return {
    children: [
      {
        children: [
          { type: "text", value: "Missing." },
          {
            identifier: "cite-missing",
            label: "cite-missing",
            type: "footnoteReference",
          },
        ],
        type: "paragraph",
      },
    ],
    type: "root",
  };
}

function processMarkdown(
  markdown: string,
  options: RemarkArticleReferencesOptions = {},
): {
  html: string;
  references: ArticleReferenceData;
} {
  const file = remark()
    .use(remarkGfm)
    .use(remarkArticleReferences, options)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown);
  const references = articleReferencesFromFrontmatter(
    frontmatterFromData(file.data),
  ) ?? {
    citations: [],
    notes: [],
  };

  return {
    html: String(file),
    references,
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
