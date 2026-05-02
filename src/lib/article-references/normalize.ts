import { extractLeadingDisplayLabel } from "./display-label";
import {
  articleReferenceBacklinkId,
  articleReferenceEntryId,
  articleReferenceMarkerDisplayText,
  articleReferenceMarkerId,
} from "./ids";
import type {
  ArticleCitation,
  ArticleNote,
  ArticleReferenceBlockContent,
  ArticleReferenceDefinitionInput,
  ArticleReferenceDiagnostic,
  ArticleReferenceDisplayLabel,
  ArticleReferenceKind,
  ArticleReferenceKindPrefix,
  ArticleReferenceLabel,
  ArticleReferenceMarker,
  ArticleReferenceOccurrenceInput,
  ArticleReferencesNormalizeResult,
} from "./model";
import { hasArticleReferenceDiagnostics } from "./validate";

const canonicalPrefixes = ["cite", "note"] as const;

/**
 * Classifies a raw Markdown footnote label into the article-reference domain.
 *
 * @param label Raw Markdown footnote label.
 * @returns Canonical label and kind, or undefined when the label is invalid.
 */
export function classifyArticleReferenceLabel(
  label: string,
): undefined | { kind: ArticleReferenceKind; label: ArticleReferenceLabel } {
  const parts = parseCanonicalLabelParts(label);

  if (parts === undefined) {
    return undefined;
  }

  if (parts.prefix === "cite") {
    return { kind: "citation", label: `cite-${parts.slug}` };
  }

  return { kind: "note", label: `note-${parts.slug}` };
}

/**
 * Normalizes collected Markdown footnote references and definitions.
 *
 * @param references Raw body reference occurrences in document order.
 * @param definitions Raw footnote definitions in document order.
 * @returns Renderable reference data or blocking diagnostics.
 */
export function normalizeArticleReferences(
  references: readonly ArticleReferenceOccurrenceInput[],
  definitions: readonly ArticleReferenceDefinitionInput[],
): ArticleReferencesNormalizeResult {
  const referenceClassifications = references.map((reference) => ({
    classification: classifyArticleReferenceLabel(reference.label),
    raw: reference,
  }));
  const definitionClassifications = definitions.map((definition) => ({
    classification: classifyArticleReferenceLabel(definition.label),
    raw: definition,
  }));
  const invalidDiagnostics: ArticleReferenceDiagnostic[] = [
    ...referenceClassifications
      .filter(({ classification }) => classification === undefined)
      .map(
        ({ raw }) =>
          ({
            code: "invalid-label",
            label: raw.label,
            source: "reference",
          }) as const,
      ),
    ...definitionClassifications
      .filter(({ classification }) => classification === undefined)
      .map(
        ({ raw }) =>
          ({
            code: "invalid-label",
            label: raw.label,
            source: "definition",
          }) as const,
      ),
  ];

  const validReferences = referenceClassifications.flatMap(
    ({ classification }) =>
      classification === undefined ? [] : [classification],
  );
  const validDefinitions = definitionClassifications.flatMap(
    ({ classification, raw }) =>
      classification === undefined ? [] : [{ ...classification, raw }],
  );
  const definitionDuplicates = duplicateLabels(
    validDefinitions.map((definition) => definition.label),
  ).map((label) => ({ code: "duplicate-definition", label }) as const);
  const definitionMap = new Map(
    validDefinitions.map(
      (definition) => [definition.label, definition] as const,
    ),
  );
  const referencedLabels = new Set(
    validReferences.map((reference) => reference.label),
  );
  const missingDefinitions = Array.from(referencedLabels)
    .filter((label) => !definitionMap.has(label))
    .map((label) => ({ code: "missing-definition", label }) as const);
  const unreferencedDefinitions = validDefinitions
    .map((definition) => definition.label)
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .filter((label) => !referencedLabels.has(label))
    .map((label) => ({ code: "unreferenced-definition", label }) as const);
  const repeatedNotes = repeatedNoteDiagnostics(validReferences);
  const displayLabelResults = validDefinitions.map((definition) => ({
    definition,
    result: extractLeadingDisplayLabel(
      definition.label,
      definition.raw.children,
    ),
  }));
  const malformedDisplayLabels = displayLabelResults.flatMap(({ result }) =>
    result.ok
      ? []
      : [{ code: "malformed-display-label", label: result.label } as const],
  );
  const emptyDefinitions = displayLabelResults.flatMap(
    ({ definition, result }) =>
      result.ok && !hasDefinitionContent(result.children)
        ? [{ code: "empty-definition", label: definition.label } as const]
        : [],
  );
  const preflightDiagnostics = [
    ...invalidDiagnostics,
    ...definitionDuplicates,
    ...missingDefinitions,
    ...unreferencedDefinitions,
    ...repeatedNotes,
    ...malformedDisplayLabels,
    ...emptyDefinitions,
  ];

  if (hasArticleReferenceDiagnostics(preflightDiagnostics)) {
    return { diagnostics: preflightDiagnostics, ok: false };
  }

  const displayLabelMap = new Map(
    displayLabelResults.flatMap(({ definition, result }) => {
      if (!result.ok) {
        return [];
      }

      return [
        [
          definition.label,
          normalizedDefinition(result.children, result.displayLabel),
        ] as const,
      ];
    }),
  );
  const referencesByLabel = referencesByCanonicalLabel(validReferences);
  const orderedCitationLabels = orderedLabelsForKind(
    validReferences,
    "citation",
  );
  const orderedNoteLabels = orderedLabelsForKind(validReferences, "note");
  const citations = orderedCitationLabels.map((label, index) =>
    citationFromLabel(
      label,
      index + 1,
      referencesByLabel.get(label) ?? [],
      displayLabelMap,
    ),
  );
  const notes = orderedNoteLabels.map((label, index) =>
    noteFromLabel(
      label,
      index + 1,
      referencesByLabel.get(label) ?? [],
      displayLabelMap,
    ),
  );
  const idCollisions = duplicateValues([
    ...citations.flatMap((citation) => [
      citation.id,
      ...citation.references.flatMap((reference) => [
        reference.id,
        reference.backlinkId,
      ]),
    ]),
    ...notes.flatMap((note) => [
      note.id,
      ...note.references.flatMap((reference) => [
        reference.id,
        reference.backlinkId,
      ]),
    ]),
  ]).map((id) => ({ code: "id-collision", id }) as const);

  if (hasArticleReferenceDiagnostics(idCollisions)) {
    return { diagnostics: idCollisions, ok: false };
  }

  return {
    data: { citations, notes },
    ok: true,
  };
}

