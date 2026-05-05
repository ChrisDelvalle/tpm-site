/** Browser dependencies used by article image inspection. */
export interface ArticleImageInspectorRuntime {
  document: Document;
}

let activeTrigger: HTMLElement | undefined;

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
    "m-auto max-h-[calc(100dvh-2rem)] w-[min(100vw-2rem,72rem)] max-w-none overflow-hidden rounded-sm border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/40";

  const shell = document.createElement("div");
  shell.className =
    "grid max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

  const header = document.createElement("div");
  header.className =
    "border-border flex items-center justify-end border-b bg-background px-3 py-2";

  const close = document.createElement("button");
  close.type = "button";
  close.dataset["articleImageDialogClose"] = "true";
  close.className =
    "inline-flex min-h-9 items-center justify-center rounded-sm px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  close.textContent = "Close";
  close.addEventListener("click", () => closeDialog(dialog));

  const viewport = document.createElement("div");
  viewport.className = "overflow-auto p-4";

  const image = document.createElement("img");
  image.dataset["articleImageDialogImage"] = "true";
  image.className = "mx-auto block h-auto max-w-full rounded-sm";

  const caption = document.createElement("p");
  caption.dataset["articleImageDialogCaption"] = "true";
  caption.className =
    "text-muted-foreground mx-auto mt-3 max-w-prose text-center text-sm";

  header.append(close);
  viewport.append(image, caption);
  shell.append(header, viewport);
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

function closeDialog(dialog: HTMLDialogElement): void {
  if (canClose(dialog) && dialog.open) {
    dialog.close();
    return;
  }

  dialog.removeAttribute("open");
  restoreTriggerFocus();
}

function restoreTriggerFocus(): void {
  activeTrigger?.focus();
  activeTrigger = undefined;
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
