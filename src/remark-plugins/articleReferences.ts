import type { Root } from "mdast";
import { visit } from "unist-util-visit";

import type {
  ArticleReferenceBlockContent,
  ArticleReferenceData,
  ArticleReferenceDefinitionInput,
  ArticleReferenceInlineContent,
  ArticleReferenceMarker,
  ArticleReferenceOccurrenceInput,
} from "../lib/article-references/model";
import {
  classifyArticleReferenceLabel,
  normalizeArticleReferences,
} from "../lib/article-references/normalize";
import { articleReferenceDiagnosticMessage } from "../lib/article-references/validate";

const frontmatterKey = "articleReferences";

/** Options for the article-reference remark transformer. */
export interface RemarkArticleReferencesOptions {
  /**
   * Whether any noncanonical footnote label should fail the build.
   *
   * Keep this disabled until the legacy article corpus is normalized.
   */
  validateLegacyFootnotes?: boolean;
}

/** Unified transformer used by the article-reference remark plugin. */
type ArticleReferencesTransformer = (tree: Root, file: VFileLike) => void;

interface MutableMdastNode {
  children?: MutableMdastNode[] | undefined;
  data?:
    | undefined
    | {
        hProperties?: Record<string, unknown> | undefined;
      };
  identifier?: string | undefined;
  label?: null | string | undefined;
  lang?: null | string | undefined;
  title?: null | string | undefined;
  type: string;
  url?: string | undefined;
  value?: string | undefined;
}

interface MutableMdastRoot extends MutableMdastNode {
  children: MutableMdastNode[];
  type: "root";
}

interface VFileLike {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
  fail: (message: string) => never;
  message: (message: string) => unknown;
}

interface ArticleReferencesFrontmatter {
  articleReferences?: unknown;
}

interface ReferenceMarkerQueue {
  markers: readonly ArticleReferenceMarker[];
  used: number;
}

/**
 * Splits canonical `note-*` and `cite-*` footnotes into custom article
 * reference data plus accessible inline markers.
 *
 * @param options Plugin behavior flags.
 * @returns Unified transformer for Markdown and MDX content.
 */
export function remarkArticleReferences(
  options: RemarkArticleReferencesOptions = {},
): ArticleReferencesTransformer {
  return (tree: Root, file: VFileLike): void => {
    const mutableTree: MutableMdastRoot = tree;
    const references = collectReferenceOccurrences(
      mutableTree,
      options.validateLegacyFootnotes === true,
    );
    const definitions = collectReferenceDefinitions(
      mutableTree,
      options.validateLegacyFootnotes === true,
    );

    if (references.length === 0 && definitions.length === 0) {
      return;
    }

    const normalized = normalizeArticleReferences(references, definitions);

    if (!normalized.ok) {
      failWithDiagnostics(file, normalized.diagnostics);
      return;
    }

    setArticleReferences(file, normalized.data);
    transformTree(mutableTree, normalized.data);
  };
}

/**
 * Reads normalized article references from Astro remark plugin frontmatter.
 *
 * @param frontmatter Unknown `render(entry).remarkPluginFrontmatter` value.
 * @returns Normalized reference data when present.
 */
export function articleReferencesFromFrontmatter(
  frontmatter: unknown,
): ArticleReferenceData | undefined {
  if (!hasArticleReferencesFrontmatter(frontmatter)) {
    return undefined;
  }

  const data = frontmatter.articleReferences;
  return isArticleReferenceData(data) ? data : undefined;
}

function collectReferenceOccurrences(
  root: MutableMdastRoot,
  validateLegacyFootnotes: boolean,
): ArticleReferenceOccurrenceInput[] {
  const references: ArticleReferenceOccurrenceInput[] = [];

  visit(root, "footnoteReference", (node: MutableMdastNode) => {
    const label = sourceLabel(node);

    if (validateLegacyFootnotes || isCanonicalArticleReference(label)) {
      references.push({ label });
    }
  });

  return references;
}

function collectReferenceDefinitions(
  root: MutableMdastRoot,
  validateLegacyFootnotes: boolean,
): ArticleReferenceDefinitionInput[] {
  const definitions: ArticleReferenceDefinitionInput[] = [];

  visit(root, "footnoteDefinition", (node: MutableMdastNode) => {
    const label = sourceLabel(node);

    if (validateLegacyFootnotes || isCanonicalArticleReference(label)) {
      definitions.push({
        children: serializeDefinitionChildren(node.children ?? []),
        label,
      });
    }
  });

  return definitions;
}

function transformTree(
  root: MutableMdastRoot,
  data: ArticleReferenceData,
): void {
  const markerQueues = markerQueuesByLabel(data);
  root.children = transformChildren(root.children, markerQueues);
}

function transformChildren(
  children: readonly MutableMdastNode[],
  markerQueues: ReadonlyMap<string, ReferenceMarkerQueue>,
): MutableMdastNode[] {
  return children
    .filter((node) => !isConsumedDefinition(node, markerQueues))
    .map((node) => transformNode(node, markerQueues));
}

function transformNode(
  node: MutableMdastNode,
  markerQueues: ReadonlyMap<string, ReferenceMarkerQueue>,
): MutableMdastNode {
  if (isFootnoteReference(node)) {
    const marker = nextMarker(sourceLabel(node), markerQueues);

    if (marker !== undefined) {
      return markerLinkNode(marker);
    }
  }

  if (node.children === undefined) {
    return node;
  }

  return {
    ...node,
    children: transformChildren(node.children, markerQueues),
  };
}

