const currentAttribute = "data-current";
const currentValue = "true";

/**
 * Installs current-section highlighting for article table-of-contents links.
 *
 * @param rootDocument Browser document that owns the article table of contents.
 */
export function installArticleTableOfContents(
  rootDocument: Document = document,
): void {
  rootDocument
    .querySelectorAll<HTMLElement>("[data-article-toc]")
    .forEach((toc) => {
      bindTableOfContents(toc, rootDocument);
    });
}

function siteHeaderOffset(rootDocument: Document, rootWindow: Window): number {
  const value = rootWindow
    .getComputedStyle(rootDocument.documentElement)
    .getPropertyValue("--site-header-height")
    .trim();
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function headingIdFromHref(href: string): string | undefined {
  if (!href.startsWith("#")) {
    return undefined;
  }

  return decodeURIComponent(href.slice(1));
}

function articleHeadingsForToc(
  links: readonly HTMLAnchorElement[],
  rootDocument: Document,
): HTMLElement[] {
  const rootWindow = rootDocument.defaultView;

  return links.flatMap((link) => {
    const id = headingIdFromHref(link.hash);
    const target = id === undefined ? null : rootDocument.getElementById(id);

    return rootWindow !== null && target instanceof rootWindow.HTMLElement
      ? [target]
      : [];
  });
}

function setCurrentLink(
  links: readonly HTMLAnchorElement[],
  currentId: string | undefined,
): void {
  links.forEach((link) => {
    const id = headingIdFromHref(link.hash);
    const isCurrent = id === currentId;

    if (isCurrent) {
      link.setAttribute(currentAttribute, currentValue);
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute(currentAttribute);
      link.removeAttribute("aria-current");
    }
  });
}

function currentHeadingId(
  headings: readonly HTMLElement[],
  rootDocument: Document,
  rootWindow: Window,
): string | undefined {
  const hashId = headingIdFromHref(rootWindow.location.hash);
  const hashHeading =
    hashId === undefined
      ? undefined
      : headings.find((heading) => heading.id === hashId);

  if (hashHeading !== undefined) {
    const hashHeadingBox = hashHeading.getBoundingClientRect();
    const viewportThreshold = Math.min(rootWindow.innerHeight * 0.45, 320);

    if (
      hashHeadingBox.top >= siteHeaderOffset(rootDocument, rootWindow) &&
      hashHeadingBox.top <= viewportThreshold
    ) {
      return hashHeading.id;
    }
  }

  const activationLine =
    siteHeaderOffset(rootDocument, rootWindow) +
    Math.min(rootWindow.innerHeight * 0.2, 160);

  return (
    headings
      .filter(
        (heading) => heading.getBoundingClientRect().top <= activationLine,
      )
      .at(-1)?.id ?? headings.at(0)?.id
  );
}

function bindTableOfContents(toc: HTMLElement, rootDocument: Document): void {
  const rootWindow = rootDocument.defaultView;

  if (rootWindow === null) {
    return;
  }

  const links = Array.from(
    toc.querySelectorAll<HTMLAnchorElement>("a[href^='#']"),
  );
  const headings = articleHeadingsForToc(links, rootDocument);
  const frame = { id: 0 };

  const update = (): void => {
    frame.id = 0;
    setCurrentLink(links, currentHeadingId(headings, rootDocument, rootWindow));
  };
  const scheduleUpdate = (): void => {
    if (frame.id === 0) {
      frame.id = rootWindow.requestAnimationFrame(update);
    }
  };

  update();
  rootWindow.addEventListener("hashchange", scheduleUpdate);
  rootWindow.addEventListener("resize", scheduleUpdate);
  rootWindow.addEventListener("scroll", scheduleUpdate, { passive: true });
}

if (typeof document !== "undefined") {
  installArticleTableOfContents();
}
