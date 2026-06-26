/* ============================================================
   LUMINA — Interações das seções (M2)
   Contadores, antes/depois, form de agendamento → WhatsApp.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CFG = (window.LUMINA = window.LUMINA || { wa: "5511999999999", nome: "Lumina Odontologia" });

  function waLink(msg) {
    return "https://wa.me/" + CFG.wa + "?text=" + encodeURIComponent(msg);
  }

  /* ---------- Contadores animados ---------- */
  function fmt(n, decimals) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = fmt(target, decimals) + suffix; return; }
    var dur = 1500, start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(counters, runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  /* ---------- Antes & Depois ---------- */
  var baRange = document.getElementById("baRange");
  if (baRange) {
    var baBefore = document.getElementById("baBefore");
    var baHandle = document.getElementById("baHandle");
    function setBA(v) {
      if (baBefore) baBefore.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      if (baHandle) baHandle.style.left = v + "%";
    }
    baRange.addEventListener("input", function () { setBA(this.value); });
    setBA(baRange.value);
  }

  /* ---------- Form de agendamento → WhatsApp ---------- */
  var book = document.getElementById("bookForm");
  if (book) {
    book.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = (book.nome.value || "").trim();
      var trat = book.tratamento.value;
      var hora = book.horario.value;
      if (!nome) { book.nome.focus(); book.nome.style.borderColor = "#c96"; return; }
      var msg = "Olá! Sou " + nome + " e gostaria de agendar uma avaliação"
        + (trat ? " para " + trat : "")
        + (hora ? ". Prefiro atendimento no período da " + hora : "") + ".";
      window.open(waLink(msg), "_blank", "noopener");
    });
    book.nome.addEventListener("input", function () { this.style.borderColor = ""; });
  }
})();
