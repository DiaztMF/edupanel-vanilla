/* EduPanel Vanilla — question banks ported 1:1 from src/data/* (Next.js source).
   No build step. Exposed as window.EduData. */
(function () {
  "use strict";

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ─── MATH (src/data/math-questions.ts) ─── */
  var MATH_BANK = [
    { problem: "3 + 4 = ?", answer: 7 }, { problem: "8 - 3 = ?", answer: 5 },
    { problem: "5 × 2 = ?", answer: 10 }, { problem: "12 ÷ 4 = ?", answer: 3 },
    { problem: "6 + 9 = ?", answer: 15 }, { problem: "14 - 7 = ?", answer: 7 },
    { problem: "4 × 3 = ?", answer: 12 }, { problem: "20 ÷ 5 = ?", answer: 4 },
    { problem: "11 + 8 = ?", answer: 19 }, { problem: "16 - 9 = ?", answer: 7 },
    { problem: "7 × 2 = ?", answer: 14 }, { problem: "18 ÷ 6 = ?", answer: 3 },
    { problem: "5 + 13 = ?", answer: 18 }, { problem: "20 - 8 = ?", answer: 12 },
    { problem: "3 × 6 = ?", answer: 18 },
    { problem: "13 + 19 = ?", answer: 32 }, { problem: "45 - 17 = ?", answer: 28 },
    { problem: "8 × 7 = ?", answer: 56 }, { problem: "48 ÷ 8 = ?", answer: 6 },
    { problem: "27 + 36 = ?", answer: 63 }, { problem: "74 - 38 = ?", answer: 36 },
    { problem: "9 × 6 = ?", answer: 54 }, { problem: "63 ÷ 7 = ?", answer: 9 },
    { problem: "52 + 29 = ?", answer: 81 }, { problem: "85 - 47 = ?", answer: 38 },
    { problem: "7 × 8 = ?", answer: 56 }, { problem: "72 ÷ 9 = ?", answer: 8 },
    { problem: "34 + 58 = ?", answer: 92 }, { problem: "91 - 46 = ?", answer: 45 },
    { problem: "6 × 9 = ?", answer: 54 },
    { problem: "17 × 3 = ?", answer: 51 }, { problem: "144 ÷ 12 = ?", answer: 12 },
    { problem: "89 + 76 = ?", answer: 165 }, { problem: "203 - 87 = ?", answer: 116 },
    { problem: "13 × 8 = ?", answer: 104 }, { problem: "169 ÷ 13 = ?", answer: 13 },
    { problem: "248 + 137 = ?", answer: 385 }, { problem: "305 - 148 = ?", answer: 157 },
    { problem: "14 × 12 = ?", answer: 168 }, { problem: "196 ÷ 14 = ?", answer: 14 }
  ];

  var mathPool = [], mathIdx = 0;
  function resetMathPool() { mathPool = shuffle(MATH_BANK); mathIdx = 0; }
  function nextMath() {
    if (mathIdx >= mathPool.length) resetMathPool();
    return mathPool[mathIdx++];
  }
  resetMathPool();

  /* ─── TRIVIA (src/data/quiz-trivia.ts — 43 soal, copy 1:1) ─── */
  var TRIVIA = [
    { q: "Planet terbesar di tata surya kita adalah?", a: "Jupiter", w: ["Saturnus", "Neptunus", "Uranus"] },
    { q: "Simbol kimia untuk emas adalah?", a: "Au", w: ["Ag", "Fe", "Go"] },
    { q: "Berapa jumlah kaki pada serangga?", a: "6", w: ["4", "8", "10"] },
    { q: "Gas apa yang paling banyak di atmosfer bumi?", a: "Nitrogen", w: ["Oksigen", "Karbon Dioksida", "Argon"] },
    { q: "Organ manusia yang memompa darah adalah?", a: "Jantung", w: ["Paru-paru", "Hati", "Ginjal"] },
    { q: "Berapa kecepatan cahaya per detik (dibulatkan)?", a: "300.000 km/s", w: ["150.000 km/s", "500.000 km/s", "1.000.000 km/s"] },
    { q: "DNA adalah singkatan dari?", a: "Deoxyribonucleic Acid", w: ["Dinitrogen Acid", "Dimethyl Nucleic Acid", "Digital Nucleic Atom"] },
    { q: "Apa nama proses tumbuhan membuat makanan sendiri?", a: "Fotosintesis", w: ["Respirasi", "Osmosis", "Fermentasi"] },
    { q: "Berapa suhu titik didih air pada tekanan normal?", a: "100°C", w: ["90°C", "80°C", "120°C"] },
    { q: "Hewan apa yang memiliki sidik jari seperti manusia?", a: "Koala", w: ["Simpanse", "Gorila", "Orang Utan"] },
    { q: "Berapa jumlah tulang pada tubuh manusia dewasa?", a: "206", w: ["180", "250", "300"] },
    { q: "Planet manakah yang dikenal sebagai Planet Merah?", a: "Mars", w: ["Venus", "Merkurius", "Jupiter"] },
    { q: "Apa satuan dasar untuk mengukur listrik?", a: "Ampere", w: ["Volt", "Watt", "Ohm"] },
    { q: "Vertebrata adalah hewan yang memiliki?", a: "Tulang belakang", w: ["Sayap", "Insang", "Bulu"] },
    { q: "Apa nama lapisan ozon yang melindungi bumi?", a: "Stratosfer", w: ["Troposfer", "Mesosfer", "Termosfer"] },
    { q: "Ibukota Indonesia adalah?", a: "Jakarta", w: ["Surabaya", "Bandung", "Medan"] },
    { q: "Gunung tertinggi di Indonesia adalah?", a: "Puncak Jaya", w: ["Gunung Rinjani", "Gunung Semeru", "Gunung Kerinci"] },
    { q: "Sungai terpanjang di dunia adalah?", a: "Nil", w: ["Amazon", "Yangtze", "Mississippi"] },
    { q: "Negara dengan luas wilayah terbesar di dunia adalah?", a: "Rusia", w: ["Kanada", "Amerika Serikat", "China"] },
    { q: "Benua terkecil di dunia adalah?", a: "Australia", w: ["Eropa", "Antartika", "Amerika Selatan"] },
    { q: "Danau terdalam di dunia adalah?", a: "Danau Baikal", w: ["Danau Superior", "Danau Titicaca", "Danau Toba"] },
    { q: "Selat Malaka menghubungkan Samudra apa?", a: "Hindia dan Pasifik", w: ["Atlantik dan Hindia", "Arktik dan Pasifik", "Atlantik dan Pasifik"] },
    { q: "Ibukota Jepang adalah?", a: "Tokyo", w: ["Osaka", "Kyoto", "Hiroshima"] },
    { q: "Kota di Indonesia yang dikenal sebagai Kota Pahlawan adalah?", a: "Surabaya", w: ["Jakarta", "Bandung", "Semarang"] },
    { q: "Pulau terluas di Indonesia adalah?", a: "Kalimantan", w: ["Sumatra", "Jawa", "Papua"] },
    { q: "Negara mana yang berbatasan langsung dengan Indonesia di darat?", a: "Malaysia", w: ["Filipina", "Australia", "Singapura"] },
    { q: "Gunung Bromo terletak di provinsi?", a: "Jawa Timur", w: ["Jawa Tengah", "Jawa Barat", "Nusa Tenggara"] },
    { q: "Indonesia memproklamasikan kemerdekaan pada tanggal?", a: "17 Agustus 1945", w: ["17 Agustus 1950", "10 November 1945", "1 Juni 1945"] },
    { q: "Siapa yang membacakan teks Proklamasi Kemerdekaan RI?", a: "Soekarno", w: ["Mohammad Hatta", "Soepomo", "Sutan Sjahrir"] },
    { q: "Perang Dunia II berakhir pada tahun?", a: "1945", w: ["1939", "1942", "1950"] },
    { q: "Candi Borobudur dibangun oleh kerajaan?", a: "Syailendra", w: ["Majapahit", "Sriwijaya", "Mataram Kuno"] },
    { q: "Pahlawan yang dijuluki 'Bung Tomo' terkenal dalam peristiwa?", a: "10 November 1945", w: ["Proklamasi 1945", "Pertempuran Ambarawa", "Bandung Lautan Api"] },
    { q: "Kerajaan Majapahit mencapai puncak kejayaan di bawah pimpinan?", a: "Hayam Wuruk", w: ["Ken Arok", "Gajah Mada", "Raden Wijaya"] },
    { q: "Organisasi pergerakan nasional pertama di Indonesia adalah?", a: "Budi Utomo", w: ["Sarekat Islam", "Indische Partij", "PNI"] },
    { q: "Konferensi Asia Afrika berlangsung di kota?", a: "Bandung", w: ["Jakarta", "Surabaya", "Yogyakarta"] },
    { q: "Tari Saman berasal dari daerah?", a: "Aceh", w: ["Bali", "Jawa", "Sulawesi"] },
    { q: "Batik diakui sebagai warisan budaya dunia oleh?", a: "UNESCO", w: ["PBB", "WHO", "ASEAN"] },
    { q: "Wayang Kulit berasal dari kebudayaan?", a: "Jawa", w: ["Bali", "Sunda", "Melayu"] },
    { q: "Lagu 'Indonesia Raya' diciptakan oleh?", a: "W.R. Supratman", w: ["Ismail Marzuki", "Gesang", "Cornel Simanjuntak"] },
    { q: "Ulos adalah kain tradisional dari suku?", a: "Batak", w: ["Dayak", "Minangkabau", "Bugis"] },
    { q: "Angklung adalah alat musik tradisional dari daerah?", a: "Sunda (Jawa Barat)", w: ["Bali", "Jawa Tengah", "Sulawesi Selatan"] },
    { q: "Keris ditetapkan sebagai warisan budaya dunia oleh UNESCO pada tahun?", a: "2005", w: ["2003", "2009", "2010"] },
    { q: "Tari Pendet berasal dari?", a: "Bali", w: ["NTB", "Jawa Timur", "Kalimantan"] },
    { q: "Upacara adat Ngaben adalah tradisi suku?", a: "Bali", w: ["Toraja", "Dayak", "Minangkabau"] },
    { q: "Motif Parang pada batik melambangkan?", a: "Ombak laut / keberanian", w: ["Bunga mekar", "Pohon kehidupan", "Burung garuda"] }
  ];
  var triviaPool = [], triviaIdx = 0;
  function resetTriviaPool() { triviaPool = shuffle(TRIVIA); triviaIdx = 0; }
  function nextTrivia() {
    if (triviaIdx >= triviaPool.length) resetTriviaPool();
    var t = triviaPool[triviaIdx++];
    return { question: t.q, answer: t.a, options: shuffle([t.a, t.w[0], t.w[1], t.w[2]]) };
  }
  resetTriviaPool();

  /* ─── WASTE (src/data/waste-items.ts — 22 item) ─── */
  var WASTE_ITEMS = [
    { name: "Kulit Pisang", emoji: "🍌", cat: "organik" }, { name: "Daun Kering", emoji: "🍂", cat: "organik" },
    { name: "Sisa Nasi", emoji: "🍚", cat: "organik" }, { name: "Tulang Ayam", emoji: "🍗", cat: "organik" },
    { name: "Ampas Kopi", emoji: "☕", cat: "organik" }, { name: "Kulit Telur", emoji: "🥚", cat: "organik" },
    { name: "Sayuran Busuk", emoji: "🥦", cat: "organik" }, { name: "Buah Busuk", emoji: "🍎", cat: "organik" },
    { name: "Botol Plastik", emoji: "🍾", cat: "anorganik" }, { name: "Kaleng Minuman", emoji: "🥫", cat: "anorganik" },
    { name: "Koran Bekas", emoji: "📰", cat: "anorganik" }, { name: "Botol Kaca", emoji: "🫙", cat: "anorganik" },
    { name: "Kardus", emoji: "📦", cat: "anorganik" }, { name: "Tas Kresek", emoji: "🛍️", cat: "anorganik" },
    { name: "Sendok Plastik", emoji: "🥄", cat: "anorganik" }, { name: "Gelas Styrofoam", emoji: "🥤", cat: "anorganik" },
    { name: "Baterai Bekas", emoji: "🔋", cat: "b3" }, { name: "Lampu Neon", emoji: "💡", cat: "b3" },
    { name: "Cat Bekas", emoji: "🎨", cat: "b3" }, { name: "Obat Kedaluwarsa", emoji: "💊", cat: "b3" },
    { name: "Oli Bekas", emoji: "🛢️", cat: "b3" }, { name: "Sprayer Aerosol", emoji: "💈", cat: "b3" }
  ];
  var WASTE_CONFIG = {
    organik: { label: "Organik", emoji: "🌱", color: "#059669" },
    anorganik: { label: "Anorganik", emoji: "♻️", color: "#2563eb" },
    b3: { label: "B3 (Berbahaya)", emoji: "☢️", color: "#dc2626" }
  };
  function nextWaste() { return WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)]; }
  function wasteOptions(correct) {
    var all = ["organik", "anorganik", "b3"].filter(function (c) { return c !== correct; });
    var wrong = all[Math.floor(Math.random() * all.length)];
    return Math.random() > 0.5 ? [correct, wrong] : [wrong, correct];
  }

  window.EduData = {
    shuffle: shuffle,
    nextMath: nextMath, resetMathPool: resetMathPool,
    nextTrivia: nextTrivia, resetTriviaPool: resetTriviaPool,
    nextWaste: nextWaste, wasteOptions: wasteOptions, WASTE_CONFIG: WASTE_CONFIG
  };
})();
