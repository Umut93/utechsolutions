// Premium v2 cosmetics: mobile nav + progress + reveal + contact mailto
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const yearEl = document.getElementById("year");
const progressEl = document.querySelector(".scroll-progress");

const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  });

  // Close if clicking outside
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      if (navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    }
  });
}

// Scroll progress bar
window.addEventListener("scroll", () => {
  if (!progressEl) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressEl.style.width = `${progress}%`;
});

// Reveal animations (subtle)
const revealEls = document.querySelectorAll(".card, .step, .info-row, .contact-form, .hero-card");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

const style = document.createElement("style");
style.innerHTML = `
  .card, .step, .info-row, .contact-form, .hero-card {
    opacity: 0;
    transform: translateY(14px);
    transition: opacity .55s ease, transform .55s ease;
  }
  .revealed {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// Contact form -> mailto (no backend required)
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    const subject = encodeURIComponent(`Kontakt fra ${name}`);
    const body = encodeURIComponent(
      `Navn: ${name}\nEmail: ${email}\n\nBesked:\n${message}\n`
    );

    window.location.href = `mailto:kontakt@utechsolutions.dk?subject=${subject}&body=${body}`;
    if (formStatus) formStatus.textContent = "Åbner din email-klient…";
  });
}
