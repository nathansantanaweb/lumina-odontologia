/* ============================================================
   LUMINA — Quiz "Qual tratamento é pra você?" (M2)
   3 passos → recomendação → WhatsApp. Vanilla, acessível.
   ============================================================ */
(function () {
  "use strict";
  var quiz = document.getElementById("quiz");
  if (!quiz) return;

  var CFG = (window.LUMINA = window.LUMINA || { wa: "5511999999999", nome: "Lumina Odontologia" });
  var steps = Array.prototype.slice.call(quiz.querySelectorAll(".quiz__step"));
  var bar = quiz.querySelector("#quizBar");
  var total = 3; // passos antes do resultado
  var state = { step: 1, treat: "", period: "" };
  var started = false; /* só foca (a11y) após interação — evita auto-scroll no load */

  function show(step) {
    state.step = step;
    steps.forEach(function (s) { s.classList.toggle("is-active", parseInt(s.getAttribute("data-step"), 10) === step); });
    if (bar) bar.style.width = Math.min(100, Math.round((Math.min(step, total) / total) * 100)) + "%";
    var active = quiz.querySelector('.quiz__step[data-step="' + step + '"]');
    if (active && started) { var f = active.querySelector("button, a"); if (f) f.focus({ preventScroll: true }); }
  }

  function finish() {
    var titleEl = quiz.querySelector("#quizResultTitle");
    var waEl = quiz.querySelector("#quizWa");
    if (titleEl) titleEl.textContent = state.treat;
    var msg = "Olá! Fiz o quiz no site e tenho interesse em " + state.treat
      + (state.period ? ", prefiro atendimento no período da " + state.period : "") + ". Podemos conversar?";
    if (waEl) waEl.href = "https://wa.me/" + CFG.wa + "?text=" + encodeURIComponent(msg);
    show(4);
  }

  quiz.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    started = true;
    if (t.hasAttribute("data-treat")) { state.treat = t.getAttribute("data-treat"); show(2); }
    else if (t.hasAttribute("data-next")) { show(3); }
    else if (t.hasAttribute("data-period")) { state.period = t.getAttribute("data-period"); finish(); }
    else if (t.hasAttribute("data-back")) { show(Math.max(1, state.step - 1)); }
    else if (t.hasAttribute("data-restart")) { state.treat = ""; state.period = ""; show(1); }
  });

  show(1);
})();
