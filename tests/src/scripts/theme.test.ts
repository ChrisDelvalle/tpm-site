import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

import {
  currentTheme,
  installTheme,
  isTheme,
  nextTheme,
  setTheme,
} from "../../../src/scripts/theme";

describe("theme browser script", () => {
  test("validates and toggles supported themes", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(nextTheme("dark")).toBe("light");
  });

  test("applies persisted theme values through browser DOM dependencies", () => {
    const window = new Window();
    Reflect.set(window, "SyntaxError", SyntaxError);
    const button = window.document.createElement("button");
    button.className = "theme-toggle";
    window.document.body.append(button);
    window.localStorage.setItem("theme", "light");

    const runtime = {
      document: window.document,
      localStorage: window.localStorage,
    };

    installTheme(runtime);
    expect(currentTheme(window.document.documentElement)).toBe("light");

    button.click();
    expect(currentTheme(window.document.documentElement)).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");

    setTheme(runtime, "light");
    expect(currentTheme(window.document.documentElement)).toBe("light");
  });
});
