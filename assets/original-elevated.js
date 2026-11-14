const root = document.documentElement;

const header = document.querySelector(".site-header");
const menu = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (menu && nav) {
  const setMenu = (open, returnFocus = false) => {
    nav.classList.toggle("is-open", open);
    header?.classList.toggle("is-open", open);
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

// Where you are: the nav marks the section that has reached the upper part of the screen (the last one once the page ends).
if (nav) {
  const stops = [...nav.querySelectorAll("a[href^='#']")]
    .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(stop => stop.section);
  let queued = false;
  const mark = () => {
    queued = false;
    const line = innerHeight * .4;
    let current = null;
    stops.forEach(stop => { if (stop.section.getBoundingClientRect().top <= line) current = stop; });
    if (scrollY > 0 && innerHeight + scrollY >= root.scrollHeight - 2) current = stops[stops.length - 1];
    stops.forEach(stop => {
      if (stop === current) stop.link.setAttribute("aria-current", "true");
      else stop.link.removeAttribute("aria-current");
    });
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(mark);
  };
  if (stops.length) {
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    mark();
  }
}

// A travelling pulse is one traced line drawn three times over (glow, tail, bright head). The copies are made here, before motion is switched on, so all three set off together.
document.querySelectorAll(".flow path").forEach(line => line.after(line.cloneNode(), line.cloneNode()));

const motion = document.querySelector("[data-motion-toggle]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const reveals = [...document.querySelectorAll(".reveal, .ill")];
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
  if (motion) {
    motion.hidden = false;
    root.classList.add("js-motion");
    motion.disabled = reduced.matches;
    motion.setAttribute("aria-label", "Animationer");
    motion.setAttribute("aria-pressed", String(enabled));
    motion.title = reduced.matches
      ? "Animationer følger din indstilling for reduceret bevægelse"
      : enabled ? "Sæt animationer på pause" : "Afspil animationer";
  }
  if (!enabled) {
    showAllContent();
    root.classList.add("intro-done");
  }
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

// Hero drift: the picture leans away from a fine pointer; CSS eases it, rAF keeps it to one write per frame.
const hero = document.querySelector(".hero");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (hero) {
  let frame = 0, pointerX = 0, pointerY = 0;
  const settle = () => { cancelAnimationFrame(frame); frame = 0; hero.classList.remove("is-drifting"); };
  const drift = () => {
    frame = 0;
    const box = hero.getBoundingClientRect();
    hero.style.setProperty("--drift-x", ((pointerX - box.left) / box.width - .5).toFixed(3));
    hero.style.setProperty("--drift-y", ((pointerY - box.top) / box.height - .5).toFixed(3));
    hero.classList.add("is-drifting");
  };
  hero.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || !finePointer.matches || root.classList.contains("motion-paused")) return settle();
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(drift);
  }, { passive: true });
  hero.addEventListener("pointerleave", settle);
}

// The loops (hero light, travelling pulses, the process line) rest while their section is off screen.
if ("IntersectionObserver" in window) {
  const resting = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle("is-away", !entry.isIntersecting));
  });
  document.querySelectorAll(".hero, .process-section").forEach(section => resting.observe(section));
}

// Copying the address is offered where the clipboard is available; if the browser refuses, the address is selected instead.
document.querySelectorAll("[data-copy]").forEach(button => {
  if (!navigator.clipboard?.writeText) return;
  const label = button.querySelector("[data-copy-label]");
  const status = document.querySelector("[data-copy-status]");
  const idleLabel = label.textContent;
  let reset = 0;
  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
    } catch {
      const address = button.closest(".contact-card")?.querySelector("a[href^='mailto:'] span");
      if (address) getSelection()?.selectAllChildren(address);
      return;
    }
    clearTimeout(reset);
    button.style.minWidth = `${button.offsetWidth}px`;
    button.classList.add("is-copied");
    label.textContent = "Kopieret";
    if (status) status.textContent = "Mailadressen er kopieret";
    reset = setTimeout(() => {
      button.classList.remove("is-copied");
      label.textContent = idleLabel;
      if (status) status.textContent = "";
    }, 2400);
  });
});

document.querySelectorAll("[data-year]").forEach(item => {
  item.textContent = String(new Date().getFullYear());
});
