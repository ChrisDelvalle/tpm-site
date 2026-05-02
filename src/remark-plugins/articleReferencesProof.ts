const proofFrontmatterKey = "articleReferencesProof";
const proofVersion = 1;
const citationPrefix = "cite-";
const displayLabelClose = "]";
const displayLabelOpen = "[@";
const notePrefix = "note-";
const whitespaceCharacters = new Set([" ", "\n", "\r", "\t"]);

/** Frontmatter key used by the article-reference data-path proof. */
export const articleReferencesProofFrontmatterKey = proofFrontmatterKey;

/** Reference kind recognized by the article-reference proof plugin. */
type ArticleReferencesProofKind = "citation" | "note";

interface ArticleReferencesProofInlineContainer {
  children: readonly ArticleReferencesProofInline[];
  kind: "emphasis" | "strong" | "unknown";
  nodeType: string;
  text: string;
}

interface ArticleReferencesProofInlineLeaf {
  kind: "break" | "inlineCode" | "text";
  text: string;
}

interface ArticleReferencesProofInlineLink {
  children: readonly ArticleReferencesProofInline[];
  kind: "link";
  text: string;
  url: string;
}

/** Inline rich-content node preserved from a reference definition. */
type ArticleReferencesProofInline =
  | ArticleReferencesProofInlineContainer
  | ArticleReferencesProofInlineLeaf
  | ArticleReferencesProofInlineLink;

/** Block-level rich-content node preserved from a reference definition. */
interface ArticleReferencesProofBlock {
  children: readonly ArticleReferencesProofInline[];
  kind: "code" | "heading" | "list" | "paragraph" | "unknown";
  nodeType: string;
  text: string;
}

/** One inline marker occurrence generated from a canonical reference. */
interface ArticleReferencesProofMarker {
  displayText: string;
  entryId: string;
  id: string;
  kind: ArticleReferencesProofKind;
  label: string;
}

/** One normalized proof entry generated from a canonical definition. */
interface ArticleReferencesProofEntry {
  blocks: readonly ArticleReferencesProofBlock[];
  definitionNodeTypes: readonly string[];
  displayLabel?: string;
  id: string;
  kind: ArticleReferencesProofKind;
  label: string;
  markerIds: readonly string[];
}

/** Structured payload transported through Astro remark plugin frontmatter. */
export interface ArticleReferencesProofPayload {
  entries: readonly ArticleReferencesProofEntry[];
  markers: readonly ArticleReferencesProofMarker[];
  source: "remark-plugin-frontmatter";
  version: typeof proofVersion;
}

interface MdastNode {
  children?: MdastNode[];
  data?: {
    hProperties?: Record<string, string>;
  };
  identifier?: string;
  type: string;
  url?: string;
  value?: string;
}

interface MdastRoot extends MdastNode {
  children: MdastNode[];
  type: "root";
}

interface VFileLike {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
}

interface ArticleReferencesProofFrontmatter {
  articleReferencesProof?: unknown;
}

interface PartialArticleReferencesProofPayload {
  entries?: unknown;
  markers?: unknown;
  source?: unknown;
  version?: unknown;
}

/** Unified transformer used by the proof plugin. */
type ArticleReferencesProofTransformer = (tree: unknown, file: unknown) => void;

interface CanonicalDefinition {
  blocks: readonly ArticleReferencesProofBlock[];
  definitionNodeTypes: readonly string[];
  displayLabel?: string;
  kind: ArticleReferencesProofKind;
  label: string;
}

interface ReferenceOccurrence {
  kind: ArticleReferencesProofKind;
  label: string;
}

/**
 * Proof-only remark plugin for validating Astro reference metadata transport.
 *
 * This is intentionally smaller than the final article-reference plugin. It
 * proves that canonical `note-*` and `cite-*` footnotes can be collected,
 * represented as structured serializable data, exposed through
 * `render(entry).remarkPluginFrontmatter`, and removed from Astro/GFM's default
 * combined footnote output.
 *
 * @returns Unified transformer for Markdown and MDX content.
 */
