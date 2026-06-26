/* ============================================================
   LUMINA — Cena 3D no scroll (M3 + M4 adaptativo)
   Corredor de luz dourada estilizado (a "clínica" abstrata)
   que a câmera atravessa conforme a página rola.
   Adaptativo: perfil leve no mobile; fallback automático p/
   aparelho fraco / sem WebGL / reduced-motion; watchdog de FPS.
   ============================================================ */
import * as THREE from "three";

(function () {
  "use strict";
  var canvas = document.getElementById("scene");
  if (!canvas) return;

  var mq = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var coarse = mq("(max-width: 760px)") || mq("(pointer: coarse)");
  var conn = navigator.connection || navigator.webkitConnection || {};
  var weak = !!conn.saveData || (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function fallback() { canvas.style.display = "none"; document.documentElement.classList.remove("has-3d"); }

  var enable = hasWebGL() && !reduce && !weak;
  document.documentElement.classList.toggle("has-3d", enable);
  if (!enable) { fallback(); return; }

  /* Perfil de qualidade por dispositivo */
  var P = coarse
    ? { bays: 11, lightEvery: 3, dpr: Math.min(window.devicePixelRatio || 1, 1.25), fogFar: 70, ptInt: 60, parallax: false }
    : { bays: 18, lightEvery: 2, dpr: Math.min(window.devicePixelRatio || 1, 1.75), fogFar: 86, ptInt: 70, parallax: true };

  var GOLD = 0xe9ce86, WARM = 0xffcf8a, INK = 0x0a0e16;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !coarse, powerPreference: "high-performance" });
  renderer.setPixelRatio(P.dpr);
  renderer.setClearColor(INK, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(INK, 12, P.fogFar);

  var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
  camera.position.set(0, 1.5, 22);

  var floor = new THREE.Mesh(new THREE.PlaneGeometry(46, 340),
    new THREE.MeshStandardMaterial({ color: 0x0b0f17, roughness: 0.42, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -3.2, -130); scene.add(floor);

  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(46, 340),
    new THREE.MeshStandardMaterial({ color: 0x070a11, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 8.5, -130); scene.add(ceil);

  var wallMat = new THREE.MeshStandardMaterial({ color: 0x0c121d, roughness: 0.8, metalness: 0.15 });
  [-11, 11].forEach(function (x) {
    var w = new THREE.Mesh(new THREE.PlaneGeometry(340, 13), wallMat);
    w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(x, 2.2, -130); scene.add(w);
  });

  var colMat = new THREE.MeshStandardMaterial({ color: 0x10161f, roughness: 0.55, metalness: 0.25 });
  var stripMat = new THREE.MeshBasicMaterial({ color: GOLD, fog: true });
  var GAP = 9;
  for (var i = 0; i < P.bays; i++) {
    var z = 10 - i * GAP;
    [-9.6, 9.6].forEach(function (x) {
      var col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 0.5), colMat);
      col.position.set(x, 1.5, z); scene.add(col);
      var strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.4, 0.1), stripMat);
      strip.position.set(x + (x < 0 ? 0.36 : -0.36), 1.6, z); scene.add(strip);
    });
    if (i % P.lightEvery === 0) {
      var pl = new THREE.PointLight(WARM, P.ptInt, 32, 2);
      pl.position.set(0, 5.6, z); scene.add(pl);
    }
  }

  var arch = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.12, 8, 48, Math.PI),
    new THREE.MeshBasicMaterial({ color: GOLD, fog: true }));
  arch.position.set(0, -1.4, -52); scene.add(arch);

  scene.add(new THREE.AmbientLight(0x2c3a55, 0.9));
  var endGlow = new THREE.Mesh(new THREE.PlaneGeometry(26, 14),
    new THREE.MeshBasicMaterial({ color: 0xf3d39a, fog: false }));
  endGlow.position.set(0, 2, -150); scene.add(endGlow);
  var endLight = new THREE.PointLight(0xffd9a0, 160, 170, 2);
  endLight.position.set(0, 3, -132); scene.add(endLight);

  /* Estado de câmera + BEATS (cada seção ancora uma profundidade no corredor) */
  var curZ = 22, targetZ = 22, camX = 0, camY = 1.5, mx = 0, my = 0;

  var BEATS = [["#hero", 22], ["#clinica", 6], ["#diferenciais", -10], ["#tratamentos", -26],
    ["#quiz-sec", -40], ["#tecnologia", -52], ["#ambiente", -64], ["#resultados", -82],
    ["#avaliacoes", -96], ["#equipe", -106], ["#conteudo", -114], ["#localizacao", -122],
    ["#agendar", -130], ["#cta", -138]]
    .map(function (b) { return { el: document.querySelector(b[0]), z: b[1] }; })
    .filter(function (b) { return b.el; });

  var beatPos = [];
  function computeBeats() {
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    beatPos = BEATS.map(function (b) {
      var top = b.el.getBoundingClientRect().top + window.scrollY;
      var center = top + b.el.offsetHeight / 2 - window.innerHeight / 2;
      return Math.min(maxScroll, Math.max(0, center));
    });
  }
  function smoothstep(t) { return t * t * (3 - 2 * t); }
  function onScroll() {
    if (!beatPos.length) return;
    var y = window.scrollY, last = beatPos.length - 1;
    if (y <= beatPos[0]) { targetZ = BEATS[0].z; return; }
    if (y >= beatPos[last]) { targetZ = BEATS[last].z; return; }
    for (var i = 0; i < last; i++) {
      if (y <= beatPos[i + 1]) {
        var span = beatPos[i + 1] - beatPos[i];
        var t = span > 0 ? (y - beatPos[i]) / span : 0;
        targetZ = BEATS[i].z + (BEATS[i + 1].z - BEATS[i].z) * smoothstep(t);
        return;
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", function () { computeBeats(); onScroll(); });
  if (P.parallax) {
    window.addEventListener("pointermove", function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    computeBeats(); onScroll();
  }
  window.addEventListener("resize", resize);
  resize();

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden; if (running) loop();
  });

  /* Watchdog de FPS: rebaixa qualidade e, se ainda travar, cai no fallback */
  var fCount = 0, fT0 = performance.now(), stage = 0;
  function watchdog(now) {
    fCount++;
    var dt = now - fT0;
    if (dt < 1400) return;
    var fps = fCount / (dt / 1000);
    fCount = 0; fT0 = now;
    if (stage === 0 && fps < 30) { renderer.setPixelRatio(Math.min(P.dpr, 1)); stage = 1; }
    else if (stage <= 1 && fps < 24) { running = false; fallback(); }
    else { stage = 2; } // saudável
  }

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    var now = performance.now();
    curZ += (targetZ - curZ) * 0.06;
    camX += (mx * 1.7 - camX) * 0.04;
    camY += (1.5 - my * 0.55 - camY) * 0.04;
    camera.position.set(camX, camY, curZ);
    camera.lookAt(camX * 0.4, 1.7, curZ - 22);
    renderer.render(scene, camera);
    if (stage < 2) watchdog(now);
  }
  loop();
})();
