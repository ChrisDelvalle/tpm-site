/* eslint-disable security/detect-object-injection -- Markdown and HAST plugins normalize dynamic property bags from parsed article nodes. */
import type { Image, Link, Nodes, Root, Text } from "mdast";

import { articleImagePresentation } from "../lib/article-image-policy";

interface HastParent {
  children: HastNode[];
  type: "element" | "root";
}

interface HastElement extends HastParent {
  properties?: Record<string, unknown>;
  tagName: string;
  type: "element";
}

interface HastText {
  type: "text";
  value: string;
}

type HastNode = HastElement | HastText | { type: string };

interface VFileLike {
  data?: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
}

type MdastParentNode = Nodes & { children: Nodes[] };

interface RehypeArticleImagesOptions {
  /**
   * Cache-busting policy version passed from Astro config. Astro's content
   * cache does not reliably notice imported helper-only policy changes in
   * plugin function bodies, so config carries a serializable policy key.
   */
  policyCacheKey?: string;
}

/** Serializable render metadata emitted by the article-image rehype plugin. */
interface ArticleImageRenderData {
  hasInspectableImages: boolean;
}

interface ArticleImagesFrontmatter {
  articleImages?: unknown;
}

interface ArticleImageTransformContext {
  renderedImageCount: number;
}

const frontmatterKey = "articleImages";
const standaloneImageProperty = "data-article-image-standalone-source";
const standaloneImagePropertyAliases = [
  standaloneImageProperty,
  "dataArticleImageStandaloneSource",
] as const;

/**
 * Reads article image render metadata from Astro remark plugin frontmatter.
 *
 * @param frontmatter Unknown `render(entry).remarkPluginFrontmatter` value.
 * @returns Serializable article image render flags for layout composition.
 */
export function articleImagesFromFrontmatter(
  frontmatter: unknown,
): ArticleImageRenderData {
  if (!hasArticleImagesFrontmatter(frontmatter)) {
    return { hasInspectableImages: false };
  }

  const data = frontmatter.articleImages;

  if (!isArticleImageRenderData(data)) {
    return { hasInspectableImages: false };
  }

  return data;
}

/**
 * Remark plugin that marks only standalone Markdown images for figure output.
 *
 * @returns A Markdown AST transformer used before Astro converts images to HTML.
 */
export function remarkArticleImageMarkers(): (tree: Root) => void {
  return function markArticleImages(tree: Root) {
    markStandaloneImages(tree);
  };
}

/**
 * Rehype plugin that gives plain Markdown article images editorial anatomy.
 *
 * @param options Serializable build policy options passed through Astro config.
 * @returns An HTML AST transformer that wraps standalone images in figures.
 */
export function rehypeArticleImages(
  options: RehypeArticleImagesOptions = {},
): (tree: HastParent, file: VFileLike) => void {
  void options.policyCacheKey;

  return function transformArticleImages(tree: HastParent, file: VFileLike) {
    transformChildren(tree, [], file, { renderedImageCount: 0 });
  };
}

function transformChildren(
  parent: HastParent,
  ancestors: readonly HastElement[],
  file: VFileLike,
  context: ArticleImageTransformContext,
): void {
  parent.children = parent.children.map((child) => {
    if (!isElement(child) || isInsideFigure(ancestors)) {
      return child;
    }

    const standaloneImage = standaloneImageFromParagraph(child);

    if (standaloneImage !== undefined) {
      return articleFigure(
        standaloneImage.image,
        file,
        context,
        standaloneImage.link,
      );
    }

    if (child.tagName === "p") {
      return child;
    }

    const linkedImage = linkedImageFromAnchor(child);

    if (
      linkedImage !== undefined &&
      isMarkedStandaloneImage(linkedImage.image)
    ) {
      return articleFigure(linkedImage.image, file, context, child);
    }

    if (child.tagName === "img" && isMarkedStandaloneImage(child)) {
      return articleFigure(child, file, context);
    }

    transformChildren(child, [...ancestors, child], file, context);
    return child;
  });
}

function standaloneImageFromParagraph(
  paragraph: HastElement,
): undefined | { image: HastElement; link?: HastElement } {
  if (paragraph.tagName !== "p") {
    return undefined;
  }

  const meaningfulChildren = paragraph.children.filter(
    (child) => !isWhitespaceText(child),
  );

  if (meaningfulChildren.length !== 1) {
    return undefined;
  }

  const [onlyChild] = meaningfulChildren;

  if (onlyChild === undefined || !isElement(onlyChild)) {
    return undefined;
  }

  if (onlyChild.tagName === "img" && isMarkedStandaloneImage(onlyChild)) {
    return { image: onlyChild };
  }

  const linkedImage = linkedImageFromAnchor(onlyChild);

  if (
    linkedImage === undefined ||
    !isMarkedStandaloneImage(linkedImage.image)
  ) {
    return undefined;
  }

  return { image: linkedImage.image, link: onlyChild };
}

