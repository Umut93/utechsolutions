const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const progress = document.querySelector(".scroll-progress");
const year = document.getElementById("year");
const revealItems = document.querySelectorAll(".reveal");

if (year) {
  year.textContent = new Date().getFullYear();
}

function setMenu(open) {
  if (!menuToggle || !nav) return;
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

function updateChrome() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  if (progress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${value}%`;
  }
}

updateChrome();
window.addEventListener("scroll", updateChrome, { passive: true });
window.addEventListener("resize", updateChrome);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
