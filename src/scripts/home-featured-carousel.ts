const activeAttribute = "data-home-featured-active";
const currentAttribute = "aria-current";
const rotationIntervalMs = 9000;

/**
 * Installs progressive carousel behavior for homepage featured items.
 *
 * @param rootDocument Browser document that owns homepage featured carousels.
 */
export function installHomeFeaturedCarousels(
  rootDocument: Document = document,
): void {
  rootDocument
    .querySelectorAll<HTMLElement>("[data-home-featured-carousel]")
    .forEach((carousel) => {
      bindCarousel(carousel, rootDocument);
    });
}

function bindCarousel(carousel: HTMLElement, rootDocument: Document): void {
  const rootWindow = rootDocument.defaultView;

  if (rootWindow === null) {
    return;
  }

  const slides = Array.from(
    carousel.querySelectorAll<HTMLElement>("[data-home-featured-slide]"),
  );
  if (slides.length <= 1) {
    return;
  }

  const controls = carousel.querySelector<HTMLElement>(
    "[data-home-featured-controls]",
  );
  const indicatorsRoot = carousel.querySelector<HTMLElement>(
    "[data-home-featured-indicators]",
  );
  const previous = carousel.querySelector<HTMLButtonElement>(
    "[data-home-featured-previous]",
  );
  const next = carousel.querySelector<HTMLButtonElement>(
    "[data-home-featured-next]",
  );
  const indicators = Array.from(
    carousel.querySelectorAll<HTMLButtonElement>(
      "[data-home-featured-indicator]",
    ),
  );
  let activeIndex = activeSlideIndex(slides);
  let timer: number | undefined;
  let manualPause = false;
  const reducedMotion = rootWindow.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  showChrome(controls);
  showChrome(indicatorsRoot);
  showSlide(slides, indicators, activeIndex);

  const pause = (): void => {
    if (timer !== undefined) {
      rootWindow.clearInterval(timer);
      timer = undefined;
    }
  };
  const start = (): void => {
    if (manualPause || reducedMotion.matches || timer !== undefined) {
      return;
    }
    timer = rootWindow.setInterval(() => {
      activeIndex = nextIndex(activeIndex, slides.length, 1);
      showSlide(slides, indicators, activeIndex);
    }, rotationIntervalMs);
  };
  const manualShow = (index: number): void => {
    manualPause = true;
    pause();
    activeIndex = index;
    showSlide(slides, indicators, activeIndex);
  };

  previous?.addEventListener("click", () => {
    manualShow(nextIndex(activeIndex, slides.length, -1));
  });
  next?.addEventListener("click", () => {
    manualShow(nextIndex(activeIndex, slides.length, 1));
  });
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      manualShow(index);
    });
  });
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("pointerdown", () => {
    manualPause = true;
    pause();
  });
  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", start);
  reducedMotion.addEventListener("change", () => {
    pause();
    start();
  });
  start();
}

function activeSlideIndex(slides: readonly HTMLElement[]): number {
  const activeIndex = slides.findIndex(
    (slide) => slide.getAttribute(activeAttribute) === "true",
  );

  return activeIndex === -1 ? 0 : activeIndex;
}

function nextIndex(index: number, length: number, direction: -1 | 1): number {
  return (index + direction + length) % length;
}

function showChrome(element: HTMLElement | null): void {
  if (element !== null) {
    element.hidden = false;
    element.classList.add("flex");
  }
}

function showSlide(
  slides: readonly HTMLElement[],
  indicators: readonly HTMLButtonElement[],
  activeIndex: number,
): void {
  slides.forEach((slide, index) => {
    const isActive = index === activeIndex;

    slide.hidden = false;
    slide.setAttribute(activeAttribute, String(isActive));
    slide.setAttribute("aria-hidden", String(!isActive));
    if (isActive) {
      slide.removeAttribute("inert");
    } else {
      slide.setAttribute("inert", "");
    }
  });
  indicators.forEach((indicator, index) => {
    const isActive = index === activeIndex;

    if (isActive) {
      indicator.setAttribute(currentAttribute, "true");
    } else {
      indicator.removeAttribute(currentAttribute);
    }
  });
}

if (typeof document !== "undefined") {
  installHomeFeaturedCarousels();
}
