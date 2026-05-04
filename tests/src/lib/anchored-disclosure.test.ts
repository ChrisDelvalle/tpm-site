import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

import {
  type AnchoredDisclosureRuntime,
  installAnchoredDisclosure,
} from "../../../src/lib/anchored-disclosure";

describe("anchored disclosure controller", () => {
  test("opens a root from an explicit trigger and keeps trigger state synchronized", () => {
    const window = new Window({ url: "https://example.com/" });
    const document = window.document;

    Reflect.set(window, "SyntaxError", SyntaxError);
    Reflect.set(window, "matchMedia", () => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => true,
      matches: false,
      media: "",
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }));

    document.body.innerHTML = `
      <div data-disclosure-root>
        <button data-disclosure-trigger aria-expanded="false">Open</button>
        <div data-disclosure-panel>Panel</div>
      </div>
    `;

    const root = requiredElement(window, "[data-disclosure-root]");
    const trigger = requiredElement(window, "[data-disclosure-trigger]");

    installAnchoredDisclosure(runtimeFor(window));
    trigger.dispatchEvent(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM events satisfy DOM Event at runtime for dispatch.
      new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }) as unknown as Event,
    );

    expect(root.getAttribute("data-disclosure-open")).toBe("true");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});

function runtimeFor(window: Window): AnchoredDisclosureRuntime {
  return {
    classes: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM exposes browser constructors with the runtime shape needed by the controller.
      Element: window.Element as unknown as typeof Element,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM exposes browser constructors with the runtime shape needed by the controller.
      Node: window.Node as unknown as typeof Node,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM provides the browser runtime shape used by this controller test.
    document: window.document as unknown as Document,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM provides the browser runtime shape used by this controller test.
    window: window as unknown as globalThis.Window,
  };
}

function requiredElement(window: Window, selector: string): HTMLElement {
  const element = window.document.querySelector(selector);

  if (!(element instanceof window.HTMLElement)) {
    throw new Error(`Expected fixture element for selector ${selector}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM elements satisfy the browser HTMLElement shape used by the controller.
  return element as unknown as HTMLElement;
}