export function remarkArticleReferencesProof(): ArticleReferencesProofTransformer {
  return (tree: unknown, file: unknown): void => {
    if (!isMdastRoot(tree) || !isVFileLike(file)) {
      return;
    }

    const definitions = collectCanonicalDefinitions(tree);
    const occurrences = collectReferenceOccurrences(tree);

    if (definitions.size === 0 && occurrences.length === 0) {
      return;
    }

    const payload = createPayload(definitions, occurrences);
    setProofPayload(file, payload);

    tree.children = transformChildren(tree.children, definitions);
  };
}

/**
 * Reads a proof payload from injected Astro remark plugin frontmatter.
 *
 * @param frontmatter Unknown frontmatter object returned by Astro rendering.
 * @returns Proof payload when present and structurally valid.
 */
export function articleReferencesProofPayloadFromFrontmatter(
  frontmatter: unknown,
): ArticleReferencesProofPayload | undefined {
  if (!hasProofFrontmatter(frontmatter)) {
    return undefined;
  }

  const payload = frontmatter.articleReferencesProof;
  return isArticleReferencesProofPayload(payload) ? payload : undefined;
}

function collectCanonicalDefinitions(
  root: MdastRoot,
): ReadonlyMap<string, CanonicalDefinition> {
  const definitions = new Map<string, CanonicalDefinition>();

  for (const child of root.children) {
    if (!isFootnoteDefinition(child)) {
      continue;
    }

    const label = normalizeLabel(child.identifier);
    const kind = kindFromLabel(label);

    if (kind === undefined) {
      continue;
    }

    const { blocks, displayLabel } = serializeDefinition(child);
    definitions.set(label, {
      blocks,
      definitionNodeTypes: child.children?.map((node) => node.type) ?? [],
      ...(displayLabel === undefined ? {} : { displayLabel }),
      kind,
      label,
    });
  }

  return definitions;
}

function collectReferenceOccurrences(root: MdastRoot): ReferenceOccurrence[] {
  const occurrences: ReferenceOccurrence[] = [];

  visit(root, (node) => {
    if (!isFootnoteReference(node)) {
      return;
    }

    const label = normalizeLabel(node.identifier);
    const kind = kindFromLabel(label);

    if (kind !== undefined) {
      occurrences.push({ kind, label });
    }
  });

  return occurrences;
}

function createPayload(
  definitions: ReadonlyMap<string, CanonicalDefinition>,
  occurrences: readonly ReferenceOccurrence[],
): ArticleReferencesProofPayload {
  const markerIdsByLabel = new Map<string, string[]>();
  const orderedLabels: string[] = [];
  const markers = occurrences.map((occurrence, index) => {
    const definition = definitions.get(occurrence.label);
    const displayText = definition?.displayLabel ?? String(index + 1);
    const markerId = `article-reference-marker-${index + 1}`;
    const priorMarkerIds = markerIdsByLabel.get(occurrence.label) ?? [];

    if (priorMarkerIds.length === 0) {
      orderedLabels.push(occurrence.label);
    }

    markerIdsByLabel.set(occurrence.label, [...priorMarkerIds, markerId]);

    return {
      displayText,
      entryId: entryId(occurrence.label),
      id: markerId,
      kind: occurrence.kind,
      label: occurrence.label,
    };
  });
  const entries = orderedLabels
    .map((label) => definitions.get(label))
    .filter((definition) => definition !== undefined)
    .map((definition) => ({
      blocks: definition.blocks,
      definitionNodeTypes: definition.definitionNodeTypes,
      ...(definition.displayLabel === undefined
        ? {}
        : { displayLabel: definition.displayLabel }),
      id: entryId(definition.label),
      kind: definition.kind,
      label: definition.label,
      markerIds: markerIdsByLabel.get(definition.label) ?? [],
    }));

  return {
    entries,
    markers,
    source: "remark-plugin-frontmatter",
    version: proofVersion,
  };
}

