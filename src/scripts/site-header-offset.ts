const headerSelector = "[data-site-header]";
const headerHeightProperty = "--site-header-height";

function updateHeaderOffset(header: HTMLElement): void {
  document.documentElement.style.setProperty(
    headerHeightProperty,
    `${header.getBoundingClientRect().height}px`,
  );
}

function hashTarget(): HTMLElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1));

  if (id === "") {
    return null;
  }

  const target = document.getElementById(id);

  return target instanceof HTMLElement ? target : null;
}

function alignHashTarget(): void {
  const target = hashTarget();

  if (target === null) {
    return;
  }

  window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
}

const header = document.querySelector<HTMLElement>(headerSelector);

if (header !== null) {
  updateHeaderOffset(header);

  const observer = new ResizeObserver(() => {
    updateHeaderOffset(header);
    alignHashTarget();
  });

  observer.observe(header);
  window.addEventListener("hashchange", alignHashTarget);
  window.addEventListener("load", alignHashTarget, { once: true });
}
