const triggerSelector = "[data-search-reveal-trigger]";

/** Browser constructor dependencies used for realm-safe instanceof checks. */
interface BrowserClasses {
  Element: typeof Element;
  HTMLButtonElement: typeof HTMLButtonElement;
}

/** Browser dependencies used by the SearchReveal focus enhancer. */
interface SearchRevealRuntime {
  classes: BrowserClasses;
  document: Document;
  eventTarget: Pick<EventTarget, "addEventListener">;
  setTimeout: Pick<Window, "setTimeout">["setTimeout"];
}

/**
 * Installs progressive focus handling for SearchReveal popovers.
 *
 * Native popover owns open/close behavior; this only moves focus into the
 * revealed search field after the browser opens the popover.
 *
 * @param runtime Browser dependencies used by the delegated focus handler.
 */
export function installSearchRevealFocus(runtime = browserRuntime()): void {
  if (runtime === null) {
    return;
  }

  runtime.eventTarget.addEventListener("click", (event) => {
    const eventTarget = event.target;

    if (!(eventTarget instanceof runtime.classes.Element)) {
      return;
    }

    const trigger = eventTarget.closest(triggerSelector);

    if (!(trigger instanceof runtime.classes.HTMLButtonElement)) {
      return;
    }

    focusSearchInput(trigger, runtime);
  });
}

function focusSearchInput(
  trigger: HTMLButtonElement,
  runtime: SearchRevealRuntime,
): void {
  const popoverId = trigger.getAttribute("popovertarget");

  if (popoverId === null) {
    return;
  }

  runtime.setTimeout(() => {
    const panel = runtime.document.getElementById(popoverId);

    if (panel?.matches(":popover-open") !== true) {
      return;
    }

    panel.querySelector("input")?.focus();
  }, 0);
}

function browserRuntime(): null | SearchRevealRuntime {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }

  return {
    classes: {
      Element: window.Element,
      HTMLButtonElement: window.HTMLButtonElement,
    },
    document,
    eventTarget: document,
    setTimeout: window.setTimeout.bind(window),
  };
}

installSearchRevealFocus();
