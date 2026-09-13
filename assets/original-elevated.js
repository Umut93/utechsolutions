const root = document.documentElement;

const menu = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (menu && nav) {
  const setMenu = (open, returnFocus = false) => {
    nav.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
    if (returnFocus) menu.focus();
  };
  root.classList.add("js-nav");
  menu.hidden = false;
  setMenu(false);
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      setMenu(false, true);
    }
  });
  const closeOutside = event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  };
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("focusin", closeOutside);
  window.addEventListener("resize", () => {
    if (getComputedStyle(menu).display === "none") setMenu(false);
  }, { passive: true });
}

const motion = document.querySelector("[data-motion-toggle]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const reveals = [...document.querySelectorAll(".reveal")];
const storageKey = "utech-motion-paused";
let userPaused = false;
let revealObserver;

try { userPaused = localStorage.getItem(storageKey) === "true"; } catch { /* Storage is optional. */ }

const showAllContent = () => {
  revealObserver?.disconnect();
  root.classList.remove("js-reveal");
  reveals.forEach(item => item.classList.add("is-visible"));
};

const applyMotionPreference = () => {
  const enabled = !userPaused && !reduced.matches;
  root.classList.toggle("motion-paused", !enabled);
  root.classList.toggle("motion-reduced", reduced.matches);
  if (motion) {
    motion.hidden = false;
    motion.disabled = reduced.matches;
    motion.setAttribute("aria-label", "Animationer");
    motion.setAttribute("aria-pressed", String(enabled));
    motion.title = reduced.matches
      ? "Animationer følger din indstilling for reduceret bevægelse"
      : enabled ? "Sæt animationer på pause" : "Afspil animationer";
  }
  if (!enabled) showAllContent();
};

motion?.addEventListener("click", () => {
  userPaused = !userPaused;
  try { localStorage.setItem(storageKey, String(userPaused)); } catch { /* Keep the preference for this visit. */ }
  applyMotionPreference();
});
reduced.addEventListener?.("change", applyMotionPreference);
applyMotionPreference();

if (root.classList.contains("motion-paused") || !("IntersectionObserver" in window)) {
  showAllContent();
} else {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  reveals.forEach(item => {
    const bounds = item.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) item.classList.add("is-visible");
    else revealObserver.observe(item);
  });
  root.classList.add("js-reveal");
}

document.querySelectorAll("[data-year]").forEach(item => {
  item.textContent = String(new Date().getFullYear());
});
