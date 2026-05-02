import { describe, expect, test } from "bun:test";
import { Window as HappyWindow } from "happy-dom";

import { installSearchRevealFocus } from "../../../../src/components/navigation/search-reveal";

describe("search reveal browser script", () => {
  test("focuses the search input after the popover opens", async () => {
    const window = new HappyWindow();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const button = window.document.createElement("button");
    const panel = window.document.createElement("div");
    const input = window.document.createElement("input");
    const focusCalls: number[] = [];

    button.setAttribute("data-search-reveal-trigger", "");
    button.setAttribute("popovertarget", "site-search-reveal");
    panel.id = "site-search-reveal";
    panel.matches = (selector: string) => selector === ":popover-open";
    input.focus = () => {
      focusCalls.push(1);
    };
    panel.append(input);
    window.document.body.append(button, panel);
    Reflect.set(globalThis, "document", window.document);
    Reflect.set(globalThis, "window", window);

    try {
      const clickHandler = installAndReturnClickHandler();
      const event = new Event("click");
      Object.defineProperty(event, "target", { value: button });
      clickHandler(event);
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      expect(focusCalls).toHaveLength(1);
    } finally {
      Reflect.deleteProperty(globalThis, "document");
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  test("ignores clicks that are not search reveal triggers", () => {
    const window = new HappyWindow();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const button = window.document.createElement("button");

    window.document.body.append(button);
    Reflect.set(globalThis, "document", window.document);
    Reflect.set(globalThis, "window", window);

    try {
      const clickHandler = installAndReturnClickHandler();
      const event = new Event("click");
      Object.defineProperty(event, "target", { value: button });
      clickHandler(event);

      expect(window.document.activeElement).toBe(window.document.body);
    } finally {
      Reflect.deleteProperty(globalThis, "document");
      Reflect.deleteProperty(globalThis, "window");
    }
  });
});

function installAndReturnClickHandler(): EventListener {
  let clickHandler: EventListener | undefined;
  const eventTarget = {
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ): void {
      if (type === "click" && typeof listener === "function") {
        clickHandler = listener;
      }
    },
  };

  Reflect.set(
    document,
    "addEventListener",
    eventTarget.addEventListener.bind(eventTarget),
  );
  installSearchRevealFocus();

  if (clickHandler === undefined) {
    throw new Error("Expected search reveal click handler to be installed.");
  }

  return clickHandler;
}
