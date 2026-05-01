type Theme = "dark" | "light";

function currentTheme(): Theme {
  return document.documentElement.dataset["theme"] === "light"
    ? "light"
    : "dark";
}

function isTheme(value: null | string): value is Theme {
  return value === "dark" || value === "light";
}

function setTheme(theme: Theme): void {
  document.documentElement.dataset["theme"] = theme;
  localStorage.setItem("theme", theme);
}

const storedTheme = localStorage.getItem("theme");
if (isTheme(storedTheme)) {
  document.documentElement.dataset["theme"] = storedTheme;
}

document
  .querySelectorAll<HTMLButtonElement>(".theme-toggle")
  .forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
