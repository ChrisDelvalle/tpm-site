/** Browser dependencies used by article image inspection. */
export interface ArticleImageInspectorRuntime {
  document: Document;
}

let activeTrigger: HTMLElement | undefined;
let activeScrollPosition: ScrollPosition | undefined;

interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Installs progressive dialog inspection for editorial article images.
 *
 * @param runtime Browser DOM dependencies, injected by tests.
 */
export function installArticleImageInspector(runtime = browserRuntime()): void {
  if (runtime === undefined) {
    return;
  }

  const { document } = runtime;

  if (document.documentElement.dataset["articleImageInspector"] === "ready") {
    return;
  }

  document.documentElement.dataset["articleImageInspector"] = "ready";
  document.addEventListener("click", (event) => {
    const target = event.target;
    const elementConstructor = document.defaultView?.Element;

    if (
      elementConstructor === undefined ||
      !(target instanceof elementConstructor)
    ) {
      return;
    }

    const trigger = target.closest<HTMLElement>(
      "[data-article-image-inspect-trigger]",
    );

    if (trigger === null) {
      return;
    }

    const figure = trigger.closest<HTMLElement>("[data-article-image-figure]");
    if (figure === null) {
      return;
    }

    const image = figure.querySelector<HTMLImageElement>(
      "img[data-article-image]",
    );

    if (image === null) {
      return;
    }

    event.preventDefault();
    openArticleImageDialog(document, trigger, figure, image);
  });
}

function openArticleImageDialog(
  document: Document,
  trigger: HTMLElement,
  figure: HTMLElement,
  image: HTMLImageElement,
): void {
  const dialog = articleImageDialog(document);
  const dialogImage = requiredDialogImage(dialog);
  const dialogCaption = requiredDialogCaption(dialog);
  const captionElement = figure.querySelector("figcaption");
  const caption =
    captionElement === null ? "" : captionElement.textContent.trim();

  activeTrigger = trigger;
  activeScrollPosition = scrollPosition(document);
  dialogImage.alt = image.alt;
  dialogImage.src = image.currentSrc.length > 0 ? image.currentSrc : image.src;
  copyOptionalAttribute(image, dialogImage, "srcset");
  dialogImage.sizes = "100vw";
  dialogCaption.textContent = caption;
  dialogCaption.hidden = caption.length === 0;

  if (canShowModal(dialog)) {
    if (!dialog.open) {
      dialog.showModal();
    }
  } else {
    dialog.setAttribute("open", "");
  }

  requiredDialogClose(dialog).focus();
}

function articleImageDialog(document: Document): HTMLDialogElement {
  const existingDialog = document.querySelector<HTMLDialogElement>(
    "[data-article-image-dialog]",
  );

  if (existingDialog !== null) {
    return existingDialog;
  }

  const dialog = document.createElement("dialog");
  dialog.dataset["articleImageDialog"] = "true";
  dialog.setAttribute("aria-label", "Image viewer");
  dialog.className =
    "m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 bg-transparent p-0 text-foreground backdrop:bg-black/85";

  const shell = document.createElement("div");
  shell.className = "relative h-dvh w-dvw";

  const close = document.createElement("button");
  close.type = "button";
  close.dataset["articleImageDialogClose"] = "true";
  close.setAttribute("aria-label", "Close image viewer");
  close.className =
    "absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  close.append(closeIcon(document));
  close.addEventListener("click", () => closeDialog(dialog));

  const viewport = document.createElement("div");
  viewport.dataset["articleImageDialogViewport"] = "true";
  viewport.className =
    "grid h-dvh w-dvw place-items-center overflow-auto p-4 sm:p-6";
  viewport.addEventListener("click", (event) => {
    if (event.target === viewport) {
      closeDialog(dialog);
    }
  });

  const image = document.createElement("img");
  image.dataset["articleImageDialogImage"] = "true";
  image.className =
    "block h-auto max-h-[calc(100dvh-2rem)] max-w-[calc(100dvw-2rem)] rounded-sm object-contain sm:max-h-[calc(100dvh-3rem)] sm:max-w-[calc(100dvw-3rem)]";

  const caption = document.createElement("p");
  caption.dataset["articleImageDialogCaption"] = "true";
  caption.className =
    "mx-auto mt-3 max-w-prose text-center text-sm text-white/80";

  viewport.append(image, caption);
  shell.append(close, viewport);
  dialog.append(shell);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog(dialog);
    }
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !canShowModal(dialog)) {
      event.preventDefault();
      closeDialog(dialog);
    }
  });
  dialog.addEventListener("close", restoreTriggerFocus);
  document.body.append(dialog);

  return dialog;
}

function closeIcon(document: Document): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "size-5");
  svg.setAttribute("fill", "none");
  svg.setAttribute("height", "24");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "24");

  const firstLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  firstLine.setAttribute("d", "M18 6 6 18");

  const secondLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  secondLine.setAttribute("d", "m6 6 12 12");

  svg.append(firstLine, secondLine);

  return svg;
}

function closeDialog(dialog: HTMLDialogElement): void {
  if (canClose(dialog) && dialog.open) {
    dialog.close();
    return;
  }

  dialog.removeAttribute("open");
  restoreTriggerFocus();
}

function restoreTriggerFocus(): void {
  const trigger = activeTrigger;
  const scrollPosition = activeScrollPosition;

  trigger?.focus({ preventScroll: true });
  activeTrigger = undefined;
  activeScrollPosition = undefined;

  if (trigger !== undefined && scrollPosition !== undefined) {
    trigger.ownerDocument.defaultView?.scrollTo(
      scrollPosition.x,
      scrollPosition.y,
    );
  }
}

function scrollPosition(document: Document): ScrollPosition | undefined {
  const window = document.defaultView;

  if (window === null) {
    return undefined;
  }

  return {
    x: window.scrollX,
    y: window.scrollY,
  };
}

function requiredDialogImage(dialog: HTMLDialogElement): HTMLImageElement {
  const element = dialog.querySelector<HTMLImageElement>(
    "[data-article-image-dialog-image]",
  );

  if (element === null) {
    throw new Error("Missing article image dialog element: image");
  }

  return element;
}

function requiredDialogCaption(dialog: HTMLDialogElement): HTMLElement {
  const element = dialog.querySelector<HTMLElement>(
    "[data-article-image-dialog-caption]",
  );

  if (element === null) {
    throw new Error("Missing article image dialog element: caption");
  }

  return element;
}

function requiredDialogClose(dialog: HTMLDialogElement): HTMLButtonElement {
  const element = dialog.querySelector<HTMLButtonElement>(
    "[data-article-image-dialog-close]",
  );

  if (element === null) {
    throw new Error("Missing article image dialog element: close");
  }

  return element;
}

function copyOptionalAttribute(
  source: HTMLImageElement,
  target: HTMLImageElement,
  attributeName: string,
): void {
  const value = source.getAttribute(attributeName);

  if (value === null) {
    target.removeAttribute(attributeName);
    return;
  }

  target.setAttribute(attributeName, value);
}

function canShowModal(dialog: HTMLDialogElement): boolean {
  return typeof dialog.showModal === "function";
}

function canClose(dialog: HTMLDialogElement): boolean {
  return typeof dialog.close === "function";
}

function browserRuntime(): ArticleImageInspectorRuntime | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  return { document };
}

installArticleImageInspector();
