import { describe, expect, test } from "bun:test";

import type {
  ArticleReferenceDefinitionInput,
  ArticleReferenceInlineContent,
  ArticleReferenceOccurrenceInput,
} from "../../../../src/lib/article-references/model";
import {
  classifyArticleReferenceLabel,
  normalizeArticleReferences,
} from "../../../../src/lib/article-references/normalize";

describe("article reference label classification", () => {
  test("accepts canonical note and citation labels", () => {
    expect(classifyArticleReferenceLabel("note-term-scope")).toEqual({
      kind: "note",
      label: "note-term-scope",
    });
    expect(classifyArticleReferenceLabel("cite-baudrillard-1981")).toEqual({
      kind: "citation",
      label: "cite-baudrillard-1981",
    });
  });

  test("rejects noncanonical labels", () => {
    for (const label of [
      "source-1",
      "note",
      "cite-",
      "cite-Baudrillard",
      "note-term_scope",
      "note--term",
      "note-term-",
    ]) {
      expect(classifyArticleReferenceLabel(label)).toBeUndefined();
    }
  });
});

describe("article reference normalization", () => {
  test("normalizes notes and citations by first-reference order", () => {
    const result = normalizeArticleReferences(
      [
        reference("cite-second"),
        reference("note-context"),
        reference("cite-first"),
        reference("cite-second"),
      ],
      [
        definition("cite-first", "First citation."),
        definition("note-context", "Context note."),
        definition(
          "cite-second",
          "[@Second 2020] Second citation with _rich_ content.",
          [
            {
              children: [{ kind: "text", text: "rich" }],
              kind: "emphasis",
              text: "rich",
            },
          ],
        ),
      ],
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected normalized article references.");
    }

    expect(result.data.citations.map((citation) => citation.label)).toEqual([
      "cite-second",
      "cite-first",
    ]);
    expect(result.data.notes.map((note) => note.label)).toEqual([
      "note-context",
    ]);
    expect(result.data.citations[0]?.displayLabel).toBe("Second 2020");
    expect(result.data.citations[0]?.references).toHaveLength(2);
    expect(
      result.data.citations[0]?.references.map((marker) => marker.id),
    ).toEqual(["cite-ref-second", "cite-ref-second-2"]);
    expect(result.data.citations[0]?.references[0]?.displayText).toBe(
      "Second 2020",
    );
    expect(result.data.notes[0]?.references[0]?.displayText).toBe("1");

    const [firstDefinitionChild] =
      result.data.citations[0]?.definition.children ?? [];

    if (firstDefinitionChild?.kind !== "paragraph") {
      throw new Error("Expected paragraph definition content.");
    }

    expect(firstDefinitionChild.children[1]?.kind).toBe("emphasis");
  });

  test("fails invalid references before renderable data is returned", () => {
    const result = normalizeArticleReferences(
      [
        reference("source-1"),
        reference("cite-missing"),
        reference("note-repeat"),
        reference("note-repeat"),
      ],
      [
        definition("cite-unused", "Unused citation."),
        definition("cite-unused", "Duplicate citation."),
        definition("note-repeat", "Repeated note."),
        definition("bad_label", "Bad label."),
        definition("cite-empty", ""),
        definition("cite-bad-display-label", "[@] Bad label."),
      ],
    );

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error("Expected diagnostics.");
    }

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "invalid-label",
      "invalid-label",
      "duplicate-definition",
      "missing-definition",
      "unreferenced-definition",
      "unreferenced-definition",
      "unreferenced-definition",
      "repeated-note-reference",
      "malformed-display-label",
      "empty-definition",
    ]);
  });
});

function reference(label: string): ArticleReferenceOccurrenceInput {
  return { label };
}

function definition(
  label: string,
  text: string,
  extraChildren: readonly ArticleReferenceInlineContent[] = [],
): ArticleReferenceDefinitionInput {
  return {
    children: [
      {
        children: [{ kind: "text", text }, ...extraChildren],
        kind: "paragraph",
        text: `${text}${extraChildren.map((child) => child.text).join("")}`,
      },
    ],
    label,
  };
}