function transformChildren(
  children: readonly MdastNode[],
  definitions: ReadonlyMap<string, CanonicalDefinition>,
): MdastNode[] {
  return children
    .filter((node) => !shouldRemoveDefinition(node))
    .map((node) => transformNode(node, definitions));
}

function transformNode(
  node: MdastNode,
  definitions: ReadonlyMap<string, CanonicalDefinition>,
): MdastNode {
  if (isFootnoteReference(node)) {
    const label = normalizeLabel(node.identifier);
    const definition = definitions.get(label);

    if (definition !== undefined) {
      return markerNode(definition);
    }
  }

  if (node.children === undefined) {
    return node;
  }

  return {
    ...node,
    children: transformChildren(node.children, definitions),
  };
}

function markerNode(definition: CanonicalDefinition): MdastNode {
  return {
    children: [
      {
        type: "text",
        value: definition.displayLabel ?? definition.label,
      },
    ],
    data: {
      hProperties: {
        "data-article-reference-marker": "true",
        "data-reference-kind": definition.kind,
      },
    },
    type: "link",
    url: `#${entryId(definition.label)}`,
  };
}

function shouldRemoveDefinition(node: MdastNode): boolean {
  return (
    isFootnoteDefinition(node) &&
    kindFromLabel(normalizeLabel(node.identifier)) !== undefined
  );
}

function serializeDefinition(node: MdastNode): {
  blocks: ArticleReferencesProofBlock[];
  displayLabel?: string;
} {
  const firstBlock = node.children?.at(0);
  const firstInline = firstBlock?.children?.at(0);
  const displayLabel =
    firstBlock?.type === "paragraph" && firstInline?.type === "text"
      ? displayLabelFromText(firstInline.value)
      : undefined;
  const blocks =
    node.children?.map((child, index) =>
      serializeBlock(child, index === 0 && displayLabel !== undefined),
    ) ?? [];

  return {
    blocks,
    ...(displayLabel === undefined ? {} : { displayLabel }),
  };
}

function serializeBlock(
  node: MdastNode,
  removeLeadingDisplayLabel: boolean,
): ArticleReferencesProofBlock {
  const children = serializeInlineChildren(
    node.children ?? [],
    removeLeadingDisplayLabel,
  );

  return {
    children,
    kind: blockKind(node.type),
    nodeType: node.type,
    text:
      node.type === "code" && node.value !== undefined
        ? node.value
        : children.map((child) => child.text).join(""),
  };
}

function serializeInlineChildren(
  children: readonly MdastNode[],
  removeLeadingDisplayLabel: boolean,
): ArticleReferencesProofInline[] {
  return children
    .flatMap((child, index) =>
      serializeInline(child, removeLeadingDisplayLabel && index === 0),
    )
    .filter((child) => child.text !== "");
}

function serializeInline(
  node: MdastNode,
  removeLeadingDisplayLabel: boolean,
): ArticleReferencesProofInline[] {
  if (node.type === "text") {
    const text = removeLeadingDisplayLabel
      ? removeDisplayLabelFromText(node.value)
      : (node.value ?? "");

    return text === "" ? [] : [{ kind: "text", text }];
  }

  if (node.type === "inlineCode") {
    return [{ kind: "inlineCode", text: node.value ?? "" }];
  }

  if (node.type === "break") {
    return [{ kind: "break", text: "\n" }];
  }

  if (node.type === "link") {
    const children = serializeInlineChildren(node.children ?? [], false);

    return [
      {
        children,
        kind: "link",
        text: children.map((child) => child.text).join(""),
        url: node.url ?? "",
      },
    ];
  }

  if (node.type === "emphasis" || node.type === "strong") {
    const children = serializeInlineChildren(node.children ?? [], false);

    return [
      {
        children,
        kind: node.type,
        nodeType: node.type,
        text: children.map((child) => child.text).join(""),
      },
    ];
  }

  const children = serializeInlineChildren(node.children ?? [], false);

  return [
    {
      children,
      kind: "unknown",
      nodeType: node.type,
      text: children.map((child) => child.text).join(""),
    },
  ];
}