function articleFigure(
  image: HastElement,
  file: VFileLike,
  context: ArticleImageTransformContext,
  link?: HastElement,
): HastElement {
  const title = stringProperty(image, "title");
  const alt = stringProperty(image, "alt") ?? "article image";
  const presentation = articleImagePresentation();
  const isInspectable = link === undefined && presentation.isInspectable;
  const loadingAttributes = nextImageLoadingAttributes(context);

  if (isInspectable) {
    setArticleImageRenderData(file, { hasInspectableImages: true });
  }

  image.properties = {
    ...image.properties,
    className: mergeClassName(
      image.properties?.["className"],
      presentation.imageClass,
    ),
    "data-article-image": "true",
    ...loadingAttributes,
    sizes: presentation.previewSizes,
  };

  standaloneImagePropertyAliases.forEach((propertyName) => {
    delete image.properties?.[propertyName];
  });
  delete image.properties["title"];

  const children: HastNode[] = [
    isInspectable
      ? inspectableFrame(
          image,
          alt,
          presentation.frameClass,
          presentation.inspectionClass,
        )
      : frameNode(image, presentation.frameClass, link),
  ];

  if (title !== undefined && title.trim().length > 0) {
    children.push({
      children: [{ type: "text", value: title }],
      properties: { className: presentation.captionClass },
      tagName: "figcaption",
      type: "element",
    });
  }

  return {
    children,
    properties: {
      className: presentation.figureClass,
      "data-article-image-figure": "true",
      "data-article-image-inspectable": isInspectable ? "true" : "false",
      "data-article-image-policy": presentation.policy,
    },
    tagName: "figure",
    type: "element",
  };
}

function nextImageLoadingAttributes(
  context: ArticleImageTransformContext,
): Record<string, string> {
  const isFirstRenderedImage = context.renderedImageCount === 0;
  context.renderedImageCount += 1;

  if (isFirstRenderedImage) {
    return {
      fetchpriority: "high",
      loading: "eager",
    };
  }

  return { loading: "lazy" };
}

