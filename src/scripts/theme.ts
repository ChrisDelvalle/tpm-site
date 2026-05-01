/** Supported persisted color theme values. */
export type Theme = "dark" | "light";

interface ThemeButton {
  addEventListener(type: "click", listener: () => void): void;
}

interface ThemeDocument {
  documentElement: ThemeElement;
  querySelectorAll(selector: string): Iterable<ThemeButton>;
}

interface ThemeElement {
  dataset: Record<string, string | undefined>;
}

interface ThemeRuntime {
  document: ThemeDocument;
  localStorage: ThemeStorage;
}

interface ThemeStorage {
  getItem(key: string): null | string;
  setItem(key: string, value: string): void;
}

/**
 * Reads the active document theme.
 *
 * @param documentElement Root document element with theme metadata.
 * @returns Current theme, defaulting to dark for unknown values.
 */
export function currentTheme(documentElement: ThemeElement): Theme {
  return documentElement.dataset["theme"] === "light" ? "light" : "dark";
}

/**
 * Installs theme persistence and toggle behavior.
 *
 * @param runtime Browser runtime dependencies.
 */
export function installTheme(runtime: ThemeRuntime): void {
  const storedTheme = runtime.localStorage.getItem("theme");
  if (isTheme(storedTheme)) {
    runtime.document.documentElement.dataset["theme"] = storedTheme;
  }

  for (const toggle of runtime.document.querySelectorAll(".theme-toggle")) {
    toggle.addEventListener("click", () => {
      setTheme(
        runtime,
        nextTheme(currentTheme(runtime.document.documentElement)),
      );
    });
  }
}

/**
 * Checks whether a persisted value is a valid theme.
 *
 * @param value Stored value to validate.
 * @returns Whether the value is a supported theme.
 */
export function isTheme(value: null | string): value is Theme {
  return value === "dark" || value === "light";
}

/**
 * Computes the opposite color theme.
 *
 * @param theme Current theme.
 * @returns Opposite theme.
 */
export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/**
 * Persists and applies a theme to the runtime document.
 *
 * @param runtime Browser runtime dependencies.
 * @param theme Theme to apply.
 */
export function setTheme(runtime: ThemeRuntime, theme: Theme): void {
  runtime.document.documentElement.dataset["theme"] = theme;
  runtime.localStorage.setItem("theme", theme);
}

if (typeof document !== "undefined" && typeof localStorage !== "undefined") {
  installTheme({ document, localStorage });
}