function setProofPayload(
  file: VFileLike,
  payload: ArticleReferencesProofPayload,
): void {
  const astro = file.data.astro ?? {};
  const frontmatter = astro.frontmatter ?? {};

  file.data.astro = {
    ...astro,
    frontmatter: {
      ...frontmatter,
      articleReferencesProof: payload,
    },
  };
}

function displayLabelFromText(value: string | undefined): string | undefined {
  const label = parseLeadingDisplayLabel(value ?? "")?.label.trim();

  return label === "" ? undefined : label;
}

function removeDisplayLabelFromText(value: string | undefined): string {
  return parseLeadingDisplayLabel(value ?? "")?.rest ?? value ?? "";
}

function kindFromLabel(label: string): ArticleReferencesProofKind | undefined {
  if (label.startsWith(notePrefix) && isSlug(label.slice(notePrefix.length))) {
    return "note";
  }

  if (
    label.startsWith(citationPrefix) &&
    isSlug(label.slice(citationPrefix.length))
  ) {
    return "citation";
  }

  return undefined;
}

function parseLeadingDisplayLabel(
  value: string,
): undefined | { label: string; rest: string } {
  if (!value.startsWith(displayLabelOpen)) {
    return undefined;
  }

  const closeIndex = value.indexOf(displayLabelClose, displayLabelOpen.length);

  if (closeIndex < 0) {
    return undefined;
  }

  const label = value.slice(displayLabelOpen.length, closeIndex);

  if (label.includes("\n") || label.includes("\r")) {
    return undefined;
  }

  return {
    label,
    rest: trimLeadingWhitespace(value.slice(closeIndex + 1)),
  };
}

function trimLeadingWhitespace(value: string): string {
  let index = 0;

  while (
    index < value.length &&
    whitespaceCharacters.has(value.charAt(index))
  ) {
    index += 1;
  }

  return value.slice(index);
}

function isSlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.split("-").every((part) => part.length > 0 && isAsciiAlnum(part))
  );
}

function isAsciiAlnum(value: string): boolean {
  for (const character of value) {
    if (!isAsciiAlnumCharacter(character)) {
      return false;
    }
  }

  return true;
}

function isAsciiAlnumCharacter(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "0" && character <= "9")
  );
}

function normalizeLabel(identifier: string | undefined): string {
  return (identifier ?? "").toLowerCase();
}

function entryId(label: string): string {
  return `article-reference-entry-${label}`;
}

function isFootnoteDefinition(node: MdastNode): boolean {
  return node.type === "footnoteDefinition";
}

function isFootnoteReference(node: MdastNode): boolean {
  return node.type === "footnoteReference";
}

function blockKind(type: string): ArticleReferencesProofBlock["kind"] {
  if (
    type === "code" ||
    type === "heading" ||
    type === "list" ||
    type === "paragraph"
  ) {
    return type;
  }

  return "unknown";
}

function visit(node: MdastNode, visitor: (node: MdastNode) => void): void {
  visitor(node);

  for (const child of node.children ?? []) {
    visit(child, visitor);
  }
}

function isMdastRoot(value: unknown): value is MdastRoot {
  return (
    isRecord(value) &&
    value["type"] === "root" &&
    Array.isArray(value["children"])
  );
}

function isVFileLike(value: unknown): value is VFileLike {
  if (!isRecord(value)) {
    return false;
  }

  const data = value["data"];
  return isRecord(data);
}

function hasProofFrontmatter(
  value: unknown,
): value is ArticleReferencesProofFrontmatter {
  return isRecord(value) && proofFrontmatterKey in value;
}

function isArticleReferencesProofPayload(
  value: unknown,
): value is ArticleReferencesProofPayload {
  if (!isPartialProofPayload(value)) {
    return false;
  }

  return (
    value.version === proofVersion &&
    value.source === "remark-plugin-frontmatter" &&
    Array.isArray(value.entries) &&
    Array.isArray(value.markers)
  );
}

function isPartialProofPayload(
  value: unknown,
): value is PartialArticleReferencesProofPayload {
  return isRecord(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
