(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".header");
  const progress = document.querySelector(".header__progress");
  const navLinks = [...document.querySelectorAll(".nav__link")];
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  /* ---------- 1. Плавное появление блоков ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  // Небольшая «лесенка» для соседних карточек
  document.querySelectorAll(".cards, .prices, .contacts__side").forEach(group => {
    group.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--d", `${(i % 2) * 0.12 + Math.floor(i / 2) * 0.04}s`);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- 2. Счётчик «20 лет» ---------- */
  const counter = document.querySelector(".counter");
  if (counter) {
    const target = Number(counter.dataset.to) || 0;
    const run = () => {
      if (reduceMotion) return;
      const duration = 1600;
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        counter.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      counter.textContent = "0";
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) { run(); obs.disconnect(); }
      }, { threshold: 0.6 });
      io.observe(counter);
    }
  }

  /* ---------- 3. Шапка: тень, прогресс прокрутки, активный пункт меню ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 8);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const mark = y + header.offsetHeight + window.innerHeight * 0.3;
    let current = null;
    sections.forEach(sec => { if (sec.offsetTop <= mark) current = sec; });
    // «Контакты» — последний раздел, до его верха страница может не доскроллиться,
    // поэтому у самого низа страницы считаем активным последний пункт
    if (max > 0 && y >= max - 4) current = sections[sections.length - 1];
    navLinks.forEach(link => {
      link.classList.toggle("is-active", !!current && link.getAttribute("href") === `#${current.id}`);
    });
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 4. Лёгкий наклон карточек услуг за курсором (только мышь) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 5. Пузыри чуть смещаются при движении мыши в блоке «О нас» ---------- */
  const about = document.querySelector(".about");
  if (about && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const bubbles = about.querySelectorAll(".bubble");
    about.addEventListener("pointermove", e => {
      const r = about.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      bubbles.forEach((b, i) => {
        const k = (i + 1) * 10;
        b.style.translate = `${(-x * k).toFixed(1)}px ${(-y * k).toFixed(1)}px`;
      });
    });
  }
})();