function citationFromLabel(
  label: ArticleReferenceLabel,
  order: number,
  references: readonly LabelOccurrence[],
  displayLabelMap: ReadonlyMap<ArticleReferenceLabel, NormalizedDefinition>,
): ArticleCitation {
  const definition = requiredDefinition(label, displayLabelMap);
  const markers = references.map((reference) =>
    markerFromOccurrence(reference, "citation", order, definition.displayLabel),
  );

  return {
    definition: { children: definition.children },
    ...(definition.displayLabel === undefined
      ? {}
      : { displayLabel: definition.displayLabel }),
    id: articleReferenceEntryId(label),
    kind: "citation",
    label,
    order,
    references: markers,
  };
}

function noteFromLabel(
  label: ArticleReferenceLabel,
  order: number,
  references: readonly LabelOccurrence[],
  displayLabelMap: ReadonlyMap<ArticleReferenceLabel, NormalizedDefinition>,
): ArticleNote {
  const definition = requiredDefinition(label, displayLabelMap);
  const [reference] = references;

  if (reference === undefined) {
    throw new Error(`Missing normalized note reference for ${label}.`);
  }

  return {
    definition: { children: definition.children },
    ...(definition.displayLabel === undefined
      ? {}
      : { displayLabel: definition.displayLabel }),
    id: articleReferenceEntryId(label),
    kind: "note",
    label,
    order,
    references: [markerFromOccurrence(reference, "note", order, undefined)],
  };
}

interface LabelOccurrence {
  occurrenceIndexForLabel: number;
  order: number;
  reference: {
    kind: ArticleReferenceKind;
    label: ArticleReferenceLabel;
  };
}

interface NormalizedDefinition {
  children: readonly ArticleReferenceBlockContent[];
  displayLabel?: ArticleReferenceDisplayLabel;
}

function normalizedDefinition(
  children: readonly ArticleReferenceBlockContent[],
  displayLabel: ArticleReferenceDisplayLabel | undefined,
): NormalizedDefinition {
  return {
    children,
    ...(displayLabel === undefined ? {} : { displayLabel }),
  };
}