function frameNode(
  image: HastElement,
  frameClass: string,
  link: HastElement | undefined,
): HastElement {
  if (link === undefined) {
    return {
      children: [image],
      properties: { className: frameClass },
      tagName: "div",
      type: "element",
    };
  }

  link.properties = {
    ...link.properties,
    className: mergeClassName(
      link.properties?.["className"],
      "inline-flex max-w-full items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ),
  };

  return {
    children: [link],
    properties: { className: frameClass },
    tagName: "div",
    type: "element",
  };
}

function inspectableFrame(
  image: HastElement,
  alt: string,
  frameClass: string,
  inspectionClass: string,
): HastElement {
  return {
    children: [image, inspectAffordance(inspectionClass)],
    properties: {
      "aria-haspopup": "dialog",
      "aria-label": inspectLabel(alt),
      className: frameClass,
      "data-article-image-inspect-trigger": "true",
      type: "button",
    },
    tagName: "button",
    type: "element",
  };
}

function inspectAffordance(className: string): HastElement {
  return {
    children: [expandIcon()],
    properties: {
      "aria-hidden": "true",
      className,
      "data-article-image-inspect-affordance": "true",
    },
    tagName: "span",
    type: "element",
  };
}

function expandIcon(): HastElement {
  return {
    children: [
      {
        properties: { points: "15 3 21 3 21 9" },
        tagName: "polyline",
        type: "element",
      },
      {
        properties: { points: "9 21 3 21 3 15" },
        tagName: "polyline",
        type: "element",
      },
      {
        properties: { x1: "21", x2: "14", y1: "3", y2: "10" },
        tagName: "line",
        type: "element",
      },
      {
        properties: { x1: "3", x2: "10", y1: "21", y2: "14" },
        tagName: "line",
        type: "element",
      },
    ],
    properties: {
      "aria-hidden": "true",
      className: "size-3",
      fill: "none",
      height: "24",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      viewBox: "0 0 24 24",
      width: "24",
      xmlns: "http://www.w3.org/2000/svg",
    },
    tagName: "svg",
    type: "element",
  };
}

function linkedImageFromAnchor(
  anchor: HastElement,
): undefined | { image: HastElement } {
  if (anchor.tagName !== "a" || anchor.children.length !== 1) {
    return undefined;
  }

  const [onlyChild] = anchor.children;

  if (
    onlyChild === undefined ||
    !isElement(onlyChild) ||
    onlyChild.tagName !== "img"
  ) {
    return undefined;
  }

  return { image: onlyChild };
}

function isMarkedStandaloneImage(image: HastElement): boolean {
  return standaloneImagePropertyAliases.some(
    (propertyName) => image.properties?.[propertyName] === "true",
  );
}

function isInsideFigure(ancestors: readonly HastElement[]): boolean {
  return ancestors.some((ancestor) => ancestor.tagName === "figure");
}

function isElement(node: HastNode): node is HastElement {
  return node.type === "element" && "tagName" in node && "children" in node;
}

function isWhitespaceText(node: HastNode): node is HastText {
  return node.type === "text" && "value" in node && node.value.trim() === "";
}

function stringProperty(
  element: HastElement,
  propertyName: string,
): string | undefined {
  const value = element.properties?.[propertyName];
  return typeof value === "string" ? value : undefined;
}

function mergeClassName(existing: unknown, extraClassName: string): string {
  const existingClassName = existingClassNameValue(existing);

  return [existingClassName, extraClassName].filter(Boolean).join(" ");
}

function existingClassNameValue(existing: unknown): string {
  if (Array.isArray(existing)) {
    return existing.join(" ");
  }

  if (typeof existing === "string") {
    return existing;
  }

  return "";
}

function inspectLabel(alt: string): string {
  return alt.trim().length > 0 ? `View full image: ${alt}` : "View full image";
}

function setArticleImageRenderData(
  file: VFileLike,
  data: ArticleImageRenderData,
): void {
  const fileData = file.data ?? {};
  const astro = fileData.astro ?? {};
  const frontmatter = astro.frontmatter ?? {};

  file.data = {
    ...fileData,
    astro: {
      ...astro,
      frontmatter: {
        ...frontmatter,
        [frontmatterKey]: data,
      },
    },
  };
}

function hasArticleImagesFrontmatter(
  value: unknown,
): value is ArticleImagesFrontmatter {
  return isRecord(value) && frontmatterKey in value;
}

function isArticleImageRenderData(
  value: unknown,
): value is ArticleImageRenderData {
  return isRecord(value) && typeof value["hasInspectableImages"] === "boolean";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function markStandaloneImages(parent: { children: Nodes[] }): void {
  parent.children.forEach((child) => {
    if (isMdastParagraph(child)) {
      const image = standaloneMdastImage(child);

      if (image !== undefined) {
        markMdastImage(image);
      }
    }

    if (isMdastParent(child)) {
      markStandaloneImages(child);
    }
  });
}

function standaloneMdastImage(parent: {
  children: Nodes[];
}): Image | undefined {
  const meaningfulChildren = parent.children.filter(
    (child) => !isMdastWhitespaceText(child),
  );

  if (meaningfulChildren.length !== 1) {
    return undefined;
  }

  const [onlyChild] = meaningfulChildren;

  if (onlyChild === undefined) {
    return undefined;
  }

  if (isMdastImage(onlyChild)) {
    return onlyChild;
  }

  if (!isMdastLink(onlyChild)) {
    return undefined;
  }

  const linkChildren = onlyChild.children.filter(
    (child) => !isMdastWhitespaceText(child),
  );
  const [onlyLinkChild] = linkChildren;

  if (
    linkChildren.length !== 1 ||
    onlyLinkChild === undefined ||
    !isMdastImage(onlyLinkChild)
  ) {
    return undefined;
  }

  return onlyLinkChild;
}

function markMdastImage(image: Image): void {
  const hProperties =
    typeof image.data?.hProperties === "object" &&
    !Array.isArray(image.data.hProperties)
      ? image.data.hProperties
      : {};

  image.data = {
    ...image.data,
    hProperties: {
      ...hProperties,
      [standaloneImageProperty]: "true",
    },
  };
}

function isMdastParent(node: Nodes): node is MdastParentNode {
  return "children" in node && Array.isArray(node.children);
}

function isMdastParagraph(node: Nodes): node is MdastParentNode {
  return node.type === "paragraph" && isMdastParent(node);
}

function isMdastImage(node: Nodes): node is Image {
  return node.type === "image";
}

function isMdastLink(node: Nodes): node is Link {
  return node.type === "link" && isMdastParent(node);
}

function isMdastWhitespaceText(node: Nodes): node is Text {
  return node.type === "text" && "value" in node && node.value.trim() === "";
}

/* eslint-enable security/detect-object-injection */
