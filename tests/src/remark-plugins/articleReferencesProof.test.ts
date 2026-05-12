import { describe, expect, test } from "bun:test";

import {
  articleReferencesProofFrontmatterKey,
  type ArticleReferencesProofPayload,
  articleReferencesProofPayloadFromFrontmatter,
  remarkArticleReferencesProof,
} from "../../../src/remark-plugins/articleReferencesProof";

interface TestNode {
  children?: TestNode[];
  data?: {
    hProperties?: Record<string, string>;
  };
  identifier?: string;
  type: string;
  url?: string;
  value?: string;
}

interface TestRoot extends TestNode {
  children: TestNode[];
  type: "root";
}

interface TestVFile {
  data: {
    astro: {
      frontmatter: Record<string, unknown>;
    };
  };
}

describe("remarkArticleReferencesProof", () => {
  test("moves canonical citation data into Astro frontmatter", () => {
    const tree = testTree();
    const file: TestVFile = {
      data: { astro: { frontmatter: { title: "Proof" } } },
    };
    remarkArticleReferencesProof()(tree, file);

    expect(file.data.astro.frontmatter).toHaveProperty(
      articleReferencesProofFrontmatterKey,
    );

    const payload = requiredPayload(file.data.astro.frontmatter);

    expect(payload.source).toBe("remark-plugin-frontmatter");
    expect(payload.entries).toHaveLength(1);
    expect(payload.markers).toHaveLength(1);
    expect(payload.entries[0]?.displayLabel).toBe("Baudrillard 1981");
    expect(payload.entries[0]?.blocks[0]?.text).toContain("Baudrillard, Jean");
    expect(payload.entries[0]?.blocks[0]?.text).toContain("Simulacra");
    expect(
      payload.entries[0]?.blocks[0]?.children.map((node) => node.kind),
    ).toContain("emphasis");
    expect(JSON.stringify(tree)).not.toContain("footnoteDefinition");
    expect(JSON.stringify(tree)).toContain("data-article-reference-marker");
  });
});

function testTree(): TestRoot {
  return {
    children: [
      {
        children: [
          { type: "text", value: "Claim." },
          {
            identifier: "cite-baudrillard-1981",
            type: "footnoteReference",
          },
        ],
        type: "paragraph",
      },
      {
        children: [
          {
            children: [
              {
                type: "text",
                value: "[@Baudrillard 1981] Baudrillard, Jean. ",
              },
              {
                children: [{ type: "text", value: "Simulacra and Simulation" }],
                type: "emphasis",
              },
              { type: "text", value: ". 1981." },
            ],
            type: "paragraph",
          },
        ],
        identifier: "cite-baudrillard-1981",
        type: "footnoteDefinition",
      },
    ],
    type: "root",
  };
}

function requiredPayload(frontmatter: unknown): ArticleReferencesProofPayload {
  const payload = articleReferencesProofPayloadFromFrontmatter(frontmatter);

  if (payload === undefined) {
    throw new Error("Expected article reference proof payload.");
  }

  return payload;
}
