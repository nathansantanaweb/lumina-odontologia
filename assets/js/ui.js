/* ============================================================
   LUMINA — UI base (M1): nav, menu, progresso (fio de luz), reveal
   Vanilla, sem dependências. Respeita prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Ano no rodapé */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Navegação: estado "scrolled" + progresso do fio de luz */
  var nav = document.getElementById("nav");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var p = docH > 0 ? Math.min(1, Math.max(0, y / docH)) : 0;
    root.style.setProperty("--progress", p.toFixed(4));
    ticking = false;
  }
  function requestScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }
  if (mobile) {
    mobile.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* Diagnóstico de overflow horizontal (só com #debug) */
  if (location.hash === "#debug") {
    var vw = document.documentElement.clientWidth;
    var worst = [];
    Array.prototype.forEach.call(document.querySelectorAll("*"), function (el) {
      var r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.width > vw + 1) {
        el.style.outline = "2px solid red";
        worst.push(el.tagName + "." + (el.className || "") + " w=" + Math.round(r.width) + " right=" + Math.round(r.right));
      }
    });
    var b = document.createElement("pre");
    b.style.cssText = "position:fixed;top:0;left:0;z-index:9999;background:#fff;color:#000;font:11px monospace;padding:6px;max-width:100%;white-space:pre-wrap;margin:0";
    b.textContent = "vw=" + vw + " scrollW=" + document.documentElement.scrollWidth + "\n" + worst.slice(0, 14).join("\n");
    document.body.appendChild(b);
  }

  /* Reveal on scroll */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var forceReveal = /[?&](all|reveal)\b/.test(location.search); /* p/ screenshots/preview estático */
  if (reduceMotion || forceReveal || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
