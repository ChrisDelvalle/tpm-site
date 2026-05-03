import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

import {
  type AnchoredPositioningRuntime,
  installAnchoredPositioning,
} from "../../../src/scripts/anchored-positioning";

describe("anchored positioning browser script", () => {
  test("positions an open mobile shell panel below the header", () => {
    const window = browserWindow();
    const document = window.document;

    document.body.innerHTML = `
      <header data-site-header>Header</header>
      <details data-anchor-root data-anchor-preset="mobile-shell-panel" open>
        <summary data-anchor-trigger>Menu</summary>
        <div data-anchor-panel>Panel</div>
      </details>
    `;

    const header = requiredElement(window, "[data-site-header]");
    const trigger = requiredElement(window, "[data-anchor-trigger]");
    const panel = requiredElement(window, "[data-anchor-panel]");
    const root = requiredElement(window, "[data-anchor-root]");

    setRect(header, { height: 96, width: 390, x: 0, y: 0 });
    setRect(trigger, { height: 40, width: 40, x: 0, y: 24 });
    setRect(panel, { height: 640, width: 360, x: 16, y: 104 });
    installImmediateAnimationFrame(window);

    installAnchoredPositioning(runtimeFor(window));
    dispatchWindowEvent(root, window, "toggle");

    expect(panel.style.getPropertyValue("--anchor-x")).toBe("16px");
    expect(panel.style.getPropertyValue("--anchor-y")).toBe("96px");
    expect(panel.style.getPropertyValue("--anchor-max-width")).toBe("358px");
    expect(panel.style.getPropertyValue("--anchor-max-height")).toBe("732px");
    expect(panel.dataset["anchorPlacement"]).toBe("viewport-fill");
    expect(panel.dataset["anchorState"]).toContain("sized-block");
  });

  test("does not eagerly measure closed panels", () => {
    const window = browserWindow();
    const document = window.document;

    document.body.innerHTML = `
      <header data-site-header>Header</header>
      <div data-anchor-root data-anchor-preset="header-dropdown">
        <a data-anchor-trigger href="/categories/culture/">Culture</a>
        <div data-anchor-panel>Panel</div>
      </div>
    `;

    const header = requiredElement(window, "[data-site-header]");
    const trigger = requiredElement(window, "[data-anchor-trigger]");
    const panel = requiredElement(window, "[data-anchor-panel]");
    let panelMeasureCount = 0;

    setRect(header, { height: 96, width: 800, x: 0, y: 0 });
    setRect(trigger, { height: 32, width: 80, x: 120, y: 32 });
    Reflect.set(panel, "getBoundingClientRect", () => {
      panelMeasureCount += 1;
      return domRect({ height: 240, width: 320, x: 0, y: 0 });
    });
    installImmediateAnimationFrame(window);

    installAnchoredPositioning(runtimeFor(window));
    dispatchWindowEvent(trigger, window, "click");

    expect(panelMeasureCount).toBe(0);
    expect(panel.style.getPropertyValue("--anchor-x")).toBe("");
  });

  test("observes header and panel size changes and disconnects removed roots", () => {
    const window = browserWindow();
    const document = window.document;
    const observer = resizeObserverConstructor();

    document.body.innerHTML = `
      <header data-site-header>Header</header>
      <details data-anchor-root data-anchor-preset="mobile-shell-panel" open>
        <summary data-anchor-trigger>Menu</summary>
        <div data-anchor-panel>Panel</div>
      </details>
    `;

    const root = requiredElement(window, "[data-anchor-root]");
    const panel = requiredElement(window, "[data-anchor-panel]");
    installImmediateAnimationFrame(window);

    installAnchoredPositioning(runtimeFor(window, observer.ResizeObserver));
    root.remove();
    window.dispatchEvent(new window.Event("resize"));

    expect(observer.observedSelectors).toEqual([
      "[data-anchor-root]",
      "[data-site-header]",
      "[data-anchor-panel]",
    ]);
    expect(observer.disconnectCount).toBe(1);
    expect(panel.style.getPropertyValue("--anchor-x")).toBe("");
  });
});

function browserWindow(): Window {
  const window = new Window({ url: "https://example.com/" });
  Reflect.set(window, "SyntaxError", SyntaxError);
  Reflect.set(window, "innerHeight", 844);
  Reflect.set(window, "innerWidth", 390);

  return window;
}

function runtimeFor(
  window: Window,
  resizeObserver?: typeof ResizeObserver,
): AnchoredPositioningRuntime {
  return {
    classes: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM exposes browser constructors with the runtime shape needed by the script.
      Element: window.Element as unknown as typeof Element,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM exposes browser constructors with the runtime shape needed by the script.
      Node: window.Node as unknown as typeof Node,
      ResizeObserver: resizeObserver,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM provides the browser runtime shape used by this script test.
    document: window.document as unknown as Document,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM provides the browser runtime shape used by this script test.
    window: window as unknown as globalThis.Window,
  };
}

function requiredElement(window: Window, selector: string): HTMLElement {
  const element = window.document.querySelector(selector);

  if (!(element instanceof window.HTMLElement)) {
    throw new Error(`Expected fixture element for selector ${selector}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM elements satisfy the browser HTMLElement shape used by the script.
  return element as unknown as HTMLElement;
}

function setRect(element: Element, rect: TestRect): void {
  Reflect.set(element, "getBoundingClientRect", () => domRect(rect));
}

function installImmediateAnimationFrame(window: Window): void {
  Reflect.set(
    window,
    "requestAnimationFrame",
    (callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    },
  );
}

function dispatchWindowEvent(
  element: HTMLElement,
  window: Window,
  eventName: string,
): void {
  const event = new window.Event(eventName, { bubbles: true });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Happy DOM events satisfy DOM Event at runtime for dispatch.
  element.dispatchEvent(event as unknown as Event);
}

interface TestRect {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

function domRect(rect: TestRect): DOMRect {
  return {
    bottom: rect.y + rect.height,
    height: rect.height,
    left: rect.x,
    right: rect.x + rect.width,
    toJSON: () => ({}),
    top: rect.y,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  };
}

function resizeObserverConstructor(): {
  readonly disconnectCount: number;
  readonly observedSelectors: readonly string[];
  readonly ResizeObserver: typeof ResizeObserver;
} {
  const observedSelectors: string[] = [];
  let disconnectCount = 0;

  class TestResizeObserver implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      void callback;
    }

    disconnect(): void {
      disconnectCount += 1;
    }

    observe(element: Element, options?: ResizeObserverOptions): void {
      void options;
      observedSelectors.push(selectorFor(element));
    }

    unobserve(element: Element): void {
      void element;
    }
  }

  return {
    get disconnectCount() {
      return disconnectCount;
    },
    get observedSelectors() {
      return observedSelectors;
    },
    ResizeObserver: TestResizeObserver,
  };
}

function selectorFor(element: Element): string {
  if (element.hasAttribute("data-anchor-root")) {
    return "[data-anchor-root]";
  }

  if (element.hasAttribute("data-site-header")) {
    return "[data-site-header]";
  }

  if (element.hasAttribute("data-anchor-panel")) {
    return "[data-anchor-panel]";
  }

  return element.tagName.toLowerCase();
}