function markerLinkNode(marker: ArticleReferenceMarker): MutableMdastNode {
  return {
    children: [{ type: "text", value: `[${marker.displayText}]` }],
    data: {
      hProperties: {
        "aria-label": `${marker.kind === "citation" ? "Citation" : "Note"} ${marker.displayText}`,
        "data-article-reference-marker": "true",
        "data-reference-kind": marker.kind,
        id: marker.id,
      },
    },
    type: "link",
    url: `#${marker.entryId}`,
  };
}

function markerQueuesByLabel(
  data: ArticleReferenceData,
): ReadonlyMap<string, ReferenceMarkerQueue> {
  return new Map(
    [...data.notes, ...data.citations].map((entry) => [
      entry.label,
      { markers: entry.references, used: 0 },
    ]),
  );
}

function nextMarker(
  label: string,
  markerQueues: ReadonlyMap<string, ReferenceMarkerQueue>,
): ArticleReferenceMarker | undefined {
  const queue = markerQueues.get(label);

  if (queue === undefined) {
    return undefined;
  }

  const marker = queue.markers.at(queue.used);
  queue.used += 1;
  return marker;
}

function isConsumedDefinition(
  node: MutableMdastNode,
  markerQueues: ReadonlyMap<string, ReferenceMarkerQueue>,
): boolean {
  return isFootnoteDefinition(node) && markerQueues.has(sourceLabel(node));
}

function serializeDefinitionChildren(
  children: readonly MutableMdastNode[],
): ArticleReferenceBlockContent[] {
  return children.map(serializeBlockContent);
}

function serializeBlockContent(
  node: MutableMdastNode,
): ArticleReferenceBlockContent {
  if (node.type === "code") {
    return {
      kind: "code",
      ...(node.lang === undefined || node.lang === null
        ? {}
        : { lang: node.lang }),
      text: node.value ?? "",
    };
  }

  const children = serializeInlineChildren(node.children ?? []);
  const text = children.map((child) => child.text).join("");
  const kind = blockKind(node.type);

  if (kind === "unknown") {
    return {
      ...(children.length === 0 ? {} : { children }),
      kind,
      nodeType: node.type,
      text,
    };
  }

  return {
    children,
    kind,
    text,
  };
}

function serializeInlineChildren(
  children: readonly MutableMdastNode[],
): ArticleReferenceInlineContent[] {
  return children.flatMap(serializeInlineContent);
}

function serializeInlineContent(
  node: MutableMdastNode,
): ArticleReferenceInlineContent[] {
  if (node.type === "text") {
    return textContent(node.value ?? "");
  }

  if (node.type === "inlineCode") {
    return [{ kind: "inlineCode", text: node.value ?? "" }];
  }

  if (node.type === "break") {
    return [{ kind: "break", text: "" }];
  }

  if (node.type === "link") {
    const children = serializeInlineChildren(node.children ?? []);

    return [
      {
        children,
        kind: "link",
        text: children.map((child) => child.text).join(""),
        ...(node.title === undefined || node.title === null
          ? {}
          : { title: node.title }),
        url: node.url ?? "",
      },
    ];
  }

  if (node.type === "emphasis" || node.type === "strong") {
    const children = serializeInlineChildren(node.children ?? []);

    return [
      {
        children,
        kind: node.type,
        text: children.map((child) => child.text).join(""),
      },
    ];
  }

  return unknownInlineContent(node);
}

function unknownInlineContent(
  node: MutableMdastNode,
): ArticleReferenceInlineContent[] {
  const children = serializeInlineChildren(node.children ?? []);
  const text = node.value ?? children.map((child) => child.text).join("");

  return text === "" && children.length === 0
    ? []
    : [
        {
          ...(children.length === 0 ? {} : { children }),
          kind: "unknown",
          nodeType: node.type,
          text,
        },
      ];
}

function textContent(text: string): ArticleReferenceInlineContent[] {
  return text === "" ? [] : [{ kind: "text", text }];
}

function blockKind(
  nodeType: string,
): Exclude<ArticleReferenceBlockContent["kind"], "code"> {
  if (
    nodeType === "heading" ||
    nodeType === "list" ||
    nodeType === "paragraph"
  ) {
    return nodeType;
  }

  return "unknown";
}

function sourceLabel(node: MutableMdastNode): string {
  return node.label ?? node.identifier ?? "";
}

function isCanonicalArticleReference(label: string): boolean {
  return classifyArticleReferenceLabel(label) !== undefined;
}

function failWithDiagnostics(
  file: VFileLike,
  diagnostics: ReadonlyArray<
    Parameters<typeof articleReferenceDiagnosticMessage>[0]
  >,
): void {
  const [firstDiagnostic, ...remainingDiagnostics] = diagnostics;

  for (const diagnostic of remainingDiagnostics) {
    file.message(articleReferenceDiagnosticMessage(diagnostic));
  }

  if (firstDiagnostic !== undefined) {
    file.fail(articleReferenceDiagnosticMessage(firstDiagnostic));
  }
}

function setArticleReferences(
  file: VFileLike,
  data: ArticleReferenceData,
): void {
  const astro = file.data.astro ?? {};
  const frontmatter = astro.frontmatter ?? {};

  file.data.astro = {
    ...astro,
    frontmatter: {
      ...frontmatter,
      [frontmatterKey]: data,
    },
  };
}

function hasArticleReferencesFrontmatter(
  value: unknown,
): value is ArticleReferencesFrontmatter {
  return isRecord(value) && frontmatterKey in value;
}

function isArticleReferenceData(value: unknown): value is ArticleReferenceData {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value["citations"]) && Array.isArray(value["notes"]);
}

function isFootnoteReference(
  node: MutableMdastNode,
): node is MutableMdastNode & { identifier: string } {
  return node.type === "footnoteReference";
}

function isFootnoteDefinition(
  node: MutableMdastNode,
): node is MutableMdastNode & { identifier: string } {
  return node.type === "footnoteDefinition";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