function markerFromOccurrence(
  occurrence: LabelOccurrence,
  kind: ArticleReferenceKind,
  entryOrder: number,
  displayLabel: ArticleReferenceDisplayLabel | undefined,
): ArticleReferenceMarker {
  return {
    backlinkId: articleReferenceBacklinkId(
      occurrence.reference.label,
      occurrence.occurrenceIndexForLabel,
    ),
    displayText: articleReferenceMarkerDisplayText(
      kind,
      entryOrder,
      displayLabel,
    ),
    entryId: articleReferenceEntryId(occurrence.reference.label),
    id: articleReferenceMarkerId(
      occurrence.reference.label,
      occurrence.occurrenceIndexForLabel,
    ),
    kind,
    label: occurrence.reference.label,
    order: occurrence.order,
  };
}

function orderedLabelsForKind(
  references: ReadonlyArray<{
    kind: ArticleReferenceKind;
    label: ArticleReferenceLabel;
  }>,
  kind: ArticleReferenceKind,
): ArticleReferenceLabel[] {
  return Array.from(
    new Set(
      references
        .filter((reference) => reference.kind === kind)
        .map((reference) => reference.label),
    ),
  );
}

function referencesByCanonicalLabel(
  references: ReadonlyArray<{
    kind: ArticleReferenceKind;
    label: ArticleReferenceLabel;
  }>,
): ReadonlyMap<ArticleReferenceLabel, LabelOccurrence[]> {
  return references.reduce((groups, reference) => {
    const previous = groups.get(reference.label) ?? [];
    const matchingKindOrder = references
      .slice(0, references.indexOf(reference) + 1)
      .filter(({ kind }) => kind === reference.kind).length;

    groups.set(reference.label, [
      ...previous,
      {
        occurrenceIndexForLabel: previous.length,
        order: matchingKindOrder,
        reference,
      },
    ]);
    return groups;
  }, new Map<ArticleReferenceLabel, LabelOccurrence[]>());
}

function duplicateLabels(
  labels: readonly ArticleReferenceLabel[],
): ArticleReferenceLabel[] {
  return duplicateValues(labels);
}

function duplicateValues<T extends string>(values: readonly T[]): T[] {
  return Array.from(
    values.reduce(
      (state, value) => ({
        duplicates: state.seen.has(value)
          ? state.duplicates.add(value)
          : state.duplicates,
        seen: state.seen.add(value),
      }),
      { duplicates: new Set<T>(), seen: new Set<T>() },
    ).duplicates,
  );
}

function repeatedNoteDiagnostics(
  references: ReadonlyArray<{
    kind: ArticleReferenceKind;
    label: ArticleReferenceLabel;
  }>,
): ArticleReferenceDiagnostic[] {
  return duplicateValues(
    references
      .filter((reference) => reference.kind === "note")
      .map((reference) => reference.label),
  ).map((label) => ({ code: "repeated-note-reference", label }));
}

function hasDefinitionContent(
  children: readonly ArticleReferenceBlockContent[],
): boolean {
  return children.some((child) => child.text.trim() !== "");
}

function parseCanonicalLabelParts(label: string):
  | undefined
  | {
      prefix: ArticleReferenceKindPrefix;
      slug: string;
    } {
  const separatorIndex = label.indexOf("-");

  if (separatorIndex <= 0) {
    return undefined;
  }

  const prefix = label.slice(0, separatorIndex);
  const slug = label.slice(separatorIndex + 1);

  if (!isCanonicalPrefix(prefix) || !isCanonicalSlug(slug)) {
    return undefined;
  }

  return { prefix, slug };
}

function isCanonicalPrefix(
  prefix: string,
): prefix is ArticleReferenceKindPrefix {
  return canonicalPrefixes.some(
    (canonicalPrefix) => canonicalPrefix === prefix,
  );
}

function isCanonicalSlug(slug: string): boolean {
  return (
    slug !== "" &&
    slug
      .split("-")
      .every((segment) => segment !== "" && hasOnlySlugCharacters(segment))
  );
}

function hasOnlySlugCharacters(segment: string): boolean {
  return Array.from(segment).every(isAsciiSlugCharacter);
}

function isAsciiSlugCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0);

  return (
    codePoint !== undefined &&
    ((codePoint >= 48 && codePoint <= 57) ||
      (codePoint >= 97 && codePoint <= 122))
  );
}

function requiredDefinition(
  label: ArticleReferenceLabel,
  displayLabelMap: ReadonlyMap<ArticleReferenceLabel, NormalizedDefinition>,
): NormalizedDefinition {
  const definition = displayLabelMap.get(label);

  if (definition === undefined) {
    throw new Error(`Missing normalized definition for ${label}.`);
  }

  return definition;
}
