import { describe, expect, test } from "bun:test";

import {
  articleReferenceDiagnosticMessage,
  hasArticleReferenceDiagnostics,
} from "../../../../src/lib/article-references/validate";

describe("article reference diagnostics", () => {
  test("reports whether diagnostics are present", () => {
    expect(hasArticleReferenceDiagnostics([])).toBe(false);
    expect(
      hasArticleReferenceDiagnostics([
        {
          code: "invalid-label",
          label: "source-1",
          source: "reference",
        },
      ]),
    ).toBe(true);
  });

  test("formats author-readable messages with repair hints", () => {
    const messages = [
      articleReferenceDiagnosticMessage({
        code: "duplicate-definition",
        label: "cite-baudrillard-1981",
      }),
      articleReferenceDiagnosticMessage({
        code: "empty-definition",
        label: "note-context",
      }),
      articleReferenceDiagnosticMessage({
        code: "id-collision",
        id: "article-reference-cite-baudrillard-1981",
      }),
      articleReferenceDiagnosticMessage({
        code: "invalid-label",
        label: "source-1",
        source: "reference",
      }),
      articleReferenceDiagnosticMessage({
        code: "malformed-display-label",
        label: "cite-baudrillard-1981",
      }),
      articleReferenceDiagnosticMessage({
        code: "missing-definition",
        label: "cite-baudrillard-1981",
      }),
      articleReferenceDiagnosticMessage({
        code: "repeated-note-reference",
        label: "note-context",
      }),
      articleReferenceDiagnosticMessage({
        code: "unreferenced-definition",
        label: "note-context",
      }),
    ];

    expect(messages).toEqual([
      'Duplicate article reference definition "[^cite-baudrillard-1981]". Keep exactly one definition for each note or citation.',
      'Article reference "[^note-context]" has an empty definition. Add note or citation content after the definition marker.',
      'Article reference generated duplicate HTML ID "article-reference-cite-baudrillard-1981". Rename one reference label so generated IDs are unique.',
      'Invalid article reference label "[^source-1]". Use lowercase "[^note-...]" for explanatory notes or "[^cite-...]" for bibliography citations.',
      'Malformed display label in "[^cite-baudrillard-1981]". Use a valid leading "[@Display Label]" marker or remove the marker.',
      'Article reference "[^cite-baudrillard-1981]" is used but has no matching definition. Add a "[^cite-baudrillard-1981]:" definition.',
      'Article note "[^note-context]" is referenced more than once. Notes may only be referenced once; use a cite-* label for repeatable citations.',
      'Article reference definition "[^note-context]" is never used. Reference it in the article body or remove the definition.',
    ]);
  });
});
