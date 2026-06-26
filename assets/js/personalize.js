/* ============================================================
   LUMINA — Personalização por link (M5)
   ?nome=<clínica>&cidade=<cidade>&whats=<55DDDnúmero>
   Reescreve o demo pro dentista: nome, cidade, e TODOS os
   links de WhatsApp/tel. Fallback p/ "Lumina" sem parâmetros.
   Roda ANTES de ui/sections/quiz (define window.LUMINA).
   ============================================================ */
(function () {
  "use strict";
  function clean(s) { return (s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60); }

  var p = new URLSearchParams(location.search);
  var nome = clean(p.get("nome"));
  var cidade = clean(p.get("cidade"));
  var whats = (p.get("whats") || "").replace(/\D/g, "").slice(0, 15);

  var CFG = (window.LUMINA = window.LUMINA || { wa: "5511999999999", nome: "Lumina Odontologia", cidade: "" });
  if (whats) CFG.wa = whats;
  if (nome) CFG.nome = nome;
  if (cidade) CFG.cidade = cidade;

  if (nome) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-brand]"), function (el) { el.textContent = nome; });
    document.title = nome + " — Odontologia de alto padrão";
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", nome);
  }

  if (cidade) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-city]"), function (el) { el.textContent = cidade; });
  }

  if (whats) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="wa.me/"]'), function (a) {
      a.href = a.href.replace(/wa\.me\/\d+/, "wa.me/" + whats);
    });
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="tel:"]'), function (a) {
      a.href = "tel:+" + whats;
    });
  }
})();
