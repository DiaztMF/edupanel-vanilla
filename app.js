/* EduPanel Vanilla — SPA hash-router. Port of Dashboard + 3 games (Next.js source).
   Routes: #/  #/games/math-tug-of-war  #/games/quiz-tug-of-war  #/games/waste-sorting-race */
(function () {
  "use strict";
  var D = window.EduData;
  var app = document.getElementById("app");
  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push({ t: "t", id: id }); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push({ t: "i", id: id }); return id; }
  function cleanup() {
    timers.forEach(function (x) { if (x.t === "t") clearTimeout(x.id); else clearInterval(x.id); });
    timers = [];
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ── Polyfill NodeList.prototype.forEach for older Android WebView ── */
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  /* ── Helper: bind unified touch/pointer/click event ── */
  function onTouch(elem, fn) {
    if (!elem) return;
    var triggered = false;
    elem.addEventListener("touchstart", function (e) {
      triggered = true;
      fn.call(this, e);
    }, false);
    elem.addEventListener("click", function (e) {
      if (triggered) {
        triggered = false;
        return;
      }
      fn.call(this, e);
    }, false);
  }

  /* ── Helper: Fullscreen with fallback for older WebKit ── */
  function triggerFullscreen() {
    var doc = document.documentElement;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (isFs) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(function () {});
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
      else if (doc.mozRequestFullScreen) doc.mozRequestFullScreen();
      else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
    }
  }
    '<rect x="20" y="10" width="40" height="8" fill="#1a1a1a"/><rect x="16" y="18" width="6" height="15" fill="#1a1a1a"/>' +
    '<rect x="18" y="16" width="44" height="4" fill="#e11d48"/><rect x="18" y="20" width="44" height="4" fill="#ffffff"/>' +
    '<rect x="22" y="24" width="36" height="24" fill="#f5c29a"/>' +
    '<rect x="40" y="28" width="8" height="2" fill="#1a1a1a"/><rect x="52" y="28" width="6" height="2" fill="#1a1a1a"/>' +
    '<rect x="42" y="34" width="4" height="4" fill="#1a1a1a"/><rect x="54" y="34" width="4" height="4" fill="#1a1a1a"/>' +
    '<rect x="46" y="42" width="6" height="2" fill="#a36b4a"/>' +
    '<rect x="20" y="48" width="40" height="20" fill="__COLOR__"/>' +
    '<rect x="20" y="66" width="40" height="4" fill="#404040"/>' +
    '<rect x="24" y="70" width="12" height="12" fill="#52525b"/><rect x="44" y="70" width="12" height="12" fill="#52525b"/>' +
    '<rect x="20" y="82" width="16" height="8" fill="#18181b"/><rect x="40" y="82" width="16" height="8" fill="#18181b"/>' +
    '<rect x="30" y="52" width="30" height="10" fill="#f5c29a"/><rect x="55" y="50" width="10" height="14" fill="#d99b78"/></svg>';
  function guy(color, flip) {
    return PIXEL.split("__COLOR__").join(color).split("__FLIP__").join(flip ? "transform:scaleX(-1)" : "");
  }

  /* ─── Shared: header + timer ring ─── */
  var timerState = null;
  function headerHTML(title, sub, showTimer) {
    return '<header class="gheader">' +
      '<div class="side"><a class="btn-menu" href="#/">← Menu</a></div>' +
      '<div class="center"><h1>' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div>' +
      '<div class="side right">' + (showTimer ? '<div class="timer"><div class="timer-ring">' +
        '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="rgba(15,23,42,.12)" stroke-width="3"/>' +
        '<circle id="tring" cx="20" cy="20" r="17" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-dasharray="106.8 106.8"/></svg>' +
        '<span class="timer-num" id="tnum">60</span></div><span class="timer-cap">TIME</span></div>' : '') +
      '<button class="btn-fs" id="fsbtn" aria-label="Fullscreen">🖥️</button></div></header>';
  }
  function wireFullscreen() {
    var b = document.getElementById("fsbtn");
    if (b) onTouch(b, function (e) {
      if (e.preventDefault) e.preventDefault();
      triggerFullscreen();
    });
  }
  function startTimer(duration, onDone) {
    var remain = duration;
    var num = document.getElementById("tnum"), ring = document.getElementById("tring");
    function paint() {
      if (!num || !ring) return;
      num.textContent = remain;
      var pct = duration > 0 ? (remain / duration) * 100 : 0;
      var color = remain <= 10 ? "#dc2626" : remain <= duration * 0.4 ? "#d97706" : "#0284c7";
      num.style.color = color;
      ring.setAttribute("stroke", color);
      ring.setAttribute("stroke-dasharray", ((pct / 100) * 106.8).toFixed(1) + " 106.8");
    }
    paint();
    timerState = { remain: remain };
    var id = every(function () {
      remain -= 1; if (remain < 0) remain = 0; timerState.remain = remain; paint();
      if (remain <= 0) { clearInterval(id); var cb = onDone; onDone = null; if (cb) cb(); }
    }, 1000);
  }

  /* ─── Shared: victory modal ─── */
  function modalHTML(winner, p1, p2, l1, l2) {
    var wc = winner === "p1" ? "#1e3a8a" : winner === "p2" ? "#7f1d1d" : "#6b7280";
    var title = winner === "draw" ? "Seri!" : "Menang!";
    var sub = winner === "draw" ? "" : "<p class='winsub'>" + esc(winner === "p1" ? l1 : l2) + " memenangkan pertandingan</p>";
    var conf = "";
    if (winner !== "draw") {
      var colors = ["#3b82f6", "#ef4444", "#a78bff", "#4adeab", "#ffaa5e", "#0ea5e9"];
      for (var i = 0; i < 40; i++) {
        conf += "<span class='confetti' style='left:" + (Math.random() * 100).toFixed(1) + "%;width:" + (6 + Math.random() * 8).toFixed(0) +
          "px;height:" + (6 + Math.random() * 8).toFixed(0) + "px;background:" + colors[i % colors.length] +
          ";animation-duration:" + (1.5 + Math.random() * 1.5).toFixed(2) + "s;animation-delay:" + (Math.random() * 0.6).toFixed(2) + "s'></span>";
      }
    }
    return "<div class='modal-wrap'>" + conf +
      "<div class='modal' style='border:2px solid " + wc + "25'>" +
      "<div class='trophy'>" + (winner === "draw" ? "🤝" : "🏆") + "</div>" +
      "<div><h2 style='color:" + wc + "'>" + title + "</h2>" + sub + "</div>" +
      "<div class='score-card'><div><div class='n' style='color:#1e3a8a'>" + p1 + "</div><div class='who'>" + esc(l1) + "</div></div>" +
      "<span class='sep'>:</span>" +
      "<div><div class='n' style='color:#7f1d1d'>" + p2 + "</div><div class='who'>" + esc(l2) + "</div></div></div>" +
      "<div class='modal-actions'><button class='btn-rematch' id='rematch' style='background:linear-gradient(135deg," + wc + "," + wc + "dd)'>↻ Rematch</button>" +
      "<a class='btn-home' href='#/'>⌂ Menu</a></div></div></div>";
  }

  function countdownThen(rootId, go) {
    var n = 3;
    var ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = "<p class='pre'>Bersiap...</p><div class='big'>" + n + "</div>";
    document.getElementById(rootId).appendChild(ov);
    var big = ov.querySelector(".big");
    every(function () {
      n -= 1;
      if (n <= 0) { cleanup_keepOverlay(); ov.querySelector(".pre").textContent = ""; big.textContent = "GO!"; later(function () { ov.remove(); go(); }, 500); }
      else big.textContent = n;
    }, 1000);
    // stop only the countdown interval, keep other timers registry intact otherwise
    function cleanup_keepOverlay() { /* countdown interval cleared via route cleanup on rematch */ }
  }

  /* ═══ DASHBOARD ═══ */
  /* ── SVG Monoline Icons for Games (Anti-Slop, No Emoji) ── */
  var SVG_ICONS = {
    math: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="18" r="1.5"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    quiz: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/><line x1="10" y1="22" x2="14" y2="22"/></svg>',
    pipette: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 2 4 4"/><path d="M18 6 9 15l-3-1 2-2-5-5 5-5 2 2 1-3 9 9Z"/><path d="m2 22 5-5"/></svg>',
    pinisi: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 18 3 14h18l-1 4Z"/><path d="M12 2v12"/><path d="M12 4l7 5h-7"/></svg>',
    animal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>',
    waste: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 5.5 9.5 8.293 5.404"/><path d="m15.5 9.5 3.5-6.5-7.5 1"/></svg>',
    vocab: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    space: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
    jungle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    shapes: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/></svg>'
  };

  var GAMES = [
    { slug: "math-tug-of-war", title: "Math Tug-of-War", sub: "Tarik Tambang Matematika", iconKey: "math", cat: "A", desc: "Adu cepat berhitung cepat untuk menarik tali ke area tim Anda!", dur: "60s", impl: true },
    { slug: "quiz-tug-of-war", title: "Quiz Tug-of-War", sub: "Tarik Tambang Kuis", iconKey: "quiz", cat: "A", desc: "Duel wawasan umum & sains — regu dengan tarikan terkuat yang menang.", dur: "60s", impl: true },
    { slug: "math-pipette-duel", title: "Pipette Duel", sub: "Duel Pipet Matematika", iconKey: "pipette", cat: "A", desc: "Isi tabung reaksi lebih cepat dengan menyelesaikan soal matematika.", dur: "60s", impl: false },
    { slug: "word-pinisi-duel", title: "Word Pinisi Duel", sub: "Duel Pinisi Kata", iconKey: "pinisi", cat: "A", desc: "Susun kata dari petunjuk sebelum kapal Pinisi Anda karam.", dur: "60s", impl: false },
    { slug: "animal-classification", title: "Animal Classification", sub: "Klasifikasi Hewan", iconKey: "animal", cat: "B", desc: "Klasifikasikan hewan ke habitat & kategori biologis yang benar.", dur: "60s", impl: false },
    { slug: "waste-sorting-race", title: "Waste Sorting Race", sub: "Balapan Pilah Sampah", iconKey: "waste", cat: "B", desc: "Pilah kategori sampah Organik, Anorganik & B3 sebelum konveyor penuh!", dur: "60s", impl: true },
    { slug: "english-match", title: "English Match", sub: "Cocokkan Kosakata", iconKey: "vocab", cat: "B", desc: "Tarik garis penghubung kosakata bahasa Inggris dengan artinya.", dur: "60s", impl: false },
    { slug: "space-exploration", title: "Space Exploration", sub: "Jelajah Antariksa", iconKey: "space", cat: "C", desc: "Simulasi tata surya interaktif — petakan satelit ke orbit planet.", dur: "∞", impl: false },
    { slug: "king-of-jungle", title: "King of the Jungle", sub: "Sang Juara Rimba", iconKey: "jungle", cat: "C", desc: "Digital board game petualangan satwa & cagar alam nusantara.", dur: "Open", impl: false },
    { slug: "geometric-shapes", title: "Geometric Shapes", sub: "Bangun Ruang Interaktif", iconKey: "shapes", cat: "C", desc: "Eksplorasi 3D bangun ruang dan buka jaring-jaring poligon.", dur: "∞", impl: false }
  ];
  var CATS = [
    { id: "A", label: "Kompetitif", icon: "⚔️", color: "#d97706", bg: "#fffbeb" },
    { id: "B", label: "Sorting & Matching", icon: "↔️", color: "#059669", bg: "#ecfdf5" },
    { id: "C", label: "Eksplorasi", icon: "🔭", color: "#7c3aed", bg: "#f5f3ff" }
  ];
  function renderDashboard() {
    var heroGame = GAMES[0]; // Math Tug of War as Spotlight
    var compGames = GAMES.filter(function (g) { return g.cat === "A"; });
    var otherGames = GAMES.filter(function (g) { return g.cat !== "A"; });

    function renderCard(g, isHero) {
      var iconSvg = SVG_ICONS[g.iconKey] || SVG_ICONS.math;
      var catColor = g.cat === "A" ? "#0284c7" : g.cat === "B" ? "#059669" : "#7c3aed";
      var catBg = g.cat === "A" ? "rgba(14,165,233,0.1)" : g.cat === "B" ? "rgba(5,150,105,0.1)" : "rgba(124,58,237,0.1)";

      var body = "<div class='card-meta-row'>" +
        "<div class='card-icon-well' style='background:" + catBg + ";border-color:" + catColor + "30;color:" + catColor + "'>" + iconSvg + "</div>" +
        (g.impl ? "<span class='badge-playable'>● SIAP MAIN</span>" : "<span class='badge-locked'>Segera Hadir</span>") +
        "</div>" +
        "<div class='card-center-text'>" +
        "<div class='card-title'>" + esc(g.title) + "</div>" +
        "<div class='card-subtitle' style='color:" + catColor + "'>" + esc(g.sub) + "</div>" +
        "<p class='card-desc'>" + esc(g.desc) + "</p>" +
        "</div>" +
        "<div class='card-bottom-pillbox'>" +
        "<div style='display:flex;align-items:center;gap:6px'>" +
        "<span class='pill-player' style='background:" + catColor + "15;color:" + catColor + "'>👥 2P Mode</span>" +
        "<span class='pill-duration'>⏱ " + g.dur + "</span>" +
        "</div>" +
        (g.impl ? "<span class='btn-card-action' style='background:" + catColor + "'>Mulai ▶</span>" : "") +
        "</div>";

      var cls = "bezel-card " + (g.impl ? "is-playable" : "is-locked") + (isHero ? " hero-card-featured" : "");
      var inner = g.impl
        ? "<a class='" + cls + "' href='#/games/" + g.slug + "'>" + body + "</a>"
        : "<div class='" + cls + "'>" + body + "</div>";
      return "<div class='cards-flex-cell'>" + inner + "</div>";
    }

    var html = "<div class='grid-bg'></div>" +

      /* ── 1. HEADER: Floating Glass Island ── */
      "<div class='kiosk-nav-wrapper'>" +
      "<header class='kiosk-nav'>" +
      "<div class='inst-badge-tray'>" +
      "<div class='inst-logo-duo'>" +
      "<img src='dinas.png' alt='Dinas Pendidikan' width='42' height='42' style='height:38px;width:auto;max-height:38px;max-width:50px;display:block;' onerror='this.remove()'>" +
      "<div class='inst-divider'></div>" +
      "<img src='smk2.png' alt='SMKN 2 Surakarta' width='42' height='42' style='height:38px;width:auto;max-height:38px;max-width:50px;display:block;' onerror='this.remove()'>" +
      "</div>" +
      "<div class='inst-text'>" +
      "<span class='inst-title'>SMK Negeri 2 Surakarta</span>" +
      "<span class='inst-subtitle'>Dinas Pendidikan Kota Surakarta</span>" +
      "</div>" +
      "</div>" +

      "<div class='kiosk-center-brand'>" +
      "<h1 class='hub-title'>EduPanel <span>Hub</span></h1>" +
      "<span class='hub-pill-status'><span class='status-dot'></span>Kiosk IFP Siap</span>" +
      "</div>" +

      "<div class='kiosk-quick-actions'>" +
      "<button class='kiosk-btn' id='dash-fs-btn' aria-label='Toggle Fullscreen'>" +
      "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'/></svg>" +
      "<span>Layar Penuh</span>" +
      "</button>" +
      "</div>" +
      "</header>" +
      "</div>" +

      /* ── 2. CONTENT: Bento Double-Bezel Architecture ── */
      "<main class='kiosk-content-area'>" +
      "<div class='bento-master-row'>" +

      /* Left Tray: Arena Duel Kompetitif (Category A) */
      "<div class='bento-col-left'>" +
      "<section class='tray-shell'>" +
      "<div class='tray-header'>" +
      "<div class='tray-title-group'>" +
      "<div class='tray-icon-box' style='background:rgba(2,132,199,0.12);color:#0284c7'>" +
      "<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><path d='M14.5 17.5 3 6V3h3l11.5 11.5'/><path d='m13 19 6-6'/><path d='m16 22 5-5'/><path d='m19 5 2 2'/></svg>" +
      "</div>" +
      "<h2 class='tray-title'>Arena Duel Kompetitif</h2>" +
      "</div>" +
      "<span class='tray-count-pill'>" + compGames.length + " Modul</span>" +
      "</div>" +
      "<div class='cards-flex-wrap'>" +
      compGames.map(function (g) { return renderCard(g, false); }).join("") +
      "</div>" +
      "</section>" +
      "</div>" +

      /* Right Tray: Sorting, Klasifikasi & Eksplorasi */
      "<div class='bento-col-right'>" +
      "<section class='tray-shell'>" +
      "<div class='tray-header'>" +
      "<div class='tray-title-group'>" +
      "<div class='tray-icon-box' style='background:rgba(5,150,105,0.12);color:#059669'>" +
      "<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><rect width='7' height='7' x='3' y='3' rx='1'/><rect width='7' height='7' x='14' y='3' rx='1'/><rect width='7' height='7' x='14' y='14' rx='1'/><rect width='7' height='7' x='3' y='14' rx='1'/></svg>" +
      "</div>" +
      "<h2 class='tray-title'>Klasifikasi & Eksplorasi</h2>" +
      "</div>" +
      "<span class='tray-count-pill'>" + otherGames.length + " Modul</span>" +
      "</div>" +
      "<div class='cards-flex-wrap'>" +
      otherGames.map(function (g) { return renderCard(g, false); }).join("") +
      "</div>" +
      "</section>" +
      "</div>" +

      "</div>" +
      "</main>" +

      /* ── 3. FOOTER: Kiosk Dock & Hardware Info ── */
      "<div class='kiosk-dock-wrapper'>" +
      "<footer class='kiosk-dock'>" +
      "<div class='dock-col'>" +
      "<span class='dock-tag'>IFP Touch Engine</span>" +
      "<span class='dock-label'>Optimal untuk Layar Sentuh Interaktif 16:9 / 4K</span>" +
      "</div>" +
      "<div class='dock-col'>" +
      "<span class='dock-credit'>Lab Interaktif <strong>SMK Negeri 2 Surakarta</strong> · Versi Web Standalone</span>" +
      "</div>" +
      "</footer>" +
      "</div>";

    app.innerHTML = html;

    var fsBtn = document.getElementById("dash-fs-btn");
    if (fsBtn) {
      onTouch(fsBtn, function (e) {
        if (e.preventDefault) e.preventDefault();
        triggerFullscreen();
      });
    }
  }

  /* ═══ MATH TUG ═══ */
  function renderMathTug() {
    var DUR = 60, rope = 0, phase = "countdown";
    var p1Q = D.nextMath(), p2Q = D.nextMath();
    var cdIntervals = [];
    app.innerHTML = "<div class='grid-bg'></div>" + headerHTML("Tarik Tambang Matematika", "Math Tug-of-War", true) +
      "<div class='gmain'>" +
      "<div class='panel-side' id='p1'></div>" +
      "<div class='center-stage'><div class='rope-wrap'><div class='rope-mid'></div>" +
      "<div class='rope-move' id='rope'><div class='pguy' style='left:0'>" + guy("#1e3a8a", false) + "</div>" +
      "<div class='rope-bar'></div><div class='rope-flag'></div>" +
      "<div class='pguy' style='right:0'>" + guy("#7f1d1d", true) + "</div></div></div>" +
      "<p class='center-hint'>Jawab soal untuk menarik tali!</p></div>" +
      "<div class='panel-side' id='p2'></div></div><div id='ov'></div><div id='md'></div>";
    wireFullscreen();

    function numpadHTML(player, q) {
      var h = player === 1 ? "p1" : "p2";
      var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) {
        return "<div class='nbtn-cell'><button class='nbtn' data-n='" + n + "'>" + n + "</button></div>";
      }).join("");
      return "<div class='play-panel' id='panel" + player + "'><div class='play-head " + h + "'>" + esc(q.problem) + "</div>" +
        "<div class='play-display'><div class='play-input' id='in" + player + "'></div></div>" +
        "<div class='numpad-flex'>" + nums +
        "<div class='nbtn-cell'><button class='nbtn clear' data-c='1'>C</button></div>" +
        "<div class='nbtn-cell'><button class='nbtn' data-n='0'>0</button></div>" +
        "<div class='nbtn-cell'><button class='nbtn go' data-g='1'>Go</button></div>" +
        "</div></div>";
    }
    function paint() {
      document.getElementById("p1").innerHTML = numpadHTML(1, p1Q);
      document.getElementById("p2").innerHTML = numpadHTML(2, p2Q);
      bindPad(1); bindPad(2);
      paintRope();
    }
    function paintRope() {
      var r = document.getElementById("rope");
      if (r) r.style.transform = "translateX(" + (-(rope / 50) * 150) + "px)";
    }
    var input = { 1: "", 2: "" };
    function bindPad(p) {
      var root = document.getElementById(p === 1 ? "p1" : "p2");
      var numBtns = root.querySelectorAll("[data-n]");
      for (var i = 0; i < numBtns.length; i++) {
        (function (b) {
          onTouch(b, function (e) {
            if (e.preventDefault) e.preventDefault();
            if (input[p].length < 4) {
              input[p] += b.getAttribute("data-n");
              var inpEl = document.getElementById("in" + p);
              if (inpEl) inpEl.textContent = input[p];
            }
          });
        })(numBtns[i]);
      }
      var clearBtn = root.querySelector("[data-c]");
      if (clearBtn) {
        onTouch(clearBtn, function (e) {
          if (e.preventDefault) e.preventDefault();
          input[p] = "";
          var inpEl = document.getElementById("in" + p);
          if (inpEl) inpEl.textContent = "";
        });
      }
      var goBtn = root.querySelector("[data-g]");
      if (goBtn) {
        onTouch(goBtn, function (e) {
          if (e.preventDefault) e.preventDefault();
          if (!input[p] || phase !== "playing") return;
          answer(p, parseInt(input[p], 10));
          input[p] = "";
          var inpEl = document.getElementById("in" + p);
          if (inpEl) inpEl.textContent = "";
        });
      }
    }
    function flash(p, ok) {
      var el = document.getElementById("panel" + p);
      el.classList.remove("pop", "shake");
      void el.offsetWidth;
      el.classList.add(ok ? "flash-good" : "flash-bad", ok ? "pop" : "shake");
      setTimeout(function () { el.classList.remove("flash-good", "flash-bad"); }, 600);
    }
    function answer(p, val) {
      var q = p === 1 ? p1Q : p2Q;
      var ok = val === q.answer;
      var delta = ok ? 10 : -10;
      rope = Math.max(-50, Math.min(50, rope + (p === 1 ? delta : -delta)));
      flash(p, ok); paintRope();
      later(function () { if (p === 1) p1Q = D.nextMath(); else p2Q = D.nextMath(); paint(); checkWin(); }, 600);
      checkWin();
    }
    function checkWin() {
      if (phase !== "playing") return;
      if (rope >= 50) finish("p1"); else if (rope <= -50) finish("p2");
    }
    function finish(w) {
      if (phase === "finished") return; phase = "finished";
      if (!w) w = rope > 0 ? "p1" : rope < 0 ? "p2" : "draw";
      document.getElementById("md").innerHTML = modalHTML(w, rope > 0 ? 100 : 0, rope < 0 ? 100 : 0, "Tim Biru", "Tim Merah");
      document.getElementById("rematch").addEventListener("click", function () { route(true); });
    }
    paint();
    // countdown
    var n = 3, ov = document.getElementById("ov");
    ov.innerHTML = "<div class='overlay'><p class='pre'>Bersiap...</p><div class='big'>3</div></div>";
    var big = ov.querySelector(".big");
    var cd = setInterval(function () {
      n -= 1;
      if (n <= 0) { clearInterval(cd); big.textContent = "GO!"; setTimeout(function () { ov.innerHTML = ""; phase = "playing"; D.resetMathPool(); p1Q = D.nextMath(); p2Q = D.nextMath(); paint(); startTimer(DUR, function () { finish(); }); }, 500); }
      else big.textContent = n;
    }, 1000);
    timers.push({ t: "i", id: cd });
  }

  /* ═══ QUIZ TUG ═══ */
  function renderQuizTug() {
    var DUR = 60, rope = 0, phase = "countdown", p1 = 0, p2 = 0, lock = false;
    var cur = D.nextTrivia(), fb1 = null, fb2 = null;
    app.innerHTML = "<div class='grid-bg'></div>" + headerHTML("Tarik Tambang Kuis", "Quiz Tug-of-War", true) +
      "<div class='q-bar'><div class='qtext-card'><h2 id='qq'></h2></div></div>" +
      "<div class='gmain' style='padding-top:0'><div class='panel-side' id='p1'></div>" +
      "<div class='center-stage'><div class='rope-wrap'><div class='rope-mid'></div>" +
      "<div class='rope-move' id='rope'><div class='pguy' style='left:0'>" + guy("#1e3a8a", false) + "</div>" +
      "<div class='rope-bar'></div><div class='rope-flag'></div>" +
      "<div class='pguy' style='right:0'>" + guy("#7f1d1d", true) + "</div></div></div>" +
      "<p class='center-hint'>Pilih jawaban untuk menarik tali!</p></div>" +
      "<div class='panel-side' id='p2'></div></div><div id='ov'></div><div id='md'></div>";
    wireFullscreen();
    function panelHTML(p, fb) {
      var h = p === 1 ? "p1" : "p2";
      var btns = cur.options.map(function (o) {
        var cls = "obtn", dis = phase !== "playing" || fb ? "disabled" : "";
        if (fb && fb.sel === o) cls += fb.ok ? " good" : " bad";
        else if (fb) cls += " dim";
        return "<button class='" + cls + "' data-o=\"" + esc(o) + "\" " + dis + ">" + esc(o) + "</button>";
      }).join("");
      return "<div class='play-panel' id='panel" + p + "'><div class='play-head " + h + "'>Tim " + (p === 1 ? "Biru" : "Merah") + "</div><div class='opts'>" + btns + "</div></div>";
    }
    function paint() {
      document.getElementById("qq").textContent = cur.question;
      document.getElementById("p1").innerHTML = panelHTML(1, fb1);
      document.getElementById("p2").innerHTML = panelHTML(2, fb2);
      bind(1); bind(2);
      var r = document.getElementById("rope");
      if (r) r.style.transform = "translateX(" + (-(rope / 50) * 150) + "px)";
    }
    function bind(p) {
      var btns = document.getElementById(p === 1 ? "p1" : "p2").querySelectorAll("[data-o]");
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          onTouch(b, function (e) {
            if (e.preventDefault) e.preventDefault();
            pick(p, b.getAttribute("data-o"));
          });
        })(btns[i]);
      }
    }
    function pick(p, val) {
      if (phase !== "playing" || lock) return;
      if ((p === 1 && fb1) || (p === 2 && fb2)) return;
      var ok = val === cur.answer;
      if (p === 1) { fb1 = { sel: val, ok: ok }; if (ok) p1 += 10; } else { fb2 = { sel: val, ok: ok }; if (ok) p2 += 10; }
      rope = Math.max(-50, Math.min(50, rope + (p === 1 ? (ok ? 10 : -10) : (ok ? -10 : 10))));
      paint();
      if (!lock) { lock = true; later(function () { cur = D.nextTrivia(); fb1 = null; fb2 = null; lock = false; paint(); checkWin(); }, 800); }
      checkWin();
    }
    function checkWin() { if (phase === "playing") { if (rope >= 50) finish("p1"); else if (rope <= -50) finish("p2"); } }
    function finish(w) {
      if (phase === "finished") return; phase = "finished";
      if (!w) w = rope > 0 ? "p1" : rope < 0 ? "p2" : "draw";
      document.getElementById("md").innerHTML = modalHTML(w, p1, p2, "Tim Biru", "Tim Merah");
      document.getElementById("rematch").addEventListener("click", function () { route(true); });
    }
    paint();
    var n = 3, ov = document.getElementById("ov");
    ov.innerHTML = "<div class='overlay'><p class='pre'>Bersiap...</p><div class='big'>3</div></div>";
    var big = ov.querySelector(".big");
    var cd = setInterval(function () {
      n -= 1;
      if (n <= 0) { clearInterval(cd); big.textContent = "GO!"; setTimeout(function () { ov.innerHTML = ""; phase = "playing"; D.resetTriviaPool(); cur = D.nextTrivia(); fb1 = fb2 = null; paint(); startTimer(DUR, function () { finish(); }); }, 500); }
      else big.textContent = n;
    }, 1000);
    timers.push({ t: "i", id: cd });
  }

  /* ═══ WASTE ═══ */
  function renderWaste() {
    var DUR = 60, phase = "countdown", lock = false, winner = null;
    var cur = D.nextWaste(), o1 = D.wasteOptions(cur.cat), o2 = D.wasteOptions(cur.cat);
    var s1 = 0, s2 = 0, r1 = null, r2 = null;
    app.innerHTML = "<div class='grid-bg'></div>" + headerHTML("Balapan Pilah Sampah", "Waste Sorting Race", true) +
      "<div class='clue-bar'><div class='clue-card'><span class='clue-emoji' id='wemoji'></span><h2 class='clue-name' id='wname'></h2></div></div>" +
      "<div class='team-cols'><div class='team' style='border-color:#7f1d1d' id='t2'></div><div class='team' style='border-color:#1e3a8a' id='t1'></div></div>" +
      "<div id='ov'></div><div id='md'></div>";
    wireFullscreen();
    function teamHTML(p) {
      var is1 = p === 1, opts = is1 ? o1 : o2, sc = is1 ? s1 : s2, res = is1 ? r1 : r2;
      var head = is1 ? "#1e1b4b" : "#7f1d1d", title = is1 ? "TIM BIRU" : "TIM MERAH";
      var btns = opts.map(function (c) {
        var cfg = D.WASTE_CONFIG[c];
        return "<button class='wbtn' data-c='" + c + "' " + (phase !== "playing" || lock ? "disabled" : "") + " style='border-color:" + cfg.color + "'>" +
          "<span class='e'>" + cfg.emoji + "</span><span class='l' style='color:" + cfg.color + "'>" + cfg.label + "</span></button>";
      }).join("");
      return "<div class='team-head' style='background:" + head + "'><h2>" + title + "</h2><div class='team-score'>" + sc + " pts</div></div>" +
        "<div class='team-body'>" + (res ? "<div class='float-pts' style='color:" + (res === "correct" ? "#10b981" : "#ef4444") + "'>" + (res === "correct" ? "+10" : "-5") + "</div>" : "") + btns + "</div>";
    }
    function paint() {
      document.getElementById("wemoji").textContent = cur.emoji;
      document.getElementById("wname").textContent = cur.name;
      document.getElementById("t1").innerHTML = teamHTML(1);
      document.getElementById("t2").innerHTML = teamHTML(2);
      bind(1); bind(2);
    }
    function bind(p) {
      var btns = document.getElementById(p === 1 ? "t1" : "t2").querySelectorAll("[data-c]");
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          onTouch(b, function (e) {
            if (e.preventDefault) e.preventDefault();
            guess(p, b.getAttribute("data-c"));
          });
        })(btns[i]);
      }
    }
    function guess(p, cat) {
      if (phase !== "playing" || lock) return;
      lock = true;
      var ok = cur.cat === cat;
      if (p === 1) { s1 = Math.max(0, s1 + (ok ? 10 : -5)); r1 = ok ? "correct" : "wrong"; }
      else { s2 = Math.max(0, s2 + (ok ? 10 : -5)); r2 = ok ? "correct" : "wrong"; }
      paint();
      later(function () { cur = D.nextWaste(); o1 = D.wasteOptions(cur.cat); o2 = D.wasteOptions(cur.cat); r1 = r2 = null; lock = false; paint(); }, 800);
    }
    function finish() {
      if (phase === "finished") return; phase = "finished";
      winner = s1 > s2 ? "p1" : s2 > s1 ? "p2" : "draw";
      document.getElementById("md").innerHTML = modalHTML(winner, s1, s2, "Tim Biru", "Tim Merah");
      document.getElementById("rematch").addEventListener("click", function () { route(true); });
    }
    paint();
    var n = 3, ov = document.getElementById("ov");
    ov.innerHTML = "<div class='overlay'><p class='pre'>Bersiap...</p><div class='big'>3</div></div>";
    var big = ov.querySelector(".big");
    var cd = setInterval(function () {
      n -= 1;
      if (n <= 0) { clearInterval(cd); big.textContent = "GO!"; setTimeout(function () { ov.innerHTML = ""; phase = "playing"; paint(); startTimer(DUR, finish); }, 500); }
      else big.textContent = n;
    }, 1000);
    timers.push({ t: "i", id: cd });
  }

  /* ─── Router ─── */
  function route(force) {
    cleanup();
    var h = location.hash || "#/";
    if (h === "#/" || h === "#") renderDashboard();
    else if (h === "#/games/math-tug-of-war") renderMathTug();
    else if (h === "#/games/quiz-tug-of-war") renderQuizTug();
    else if (h === "#/games/waste-sorting-race") renderWaste();
    else renderDashboard();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", function () { route(); });
  route();
})();
