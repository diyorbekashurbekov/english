/* Super U — classroom engine: state, sound, voice, motion effects, landing page, lesson player and the shared scene types */
(function () {
  'use strict';
  const G = (window.G = {});
  const $ = s => document.querySelector(s);
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- DOM helpers ---------- */
  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') { for (const p in v) { if (v[p] == null) continue; if (p.slice(0, 2) === '--') el.style.setProperty(p, v[p]); else el.style[p] = v[p]; } }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(x => add(el, x));
    else el.append(c.nodeType ? c : String(c));
  }
  G.h = h;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  G.esc = esc;
  G.fmt = s => esc(s).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>').replace(/_{3,}/g, '<span class="gap"> </span>');
  G.rich = (s, cls, tag) => h(tag || 'span', { class: cls || null, html: G.fmt(s) });
  G.kk = s => s ? h('div', { class: 'kk', html: G.fmt(s) }) : null;
  G.plain = s => String(s).replace(/\*/g, '');
  G.spoken = s => G.plain(s).replace(/\(.*?\)/g, '').replace(/\/[^/]*\//g, '').replace(/_{3,}/g, ' … ').replace(/[·•→=]/g, ', ').replace(/\s+/g, ' ').trim();
  G.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  G.pick = a => a[Math.random() * a.length | 0];
  G.cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  G.center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  // Kinetic text: every word slides up out of a mask; *highlights* keep their gradient
  G.split = (text, o) => {
    o = o || {};
    const d0 = o.delay || 0, st = o.stagger || .07;
    const out = h(o.tag || 'div', { class: 'split ' + (o.cls || '') });
    let n = 0;
    String(text).split(/(\*[^*]+\*|_{3,})/).forEach(seg => {
      if (!seg) return;
      if (/^_{3,}$/.test(seg)) { out.append(h('span', { class: 'gap' }, ' ')); return; }
      const hl = /^\*[\s\S]*\*$/.test(seg), t = hl ? seg.slice(1, -1) : seg;
      t.split(/(\s+)/).forEach(word => {
        if (!word) return;
        if (/^\s+$/.test(word)) { out.append(' '); return; }
        out.append(h('span', { class: 'w' }, h('span', { class: 'wi', style: { animationDelay: (d0 + n++ * st).toFixed(2) + 's' } }, hl ? h('span', { class: 'hl' }, word) : word)));
      });
    });
    return out;
  };

  /* ---------- State (this browser only) ---------- */
  const KEY = 'superU.class.v3';
  G.PRESETS = [['Lightning', '⚡', '#ff9f0a'], ['Phoenix', '🔥', '#ff375f'], ['Ocean', '🌊', '#0a84ff'], ['Forest', '🌿', '#30d158'], ['Galaxy', '🌌', '#bf5af2'], ['Comet', '☄️', '#64d2ff']];
  G.COLORS = ['#ff9f0a', '#ff375f', '#0a84ff', '#30d158', '#bf5af2', '#64d2ff', '#ffd60a', '#ac8e68'];
  G.EMOJI = ['⚡', '🔥', '🌊', '🌿', '🌌', '☄️', '🦅', '🐺', '🦁', '🐉', '🚀', '💎'];
  G.NAMES = ['Диярбек', 'Азиз', 'Кемеңгер', 'Амірхан', 'Алишер', 'Дархан', 'Жасулан', 'Димаш', 'Баха', 'Балауса', 'Аида', 'Қарақат', 'Жадыра'];
  const fresh = () => ({ students: G.NAMES.map(name => ({ name, team: -1, stars: 0 })), group: '', size: 13, teams: G.PRESETS.slice(0, 4).map(([name, emoji, color]) => ({ name, emoji, color, score: 0 })), kk: true, sound: true, pos: {}, done: {} });
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object' && Array.isArray(s.teams) && s.teams.length) return Object.assign(fresh(), s); } catch (e) {}
    return fresh();
  }
  G.S = load();
  G.save = () => { try { localStorage.setItem(KEY, JSON.stringify(G.S)); } catch (e) {} };
  G.setTeamCount = n => {
    const T = G.S.teams;
    while (T.length < n) { const p = G.PRESETS[T.length] || ['Team ' + (T.length + 1), '⭐', G.COLORS[T.length % G.COLORS.length]]; T.push({ name: p[0], emoji: p[1], color: p[2], score: 0 }); }
    T.length = n;
    G.S.students.forEach(s => { if (s.team >= n) s.team = -1; });
    G.save();
  };
  G.draft = () => {
    const n = G.S.teams.length;
    G.shuffle(G.S.students.map((s, i) => i)).forEach((i, k) => { G.S.students[i].team = k % n; });
    G.save();
  };
  G.members = t => G.S.students.filter(s => s.team === t);

  // Slot-machine name picker: "Who answers?"
  G.lastPick = null;
  let picking = false;
  G.pickStudent = () => {
    const L = G.S.students; if (!L.length || picking) return;
    picking = true;
    const nameEl = h('div', { class: 'pick-name' }), teamEl = h('div', { class: 'pick-team' });
    const ov = h('div', { class: 'pickov', role: 'dialog', 'aria-label': 'Кім жауап береді?' },
      h('div', { class: 'eyebrow', style: { color: 'var(--moon-2)' } }, '🎯 Кім жауап береді?'), nameEl, teamEl,
      h('div', { class: 'pick-hint' }, 'Жабу үшін кез келген жерді немесе Enter басыңыз'));
    document.body.append(ov);
    const fx = G.fx(ov, 'stars');
    const target = Math.random() * L.length | 0;
    let k = Math.random() * L.length | 0, step = 0, done = false;
    const total = 26;
    const close = () => { if (!done) return; document.removeEventListener('keydown', onKey, true); fx.stop(); ov.remove(); picking = false; };
    const onKey = e => { e.preventDefault(); e.stopImmediatePropagation(); if (done && /Enter| |Escape|n|N/.test(e.key)) close(); };
    document.addEventListener('keydown', onKey, true);
    ov.addEventListener('click', close);
    (function spin() {
      if (!ov.isConnected) return;
      step++;
      k = step >= total ? target : (k + 1 + (Math.random() * 3 | 0)) % L.length;
      const s = L[k], T = G.S.teams[s.team];
      nameEl.textContent = s.name;
      nameEl.style.color = T ? T.color : '#fff';
      nameEl.animate([{ transform: 'translateY(40%)', opacity: .2, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: Math.min(260, 40 + step * 9), easing: 'cubic-bezier(.2,.8,.2,1)' });
      G.sfx('blip');
      if (step < total) setTimeout(spin, 45 + Math.pow(step / total, 3) * 520);
      else {
        done = true; G.lastPick = target;
        teamEl.textContent = T ? T.emoji + ' ' + T.name : 'Командасыз';
        nameEl.animate([{ transform: 'scale(.7)' }, { transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,1.4,.4,1)' });
        G.sfx('fanfare');
        setTimeout(() => G.burstAt(nameEl, [T ? T.color : '#ffd60a', '#ffffff', '#ffd60a'], 120), 120);
      }
    })();
  };
  G.setKK = v => { G.S.kk = !!v; document.body.classList.toggle('kk-on', G.S.kk); G.save(); document.querySelectorAll('[data-kk]').forEach(b => b.setAttribute('aria-pressed', String(G.S.kk))); };

  /* ---------- Sound ---------- */
  let ac = null;
  G.actx = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  };
  function tone(f, at, dur, type, vol) {
    const a = ac, t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .1, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  function noise(at, dur, vol, freq, type) {
    const a = ac, len = Math.max(1, a.sampleRate * dur | 0), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + at;
    s.buffer = buf; f.type = type || 'highpass'; f.frequency.value = freq || 1000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + dur + .02);
    return f;
  }
  G.sfx = type => {
    if (!G.S.sound) return;
    const a = G.actx(); if (!a) return;
    try {
      if (type === 'ok') { tone(1318.5, 0, .35, 'sine', .08); tone(1975.5, .07, .5, 'sine', .06); }
      else if (type === 'bad') { tone(311, 0, .22, 'triangle', .09); tone(233, .11, .3, 'triangle', .08); }
      else if (type === 'tap') tone(1800, 0, .03, 'sine', .03);
      else if (type === 'tick') { tone(1000, 0, .08, 'sine', .07); tone(1000, .18, .08, 'sine', .07); }
      else if (type === 'blip') tone(1500, 0, .05, 'sine', .035);
      else if (type === 'swish') { const f = noise(0, .35, .025, 900, 'bandpass'); f.frequency.setValueAtTime(600, a.currentTime); f.frequency.exponentialRampToValueAtTime(2400, a.currentTime + .3); }
      else if (type === 'whoosh') { const f = noise(0, .6, .08, 600, 'bandpass'); f.frequency.setValueAtTime(400, a.currentTime); f.frequency.exponentialRampToValueAtTime(3000, a.currentTime + .5); }
      else if (type === 'warp') { const f = noise(0, 1.3, .1, 200, 'bandpass'); f.frequency.setValueAtTime(150, a.currentTime); f.frequency.exponentialRampToValueAtTime(5000, a.currentTime + 1.2); tone(80, 0, 1.2, 'sawtooth', .03); }
      else if (type === 'point') { tone(880, 0, .12, 'sine', .07); tone(1320, .08, .2, 'sine', .07); }
      else if (type === 'boom') { noise(0, .6, .2, 120, 'lowpass'); tone(60, 0, .5, 'sine', .15); }
      else if (type === 'unlock') [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => tone(f, i * .09, 1.1, 'sine', .055));
      else if (type === 'drum') { for (let i = 0; i < 18; i++) noise(i * .045, .05, .05 + i * .006, 1800); }
      else if (type === 'fanfare') { [523.3, 659.3, 784].forEach((f, i) => tone(f, i * .12, .3, 'triangle', .08)); [1046.5, 1318.5, 1568].forEach(f => tone(f, .42, 1.4, 'triangle', .06)); }
    } catch (e) {}
  };

  /* ---------- Voice (browser text-to-speech) ---------- */
  G.canSpeak = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  let voice = null, warned = false;
  // Natural British voices first, then natural American ones, then good system voices; never a non-English voice
  const PREF = [/Sonia.*Natural/i, /Libby.*Natural/i, /Ryan.*Natural/i, /Maisie.*Natural/i, /Thomas.*Natural/i, /Natural.*United Kingdom/i, /Google UK English Female/i, /Google UK English Male/i, /^Daniel/i, /^Serena/i, /^Kate\b/i, /^Stephanie/i, /^Martha/i, /Aria.*Natural/i, /Jenny.*Natural/i, /Guy.*Natural/i, /Natural.*United States/i, /Google US English/i, /^Samantha/i, /^Karen/i, /^Moira/i, /Hazel/i, /George/i, /Susan/i, /Zira/i, /David/i, /Mark/i];
  const rank = v => { const i = PREF.findIndex(re => re.test(v.name)); return (i < 0 ? 100 : i) + (/espeak|robot/i.test(v.name) ? 500 : 0) + (/GB/i.test(v.lang) ? 0 : .5); };
  G.voices = () => { try { return speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang)).sort((a, b) => rank(a) - rank(b)); } catch (e) { return []; } };
  function pickVoice() {
    const vs = G.voices();
    voice = (G.S.voice && vs.find(v => v.name === G.S.voice)) || vs[0] || null;
  }
  G.setVoice = name => { G.S.voice = name || ''; G.save(); pickVoice(); };
  G.voiceName = () => voice ? voice.name : '';
  if (G.canSpeak) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', () => { pickVoice(); document.dispatchEvent(new Event('superu:voices')); }); } catch (e) {} }
  G.speak = (text, o) => {
    o = o || {};
    if (!G.canSpeak) { if (o.onend) o.onend(); return false; }
    try {
      if (!voice) pickVoice();
      // Never let a Russian or Kazakh voice read English: stay silent and explain instead
      if (!voice && speechSynthesis.getVoices().length) {
        if (!warned) { warned = true; G.noVoice(); }
        if (o.onend) o.onend();
        return false;
      }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(G.spoken(text));
      u.lang = voice ? voice.lang : 'en-GB'; if (voice) u.voice = voice;
      u.rate = (o.rate ? o.rate / .9 : 1) * (G.S.rate || .75);
      if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
      speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  };
  G.hush = () => { try { if (G.canSpeak) speechSynthesis.cancel(); } catch (e) {} };
  G.noVoice = () => {
    const old = document.querySelector('.voicewarn'); if (old) old.remove();
    const box = h('div', { class: 'voicewarn', role: 'alert' },
      h('b', null, '🔇 Бұл браузерде ағылшынша дауыс жоқ'),
      h('p', null, 'Таза британдық акцент үшін сайтты Google Chrome немесе Microsoft Edge браузерінде ашыңыз — оларда табиғи ағылшын дауысы бар. Немесе Windows-та: Settings → Time & language → Speech → Add voices → English (United Kingdom).'),
      h('button', { class: 'pill sm', onclick: () => box.remove() }, 'Түсіндім'));
    document.body.append(box);
  };
  G.sayBtn = (text, rate) => h('button', { class: 'say', type: 'button', title: 'Тыңдау', 'aria-label': 'Тыңдау', onclick: e => { e.stopPropagation(); G.speak(text, { rate }); } }, '🔈');

  /* ---------- Motion effects ---------- */
  G.toast = msg => { const o = $('.toast'); if (o) o.remove(); const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), 2600); };
  G.confetti = n => {
    if (calm()) return;
    const c = h('canvas', { class: 'confetti' }); document.body.append(c);
    const x = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
    const cols = ['#0894ff', '#c959dd', '#ff2e54', '#ff9004', '#30d158', '#ffd60a'];
    const ps = Array.from({ length: n || 180 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * .5, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, r: 6 + Math.random() * 7, c: G.pick(cols), a: Math.random() * 6, va: (Math.random() - .5) * .25 }));
    let t = 0;
    (function f() {
      t++; x.clearRect(0, 0, W, H);
      ps.forEach(p => { p.vy += .03; p.x += p.vx + Math.sin((t + p.r) / 18); p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 5, p.r, p.r / 2.5); x.restore(); });
      if (t < 260) requestAnimationFrame(f); else c.remove();
    })();
  };

  // One-shot sparkle burst at screen coordinates
  let BC = null, BP = [], bOn = false;
  G.burst = (x0, y0, cols, n) => {
    if (calm()) return;
    if (!BC || !BC.isConnected) { BC = h('canvas', { class: 'burstc', 'aria-hidden': 'true' }); document.body.append(BC); }
    BC.width = innerWidth; BC.height = innerHeight;
    cols = cols || ['#30d158', '#ffd60a', '#0a84ff', '#ff375f'];
    for (let i = 0; i < (n || 70); i++) { const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 7; BP.push({ x: x0, y: y0, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, r: 1.5 + Math.random() * 3.5, c: G.pick(cols), life: 1, star: Math.random() < .3 }); }
    if (bOn) return; bOn = true;
    const x = BC.getContext('2d');
    (function f() {
      x.clearRect(0, 0, BC.width, BC.height);
      BP.forEach(p => { p.vx *= .965; p.vy = p.vy * .965 + .12; p.x += p.vx; p.y += p.vy; p.life -= .016; x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.c; x.beginPath(); if (p.star) { x.save(); x.translate(p.x, p.y); x.rotate(p.life * 6); x.fillRect(-p.r * 1.6, -p.r * .35, p.r * 3.2, p.r * .7); x.fillRect(-p.r * .35, -p.r * 1.6, p.r * .7, p.r * 3.2); x.restore(); } else { x.arc(p.x, p.y, p.r, 0, 7); x.fill(); } });
      x.globalAlpha = 1;
      BP = BP.filter(p => p.life > 0);
      if (BP.length) requestAnimationFrame(f); else { bOn = false; x.clearRect(0, 0, BC.width, BC.height); }
    })();
  };
  G.burstAt = (el, cols, n) => { if (!el) return; const [x, y] = G.center(el); G.burst(x, y, cols, n); };

  // "+100" flies along an arc into the scoreboard
  G.flyTo = (fromEl, toEl, color, label, done) => {
    if (!fromEl || !toEl || calm() || !fromEl.isConnected) { if (done) done(); return; }
    const [x0, y0] = G.center(fromEl), [x1, y1] = G.center(toEl);
    const mx = (x0 + x1) / 2 + (x1 > x0 ? -60 : 60), my = Math.min(y0, y1) - 140;
    const dot = h('div', { class: 'flydot', style: { background: color } }, label);
    document.body.append(dot);
    const tf = (x, y, s) => 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%) scale(' + s + ')';
    const an = dot.animate([{ transform: tf(x0, y0, .6), opacity: 0 }, { transform: tf(x0, y0 - 30, 1.15), opacity: 1, offset: .15 }, { transform: tf(mx, my, 1.1), opacity: 1, offset: .55 }, { transform: tf(x1, y1, .5), opacity: .9 }], { duration: 1000, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
    let fired = false;
    const fin = () => { if (fired) return; fired = true; dot.remove(); if (done) done(); };
    an.onfinish = fin;
    setTimeout(fin, 1400);
  };
  G.countUp = (el, from, to, fmt, dur) => {
    if (!el) return;
    const t0 = performance.now(), D2 = dur || 800;
    fmt = fmt || (v => String(v));
    if (calm()) { el.textContent = fmt(to); return; }
    (function f(t) { const p = Math.min(1, (t - t0) / D2), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(f); })(t0);
  };

  // Canvas scenery: stars, warp, embers, orbs, fireworks
  G.fx = (host, mode, o) => {
    o = o || {};
    if (calm() || !host) return { stop() {}, set() {} };
    const c = h('canvas', { class: 'fxc', 'aria-hidden': 'true' });
    host.prepend(c);
    const x = c.getContext('2d');
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const cols = o.colors || ['#ffffff'];
    let W = 0, H = 0, on = true, speed = o.speed || 1, last = performance.now();
    const resize = () => { const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    let ro = null; try { ro = new ResizeObserver(resize); ro.observe(host); } catch (e) {}
    const R = Math.random;
    let P = [], S = [], next = 0;
    if (mode === 'stars') P = Array.from({ length: 170 }, () => ({ x: R(), y: R(), z: .25 + R() * .75, ph: R() * 6 }));
    if (mode === 'warp') P = Array.from({ length: 300 }, () => ({ a: R() * Math.PI * 2, d: R() * 1, s: .4 + R() * .9, c: G.pick(cols) }));
    if (mode === 'embers') P = Array.from({ length: 110 }, () => ({ x: R(), y: R(), vy: .02 + R() * .06, r: .6 + R() * 2.2, c: G.pick(cols), ph: R() * 6 }));
    if (mode === 'orbs') P = Array.from({ length: 7 }, (_, i) => ({ x: R(), y: R(), r: .18 + R() * .22, vx: (R() - .5) * .02, vy: (R() - .5) * .02, c: cols[i % cols.length] }));
    function frame(now) {
      if (!on || !c.isConnected) { stop(); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (mode === 'warp') { x.fillStyle = 'rgba(0,0,0,' + (o.trail || .28) + ')'; x.fillRect(0, 0, W, H); } else x.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * (o.cy || .45), M = Math.hypot(W, H) / 2;
      if (mode === 'stars') {
        P.forEach(p => { p.x += .0025 * p.z * dt; if (p.x > 1) p.x -= 1; const a = .35 + .65 * Math.abs(Math.sin(now / 900 * p.z + p.ph)); x.globalAlpha = a * p.z; x.fillStyle = '#fff'; x.beginPath(); x.arc(p.x * W, p.y * H, p.z * 1.4, 0, 7); x.fill(); });
        if (now > next) { S.push({ x: R() * W * .8, y: R() * H * .4, vx: 600 + R() * 400, vy: 220 + R() * 160, life: 1 }); next = now + 2600 + R() * 3500; }
        S.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.4; const g = x.createLinearGradient(s.x, s.y, s.x - s.vx * .12, s.y - s.vy * .12); g.addColorStop(0, 'rgba(255,255,255,' + Math.max(0, s.life) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(s.x - s.vx * .12, s.y - s.vy * .12); x.stroke(); });
        S = S.filter(s => s.life > 0);
      } else if (mode === 'warp') {
        x.lineCap = 'round';
        P.forEach(p => {
          const v = (p.d * 2.2 + .05) * p.s * speed * dt;
          const d0 = p.d * M; p.d += v; const d1 = p.d * M;
          if (p.d > 1.1) { p.d = R() * .08; p.a = R() * Math.PI * 2; return; }
          x.globalAlpha = Math.min(1, p.d * 2.5); x.strokeStyle = p.c; x.lineWidth = Math.max(.6, p.d * 2.6 * Math.min(2, speed));
          x.beginPath(); x.moveTo(cx + Math.cos(p.a) * d0, cy + Math.sin(p.a) * d0); x.lineTo(cx + Math.cos(p.a) * d1, cy + Math.sin(p.a) * d1); x.stroke();
        });
      } else if (mode === 'embers') {
        P.forEach(p => { p.y -= p.vy * dt * speed; p.x += Math.sin(now / 1200 + p.ph) * .0006; if (p.y < -0.02) { p.y = 1.02; p.x = R(); } x.globalAlpha = .35 + .65 * Math.abs(Math.sin(now / 500 + p.ph)); x.fillStyle = p.c; x.shadowColor = p.c; x.shadowBlur = 12; x.beginPath(); x.arc(p.x * W, p.y * H, p.r, 0, 7); x.fill(); });
        x.shadowBlur = 0;
      } else if (mode === 'orbs') {
        x.globalCompositeOperation = 'lighter';
        P.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.x < -.1 || p.x > 1.1) p.vx *= -1; if (p.y < -.1 || p.y > 1.1) p.vy *= -1; const r = p.r * Math.max(W, H), g = x.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, r); g.addColorStop(0, p.c + '55'); g.addColorStop(1, p.c + '00'); x.globalAlpha = 1; x.fillStyle = g; x.beginPath(); x.arc(p.x * W, p.y * H, r, 0, 7); x.fill(); });
        x.globalCompositeOperation = 'source-over';
      } else if (mode === 'fireworks') {
        if (now > next && (o.auto !== false)) { S.push({ x: W * (.15 + R() * .7), y: H, vy: -(H * (.9 + R() * .5)), tx: H * (.15 + R() * .3), c: G.pick(cols) }); next = now + 450 + R() * 600; }
        S.forEach(s => { s.y += s.vy * dt; s.vy *= .985; x.globalAlpha = 1; x.fillStyle = s.c; x.beginPath(); x.arc(s.x, s.y, 2.4, 0, 7); x.fill(); if (s.y <= s.tx) { s.dead = true; G.sfx('blip'); for (let i = 0; i < 80; i++) { const a = R() * Math.PI * 2, sp = 60 + R() * 220; P.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: R() < .2 ? '#ffffff' : s.c }); } } });
        S = S.filter(s => !s.dead);
        P.forEach(p => { p.vx *= .98; p.vy = p.vy * .98 + 90 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * .7; x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, 1.8, 0, 7); x.fill(); });
        P = P.filter(p => p.life > 0);
      }
      x.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    function stop() { on = false; if (ro) try { ro.disconnect(); } catch (e) {} if (c.isConnected) c.remove(); }
    requestAnimationFrame(frame);
    const ctl = { stop, set: v => { speed = v; }, el: c };
    if (D) D.sc.push(stop);
    return ctl;
  };

  // 3D tilt that follows the pointer
  G.tilt = (el, max) => {
    if (calm()) return;
    max = max || 14;
    el.classList.add('tilt');
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; el.style.transform = 'perspective(700px) rotateY(' + (px * max * 2) + 'deg) rotateX(' + (-py * max * 2) + 'deg) translateY(-6px)'; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  };
  G.chip = (L, o) => {
    o = o || {};
    const b = h(o.tag || 'button', { class: 'chip3d ' + (o.cls || ''), style: { '--g': L.grad, '--glow': L.glow, '--d': o.delay, '--s': o.size, '--sh': (L.n * 1.3) + 's' }, onclick: o.onclick || null, 'aria-label': L.n + '-сабақ ' + L.title },
      h('span', { class: 'sheen' }), h('span', { class: 'brand' }, 'SUPER U'), h('span', { class: 'lbl' }, L.chip), h('span', { class: 'sub' }, o.sub || L.title));
    if (o.tilt) G.tilt(b, 12);
    return b;
  };

  /* ---------- Teams and points ---------- */
  G.award = (t, pts, el) => {
    const T = G.S.teams[t]; if (!T || !pts) return;
    const old = T.score;
    T.score = Math.max(0, old + pts); G.save();
    const sbi = D && D.sbItems[t];
    const fmt = v => T.emoji + ' ' + v;
    if (pts > 0 && sbi) {
      G.sfx('point');
      if (el) G.burstAt(el, [T.color, '#ffffff', '#ffd60a'], 26);
      G.flyTo(el, sbi.el, T.color, '+' + pts, () => {
        sbi.el.classList.remove('bump'); void sbi.el.offsetWidth; sbi.el.classList.add('bump');
        G.countUp(sbi.num, old, T.score, fmt, 700);
        G.burstAt(sbi.el, [T.color, '#ffffff'], 18);
      });
    } else if (sbi) sbi.num.textContent = fmt(T.score);
  };
  G.picker = (pts, set, label) => {
    set = set || new Set();
    const box = h('div', { class: 'picker' }, h('div', { class: 'lab' }, label || 'Кім дұрыс тапты? Команданы басыңыз (қате басылса, қайта бассаңыз — өшеді).'));
    G.S.teams.forEach((T, t) => {
      const b = h('button', { class: 'tp' + (set.has(t) ? ' on' : ''), type: 'button', style: { animation: 'rise .6s ' + (.05 + t * .06) + 's var(--ease) both' }, onclick: () => {
        if (set.has(t)) { set.delete(t); b.classList.remove('on'); G.award(t, -pts, b); }
        else { set.add(t); b.classList.add('on'); G.award(t, pts, b); }
      } }, h('span', { class: 'dot', style: { '--c': T.color } }), T.emoji + ' ' + T.name, h('span', { class: 'plus' }, '+' + pts));
      box.append(b);
    });
    return box;
  };

  /* ---------- Timer ring ---------- */
  G.ring = secs => {
    const C = 2 * Math.PI * 26;
    const el = h('div', { class: 'ring', role: 'timer', title: 'Таймер', html: '<svg width="62" height="62" viewBox="0 0 62 62"><circle class="bg" cx="31" cy="31" r="26"/><circle class="fg" cx="31" cy="31" r="26" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="0"/></svg><div class="n"></div>' });
    const fg = el.querySelector('.fg'), n = el.querySelector('.n');
    let id = null, left = secs, lastSec = secs;
    const draw = () => { fg.style.strokeDashoffset = (C * (1 - left / secs)).toFixed(2); n.textContent = Math.ceil(left); };
    const stop = () => { if (id) { clearInterval(id); id = null; } el.classList.remove('hurry'); };
    const start = () => {
      stop(); left = secs; lastSec = secs; el.classList.remove('end'); draw();
      const t0 = Date.now();
      id = setInterval(() => {
        left = Math.max(0, secs - (Date.now() - t0) / 1000); draw();
        const s = Math.ceil(left);
        if (s <= 5 && s > 0) { el.classList.add('hurry'); if (s !== lastSec) G.sfx('blip'); }
        lastSec = s;
        if (left <= 0) { stop(); el.classList.add('end'); G.sfx('tick'); }
      }, 100);
    };
    draw();
    if (D) D.sc.push(stop);
    return { el, start, stop };
  };

  /* ---------- Lesson player ---------- */
  G.LESSONS = {}; G.ORDER = [];
  G.lesson = def => { G.LESSONS[def.id] = def; G.ORDER.push(def.id); };
  G.SCENES = {};
  const HINTS = {
    film: 'Кіріспе бейне. Келесіге өту үшін → басыңыз.',
    explain: 'Ереже. Сөйлемдерді бірге оқыңдар (🔈 — дауыстап оқиды). → — келесі мысал.',
    task: 'Жұппен жұмыс. «Бастау» батырмасы таймерді қосады. Уақыт біткенде → басыңыз.',
    unlock: 'Сабақ аяқталды! Командалардың ұпайы көрсетілді. → — әрі қарай.'
  };
  let D = null;

  function renderSB() {
    if (!D) return;
    D.sb.innerHTML = ''; D.sbItems = [];
    G.S.teams.forEach((T, t) => {
      const num = h('span', null, T.emoji + ' ' + T.score);
      const el = h('span', { class: 'sbi', title: T.name }, h('span', { class: 'dot', style: { '--c': T.color } }), num);
      D.sb.append(el); D.sbItems.push({ el, num });
    });
  }
  function updateProg() {
    const n = D.L.scenes.length;
    [...D.prog.children].forEach((b, k) => { b.className = k < D.i ? 'done' : k === D.i ? 'cur' : ''; });
    D.count.textContent = (D.i + 1) + ' / ' + n;
  }
  function setHint(t) { if (!D) return; D.hint.innerHTML = ''; if (t) { D.hint.append(h('span', { class: 'bulb' }, '💡'), h('span', { html: G.fmt(t) })); D.hint.style.animation = 'none'; void D.hint.offsetWidth; D.hint.style.animation = ''; } }
  function clearScene() {
    if (!D) return;
    D.sc.forEach(f => { try { f(); } catch (e) {} }); D.sc = [];
    if (D.ctrl && D.ctrl.destroy) { try { D.ctrl.destroy(); } catch (e) {} }
    D.ctrl = null; G.hush();
  }
  function go(i) {
    if (!D) return;
    if (i < 0) return;
    if (i >= D.L.scenes.length) { G.S.done[D.L.id] = true; G.S.pos[D.L.id] = 0; G.save(); G.home('lessons'); return; }
    clearScene();
    const old = D.stage.querySelector('.scene:not(.leaving)');
    if (old) { old.classList.add('leaving'); setTimeout(() => old.remove(), 450); }
    const def = D.L.scenes[i];
    const el = h('section', { class: 'scene', 'aria-live': 'polite' }), inner = h('div', { class: 'inner' });
    el.append(inner);
    D.deck.classList.toggle('dark', !!def.dark);
    D.i = i; G.S.pos[D.L.id] = i; G.save();
    setHint(def.hint || HINTS[def.type] || '');
    const build = def.render || G.SCENES[def.type];
    D.stage.append(el);
    if (old) G.sfx('swish');
    D.ctrl = (build ? build(inner, def, api, el) : null) || {};
    updateProg();
  }
  function next() { if (!D) return; if (D.ctrl && D.ctrl.next && D.ctrl.next()) return; go(D.i + 1); }
  function prev() { if (!D) return; if (D.ctrl && D.ctrl.prev && D.ctrl.prev()) return; go(D.i - 1); }
  const api = {
    get lesson() { return D && D.L; },
    after: (fn, ms) => { const id = setTimeout(fn, ms); D.sc.push(() => clearTimeout(id)); return id; },
    every: (fn, ms) => { const id = setInterval(fn, ms); D.sc.push(() => clearInterval(id)); return id; },
    loop: fn => { let on = true; const st = t => { if (!on) return; if (fn(t) === false) return; requestAnimationFrame(st); }; requestAnimationFrame(st); D.sc.push(() => { on = false; }); },
    onLeave: fn => D.sc.push(fn),
    hint: t => setHint(t),
    next: () => next(), go: i => go(i), get index() { return D ? D.i : 0; }
  };
  G.api = api;
  function onKey(e) {
    if (!D) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (D.ctrl && D.ctrl.key && D.ctrl.key(e)) { e.preventDefault(); return; }
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'k' || k === 'K') G.setKK(!G.S.kk);
    else if (k === 'n' || k === 'N') G.pickStudent();
    else if (k === 'f' || k === 'F') toggleFull();
  }
  function toggleFull() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else { const p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => G.toast('Толық экран бұл жерде қолжетімсіз')); }
    } catch (e) { G.toast('Толық экран бұл жерде қолжетімсіз'); }
  }
  const tog = (label, on, fn, attrs) => h('button', Object.assign({ class: 'tog', 'aria-pressed': String(!!on), onclick: fn }, attrs || {}), label);

  G.play = (id, at) => {
    const L = G.LESSONS[id]; if (!L) return;
    if (D) { clearScene(); document.removeEventListener('keydown', onKey); }
    const app = $('#app'); app.innerHTML = '';
    document.body.style.overflow = 'hidden';
    const deck = h('div', { class: 'deck', style: { '--g': L.grad } });
    const sb = h('div', { class: 'sb', 'aria-label': 'Командалардың ұпайы' });
    const sound = tog(G.S.sound ? '🔊' : '🔇', G.S.sound, () => { G.S.sound = !G.S.sound; G.save(); sound.textContent = G.S.sound ? '🔊' : '🔇'; sound.setAttribute('aria-pressed', String(G.S.sound)); }, { title: 'Дыбыс' });
    const prog = h('div', { class: 'prog' }, L.scenes.map((s, k) => h('button', { type: 'button', title: (k + 1) + '-сахна', 'aria-label': (k + 1) + '-сахна', onclick: () => go(k) }, h('i'))));
    const count = h('span', { class: 'count' });
    const hint = h('div', { class: 'hint', role: 'status' });
    const cols = L.colors || ['#0894ff', '#ff2e54', '#c959dd'];
    deck.append(
      h('div', { class: 'dtop' },
        h('button', { class: 'wordmark', onclick: () => G.home(), title: 'Басты бет' }, 'Super U'),
        h('span', { class: 'ttl' }, L.n + '-сабақ · ' + L.title),
        sb,
        h('button', { class: 'tog', title: 'Кім жауап береді? (N)', onclick: () => G.pickStudent() }, '🎯'),
        tog('ҚАЗ', G.S.kk, () => G.setKK(!G.S.kk), { 'data-kk': '', title: 'Қазақша түсіндірме (K)' }),
        sound,
        tog('⤢', false, toggleFull, { title: 'Толық экран (F)' })),
      h('div', { class: 'dstage' }, h('div', { class: 'aura', 'aria-hidden': 'true' }, cols.slice(0, 3).map(c => h('i', { style: { background: c } })))),
      hint,
      h('div', { class: 'dbot' },
        h('button', { class: 'nbtn', 'aria-label': 'Артқа', title: 'Артқа (←)', onclick: prev }, '‹'),
        prog, count,
        h('button', { class: 'nbtn main', 'aria-label': 'Келесі', title: 'Келесі (→)', onclick: next }, '›')));
    app.append(deck);
    D = { L, i: -1, ctrl: null, deck, stage: deck.querySelector('.dstage'), sb, sbItems: [], prog, count, hint, sc: [] };
    renderSB();
    document.addEventListener('keydown', onKey);
    go(Math.min(at || 0, L.scenes.length - 1));
  };

  /* ---------- Landing page ---------- */
  G.home = section => {
    if (D) { clearScene(); document.removeEventListener('keydown', onKey); D = null; }
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    document.body.style.overflow = '';
    const S = G.S, app = $('#app');
    app.innerHTML = '';
    const lessons = G.ORDER.map(id => G.LESSONS[id]);
    const firstOpen = lessons.find(L => !S.done[L.id]) || lessons[0];
    const start = () => G.play(firstOpen.id, S.pos[firstOpen.id] || 0);
    const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
    const navLink = (id, t) => h('a', { href: '#' + id, onclick: e => { e.preventDefault(); scrollTo(id); } }, t);

    const nav = h('nav', { class: 'nav' }, h('div', { class: 'wrap' },
      h('button', { class: 'wordmark', onclick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }, 'Super U'),
      h('span', { class: 'sp' }),
      h('span', { class: 'links', style: { display: 'flex', gap: '22px' } }, navLink('how', 'Қалай жұмыс істейді'), navLink('lessons', 'Сабақтар'), navLink('teams', 'Командалар'), navLink('inside', 'Ішінде не бар')),
      tog('ҚАЗ', S.kk, () => G.setKK(!S.kk), { 'data-kk': '', title: 'Қазақша түсіндірме' }),
      h('button', { class: 'pill sm', onclick: start }, 'Бастау')));

    const hero = h('section', { class: 'hero on-dark' },
      h('div', { class: 'glow', style: { width: '620px', height: '620px', left: '-180px', top: '-220px', background: '#0894ff', animation: 'drift 22s ease-in-out infinite alternate' } }),
      h('div', { class: 'glow', style: { width: '560px', height: '560px', right: '-200px', bottom: '-260px', background: '#ff2e54', animation: 'drift 28s -9s ease-in-out infinite alternate' } }),
      h('div', { class: 'glow', style: { width: '420px', height: '420px', left: '40%', top: '30%', background: '#c959dd', opacity: '.25', animation: 'drift 34s -17s ease-in-out infinite alternate' } }),
      h('div', { class: 'wrap' },
        h('div', { class: 'eyebrow', style: { animation: 'rise 1s var(--ease) both' } }, 'Headway Elementary · 5-юнит'),
        h('h1', { class: 'shimmer' }, 'Super U.'),
        h('p', { class: 'lede' }, 'Сенің күшің. Ағылшын тілінде.'),
        h('p', { style: { color: 'var(--moon-2)', fontSize: 'clamp(16px,1.7vw,21px)', maxWidth: '46ch', animation: 'rise 1.3s .25s var(--ease) both' } }, 'Бүкіл топқа арналған үш сабақ. Апай проекторға шығарады, сынып командамен ойнайды. Әр сабақ бір «күш» ашады: can, could және please.'),
        h('div', { class: 'row' },
          h('button', { class: 'pill', onclick: start }, Object.keys(S.pos).some(k => S.pos[k]) ? firstOpen.n + '-сабақты жалғастыру' : '1-сабақты бастау'),
          h('button', { class: 'link', onclick: () => scrollTo('how') }, 'Қалай жұмыс істейді?')),
        S.students.length ? h('div', { class: 'starring' }, h('span', { class: 'st-l' }, (S.group ? S.group + ' · ' : '') + 'Starring'), h('div', null, S.students.map((s, k) => h('span', { style: { animationDelay: (.9 + k * .09) + 's' } }, s.name)))) : null,
        h('div', { class: 'chips' }, lessons.map((L, n) => h('div', { class: 'float', style: { animationDelay: (-n * 2) + 's' } }, G.chip(L, { delay: (.5 + n * .15) + 's', sub: S.done[L.id] ? 'Ашылды ✓' : L.title, tilt: true, onclick: () => G.play(L.id, S.pos[L.id] || 0) }))))));

    const WORDS = ['can', 'can\'t', 'could', 'couldn\'t', 'was', 'were', 'was born', 'a little bit', 'quite well', 'brilliantly', 'fluently', 'not at all'];
    const WORDS2 = ['bus stop', 'sunglasses', 'traffic lights', 'motorbike', 'coffee shop', 'play the violin', 'earn money', 'go on holiday', 'Can I…?', 'Could you…?', 'worried about', 'Yours sincerely'];
    const row = (list, rev) => { const items = list.concat(list).map((w, k) => h('span', null, k % 3 === 0 ? h('b', null, w) : w, ' ·')); return h('div', { class: 'mq' + (rev ? ' rev' : '') }, items); };
    const marquee = h('section', { class: 'marquee', 'aria-label': '5-юниттің сөздері' }, row(WORDS), row(WORDS2, true));

    const STEPS = [
      ['👥', 'Командаларды құр', 'Сыныпты 2–6 командаға бөл. Төмендегі «Командалар» бөлімінде аттарын жаз.'],
      ['🖥️', 'Проекторға шығар', 'Сабақты аш. F пернесі — толық экран. Экранда бір уақытта бір ғана тапсырма тұрады.'],
      ['→', 'Тек → пернесін бас', 'Сұрақ шығады — командалар ауызша жауап береді. → басқанда дұрыс жауап ашылады.'],
      ['🏆', 'Ұпай бер', 'Дұрыс тапқан команданы бас: +100. Соңында марапаттау — жеңімпаз анықталады.']
    ];
    const howSec = h('section', { class: 'sec', id: 'how' }, h('div', { class: 'wrap' },
      h('h2', { class: 'sec-title reveal' }, 'Қалай жұмыс', h('br'), 'істейді?'),
      h('p', { class: 'sec-lede reveal' }, 'Төрт қадам. Бәрі бір пернемен басқарылады. Әр экранның төменгі жағында «💡» жолы не істеу керегін айтып тұрады.'),
      h('div', { class: 'steps' }, STEPS.map(([ic, t, d], n) => h('div', { class: 'step reveal' }, h('div', { class: 'step-n' }, n + 1), h('div', { class: 'step-ic' }, ic), h('h3', null, t), h('p', null, d)))),
      h('div', { class: 'keys reveal' }, [['→', 'келесі'], ['←', 'артқа'], ['K', 'қазақша түсіндірме'], ['F', 'толық экран']].map(([k, t]) => h('span', null, h('kbd', null, k), t)))));

    const lessonSec = h('section', { class: 'sec grey', id: 'lessons' }, h('div', { class: 'wrap' },
      h('h2', { class: 'sec-title reveal' }, 'Үш сабақ.', h('br'), 'Үш күш.'),
      h('p', { class: 'sec-lede reveal' }, 'Әр сабақ — бір пара. Соңында жаңа «чип» ашылады.'),
      h('div', { class: 'lcards' }, lessons.map(L => {
        const pos = S.pos[L.id] || 0;
        const card = h('article', { class: 'lcard on-dark reveal' },
          h('div', { class: 'glow', style: { background: L.glowColor, animation: 'drift 20s ease-in-out infinite alternate' } }),
          h('div', { class: 'eyebrow' }, L.n + '-сабақ' + (S.done[L.id] ? ' · ашылды ✓' : '')),
          h('h3', { class: 'grad', style: { '--g': L.grad } }, L.title + '.'),
          h('div', { class: 'sub' }, L.grammar),
          h('div', { class: 'meta' }, L.scenes.length + ' сахна · шамамен ' + L.minutes + ' минут'),
          G.chip(L, { size: '112px', tilt: true, sub: S.done[L.id] ? 'Ашылды ✓' : L.title, onclick: () => G.play(L.id, pos) }),
          h('p', { style: { color: 'var(--moon-2)', fontSize: '15px' } }, L.blurb),
          h('div', { class: 'actions' },
            h('button', { class: 'pill light', onclick: () => G.play(L.id, pos) }, pos ? 'Жалғастыру · ' + (pos + 1) + '-сахна' : 'Бастау'),
            pos ? h('button', { class: 'link', onclick: () => G.play(L.id, 0) }, 'Басынан') : null));
        card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
        return card;
      })),
      h('div', { class: 'reveal', style: { display: 'flex', justifyContent: 'center', marginTop: '40px' } }, G.practiceCard(false))));

    const teamCards = h('div', { class: 'tcards' });
    const drawTeams = () => {
      teamCards.innerHTML = '';
      S.teams.forEach((T, t) => {
        const em = h('button', { class: 'em', title: 'Белгіні ауыстыру', onclick: () => { T.emoji = G.EMOJI[(G.EMOJI.indexOf(T.emoji) + 1) % G.EMOJI.length]; G.save(); em.textContent = T.emoji; em.animate([{ transform: 'scale(.4) rotate(-30deg)' }, { transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' }); } }, T.emoji);
        const name = h('input', { type: 'text', value: T.name, maxlength: '16', 'aria-label': 'Команда аты', id: 'team-' + t, oninput: e => { T.name = e.target.value.trim() || ('Team ' + (t + 1)); G.save(); } });
        const sw = h('div', { class: 'swatches' }, G.COLORS.map(c => h('button', { class: 'sw', style: { background: c }, 'aria-label': 'түс', 'aria-pressed': String(T.color === c), onclick: () => { T.color = c; G.save(); drawTeams(); } })));
        const mem = G.members(t);
        teamCards.append(h('div', { class: 'tcard', style: { animation: 'rise .7s ' + (t * .06) + 's var(--ease) both', boxShadow: 'inset 0 3px 0 ' + T.color } }, h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, em, h('span', { class: 'score' }, T.score)), name,
          h('div', { class: 'members' }, mem.length ? mem.map((s, k) => h('span', { style: { animationDelay: (drafting ? (S.students.indexOf(s) * .12) : 0) + 's', borderColor: T.color } }, s.name, s.stars ? ' ⭐' + s.stars : '')) : h('em', { class: 'muted' }, 'Әзірге бос')), sw));
      });
      drafting = false;
    };
    let drafting = false;
    const roster = h('div', { class: 'roster' });
    const drawRoster = () => {
      roster.innerHTML = '';
      S.students.forEach((s, i) => roster.append(h('span', { class: 'rchip' }, s.name, h('button', { 'aria-label': s.name + ' өшіру', title: 'Өшіру', onclick: () => { S.students.splice(i, 1); G.save(); drawRoster(); drawTeams(); } }, '×'))));
      const inp = h('input', { type: 'text', id: 'new-student', placeholder: '+ оқушы қосу', maxlength: '20', onkeydown: e => { if (e.key === 'Enter' && e.target.value.trim()) { S.students.push({ name: e.target.value.trim(), team: -1, stars: 0 }); G.save(); drawRoster(); drawTeams(); setTimeout(() => { const n = document.getElementById('new-student'); if (n) n.focus(); }, 0); } } });
      roster.append(inp);
    };
    drawRoster();
    const draftBtn = h('button', { class: 'pill', onclick: () => { G.draft(); drafting = true; G.sfx('drum'); drawTeams(); setTimeout(() => { G.sfx('fanfare'); G.burstAt(draftBtn, ['#ff9f0a', '#ff375f', '#0a84ff', '#30d158'], 90); }, S.students.length * 120 + 200); } }, '🎲 Жеребемен бөлу');
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Команда саны' });
    const drawSeg = () => { seg.innerHTML = ''; [2, 3, 4, 5, 6].forEach(n => seg.append(h('button', { 'aria-pressed': String(S.teams.length === n), onclick: () => { G.setTeamCount(n); drawSeg(); drawTeams(); } }, n))); };
    drawSeg(); drawTeams();
    const resetBox = h('span');
    const resetFirst = () => h('button', { class: 'link', onclick: () => { resetBox.innerHTML = ''; resetBox.append(h('span', { style: { fontWeight: 600, marginRight: '14px' } }, 'Барлық ұпайды нөлдейміз бе?'), h('button', { class: 'link', onclick: () => { S.teams.forEach(T => T.score = 0); G.save(); drawTeams(); resetBox.innerHTML = ''; resetBox.append(resetFirst()); } }, 'Иә'), h('button', { class: 'link', style: { marginLeft: '14px', color: 'var(--ink-2)' }, onclick: () => { resetBox.innerHTML = ''; resetBox.append(resetFirst()); } }, 'Жоқ')); } }, 'Ұпайларды нөлдеу');
    resetBox.append(resetFirst());
    const voiceSel = h('select', { id: 'voice', 'aria-label': 'Ағылшынша дауыс', style: { maxWidth: '100%' } });
    const voiceNote = h('div', { class: 'muted', style: { fontSize: '14px', maxWidth: '60ch', textAlign: 'center' } });
    const fillVoices = () => {
      const vs = G.voices(), cur = G.voiceName();
      voiceSel.innerHTML = '';
      if (!vs.length) { voiceSel.append(h('option', { value: '' }, 'Ағылшынша дауыс табылмады')); voiceSel.disabled = true; voiceNote.textContent = 'Бұл браузерде ағылшынша дауыс жоқ, сондықтан сайт дыбыссыз жұмыс істейді (орыс дауысымен оқымайды). Таза британдық акцент үшін сайтты Google Chrome немесе Microsoft Edge-те ашыңыз. Немесе Windows-та: Settings → Time & language → Speech → Add voices → English (United Kingdom).'; return; }
      voiceSel.disabled = false;
      vs.forEach(v => voiceSel.append(h('option', { value: v.name, selected: v.name === cur ? '' : null }, v.name.replace(/^Microsoft /, '').replace(/ - English/, ' —') + (/GB/i.test(v.lang) ? ' 🇬🇧' : /US/i.test(v.lang) ? ' 🇺🇸' : ''))));
      voiceNote.textContent = /Natural|Google/i.test(cur) ? 'Табиғи дауыс таңдалды ✓' : 'Ең табиғи дауыс — атауында «Natural» немесе «Google UK English» бар дауыс (Edge немесе Chrome-да болады).';
    };
    voiceSel.addEventListener('change', () => { G.setVoice(voiceSel.value); fillVoices(); G.speak('Hello! I can speak English. Could you help me, please?'); });
    if (G._vh) document.removeEventListener('superu:voices', G._vh);
    G._vh = fillVoices; document.addEventListener('superu:voices', fillVoices);
    fillVoices();
    const voiceBox = h('div', { class: 'reveal', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '40px' } },
      h('h3', { style: { fontSize: '28px', letterSpacing: '-.03em' } }, '🔈 Дауыс'),
      h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' } }, voiceSel,
        h('select', { id: 'rate', 'aria-label': 'Сөйлеу жылдамдығы', onchange: e => { S.rate = +e.target.value; G.save(); G.speak('Hello! I can speak English. Could you help me, please?'); } },
          [[.55, '🐢 Өте баяу'], [.65, 'Баяу'], [.75, 'Орташа (ұсынылады)'], [.9, 'Жылдам'], [1, 'Табиғи жылдамдық']].map(([v, t]) => h('option', { value: v, selected: (S.rate || .75) === v ? '' : null }, t))),
        h('button', { class: 'pill sm', onclick: () => G.speak('Hello! I can speak English. Could you help me, please?') }, '▶ Тыңдау')),
      voiceNote);
    const teamSec = h('section', { class: 'sec', id: 'teams' }, h('div', { class: 'wrap' },
      h('h2', { class: 'sec-title reveal' }, 'Бірге ойнаймыз.'),
      h('p', { class: 'sec-lede reveal' }, 'Сыныпты командаларға бөл, аттарын жаз. Белгіні басып ауыстыруға болады. Ұпайлар үш сабақ бойы сақталады.'),
      h('div', { class: 'tsetup' },
        h('label', { for: 'group' }, 'Топ'), h('input', { type: 'text', id: 'group', value: S.group, placeholder: 'мысалы, AI-25', maxlength: '20', oninput: e => { S.group = e.target.value.trim(); G.save(); } }),
        h('label', { for: 'size' }, 'Студент саны'), h('input', { type: 'number', id: 'size', min: '2', max: '60', value: S.size, style: { width: '80px' }, oninput: e => { const v = parseInt(e.target.value, 10); if (v > 1 && v < 100) { S.size = v; G.save(); } } }),
        h('label', null, 'Команда саны'), seg),
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '30px' } },
        h('div', { class: 'eyebrow' }, 'Оқушылар · ' + S.students.length), roster, draftBtn,
        h('div', { class: 'muted', style: { fontSize: '14px' } }, 'Жеребе оқушыларды командаларға кездейсоқ бөледі. Қайта бассаң — қайта бөледі.')),
      teamCards,
      h('div', { style: { textAlign: 'center', marginTop: '26px' } }, resetBox),
      voiceBox));

    const specRows = [['Грамматика', L => L.specs.grammar], ['Сөздер', L => L.specs.words], ['Дағдылар', L => L.specs.skills], ['Ойындар', L => L.specs.games], ['Уақыт', L => 'Шамамен ' + L.minutes + ' минут · ' + L.scenes.length + ' сахна']];
    const insideSec = h('section', { class: 'sec grey', id: 'inside' }, h('div', { class: 'wrap' },
      h('h2', { class: 'sec-title reveal' }, 'Ішінде не бар?'),
      h('p', { class: 'sec-lede reveal' }, '5-юнит «Super U!» толық, 49–58 беттер: барлық ереже, барлық сөз, барлық дағды.'),
      h('div', { class: 'specs reveal' }, h('table', null,
        h('thead', null, h('tr', null, h('th', null, ''), lessons.map(L => h('th', null, h('span', { class: 'grad', style: { '--g': L.grad } }, L.title))))),
        h('tbody', null, specRows.map(([lab, fn]) => h('tr', null, h('th', null, lab), lessons.map(L => h('td', null, fn(L))))))))));

    const foot = h('footer', { class: 'wrap foot' },
      h('span', null, 'Headway Elementary 5th edition · 5-юнит «Super U!». Сабаққа арналған жаттығу платформасы.'),
      h('span', null, 'Пернелер: → келесі · ← артқа · K қазақша · F толық экран'));

    app.append(nav, hero, marquee, howSec, lessonSec, teamSec, insideSec, foot);
    G.fx(hero, 'stars');
    if (section) setTimeout(() => scrollTo(section), 60); else window.scrollTo(0, 0);
  };

  /* ---------- Scene types ---------- */
  // Film: black title sequence with a canvas effect and words rising one by one
  G.SCENES.film = (inner, def, api, el) => {
    const L = api.lesson;
    const fx = G.fx(el, def.fx || L.fx || 'stars', { colors: L.colors, speed: def.fx === 'warp' || L.fx === 'warp' ? .8 : 1 });
    let step = 0;
    const box = h('div', { style: { minHeight: '52vh', display: 'grid', placeItems: 'center', width: '100%' } });
    inner.append(box);
    let auto = null;
    const names = def.roll ? G.S.students.map(s => s.name) : [];
    const R = def.roll && names.length ? 1 : 0, N = def.lines.length + R;
    function render() {
      box.innerHTML = '';
      if (auto) { clearTimeout(auto); auto = null; }
      if (R && step === def.lines.length) {
        let k = 0;
        const show = () => {
          box.innerHTML = '';
          if (k < names.length) {
            const T = G.S.teams[(G.S.students[k] || {}).team];
            const el2 = h('div', { class: 'display', style: { color: T ? T.color : 'var(--moon)', textShadow: '0 0 50px currentColor' } }, names[k]);
            box.append(el2);
            el2.animate([{ opacity: 0, transform: 'scale(1.35)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
            G.sfx('blip'); fx.set(1.5 + k * .25);
            k++; auto = api.after(show, 520);
          } else {
            box.append(G.split('Every one of you has a *superpower.*', { cls: 'headline', stagger: .1 }));
            box.firstChild.style.color = 'var(--moon)'; box.firstChild.style.maxWidth = '16ch';
            G.sfx('whoosh');
            auto = api.after(() => { step++; render(); }, 2800);
          }
        };
        show();
        return;
      }
      if (step < def.lines.length) {
        box.append(G.split(def.lines[step], { cls: 'headline', stagger: .09 }));
        box.firstChild.style.color = 'var(--moon)'; box.firstChild.style.maxWidth = '16ch';
        G.sfx('whoosh');
        fx.set(1 + step * .6);
        if (auto) clearTimeout(auto);
        auto = api.after(() => { step++; render(); }, def.pace || 2600);
      } else {
        fx.set(.5);
        const chip = G.chip(L, { tag: 'div', size: 'clamp(110px,12vw,150px)', cls: 'spin-in' });
        box.append(h('div', { class: 'lines', style: { gap: '14px' } },
          h('div', { class: 'eyebrow', style: { animation: 'rise 1s var(--ease) both' } }, def.kicker),
          h('h1', { class: 'display grad shimmer' }, def.title),
          h('div', { class: 'lede', style: { color: 'var(--moon-2)', animation: 'rise 1.2s .5s var(--ease) both' } }, def.sub),
          h('div', { class: 'chipwrap', style: { marginTop: '10px' } }, h('span', { class: 'shock', style: { animationDelay: '.9s' } }), h('span', { class: 'shock', style: { animationDelay: '1.2s' } }), chip),
          G.kk(def.kk)));
        G.sfx('unlock'); setTimeout(() => G.sfx('boom'), 900);
        api.hint('Сабақтың тақырыбы. Бастау үшін → басыңыз.');
      }
    }
    render();
    return {
      next: () => { if (step < N) { step++; render(); return true; } return false; },
      prev: () => { if (step > 0) { step--; render(); return true; } return false; }
    };
  };

  // Explain: one big statement per beat, words rise in
  G.SCENES.explain = (inner, def) => {
    let b = 0;
    const body = h('div', { style: { minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%' } });
    const dots = h('div', { class: 'beats', 'aria-hidden': 'true' }, def.beats.map(() => h('i')));
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, h('div', { class: 'eyebrow', style: { animation: 'rise .8s var(--ease) both' } }, def.kicker), G.split(def.title, { cls: 'headline' })), body, dots);
    function render() {
      const be = def.beats[b];
      body.innerHTML = '';
      const cls = be.size || (be.lines.length > 2 || be.lines.some(l => G.plain(l).length > 30) ? 'mid' : 'big');
      let d = 0;
      body.append(h('div', { class: 'lines', style: { gap: '.1em' } }, be.lines.map(l => { const s = G.split(l, { cls, delay: d, stagger: .06 }); d += G.plain(l).split(/\s+/).length * .06 + .1; return s; })));
      if (be.note) body.append(h('div', { class: 'note', style: { animation: 'rise .9s ' + (d + .1).toFixed(2) + 's var(--ease) both' }, html: G.fmt(be.note) }));
      if (be.kk) body.append(G.kk(be.kk));
      body.append(G.sayBtn(be.say || be.lines.join('. ')));
      [...dots.children].forEach((x, k) => x.classList.toggle('on', k === b));
    }
    render();
    return {
      next: () => { if (b < def.beats.length - 1) { b++; render(); G.sfx('swish'); return true; } return false; },
      prev: () => { if (b > 0) { b--; render(); return true; } return false; }
    };
  };

  // Quiz: the class answers, the teacher reveals and gives points
  G.SCENES.quiz = (inner, def, api) => {
    const L = api.lesson;
    const items = (def.shuffle === false ? def.items.slice() : G.shuffle(def.items)).slice(0, def.count || 99);
    const pts = def.pts || 100;
    const awards = items.map(() => new Set());
    let i = 0, revealed = false, ring = null;
    const eyebrow = h('div', { class: 'eyebrow' });
    const top = h('div', { class: 'qtop' }, eyebrow);
    const qEl = h('div', { style: { maxWidth: '1040px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' } });
    const opts = h('div', { class: 'opts' });
    const foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '120px', width: '100%' } });
    inner.append(top, qEl, opts, foot);
    function show() {
      revealed = false;
      const it = items[i];
      eyebrow.textContent = (def.title || 'Quick check') + ' · ' + (i + 1) + ' / ' + items.length;
      if (def.timer) { if (ring) { ring.stop(); ring.el.remove(); } ring = G.ring(def.timer); top.append(ring.el); ring.start(); }
      qEl.innerHTML = '';
      if (it.pre) qEl.append(it.pre());
      const len = G.plain(it.q).length;
      qEl.append(G.split(it.q, { cls: len < 30 ? 'big' : len < 64 ? 'mid' : 'small-q', stagger: .05 }));
      if (it.say) { qEl.append(G.sayBtn(it.say)); setTimeout(() => G.speak(it.say), 300); }
      opts.innerHTML = '';
      const order = it.fixed ? it.o.map((t, k) => ({ t, k })) : G.shuffle(it.o.map((t, k) => ({ t, k })));
      const d0 = .25 + len * .006;
      order.forEach((op, n) => {
        const b = h('button', { class: 'opt', type: 'button', style: { animation: 'rise .8s ' + (d0 + n * .09).toFixed(2) + 's var(--ease) both' }, onclick: () => reveal(op.k) }, h('span', { class: 'L' }, 'ABCD'[n]), h('span', { html: G.fmt(op.t) }));
        b._k = op.k; opts.append(b);
      });
      foot.innerHTML = '';
      G.lastPick = null;
      foot.append(h('div', { style: { display: 'flex', gap: '26px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' } },
        h('button', { class: 'reveal-btn', onclick: () => G.pickStudent() }, '🎯 Кім жауап береді?'),
        h('button', { class: 'reveal-btn', onclick: () => reveal(-1) }, 'Жауапты көрсету →')));
      api.hint('🎯 (немесе N) — барабан жауап беретін оқушыны таңдайды. Ол ауызша жауап береді. Сосын → — дұрыс жауап.');
    }
    function reveal(k) {
      if (revealed) return; revealed = true;
      if (ring) ring.stop();
      const it = items[i];
      let rightBtn = null;
      [...opts.children].forEach(b => { b.classList.add(b._k === it.a ? 'right' : b._k === k ? 'wrong' : 'dim'); if (b._k === it.a) rightBtn = b; });
      const g = qEl.querySelector('.gap');
      if (g) { g.innerHTML = G.fmt('*' + G.plain(it.o[it.a]) + '*'); g.classList.add('fill'); }
      G.sfx(k === -1 || k === it.a ? 'ok' : 'bad');
      if (rightBtn) setTimeout(() => G.burstAt(rightBtn, (L && L.colors || []).concat(['#30d158', '#ffd60a']), 60), 60);
      foot.innerHTML = '';
      if (it.e) foot.append(h('div', { class: 'why', style: { animation: 'rise .7s var(--ease) both' }, html: G.fmt(it.e) }));
      if (it.k) foot.append(G.kk(it.k));
      let pk = G.picker(pts, awards[i]);
      if (G.lastPick != null && G.S.students[G.lastPick]) {
        const s = G.S.students[G.lastPick], t = s.team;
        const star = h('button', { class: 'pill', style: { animation: 'rise .6s var(--ease) both' }, onclick: () => {
          s.stars = (s.stars || 0) + 1; G.save(); star.disabled = true; star.textContent = '⭐ ' + s.name + ' · ' + s.stars;
          G.burstAt(star, ['#ffd60a', '#ffffff', '#ff9f0a'], 70); G.sfx('ok');
          if (t >= 0 && !awards[i].has(t)) { awards[i].add(t); G.award(t, pts, star); const np = G.picker(pts, awards[i]); pk.replaceWith(np); pk = np; }
        } }, '⭐ ' + s.name + ' дұрыс тапты');
        foot.append(star);
      }
      foot.append(pk);
      api.hint('Дұрыс тапқан командаларды басыңыз (+' + pts + '). Сосын → — ' + (i < items.length - 1 ? 'келесі сұрақ.' : 'келесі бөлім.'));
    }
    show();
    return {
      next: () => { if (!revealed) { reveal(-1); return true; } if (i < items.length - 1) { i++; show(); G.sfx('swish'); return true; } return false; },
      prev: () => { if (i > 0) { i--; show(); return true; } return false; },
      key: e => {
        if (revealed) return false;
        const idx = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(String(e.key).toLowerCase());
        if (idx >= 0 && opts.children[idx]) { opts.children[idx].click(); return true; }
        return false;
      }
    };
  };

  // Task: pair or group work with a clock
  G.SCENES.task = (inner, def, api) => {
    const total = (def.minutes || 3) * 60;
    let left = total, running = false, id = null;
    const clock = h('div', { class: 'clock' });
    const draw = () => { clock.textContent = Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0'); };
    const btn = h('button', { class: 'pill dark', onclick: () => { running ? pause() : start(); } }, 'Бастау');
    const start = () => { running = true; btn.textContent = 'Тоқтату'; const t0 = Date.now(), from = left; id = setInterval(() => { left = Math.max(0, from - (Date.now() - t0) / 1000); draw(); if (left <= 0) { pause(); G.sfx('tick'); G.toast('Уақыт бітті!'); G.burstAt(clock); } }, 250); };
    const pause = () => { running = false; btn.textContent = 'Бастау'; if (id) clearInterval(id); id = null; };
    api.onLeave(pause);
    draw();
    inner.append(
      h('div', { class: 'lines', style: { gap: '6px' } }, h('div', { class: 'eyebrow' }, def.kicker), G.split(def.title, { cls: 'headline' }), def.note ? h('div', { class: 'note', style: { animation: 'rise .9s .4s var(--ease) both' }, html: G.fmt(def.note) }) : null, G.kk(def.kk)),
      h('div', { class: 'taskgrid' },
        h('div', { class: 'card', style: { animation: 'rise .9s .3s var(--ease) both' } }, h('div', { class: 'eyebrow', style: { marginBottom: '14px' } }, 'Сұрақтар'), h('div', { class: 'plist' }, def.prompts.map((p, n) => h('div', { style: { animation: 'rise .7s ' + (.5 + n * .1) + 's var(--ease) both' } }, G.sayBtn(p), h('span', { html: G.fmt(p) }))))),
        h('div', { class: 'card', style: { display: 'flex', flexDirection: 'column', gap: '16px', animation: 'rise .9s .45s var(--ease) both' } },
          h('div', { class: 'eyebrow' }, 'Үлгі диалог'),
          def.model ? h('div', { class: 'chat', style: { padding: 0 } }, def.model.map((m, n) => h('div', { class: n % 2 ? 'bout' : 'bin', style: { animationDelay: (.8 + n * .45) + 's' } }, m))) : null,
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '18px', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 'auto' } }, clock, h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center' } }, btn, h('button', { class: 'link', onclick: () => { pause(); left = total; draw(); } }, 'Қайта'))))));
    return {};
  };

  // Unlock: the power chip spins in, shock rings, standings count up
  G.SCENES.unlock = (inner, def, api, el) => {
    const L = G.LESSONS[def.lesson];
    G.S.done[def.lesson] = true; G.save();
    G.fx(el, 'orbs', { colors: L.colors });
    G.fx(el, 'stars');
    G.sfx('whoosh'); setTimeout(() => { G.sfx('boom'); G.sfx('unlock'); }, 1100); setTimeout(() => G.confetti(140), 1300);
    const nextL = G.LESSONS[G.ORDER[G.ORDER.indexOf(def.lesson) + 1]];
    const ranked = G.S.teams.map((T, t) => ({ T, t })).sort((a, b) => b.T.score - a.T.score);
    const max = Math.max(1, ...ranked.map(r => r.T.score));
    const bars = [];
    inner.append(
      h('div', { class: 'chipwrap' }, [0, .25, .5].map(d => h('span', { class: 'shock', style: { animationDelay: (1.1 + d) + 's' } })), G.chip(L, { tag: 'div', size: 'clamp(170px,22vw,260px)', cls: 'spin-in' })),
      h('h2', { class: 'display grad shimmer', style: { animationDelay: '1.2s, 2.8s' } }, def.line || L.title + ' unlocked.'),
      def.note ? h('p', { class: 'lede', style: { animation: 'rise 1s 1.6s var(--ease) both' } }, def.note) : null,
      G.kk(def.kk),
      h('div', { class: 'awards' }, ranked.map((r, n) => {
        const bar = h('i', { style: { width: '0%', '--c': r.T.color } }), sc = h('span', { class: 'sc' }, '0');
        bars.push([bar, sc, r.T.score]);
        return h('div', { class: 'arow', style: { animationDelay: (1.9 + n * .14) + 's' } },
          h('span', { class: 'pl' }, n + 1), h('span', { class: 'nm' }, h('span', { class: 'dot', style: { '--c': r.T.color } }), r.T.emoji + ' ' + r.T.name),
          h('span', { class: 'bar' }, bar), sc);
      })),
      h('div', { style: { animation: 'rise 1s 2.4s var(--ease) both' } }, G.practiceCard(true)),
      h('div', { style: { display: 'flex', gap: '26px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', animation: 'rise 1s 2.6s var(--ease) both' }, class: 'on-dark' },
        nextL ? h('button', { class: 'pill light', onclick: () => G.play(nextL.id, 0) }, nextL.n + '-сабақ: ' + nextL.title) : null,
        h('button', { class: 'link', onclick: () => G.home('lessons') }, 'Басты бет')));
    api.after(() => bars.forEach(([bar, sc, v], n) => setTimeout(() => { bar.style.width = (v / max * 100) + '%'; G.countUp(sc, 0, v, null, 1200); }, n * 140)), 2100);
    return {};
  };

  /* ---------- More scene types ---------- */
  // Class vs Boss: the whole group fights one villain together
  G.SCENES.boss = (inner, def, api, el) => {
    const L = api.lesson;
    G.fx(el, 'stars');
    const items = G.shuffle(def.items).slice(0, def.count || 8);
    const hits = Math.ceil(items.length * .75), MAXH = 4;
    let i = 0, hp = 100, hearts = MAXH, st = 0, over = false;
    const vEmoji = h('div', { class: 'boss-emoji' }, def.emoji);
    const hpBar = h('i', { style: { width: '100%' } });
    const heartsEl = h('div', { class: 'boss-hearts' });
    const qEl = h('div', { style: { maxWidth: '1000px', minHeight: '1.4em' } }), opts = h('div', { class: 'opts' });
    const foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '90px' } });
    const drawHearts = () => { heartsEl.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(MAXH - hearts); };
    inner.append(
      h('div', { class: 'boss-top' },
        h('div', { class: 'boss-side' }, h('div', { class: 'eyebrow' }, (G.S.group || 'Сынып') + ' · бүкіл топ'), heartsEl),
        h('div', { class: 'boss-side', style: { alignItems: 'center' } }, vEmoji, h('div', { class: 'eyebrow' }, def.villain), h('div', { class: 'boss-hp' }, hpBar))),
      qEl, opts, foot);
    drawHearts();
    function show() {
      st = 0;
      const it = items[i];
      qEl.innerHTML = ''; qEl.append(G.split(it.q, { cls: G.plain(it.q).length < 40 ? 'mid' : 'small-q', stagger: .05 }));
      opts.innerHTML = '';
      G.shuffle(it.o.map((t, k) => ({ t, k }))).forEach((op, n) => { const b = h('button', { class: 'opt', style: { animation: 'rise .7s ' + (.2 + n * .08) + 's var(--ease) both' }, onclick: () => reveal(op.k) }, h('span', { class: 'L' }, 'ABC'[n]), h('span', { html: G.fmt(op.t) })); b._k = op.k; opts.append(b); });
      foot.innerHTML = '';
      api.hint('Бүкіл сынып бірге ойлап, бір жауап айтады. → — дұрыс жауап. Дұрыс болса — зұлымға соққы, қате болса — сынып жүрегін жоғалтады.');
    }
    function reveal(k) {
      if (st) return; st = 1;
      const it = items[i];
      [...opts.children].forEach(b => b.classList.add(b._k === it.a ? 'right' : b._k === k ? 'wrong' : 'dim'));
      const g = qEl.querySelector('.gap'); if (g) { g.innerHTML = G.fmt('*' + G.plain(it.o[it.a]) + '*'); g.classList.add('fill'); }
      foot.innerHTML = '';
      foot.append(h('div', { style: { display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' } },
        h('button', { class: 'pill', onclick: () => decide(true) }, '✓ Сынып дұрыс тапты'),
        h('button', { class: 'pill light', onclick: () => decide(false) }, '✗ Қате айтты')));
      if (k !== -1) decide(k === it.a);
      else api.hint('Сынып дұрыс айтты ма? Батырманы басыңыз.');
    }
    function decide(ok) {
      if (st !== 1 || over) return; st = 2;
      foot.innerHTML = '';
      if (ok) {
        hp = Math.max(0, hp - 100 / hits); hpBar.style.width = hp + '%';
        vEmoji.animate([{ transform: 'translateX(-14px) rotate(-8deg)' }, { transform: 'translateX(14px) rotate(8deg)' }, { transform: 'none' }], { duration: 450 });
        G.sfx('boom'); G.burstAt(vEmoji, ['#ff453a', '#ffd60a', '#ffffff'], 90);
        foot.append(h('div', { class: 'headline grad', style: { animation: 'pop .5s cubic-bezier(.2,1.4,.4,1) both' } }, G.pick(['POW!', 'BOOM!', 'WHAM!', 'ZAP!'])));
      } else {
        hearts--; drawHearts(); G.sfx('bad');
        heartsEl.animate([{ transform: 'scale(1.3)' }, { transform: 'none' }], { duration: 400 });
        foot.append(h('div', { class: 'mid', style: { color: 'var(--red)' } }, def.taunt || 'Ha-ha! Try again!'));
      }
      if (hp <= 0) return end(true);
      if (hearts <= 0) return end(false);
      api.hint('→ — келесі сұрақ.');
    }
    function end(win) {
      over = true; opts.innerHTML = ''; qEl.innerHTML = ''; foot.innerHTML = '';
      if (win) {
        vEmoji.textContent = '💥'; G.sfx('fanfare'); G.fx(el, 'fireworks', { colors: (L && L.colors || []).concat(['#ffd60a', '#ffffff']) });
        qEl.append(h('div', { class: 'display grad shimmer' }, 'Victory!'));
        foot.append(h('div', { class: 'lede', style: { color: 'var(--moon-2)' } }, 'Бүкіл топ бірге жеңді! Әр командаға +200.'));
        G.S.teams.forEach((T, t) => setTimeout(() => G.award(t, 200, vEmoji), t * 250));
      } else {
        G.sfx('bad');
        qEl.append(h('div', { class: 'display', style: { color: 'var(--moon)' } }, 'Not this time…'));
        foot.append(h('div', { class: 'lede', style: { color: 'var(--moon-2)' } }, 'Зұлым бұл жолы қашып кетті. Ережені қайталап, тағы көріңдер!'), h('button', { class: 'pill light', onclick: () => api.go(api.index) }, '↻ Қайта шайқасу'));
      }
      api.hint('→ — келесі бөлім.');
    }
    show();
    return {
      next: () => {
        if (over) return false;
        if (st === 0) { reveal(-1); return true; }
        if (st === 1) { G.toast('Алдымен басыңыз: ✓ дұрыс немесе ✗ қате'); return true; }
        if (i < items.length - 1) { i++; show(); return true; }
        end(hp <= 34); return true;
      }
    };
  };

  // Reading: a text that opens paragraph by paragraph
  G.SCENES.read = (inner, def, api) => {
    let p = 0;
    const box = h('div', { class: 'readbox' });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, h('div', { class: 'eyebrow' }, def.kicker), G.split(def.title, { cls: 'headline' })), G.kk(def.kk), box,
      h('button', { class: 'reveal-btn', onclick: () => G.speak(def.paras.join(' ')) }, '🔈 Бүкіл мәтінді тыңдау'));
    function add() {
      const t = def.paras[p];
      const para = h('div', { class: 'para' }, G.sayBtn(t), G.split(t, { tag: 'p', stagger: .018 }));
      box.append(para);
      setTimeout(() => para.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      api.hint(p < def.paras.length - 1 ? 'Абзацты бірге оқыңдар (🔈 — тыңдау). → — келесі абзац.' : 'Мәтін аяқталды. → — сұрақтар.');
    }
    add();
    return { next: () => { if (p < def.paras.length - 1) { p++; add(); return true; } return false; } };
  };

  // Dictation: hear it, write it, check it word by word
  G.SCENES.dictation = (inner, def, api) => {
    const items = def.items, awards = items.map(() => new Set());
    let i = 0, open = false;
    const ey = h('div', { class: 'eyebrow' }), out = h('div', { style: { minHeight: '2.6em', maxWidth: '1000px' } }), foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '80px' } });
    const play = h('button', { class: 'play', 'aria-label': 'Тыңдау' }, '▶');
    const doPlay = rate => { play.classList.add('on'); G.speak(items[i], { rate, onend: () => play.classList.remove('on') }); };
    play.onclick = () => doPlay();
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, ey, G.split('Listen. *Write.* Check.', { cls: 'headline' })),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '26px' } }, play, h('button', { class: 'link', onclick: () => doPlay(.6) }, 'Баяулау')), out, foot);
    function show() {
      open = false; ey.textContent = 'Dictation · ' + (i + 1) + ' / ' + items.length;
      out.innerHTML = ''; out.append(h('div', { class: 'mid', style: { color: 'var(--ink-3)', letterSpacing: '.1em' } }, items[i].split(' ').map(w => '_'.repeat(Math.min(8, w.length))).join('  ')));
      foot.innerHTML = '';
      api.after(() => doPlay(), 500);
      api.hint('Сөйлемді тыңдаңдар (2–3 рет). Әр команда дәптерге жазады. → — дұрыс жазылуы ашылады.');
    }
    function reveal() {
      open = true; out.innerHTML = '';
      out.append(G.split(items[i], { cls: 'mid', stagger: .12 }));
      G.sfx('ok');
      foot.innerHTML = ''; foot.append(G.picker(100, awards[i], 'Қатесіз жазған командаларды басыңыз.'));
      api.hint('Қатесіз жазған командаларды басыңыз. → — келесі сөйлем.');
    }
    show();
    return { next: () => { if (!open) { reveal(); return true; } if (i < items.length - 1) { i++; show(); return true; } return false; } };
  };

  // Recap: what did we learn today?
  G.SCENES.recap = (inner, def, api) => {
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, h('div', { class: 'eyebrow' }, 'Recap'), G.split('What did we *learn* today?', { cls: 'headline' })),
      h('div', { class: 'recap-rules' }, def.rules.map((r, n) => h('div', { style: { animation: 'rise .8s ' + (.4 + n * .12) + 's var(--ease) both' }, html: G.fmt(r) }))),
      h('div', { class: 'card', style: { maxWidth: '900px', width: '100%', textAlign: 'left', animation: 'rise .9s 1s var(--ease) both' } },
        h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Сөйлемді аяқта'),
        h('div', { class: 'plist' }, def.starters.map(s => h('div', null, G.sayBtn(s), h('span', { html: G.fmt(s) }))))),
      h('button', { class: 'pill', onclick: () => G.pickStudent() }, '🎯 Кім айтады?'), G.kk(def.kk));
    api.hint('🎯 — барабан оқушыны таңдайды, ол бір сөйлемді аяқтайды. 3 оқушыға қайталаңыз. Сосын → басыңыз.');
    return {};
  };

  // Stand up if it's true for you
  G.SCENES.standup = (inner, def, api) => {
    let i = 0;
    const ey = h('div', { class: 'eyebrow' }), stage = h('div', { style: { minHeight: '46vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px' } });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, ey, G.split('Stand up if it\'s *true* for you!', { cls: 'headline' })), G.kk('Сөйлем саған шын болса — орныңнан тұр! Мұғалім тұрғандардан сұрайды: «Can you swim?» — «Yes, I can!»'), stage);
    function show() {
      const [e, s] = def.items[i];
      ey.textContent = 'Stand up! · ' + (i + 1) + ' / ' + def.items.length;
      stage.innerHTML = '';
      const em = h('div', { style: { fontSize: 'clamp(80px,12vw,150px)', lineHeight: 1 } }, e);
      stage.append(em, G.split(s, { cls: 'big', delay: .2 }), G.sayBtn(s));
      em.animate([{ transform: 'scale(.3) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1 }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,1.4,.4,1)' });
      G.sfx('whoosh'); setTimeout(() => G.speak(s), 400);
      api.hint('Шын болса — тұрыңдар! Тұрған екі оқушыдан сұраңыз: «Can you …?». Сосын → — келесі сөйлем.');
    }
    show();
    return { next: () => { if (i < def.items.length - 1) { i++; show(); return true; } return false; }, prev: () => { if (i > 0) { i--; show(); return true; } return false; } };
  };

  // Unscramble: words fly into the right order
  G.SCENES.unscramble = (inner, def, api) => {
    const items = def.items, awards = items.map(() => new Set());
    let i = 0, open = false, chips = [];
    const ey = h('div', { class: 'eyebrow' }), row = h('div', { class: 'scr' }), foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '90px' } });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, ey, G.split('Put the words in *order*.', { cls: 'headline' })), G.kk('Сөздерді дұрыс ретке қойыңдар. Командалар сөйлемді дауыстап айтады.'), row, foot);
    function show() {
      open = false; ey.textContent = 'Unscramble · ' + (i + 1) + ' / ' + items.length;
      const words = items[i].replace(/[.?!]$/, '').split(' ');
      let order = G.shuffle(words.map((w, k) => k));
      if (order.every((k, n) => k === n)) order = order.reverse();
      row.innerHTML = '';
      chips = words.map((w, k) => { const c = h('span', { class: 'scr-chip' }, w); c._k = k; return c; });
      order.forEach((k, n) => { const c = chips[k]; c.style.animation = 'pop .5s ' + (n * .07) + 's cubic-bezier(.2,1.4,.4,1) both'; c.style.rotate = ((Math.random() - .5) * 14) + 'deg'; row.append(c); });
      foot.innerHTML = '';
      api.hint('Командалар сөйлемді дұрыс ретпен айтады. → — сөздер орнына ұшып барады.');
    }
    function reveal() {
      open = true;
      const first = chips.map(c => c.getBoundingClientRect());
      chips.forEach(c => { c.style.animation = 'none'; row.append(c); });
      chips.forEach((c, k) => {
        const r0 = first[k], r1 = c.getBoundingClientRect();
        c.style.rotate = '0deg'; c.classList.add('ok');
        c.animate([{ transform: 'translate(' + (r0.left - r1.left) + 'px,' + (r0.top - r1.top) + 'px)' }, { transform: 'none' }], { duration: 700, delay: k * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
      G.sfx('ok'); setTimeout(() => { G.burstAt(row, null, 60); G.speak(items[i]); }, 700 + chips.length * 60);
      foot.innerHTML = ''; foot.append(G.picker(100, awards[i]));
      api.hint('Дұрыс айтқан командаларды басыңыз. → — келесі сөйлем.');
    }
    show();
    return { next: () => { if (!open) { reveal(); return true; } if (i < items.length - 1) { i++; show(); return true; } return false; } };
  };

  // Memory: flip two cards, find a pair
  G.SCENES.memory = (inner, def, api) => {
    const T = G.S.teams;
    let turn = 0, openC = [], found = 0, lock = false;
    const cards = G.shuffle(def.pairs.flatMap((p, k) => [{ t: p[0], k }, { t: p[1], k }]));
    const turnEl = h('div'), grid = h('div', { class: 'mem' });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, h('div', { class: 'eyebrow' }, def.kicker || 'Memory'), G.split(def.title || 'Find the *pairs*.', { cls: 'headline' })), G.kk(def.kk), turnEl, grid);
    const drawTurn = () => { const x = T[turn]; turnEl.innerHTML = ''; turnEl.append(h('span', { class: 'tp on' }, h('span', { class: 'dot', style: { '--c': x.color } }), 'Кезек: ' + x.emoji + ' ' + x.name)); };
    cards.forEach((c, n) => {
      const el = h('button', { class: 'mcard', style: { animation: 'pop .5s ' + (n * .04) + 's cubic-bezier(.2,1.4,.4,1) both' } }, h('span', { class: 'mback' }, '?'), h('span', { class: 'mface' }, c.t));
      el.onclick = () => {
        if (lock || el.classList.contains('open') || el.classList.contains('done')) return;
        el.classList.add('open'); G.sfx('tap'); openC.push({ el, c });
        if (openC.length === 2) {
          lock = true;
          const [a, b] = openC;
          if (a.c.k === b.c.k) {
            setTimeout(() => { a.el.classList.add('done'); b.el.classList.add('done'); G.sfx('ok'); G.burstAt(b.el, [T[turn].color, '#ffd60a'], 40); G.award(turn, 100, b.el); G.speak(def.pairs[a.c.k].join(' ')); found++; openC = []; lock = false; if (found === def.pairs.length) { G.confetti(120); api.hint('Барлық жұп табылды! → — келесі бөлім.'); } }, 450);
          } else {
            setTimeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); G.sfx('bad'); openC = []; lock = false; turn = (turn + 1) % T.length; drawTurn(); }, 1100);
          }
        }
      };
      grid.append(el);
    });
    drawTurn();
    api.hint('Команда екі карточканы таңдайды. Жұбы болса — +100 және тағы ойнайды. Болмаса — кезек келесі командаға. Біткенде → басыңыз.');
    return {};
  };

  // Blur guess: a picture slowly comes into focus
  G.SCENES.blur = (inner, def, api) => {
    const items = def.items, awards = items.map(() => new Set());
    let i = 0, open = false;
    const ey = h('div', { class: 'eyebrow' }), pic = h('div', { class: 'blurpic' }), ans = h('div', { style: { minHeight: '1.3em' } }), foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '80px' } });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, ey, G.split('What is *it*?', { cls: 'headline' })), G.kk('Сурет біртіндеп анықталады. Бірінші болып ағылшынша айтқан команда жеңеді!'), pic, ans, foot);
    function show() {
      open = false; ey.textContent = 'Blur guess · ' + (i + 1) + ' / ' + items.length;
      pic.textContent = items[i][0]; ans.innerHTML = ''; foot.innerHTML = '';
      pic.getAnimations().forEach(a => a.cancel());
      pic.animate([{ filter: 'blur(38px)', transform: 'scale(2.4)' }, { filter: 'blur(0)', transform: 'scale(1)' }], { duration: 9000, easing: 'cubic-bezier(.3,0,.3,1)', fill: 'forwards' });
      api.hint('Сурет анықталып жатыр — бірінші айтқан команда жеңеді! → — жауап.');
    }
    function reveal() {
      open = true;
      pic.getAnimations().forEach(a => a.finish());
      ans.append(G.split('*' + items[i][1] + '*', { cls: 'big' }));
      G.sfx('ok'); G.speak(items[i][1]); G.burstAt(pic, null, 60);
      foot.append(G.picker(100, awards[i], 'Бірінші дұрыс айтқан команданы басыңыз.'));
      api.hint('Дұрыс айтқан команданы басыңыз. → — келесі сурет.');
    }
    show();
    return { next: () => { if (!open) { reveal(); return true; } if (i < items.length - 1) { i++; show(); return true; } return false; } };
  };

  /* ---------- Phone practice (open the site with #practice) ---------- */
  G.PRACTICE_URL = 'https://diyorbekashurbekov.github.io/english/#practice';
  G.qr = (url, size) => {
    const box = h('div', { class: 'qr' });
    try { if (window.QRCode) { new window.QRCode(box, { text: url, width: size || 160, height: size || 160, colorDark: '#000000', colorLight: '#ffffff' }); return box; } } catch (e) {}
    box.append(h('div', { style: { fontSize: '13px', wordBreak: 'break-all', color: '#000', padding: '8px' } }, url));
    return box;
  };
  G.practiceCard = dark => h('div', { class: 'practice-card' + (dark ? ' on-dark' : '') }, G.qr(G.PRACTICE_URL, 150),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' } },
      h('b', { style: { fontSize: '20px', letterSpacing: '-.02em' } }, '📱 Телефонмен жаттығу'),
      h('span', { class: 'muted', style: { fontSize: '15px' } }, 'Камерамен QR-кодты сканерле — үйде өз бетіңше квиз ойна.'),
      h('a', { href: G.PRACTICE_URL, target: '_blank', rel: 'noopener', class: 'link', style: { fontSize: '14px' } }, 'Сілтеме')));
  const PRACTICE = { power: ['can', 'adv', 'pron'], time: ['waswere', 'could', 'born', 'adj'], connect: ['vn', 'prep', 'req'] };
  G.practice = () => {
    if (D) { clearScene(); document.removeEventListener('keydown', onKey); D = null; }
    document.body.style.overflow = '';
    const app = $('#app'); app.innerHTML = '';
    const wrap = h('div', { class: 'wrap pr' });
    app.append(h('nav', { class: 'nav' }, h('div', { class: 'wrap' }, h('button', { class: 'wordmark', onclick: () => { history.replaceState(null, '', location.pathname); G.home(); } }, 'Super U'), h('span', { class: 'sp' }), h('span', { class: 'muted', style: { fontSize: '13px' } }, 'Practice'))), wrap);
    function menu() {
      wrap.innerHTML = '';
      wrap.append(h('h1', { class: 'headline', style: { marginTop: '30px' } }, 'Practice.'), h('p', { class: 'lede' }, 'Сабақты таңда — 10 сұрақ, бірден жауабы.'),
        h('div', { class: 'pr-lessons' }, G.ORDER.map(id => { const L = G.LESSONS[id]; return h('button', { class: 'pr-l', style: { '--g': L.grad }, onclick: () => run(id) }, h('span', { class: 'grad', style: { fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '30px', letterSpacing: '-.03em' } }, L.title), h('span', { class: 'muted' }, L.grammar)); })));
    }
    function run(id) {
      const L = G.LESSONS[id];
      const pool = G.shuffle([].concat(...PRACTICE[id].map(k => G.BANK[k] || []))).slice(0, 10);
      let i = 0, right = 0;
      const q = () => {
        const it = pool[i];
        wrap.innerHTML = '';
        const opts = G.shuffle(it.o.map((t, k) => ({ t, k })));
        const fb = h('div');
        wrap.append(h('div', { class: 'eyebrow', style: { marginTop: '26px' } }, L.title + ' · ' + (i + 1) + ' / ' + pool.length + ' · ✓ ' + right),
          h('div', { class: 'small-q', style: { margin: '14px 0 18px' }, html: G.fmt(it.q) }),
          h('div', { class: 'opts', style: { gridTemplateColumns: '1fr' } }, opts.map((op, n) => {
            const b = h('button', { class: 'opt', onclick: () => {
              if (fb.childNodes.length) return;
              const ok = op.k === it.a; if (ok) right++;
              [...b.parentNode.children].forEach((x, m) => x.classList.add(opts[m].k === it.a ? 'right' : x === b ? 'wrong' : 'dim'));
              G.sfx(ok ? 'ok' : 'bad'); if (ok) G.burstAt(b, null, 40);
              fb.append(h('div', { class: 'why', style: { margin: '14px 0', textAlign: 'left' }, html: G.fmt((ok ? '✓ ' : '✗ ') + (it.e || '')) }), G.kk(it.k),
                h('button', { class: 'pill', style: { marginTop: '14px' }, onclick: () => { i++; i < pool.length ? q() : end(); } }, i < pool.length - 1 ? 'Келесі →' : 'Нәтиже →'));
            } }, h('span', { class: 'L' }, 'ABC'[n]), h('span', { html: G.fmt(op.t) }));
            return b;
          })), fb);
        window.scrollTo(0, 0);
      };
      const end = () => {
        wrap.innerHTML = '';
        const stars = right >= 9 ? 3 : right >= 7 ? 2 : 1;
        wrap.append(h('div', { style: { textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' } },
          h('div', { style: { fontSize: '56px' } }, '⭐'.repeat(stars)), h('h2', { class: 'display grad', style: { '--g': L.grad } }, right + ' / ' + pool.length),
          h('p', { class: 'lede' }, stars === 3 ? 'Керемет! Сен — Super U!' : stars === 2 ? 'Жақсы! Тағы бір рет ойнасаң — 3 жұлдыз.' : 'Ережені қайталап, тағы ойна!'),
          h('div', { style: { display: 'flex', gap: '20px', alignItems: 'center' } }, h('button', { class: 'pill', onclick: () => run(id) }, '↻ Қайта'), h('button', { class: 'link', onclick: menu }, 'Басқа сабақ'))));
        if (stars >= 2) G.confetti(120);
      };
      q();
    }
    menu();
  };

  /* ---------- Start ---------- */
  G.start = () => {
    document.body.classList.toggle('kk-on', !!G.S.kk);
    document.addEventListener('pointerdown', () => G.actx(), { once: true });
    if (location.hash === '#practice') G.practice(); else G.home();
  };
})();
