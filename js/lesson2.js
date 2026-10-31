/* Super U — Lesson 2 · Time: was / were, could / couldn't, was born */
(function () {
  'use strict';
  const h = G.h;
  const Q = list => list.map(x => ({ q: x[0], o: x[1], a: 0, e: x[2] || '', k: x[3] || '' }));
  const eyebrow = t => h('div', { class: 'eyebrow' }, t);
  const head = (k, t) => h('div', { class: 'lines', style: { gap: '4px' } }, eyebrow(k), h('h2', { class: 'headline', html: G.fmt(t) }));
  const col = () => h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px,2.3vh,26px)', width: '100%' } });

  G.BANK.waswere = Q([
    ['I ___ at home yesterday.', ['was', 'were'], 'I → *was*.', 'I → was.'],
    ['They ___ at school.', ['were', 'was'], 'they → *were*.', 'they → were.'],
    ['Where ___ you last night?', ['were', 'was'], 'you → *were*.', 'you → were.'],
    ['She ___ happy.', ['was', 'were'], 'she → *was*.', 'she → was.'],
    ['___ you at the party? — Yes, I was.', ['Were', 'Was'], '*Were* you…?', 'Сұрақ: Were you…?'],
    ['I ___ at school. I was ill. 🤒', ['wasn\'t', 'weren\'t'], 'I → *wasn\'t*.', 'I → wasn\'t.']
  ]);
  G.BANK.could = Q([
    ['I ___ read when I was five.', ['could', 'can'], 'Past → *could*.', 'Өткен шақ → could.'],
    ['He ___ swim when he was two. 👶', ['couldn\'t', 'could'], 'A baby *couldn\'t* swim.', 'Сәби жүзе алмады — couldn\'t.'],
    ['___ you ride a bike when you were six?', ['Could', 'Can'], 'Past → *Could* you…?', 'Өткен шақ → Could you…?'],
    ['Messi ___ play football when he was five. ⚽', ['could', 'can'], 'Past → *could*.', 'Өткен шақ → could.']
  ]);
  G.BANK.born = Q([
    ['I ___ born in 2009.', ['was', 'am'], 'I *was* born.', 'I was born — мен туылдым.'],
    ['When ___ you born?', ['were', 'was'], 'you → *were* born.', 'you → were born.'],
    ['I was born ___ Almaty.', ['in', 'on'], '*in* + city.', 'Қала алдында — in.'],
    ['I was born ___ May 5th.', ['on', 'in'], '*on* + date.', 'Нақты күн алдында — on.']
  ]);

  G.BANK.adj = Q([
    ['🎻 They are very good at music. They are ___.', ['talented', 'expensive'], '*talented* = very good at something.', 'talented — дарынды.'],
    ['💰 Music lessons cost a lot. They are ___.', ['expensive', 'proud'], '*expensive* = costs a lot.', 'expensive — қымбат.'],
    ['🥰 Mum is very ___ of her children.', ['proud', 'rich'], '*proud* of.', 'proud of — мақтан тұту.'],
    ['🏆 They work hard. They are ___.', ['successful', 'normal'], '*successful* = good results.', 'successful — табысты.'],
    ['😎 Music is ___!', ['cool', 'full-time'], '*cool* = great.', 'cool — керемет.']
  ]);
  const TF = [
    ['All the children can play music.', true, 'Yes — they can all play music.'],
    ['Aruzhan can play the piano.', true, 'Yes — she can play it brilliantly.'],
    ['Dana and Arman can sing really well.', false, 'No — they *can\'t* sing at all.'],
    ['The family was on TV.', true, 'Yes — they *were* on TV.'],
    ['The parents are rich.', false, 'No — they *aren\'t* rich.']
  ].map(([q, t, e]) => ({ q, o: ['True ✓', 'False ✗'], a: t ? 0 : 1, e, fixed: true }));
  const READ = [
    'This is the Ospanov family from Almaty. There are seven children. They can all play music!',
    'Aruzhan can play the piano brilliantly. Timur can play the dombra. When he was eleven, he could play the guitar too.',
    'Dana and Arman can play the violin. But they can\'t sing at all! “We sing very badly!” says Dana.',
    'Last year the family was on TV. They were very happy.',
    'The parents aren\'t rich. Music lessons are expensive. But the children work hard. They are talented and successful. Mum is very proud of them.'
  ];

  /* Time machine: now → 1916 */
  const timeMachine = { render(inner, def, api, el) {
    const IT = [
      ['It *is* sunny today.', 'It ___ sunny yesterday.', 'was'],
      ['Where *are* you now?', 'Where ___ you yesterday?', 'were'],
      ['My parents *are* at work.', 'My parents ___ at work last week.', 'were'],
      ['I\'m *not* at school today.', 'I ___ at school yesterday.', 'wasn\'t'],
      ['*Can* you play the guitar?', '___ you play the guitar when you were ten?', 'Could'],
      ['The party *is* fantastic!', 'The party last night ___ fantastic!', 'was'],
      ['Everyone *is* here.', 'Everyone ___ there.', 'was'],
      ['I *can\'t* read.', 'I ___ read when I was two.', 'couldn\'t'],
      ['*Are* you in New York?', '___ you in New York last year?', 'Were'],
      ['They *aren\'t* at home.', 'They ___ at home on Sunday.', 'weren\'t']
    ];
    const awards = IT.map(() => new Set());
    let i = 0, st = 0;
    const ey = eyebrow(''), year = h('div', { class: 'year' }, '2026');
    const nowCard = h('div', { class: 'tm-card tm-now' }), thenHost = h('div', { style: { width: '100%', display: 'flex', justifyContent: 'center', minHeight: '140px' } }), foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '90px' } });
    inner.append(ey, year, nowCard, thenHost, foot);
    function show() {
      st = 0; el.classList.remove('sepia-on'); year.textContent = '2026';
      el.querySelectorAll('.wipe').forEach(w => w.remove());
      ey.textContent = 'Time machine · ' + (i + 1) + ' / ' + IT.length;
      nowCard.innerHTML = ''; nowCard.append(h('div', { class: 'k' }, 'Now'), G.split(IT[i][0], { cls: 'mid' }));
      thenHost.innerHTML = ''; foot.innerHTML = '';
      foot.append(h('button', { class: 'reveal-btn', onclick: travel }, '1916 жылға саяхат →'));
      api.hint('«Қазір» сөйлемін бірге оқыңдар. → басыңыз — уақыт машинасы 1916 жылға апарады.');
    }
    function travel() {
      st = 1; G.sfx('warp');
      const ov = h('div', { class: 'warpov', 'aria-hidden': 'true' });
      el.append(ov);
      G.fx(ov, 'warp', { speed: 3.4, colors: ['#ffffff', '#a95cff', '#2997ff', '#f3e8d2'], cy: .5, trail: .22 });
      api.after(() => ov.remove(), 1550);
      api.after(() => { el.querySelectorAll('.wipe').forEach(w => w.remove()); el.prepend(h('div', { class: 'wipe', 'aria-hidden': 'true' })); }, 900);
      const t0 = performance.now();
      api.loop(t => { const p = Math.min(1, (t - t0) / 1300); year.textContent = String(Math.round(2026 - 110 * (1 - Math.pow(1 - p, 3)))); return p < 1; });
      thenHost.innerHTML = '';
      thenHost.append(h('div', { class: 'tm-card tm-then', style: { animationDelay: '1s' } }, h('div', { class: 'k' }, 'Then'), G.split(IT[i][1], { cls: 'mid', delay: 1.1 })));
      foot.innerHTML = ''; foot.append(h('div', { class: 'note' }, 'Say it in the past.'), G.kk('Сөйлемді өткен шақта айтыңдар: бос орынға қандай сөз келеді?'));
      api.hint('Командалар бос орынға сөз тауып, ауызша айтады. Сосын → — дұрыс жауап.');
    }
    function reveal() {
      st = 2; G.sfx('ok');
      const g = thenHost.querySelector('.gap'); if (g) { g.innerHTML = G.fmt('*' + IT[i][2] + '*'); g.classList.add('fill'); setTimeout(() => G.burstAt(g, ['#b8621b', '#ffd60a', '#a95cff'], 50), 80); }
      foot.innerHTML = '';
      foot.append(h('div', { class: 'why' }, /could/i.test(IT[i][2]) ? 'can → could · can\'t → couldn\'t' : 'am / is → was · are → were'), G.picker(100, awards[i]));
      api.hint('Дұрыс тапқан командаларды басыңыз. Сосын → — ' + (i < IT.length - 1 ? 'келесі сөйлем.' : 'келесі бөлім.'));
    }
    show();
    return {
      next: () => { if (st === 0) { travel(); return true; } if (st === 1) { reveal(); return true; } if (i < IT.length - 1) { i++; show(); return true; } el.classList.remove('sepia-on'); return false; },
      prev: () => { if (st > 0) { show(); return true; } if (i > 0) { i--; show(); return true; } return false; }
    };
  } };

  /* Team relay: was or were in 30 seconds */
  const relay = { render(inner, def, api) {
    const SUBJ = [['I', 'was'], ['You', 'were'], ['He', 'was'], ['She', 'was'], ['We', 'were'], ['They', 'were'], ['My parents', 'were'], ['Picasso', 'was'], ['The children', 'were'], ['Everyone', 'was'], ['Marie Curie', 'was'], ['Ben and Kate', 'were'], ['The party', 'was'], ['My friends', 'were'], ['The weather', 'was'], ['You and I', 'were'], ['My mum', 'was'], ['The superheroes', 'were'], ['The cake', 'was'], ['Nobody', 'was'], ['A lot of people', 'were'], ['The teacher', 'was'], ['The students', 'were'], ['These shoes', 'were'], ['This film', 'was']];
    const TAIL = ['at the party.', 'very happy.', 'at home yesterday.', 'in London last year.', 'tired.', 'there at nine.'];
    const T = G.S.teams, res = T.map(() => ({ c: 0, w: 0 }));
    let t = 0, phase = 'intro', cur = null, ring = null, stopRun = null;
    const view = col(); inner.append(view);
    function intro() {
      phase = 'intro'; view.innerHTML = '';
      view.append(head('Relay', 'Was or were?'),
        h('div', { class: 'note' }, 'Each team has 30 seconds. One student reads the subject and says was or were. The teacher taps the answer they say.'),
        G.kk('Әр командаға 30 секунд. Бір студент бастауышты оқып, was немесе were дейді. Мұғалім айтылған жауапты басады.'),
        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } }, T.map((x, k) => h('span', { class: 'tp' + (k === t ? ' on' : '') }, h('span', { class: 'dot', style: { '--c': x.color } }), x.emoji + ' ' + x.name + (k < t ? ' · ' + res[k].c + ' ✓' : '')))),
        h('button', { class: 'pill', onclick: run }, 'Бастау · ' + T[t].emoji + ' ' + T[t].name));
      api.hint('Эстафета: ' + T[t].emoji + ' ' + T[t].name + ' командасы дайындалсын. → немесе «Бастау» — 30 секунд басталады.');
    }
    function run() {
      phase = 'run'; view.innerHTML = '';
      const subj = h('div', { class: 'relay-subj' }), tail = h('div', { class: 'mid', style: { color: 'var(--ink-2)' } });
      const score = h('div', { class: 'note' });
      const bWas = h('button', { onclick: () => pick('was') }, '← was'), bWere = h('button', { onclick: () => pick('were') }, 'were →');
      ring = G.ring(30);
      view.append(h('div', { class: 'qtop' }, h('span', { class: 'tp on' }, h('span', { class: 'dot', style: { '--c': T[t].color } }), T[t].emoji + ' ' + T[t].name), ring.el), subj, tail, h('div', { class: 'ww' }, bWas, bWere), score);
      const nextS = () => { let n; do { n = G.pick(SUBJ); } while (cur && n[0] === cur[0]); cur = n; subj.textContent = n[0]; tail.textContent = '___ ' + G.pick(TAIL); subj.style.animation = 'none'; void subj.offsetWidth; subj.style.animation = 'pop .35s var(--ease)'; };
      const drawScore = () => { score.textContent = '✓ ' + res[t].c + '   ✗ ' + res[t].w; };
      function pick(v) {
        if (phase !== 'run') return;
        const ok = v === cur[1], b = v === 'was' ? bWas : bWere;
        res[t][ok ? 'c' : 'w']++;
        b.classList.add(ok ? 'flash-ok' : 'flash-bad'); setTimeout(() => b.classList.remove('flash-ok', 'flash-bad'), 260);
        G.sfx(ok ? 'tap' : 'bad'); if (!ok) G.toast(cur[0] + ' → ' + cur[1]); else G.burstAt(b, ['#2997ff', '#a95cff', '#30d158'], 18);
        drawScore(); nextS();
      }
      relay.pick = pick;
      nextS(); drawScore(); ring.start();
      api.hint('Студент экрандағы сөзге was немесе were қосып айтады. Сіз естіген жауапты басыңыз: ← was · were →');
      const t0 = Date.now();
      const id = api.every(() => { if (Date.now() - t0 >= 30000) { clearInterval(id); done(); } }, 200);
    }
    function done() {
      phase = 'done'; G.sfx('tick');
      const pts = res[t].c * 50;
      view.innerHTML = '';
      const card = h('div', { class: 'card', style: { minWidth: 'min(520px,100%)' } }, h('div', { class: 'eyebrow' }, 'Уақыт бітті!'), h('div', { class: 'headline' }, T[t].emoji + ' ' + T[t].name), h('div', { class: 'mid' }, res[t].c + ' дұрыс · ' + res[t].w + ' қате'), h('div', { class: 'note' }, '+' + pts + ' ұпай (әр дұрыс жауапқа 50)'));
      view.append(card, h('button', { class: 'pill', onclick: () => advance() }, t < T.length - 1 ? 'Келесі команда →' : 'Нәтиже →'));
      if (pts) G.award(t, pts, card);
      api.hint('Ұпай автоматты түрде қосылды. → — ' + (t < T.length - 1 ? 'келесі команда.' : 'нәтиже.'));
    }
    function final() {
      phase = 'final'; view.innerHTML = '';
      const max = Math.max(1, ...res.map(r => r.c));
      api.hint('Эстафета нәтижесі. → — келесі бөлім.');
      view.append(head('Relay results', 'Fastest in time.'),
        h('div', { class: 'awards' }, T.map((x, k) => h('div', { class: 'arow', style: { animationDelay: (k * .12) + 's' } }, h('span', { class: 'pl' }, x.emoji), h('span', { class: 'nm' }, x.name), h('span', { class: 'bar', style: { background: 'var(--mist)' } }, h('i', { style: { width: (res[k].c / max * 100) + '%', '--c': x.color } })), h('span', { class: 'sc' }, res[k].c)))));
    }
    function advance() { if (phase === 'done') { if (t < T.length - 1) { t++; intro(); } else final(); } }
    intro();
    return {
      next: () => { if (phase === 'intro') { run(); return true; } if (phase === 'run') return true; if (phase === 'done') { advance(); return true; } return false; },
      prev: () => phase === 'run',
      key: e => { if (phase !== 'run') return false; if (e.key === 'ArrowLeft') { relay.pick('was'); return true; } if (e.key === 'ArrowRight') { relay.pick('were'); return true; } return false; },
      destroy: () => { phase = 'gone'; }
    };
  } };

  /* Great talents: guess who */
  const genius = { render(inner, def, api) {
    const P = G.shuffle([
      { n: 'Lionel Messi', i: 'LM', ico: '⚽', img: 'img/messi.jpg', credit: 'Bryan Berlin · CC BY-SA 4.0', job: 'a footballer', p: 'he', born: 'June 24th, 1987', place: 'Argentina', could: 'play football brilliantly', age: 'five', y: 'born 1987' },
      { n: 'Cristiano Ronaldo', i: 'CR', ico: '⚽', img: 'img/ronaldo.jpg', credit: 'Bryan Berlin · CC BY-SA 4.0', job: 'a footballer', p: 'he', born: 'February 5th, 1985', place: 'Portugal', could: 'play football very well', age: 'eight', y: 'born 1985' },
      { n: 'Lamine Yamal', i: 'LY', ico: '⚽', img: 'img/yamal.jpg', credit: 'Bryan Berlin · CC BY-SA 4.0', job: 'a footballer', p: 'he', born: 'July 13th, 2007', place: 'Spain', could: 'play football very well', age: 'just seven', y: 'born 2007' },
      { n: 'Dimash Kudaibergen', i: 'DK', ico: '🎤', img: 'img/dimash.jpg', credit: 'laura___dear · CC BY-SA 3.0', job: 'a singer', p: 'he', born: 'May 24th, 1994', place: 'Kazakhstan', could: 'sing and play the piano', age: 'a little boy', y: 'born 1994' },
      { n: 'Elon Musk', i: 'EM', ico: '🚀', img: 'img/musk.jpg', credit: 'Gage Skidmore · CC BY-SA 4.0', job: 'a businessman', p: 'he', born: 'June 28th, 1971', place: 'South Africa', could: 'write computer games', age: 'twelve', y: 'born 1971' },
      { n: 'Taylor Swift', i: 'TS', ico: '🎸', img: 'img/swift.png', credit: 'iHeartRadioCA · CC BY 3.0', job: 'a singer and songwriter', p: 'she', born: 'December 13th, 1989', place: 'the USA', could: 'write songs', age: 'twelve', y: 'born 1989' }
    ]);
    const awards = P.map(() => new Set());
    let i = 0, st = 1;
    const ey = eyebrow(''), clues = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } });
    const mono = h('div', { class: 'mono hide' }), who = h('div', { style: { textAlign: 'center', minHeight: '90px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' } });
    const foot = h('div', { style: { minHeight: '70px', display: 'flex', justifyContent: 'center' } });
    inner.append(h('div', { class: 'lines', style: { gap: '4px' } }, ey, h('h2', { class: 'headline' }, 'Who is it?')),
      h('div', { class: 'g2' }, clues, h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' } }, mono, who)), foot);
    const C = g => { const S = G.cap(g.p); return [S + ' was born on ' + g.born + '.', S + ' was born in ' + g.place + '.', S + ' could ' + g.could + ' when ' + g.p + ' was ' + g.age + '.', S + ' was ' + g.job + '.']; };
    function draw() {
      const g = P[i], cl = C(g);
      ey.textContent = 'Great talents · ' + (i + 1) + ' / ' + P.length;
      clues.innerHTML = '';
      cl.slice(0, Math.min(st, 4)).forEach((c, n) => clues.append(h('div', { class: 'clue' }, h('span', { class: 'n' }, n + 1), h('span', { html: G.fmt(c.replace(/(was born|could)/, '*$1*')) }))));
      foot.innerHTML = '';
      if (st <= 4) {
        mono.className = 'mono hide'; mono.textContent = '?'; mono.append(h('span', { class: 'sweepring', 'aria-hidden': 'true' })); who.innerHTML = '';
        who.append(h('div', { class: 'note' }, 'Қазір болжасаңдар: ' + (5 - st) * 100 + ' ұпай'));
        foot.append(h('button', { class: 'reveal-btn', onclick: () => { st = 5; draw(); G.sfx('ok'); } }, 'Жауапты ашу →'));
        api.hint('Кеңестерді бірге оқыңдар. Командалар «Бұл кім?» деп болжайды. → — тағы бір кеңес (кеңес аз болса, ұпай көп).');
      } else {
        const used = Math.min(4, clues.children.length);
        mono.className = 'mono flip' + (g.img ? ' photo' : ''); mono.innerHTML = '';
        if (g.img) mono.append(h('img', { src: g.img, alt: g.n, onerror: e => { e.target.remove(); mono.classList.remove('photo'); mono.prepend(g.i); } }), h('span', { class: 'em' }, g.ico));
        else mono.append(g.i, h('span', { class: 'em' }, g.ico));
        setTimeout(() => G.burstAt(mono, ['#2997ff', '#a95cff', '#ffd60a', '#ffffff'], 90), 450);
        who.innerHTML = '';
        who.append(h('div', { class: 'mid' }, g.n), h('div', { class: 'note' }, g.y + ' · ' + g.job), g.credit ? h('div', { class: 'credit' }, 'Photo: ' + g.credit + ' · Wikimedia Commons') : null);
        foot.append(G.picker((5 - used) * 100, awards[i]));
        api.hint('Дұрыс тапқан командаларды басыңыз. Сосын → — ' + (i < P.length - 1 ? 'келесі адам.' : 'келесі бөлім.'));
      }
    }
    draw();
    return {
      next: () => { if (st < 4) { st++; draw(); return true; } if (st === 4) { st = 5; draw(); G.sfx('ok'); return true; } if (i < P.length - 1) { i++; st = 1; draw(); return true; } return false; },
      prev: () => { if (st > 1 && st <= 4) { st--; draw(); return true; } if (st === 5) { st = 4; draw(); return true; } if (i > 0) { i--; st = 1; draw(); return true; } return false; }
    };
  } };

  /* Mystery: the missing cake */
  const mystery = { render(inner, def, api) {
    const W = [
      { who: 'Marcus', av: '🧔', text: 'At nine o\'clock I {was} at the bar with Kate. We {were} there for an hour. I {couldn\'t} see the cake table from the bar.', clue: '🪑 A chair was next to the cake table.' },
      { who: 'Eva', av: '🤒', text: 'I {wasn\'t} at the party! I {was} in bed with flu, so I {couldn\'t} come.', clue: '🍫 There were small chocolate fingerprints on the chair.' },
      { who: 'Uncle Joe', av: '👨', text: 'I {was} in the garden at nine o\'clock. Dexter {was} with me. We {were} outside for an hour.', clue: '🎂 The cake was on the table at 8.45. At 9.15 it wasn\'t there.' },
      { who: 'Dexter, 6', av: '👦', text: 'I {wasn\'t} in the garden. I {was} in the bathroom! And I {couldn\'t} reach the cake table. It\'s too high!', clue: '🧗 Ben says: “Dexter can climb anything. He\'s Super Boy!”' },
      { who: 'Kate', av: '👩', text: 'Marcus and I {were} at the bar. Joe {was} in the garden, but he {was} alone. Dexter {wasn\'t} with him!', clue: '🤔 Joe and Dexter tell different stories.' }
    ];
    const SUS = [['Marcus', '🧔'], ['Eva', '🤒'], ['Uncle Joe', '👨'], ['Dexter', '👦']];
    const T = G.S.teams, votes = T.map(() => -1);
    let st = 0, filled = false;
    const view = col(); inner.append(view);
    const statement = (text, show) => h('div', { class: 'statement', html: text.split(/\{(.+?)\}/).map((p, n) => n % 2 ? (show ? '<span class="gap fill"><span class="hl">' + G.esc(p) + '</span></span>' : '<span class="gap"> </span>') : G.esc(p)).join('') });
    function caseFile() {
      view.innerHTML = '';
      view.append(eyebrow('Case file'), G.split('The Missing *Cake.*', { cls: 'display', stagger: .12 }),
        h('div', { class: 'lede' }, 'Ben\'s birthday party. Retro Bar, 9.15 p.m. The cake is gone. Five people. One of them is not telling the truth.'),
        G.kk('Беннің туған күні. Сағат 21:15-те торт жоғалды. Бес куәгер бар, біреуі шындықты айтпай тұр. Әр сөзді was/were/couldn\'t арқылы толықтырыңдар.'),
        h('div', { style: { fontSize: 'clamp(54px,7vw,90px)', letterSpacing: '8px' } }, '🎂❓'));
      api.hint('Детектив ойыны! Тортты кім жегенін табамыз. → — бірінші куәгер.');
    }
    function witness() {
      const w = W[st - 1];
      view.innerHTML = '';
      const evid = h('div', { class: 'evid' }, h('div', { class: 'eyebrow', style: { textAlign: 'left' } }, 'Дәлелдер · Evidence'), W.slice(0, filled ? st : st - 1).map((x, k) => h('div', { class: 'e polaroid', style: { '--rot': ((k % 2 ? 1 : -1) * (1 + k % 3)) + 'deg', animationDelay: (k === st - 1 && filled ? .2 : 0) + 's' } }, x.clue)));
      api.hint(filled ? 'Жаңа дәлел пайда болды (оң жақта). → — ' + (st < W.length ? 'келесі куәгер.' : 'дауыс беру.') : 'Куәгердің сөзін оқыңдар. Бос орындарға was / were / wasn\'t / couldn\'t қойып айтыңдар. → — тексеру.');
      view.append(eyebrow('Witness ' + st + ' / ' + W.length),
        h('div', { class: 'g2', style: { alignItems: 'start' } },
          h('div', { class: 'witness' }, h('div', { class: 'av' }, w.av), h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, h('div', { class: 'mid' }, w.who + ':'), statement(w.text, filled))),
          h('div', { class: 'card', style: { background: 'var(--sepia)', color: 'var(--sepia-ink)' } }, evid)),
        filled ? null : h('div', { class: 'note' }, 'Complete with was, were, wasn\'t or couldn\'t. Press → to check.'));
      if (filled) G.sfx('ok');
    }
    function vote() {
      view.innerHTML = '';
      view.append(h('div', { class: 'lines', style: { gap: '4px' } }, eyebrow('Your verdict'), h('h2', { class: 'headline' }, 'Who ate the cake?')),
        h('div', { class: 'card', style: { background: 'var(--sepia)', color: 'var(--sepia-ink)', width: '100%', maxWidth: '980px' } }, h('div', { class: 'evid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' } }, W.map(x => h('div', { class: 'e' }, x.clue)))),
        h('div', { class: 'vote' }, T.map((x, k) => h('div', { class: 'vr' }, h('span', { class: 'tp', style: { justifySelf: 'start' } }, h('span', { class: 'dot', style: { '--c': x.color } }), x.emoji + ' ' + x.name),
          SUS.map(([n, e], s) => h('button', { class: votes[k] === s ? 'on' : '', onclick: ev => { votes[k] = s; ev.currentTarget.parentNode.querySelectorAll('button').forEach((b, j) => b.classList.toggle('on', j === s)); G.sfx('tap'); } }, e + ' ' + n))))),
        G.kk('Әр команда күдіктіні таңдайды.'));
      api.hint('Әр команданың жолынан олар таңдаған адамды басыңыз. Сосын → — кінәлі кім екені ашылады.');
    }
    function verdict() {
      view.innerHTML = '';
      const cards = SUS.map(([n, e]) => h('div', null, h('span', { class: 'em' }, e), n));
      view.append(eyebrow('Case closed'), h('div', { class: 'suspects' }, cards),
        h('div', { class: 'display grad shimmer', style: { animationDelay: '.9s, 2.5s' } }, 'It was Dexter.'),
        h('div', { class: 'lede', style: { animation: 'rise 1s 1.2s var(--ease) both' } }, 'He said he couldn\'t reach the table — but there was a chair, and he can climb anything. Uncle Joe wasn\'t telling the truth: he wanted to help him.'),
        G.kk('Дексер столға жете алмадым деді, бірақ жанында орындық болған, ал ол кез келген жерге өрмелей алады. Джо ағай оны қорғау үшін шындықты айтпады.'));
      G.sfx('drum');
      api.hint('Дексерді таңдаған командаларға +300 ұпай автоматты түрде қосылды. → — келесі бөлім.');
      setTimeout(() => { cards.forEach((c, k) => c.classList.add(k === 3 ? 'guilty' : 'out')); cards[3].classList.add('spot'); G.sfx('boom'); G.sfx('fanfare'); G.burstAt(cards[3], ['#ffd60a', '#ff9004', '#ffffff', '#a95cff'], 120); G.confetti(90); votes.forEach((v, k) => { if (v === 3) setTimeout(() => G.award(k, 300, cards[3]), 300 + k * 250); }); }, 900);
    }
    caseFile();
    return {
      next: () => {
        if (st === 0) { st = 1; filled = false; witness(); return true; }
        if (st <= W.length) { if (!filled) { filled = true; witness(); return true; } if (st < W.length) { st++; filled = false; witness(); return true; } st = W.length + 1; vote(); return true; }
        if (st === W.length + 1) { st = W.length + 2; verdict(); return true; }
        return false;
      },
      prev: () => { if (st === W.length + 1) { st = W.length; filled = true; witness(); return true; } if (st >= 1 && st <= W.length) { if (filled) { filled = false; witness(); return true; } st--; if (st === 0) caseFile(); else { filled = true; witness(); } return true; } return false; }
    };
  } };

  G.lesson({
    id: 'time', n: 2, title: 'Time', chip: 'could', grad: 'var(--g-time)', glow: 'rgba(129,92,255,.6)', glowColor: '#7d5cff', colors: ['#2997ff', '#a95cff', '#64d2ff'], fx: 'warp',
    grammar: 'was · were · could · was born', minutes: 100,
    blurb: '1916 жылға уақыт машинасы, командалық эстафета, атақты адамдар және туған күндегі құпия.',
    specs: { grammar: 'was / were, wasn\'t / weren\'t · сұрақ және қысқа жауап · could / couldn\'t · was born + in / on', words: 'yesterday, last week, last year, when I was five, until', skills: 'Оқу: кеңестер мен куәгер сөздері · Сөйлеу: өз өмірің туралы', games: 'Time machine · Relay · Great talents · Диктант · The Missing Cake · A talented family (оқу) · Class vs Boss' },
    scenes: [
      { type: 'film', dark: true, lines: ['What if you could travel in time?', 'New York.', '*1916.*', 'Ready?'], kicker: 'Lesson 2', title: 'Time.', sub: 'was · were · could · was born', kk: 'Бүгін — өткен шақ: was, were, could. Уақытта саяхат жасаймыз!' },
      { type: 'task', kicker: 'Warm-up · 3 minutes', title: 'Yesterday…', note: 'Ask three people in your team. Answer with *I was…*', kk: 'Жылыну: командаңдағы үш адамнан сұра. Жауап: I was at home / at school / in bed…', minutes: 3,
        prompts: ['Where were you at *8 o\'clock* this morning?', 'Where were you at *10 o\'clock* last night?', 'Where were you last *Sunday*?', 'Were you *happy* yesterday?'],
        model: ['Where were you at 10 o\'clock last night?', 'I was at home. I was in bed!'] },
      { type: 'explain', kicker: 'Grammar', title: 'The past of *be*.', beats: [
        { lines: ['Today it *is* sunny.', 'Yesterday it *was* sunny.'], note: 'am / is → *was* · are → *were*', kk: 'am/is → was, are → were.' },
        { lines: ['I *was* · he *was* · she *was* · it *was*', 'you *were* · we *were* · they *were*'], note: 'Careful: *everyone* and *nobody* take was.', kk: 'I/he/she/it → was; you/we/they → were. Everyone, nobody → was.' },
        { lines: ['I *wasn\'t* at school.', 'They *weren\'t* at home.'], note: 'wasn\'t = was not · weren\'t = were not', kk: 'Болымсыз: wasn\'t, weren\'t.' },
        { lines: ['*Were* you at the party?', 'Yes, I *was*. · No, I *wasn\'t*.'], note: 'Questions: was / were comes first.', kk: 'Сұрақта was/were алға шығады.' }
      ] },
      timeMachine,
      relay,
      { type: 'standup', items: [['🏠', 'I was at home yesterday.'], ['🏫', 'I was at school yesterday.'], ['🏊', 'I could swim when I was five.'], ['🚲', 'I could ride a bike when I was six.'], ['📖', 'I could read when I was four.'], ['🍰', 'I was born in 2009.']] },
      { type: 'explain', kicker: 'Grammar', title: '*could* — yesterday\'s power.', beats: [
        { lines: ['I *can* swim now.', 'I *could* swim when I was six.'], note: 'can → *could* · can\'t → *couldn\'t*', kk: 'could — can-нің өткен шағы: «істей алатынмын».' },
        { lines: ['She *could* read when she was four.', 'He *couldn\'t* walk until he was two.'], note: '*could* + verb. The same for everyone.', kk: 'Барлық жақта бірдей: could + етістік. until — «...-ге дейін».' },
        { lines: ['*Could* you swim when you were five?', 'Yes, I *could*. · No, I *couldn\'t*.'], kk: 'Сұрақ: Could you…? Жауап: Yes, I could. / No, I couldn\'t.' },
        { lines: ['I *was born* in 2009.', 'Picasso *was born* on October 25th, 1881.'], note: 'Never “I born”. *in* + year or city · *on* + date', kk: '«Мен туылдым» — I was born. Жыл, қала алдында — in; нақты күн алдында — on.' }
      ] },
      genius,
      { type: 'dictation', items: ['Dimash was born in Aktobe.', 'Where were you yesterday?', 'I could swim when I was five.'] },
      { type: 'quiz', title: 'Born to be', timer: 20, pts: 100, items: [].concat(G.BANK.born, G.BANK.could) , count: 4 },
      { type: 'unscramble', items: ['I was born in 2009.', 'Where were you yesterday?', 'I could swim when I was six.', 'They were at home.'] },
      mystery,
      { type: 'read', kicker: 'Reading · A talented family', title: 'Is this the most *talented* family in Kazakhstan?', kk: 'Мәтінді абзац-абзацпен бірге оқимыз. Назар аударыңдар: can, could, was, were.', paras: READ },
      { type: 'quiz', title: 'True or false?', timer: 20, pts: 100, items: TF, shuffle: false },
      { type: 'explain', kicker: 'Words', title: 'Words from the text', beats: [
        { lines: ['*talented* · *brilliant* · *successful*'], note: 'very good at something · amazing · gets great results', kk: 'talented — дарынды · brilliant — тамаша · successful — табысты' },
        { lines: ['*proud* of · *normal* · *cool*'], note: 'very happy about someone · usual · great, fashionable', kk: 'proud of — мақтан тұту · normal — қалыпты · cool — керемет' },
        { lines: ['*rich* · *expensive* · *full-time*'], note: 'a lot of money · costs a lot · all day, every day', kk: 'rich — бай · expensive — қымбат · full-time — толық күн' }
      ] },
      { type: 'quiz', title: 'The right word', timer: 15, pts: 100, items: G.BANK.adj },
      { type: 'task', kicker: 'Pair work · 5 minutes', title: 'Your life. In the past.', note: 'Ask your partner. Then tell the class one surprising thing.', kk: 'Жұбыңнан сұра. Соңында сыныпқа бір қызық дерек айт.', minutes: 5,
        prompts: ['When were you *born*?', 'Where were you *born*?', 'How old were you when you *could* walk?', 'How old were you when you *could* ride a bike?', '*Could* you swim when you were five?', 'Where *were* you at 8.00 this morning?'],
        model: ['When were you born?', 'I was born in 2009, in Turkistan.', 'How old were you when you could ride a bike?', 'I could ride a bike when I was seven.'] },
      { type: 'boss', dark: true, villain: 'Captain Yesterday', emoji: '🕰️', taunt: 'The past is mine!', items: [].concat(G.BANK.waswere, G.BANK.could, G.BANK.born), count: 6 },
      { type: 'recap', rules: ['I *was* · they *were*', 'I *wasn\'t* at school.', 'I *could* read at five.', 'I *was born* in 2009.', '*talented* · *proud* · *successful*'], starters: ['Yesterday I *was* …', 'When I was five, I *could* …', 'I *was born* in … in …'], kk: 'Бүгін: was/were, could/couldn\'t, was born және мәтіндегі сын есімдер.' },
      { type: 'unlock', dark: true, lesson: 'time', line: 'Time unlocked.', note: 'You can travel to the past with was, were and could.', kk: 'Екінші күш ашылды! Енді was, were, could арқылы өткен шақ туралы айта аласың.' }
    ]
  });
})();
