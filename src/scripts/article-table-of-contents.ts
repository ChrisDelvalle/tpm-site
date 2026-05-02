const currentAttribute = "data-current";
const currentValue = "true";

function siteHeaderOffset(): number {
  const value = getComputedStyle(document.documentElement)
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
): HTMLElement[] {
  return links.flatMap((link) => {
    const id = headingIdFromHref(link.hash);
    const target = id === undefined ? null : document.getElementById(id);

    return target instanceof HTMLElement ? [target] : [];
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
): string | undefined {
  const hashId = headingIdFromHref(window.location.hash);
  const hashHeading =
    hashId === undefined
      ? undefined
      : headings.find((heading) => heading.id === hashId);

  if (hashHeading !== undefined) {
    const hashHeadingBox = hashHeading.getBoundingClientRect();
    const viewportThreshold = Math.min(window.innerHeight * 0.45, 320);

    if (
      hashHeadingBox.top >= siteHeaderOffset() &&
      hashHeadingBox.top <= viewportThreshold
    ) {
      return hashHeading.id;
    }
  }

  const activationLine =
    siteHeaderOffset() + Math.min(window.innerHeight * 0.2, 160);

  return (
    headings
      .filter(
        (heading) => heading.getBoundingClientRect().top <= activationLine,
      )
      .at(-1)?.id ?? headings.at(0)?.id
  );
}

function bindTableOfContents(toc: HTMLElement): void {
  const links = Array.from(
    toc.querySelectorAll<HTMLAnchorElement>("a[href^='#']"),
  );
  const headings = articleHeadingsForToc(links);
  const frame = { id: 0 };

  const update = (): void => {
    frame.id = 0;
    setCurrentLink(links, currentHeadingId(headings));
  };
  const scheduleUpdate = (): void => {
    if (frame.id === 0) {
      frame.id = window.requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
}

document
  .querySelectorAll<HTMLElement>("[data-article-toc]")
  .forEach(bindTableOfContents);
