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

  var PIXEL = '<svg width="100%" height="100%" viewBox="0 0 80 90" style="display:block;__FLIP__">' +
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
    if (b) b.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(function () {});
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
  var GAMES = [
    { slug: "math-tug-of-war", title: "Math Tug-of-War", sub: "Tarik Tambang Matematika", icon: "➗", cat: "A", desc: "Race to solve math problems and pull the rope to your side!", dur: "60s", impl: true },
    { slug: "quiz-tug-of-war", title: "Quiz Tug-of-War", sub: "Tarik Tambang Kuis", icon: "🧠", cat: "A", desc: "General knowledge trivia battle — who pulls hardest wins!", dur: "60s", impl: true },
    { slug: "math-pipette-duel", title: "Pipette Duel", sub: "Duel Pipet Matematika", icon: "🧪", cat: "A", desc: "Fill your test tube faster by solving math questions.", dur: "60s", impl: false },
    { slug: "word-pinisi-duel", title: "Word Pinisi Duel", sub: "Duel Pinisi Kata", icon: "⛵", cat: "A", desc: "Guess words from clues before your Pinisi ship sinks!", dur: "60s", impl: false },
    { slug: "animal-classification", title: "Animal Classification", sub: "Klasifikasi Hewan", icon: "🐾", cat: "B", desc: "Classify animals into the correct biological categories!", dur: "60s", impl: false },
    { slug: "waste-sorting-race", title: "Waste Sorting Race", sub: "Balapan Pilah Sampah", icon: "♻️", cat: "B", desc: "Sort falling waste items before the conveyor overflows!", dur: "60s", impl: true },
    { slug: "english-match", title: "English Match", sub: "Cocokkan Kosakata", icon: "🌐", cat: "B", desc: "Draw lines to match English words with their translations.", dur: "60s", impl: false },
    { slug: "space-exploration", title: "Space Exploration", sub: "Jelajah Antariksa", icon: "🚀", cat: "C", desc: "Map the solar system — drag moons onto their planets.", dur: "∞", impl: false },
    { slug: "king-of-jungle", title: "King of the Jungle", sub: "Sang Juara Rimba", icon: "🌿", cat: "C", desc: "Digital board game through Indonesian wilderness terrain.", dur: "Open", impl: false },
    { slug: "geometric-shapes", title: "Geometric Shapes", sub: "Bangun Ruang Interaktif", icon: "🔷", cat: "C", desc: "Rotate 3D shapes and unfold them into flat nets.", dur: "∞", impl: false }
  ];
  var CATS = [
    { id: "A", label: "Kompetitif", icon: "⚔️", color: "#d97706", bg: "#fffbeb" },
    { id: "B", label: "Sorting & Matching", icon: "↔️", color: "#059669", bg: "#ecfdf5" },
    { id: "C", label: "Eksplorasi", icon: "🔭", color: "#7c3aed", bg: "#f5f3ff" }
  ];
  function renderDashboard() {
    var html = "<div class='grid-bg'></div>" +
      "<header class='dash-header'><div class='brand-left'>" +
      "<div class='brand-item'><img src='DinasPendidikanKotaSurakarta_nobg.webp' alt='Logo Dinas Pendidikan Kota Surakarta' onerror='this.remove()'><span class='t'><span>Dinas Pendidikan</span><span>Kota Surakarta</span></span></div>" +
      "<div class='brand-divider'></div>" +
      "<div class='brand-item'><img src='smpn14_nobg.webp' alt='Logo SMP Negeri 14 Surakarta' onerror='this.remove()'><span class='t'><span>SMP Negeri 14</span><span>Surakarta</span></span></div>" +
      "</div><div class='brand-right'><h1>EduPanel <span>Hub</span></h1><p>Interactive Learning Games · IFP Edition</p></div></header>" +
      "<main class='dash-main'>";
    CATS.forEach(function (c) {
      var list = GAMES.filter(function (g) { return g.cat === c.id; });
      html += "<section class='cat'><div class='cat-label'><span class='cat-bar' style='background:" + c.color + "'></span>" +
        "<span>" + c.icon + "</span><span class='cat-name' style='color:" + c.color + "'>" + c.label + "</span>" +
        "<span class='cat-count'>· " + list.length + " game</span>" +
        "<span class='cat-line' style='background:" + c.color + "30'></span></div>" +
        "<div class='cat-grid' style='grid-template-columns:repeat(" + list.length + ",1fr)'>";
      list.forEach(function (g) {
        var inner = "<span class='gcard-top' style='background:" + c.color + "'></span><span class='gcard-body'>" +
          "<span class='gcard-row'><span class='gcard-icon' style='background:" + c.bg + ";border:1.5px solid " + c.color + "35'>" + g.icon + "</span>" +
          "<span style='flex:1;min-width:0'><span class='gcard-title'>" + esc(g.title) + "</span><br><span class='gcard-sub' style='color:" + c.color + "'>" + esc(g.sub) + "</span></span></span>" +
          "<span class='gcard-desc'>" + esc(g.desc) + "</span>" +
          "<span class='gcard-foot'><span class='pill' style='background:" + c.color + "15;color:" + c.color + "'>👥 " + 2 + "P</span>" +
          "<span class='dur'>⏱ " + g.dur + "</span></span>" +
          (g.impl ? "" : "<span class='pill' style='margin-top:6px;background:#f3f4f6;color:#9ca3af'>Segera hadir di versi vanilla</span>") + "</span>";
        html += g.impl
          ? "<a class='gcard' style='border-color:" + c.color + "40' href='#/games/" + g.slug + "'>" + inner + "</a>"
          : "<div class='gcard' style='border-color:" + c.color + "40;opacity:.65;cursor:default'>" + inner + "</div>";
      });
      html += "</div></section>";
    });
    html += "</main><p style='position:relative;z-index:10;text-align:center;color:#94a3b8;font-size:11px;padding:2px 0 6px'>Vanilla port · Next.js source di D:\\Project\\Web Project\\Enuma\\EduPanel · 3 dari 10 game playable</p>";
    app.innerHTML = html;
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
      var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return "<button class='nbtn' data-n='" + n + "'>" + n + "</button>"; }).join("");
      return "<div class='play-panel' id='panel" + player + "'><div class='play-head " + h + "'>" + esc(q.problem) + "</div>" +
        "<div class='play-display'><div class='play-input' id='in" + player + "'></div></div>" +
        "<div class='numpad'>" + nums +
        "<button class='nbtn clear' data-c='1'>C</button><button class='nbtn' data-n='0'>0</button>" +
        "<button class='nbtn go' data-g='1'>Go</button></div></div>";
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
      root.querySelectorAll("[data-n]").forEach(function (b) {
        b.addEventListener("pointerdown", function (e) { e.stopPropagation(); if (input[p].length < 4) { input[p] += b.getAttribute("data-n"); document.getElementById("in" + p).textContent = input[p]; } });
      });
      root.querySelector("[data-c]").addEventListener("pointerdown", function (e) { e.stopPropagation(); input[p] = ""; document.getElementById("in" + p).textContent = ""; });
      root.querySelector("[data-g]").addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        if (!input[p] || phase !== "playing") return;
        answer(p, parseInt(input[p], 10)); input[p] = ""; document.getElementById("in" + p).textContent = "";
      });
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
      document.getElementById(p === 1 ? "p1" : "p2").querySelectorAll("[data-o]").forEach(function (b) {
        b.addEventListener("pointerdown", function (e) { e.stopPropagation(); pick(p, b.getAttribute("data-o")); });
      });
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
      document.getElementById(p === 1 ? "t1" : "t2").querySelectorAll("[data-c]").forEach(function (b) {
        b.addEventListener("pointerdown", function (e) { e.stopPropagation(); guess(p, b.getAttribute("data-c")); });
      });
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
