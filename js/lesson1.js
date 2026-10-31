/* Super U — Lesson 1 · Power: can / can't, how well */
(function () {
  'use strict';
  const h = G.h;
  const Q = list => list.map(x => ({ q: x[0], o: x[1], a: 0, e: x[2] || '', k: x[3] || '' }));
  const eyebrow = t => h('div', { class: 'eyebrow' }, t);
  const head = (k, t) => h('div', { class: 'lines', style: { gap: '4px' } }, eyebrow(k), h('h2', { class: 'headline', html: G.fmt(t) }));

  G.BANK = G.BANK || {};
  G.BANK.can = Q([
    ['🦸 Superman ___ fly.', ['can', 'cans'], '*can* + verb. No -s.', 'can-ге -s жалғанбайды.'],
    ['🦇 Batman ___ fly.', ['can\'t', 'can'], 'Batman *can\'t* fly.', 'Бэтмен ұша алмайды — can\'t.'],
    ['___ you swim?', ['Can', 'Are'], '*Can* you swim?', 'Сұрақ Can-нан басталады.'],
    ['Can you cook? — Yes, I ___.', ['can', 'cook'], 'Yes, I *can*.', 'Қысқа жауап: Yes, I can.'],
    ['Can he ski? — No, he ___.', ['can\'t', 'isn\'t'], 'No, he *can\'t*.', 'Қысқа жауап: No, he can\'t.'],
    ['She can ___ the guitar.', ['play', 'plays'], 'can + *play* (no -s).', 'can-нан кейін етістік өзгермейді.'],
    ['I can\'t ___. 🔇', ['hear you', 'hears you'], 'can\'t + *hear*.', 'can\'t + етістік.'],
    ['🕷️ Spider-Man can ___ buildings.', ['climb', 'to climb'], 'can + *climb* (no "to").', 'can-нан кейін to қойылмайды.']
  ]);
  G.BANK.adv = Q([
    ['I can speak English ___. ★★★★★', ['fluently', 'a little bit'], '★★★★★ = *fluently*.', 'fluently — еркін.'],
    ['I can\'t ski ___. ☆☆☆☆☆', ['at all', 'really well'], 'can\'t … *at all*.', 'at all — мүлдем.'],
    ['He can cook ___. ★☆☆☆☆', ['a little bit', 'brilliantly'], '★ = *a little bit*.', 'a little bit — сәл.'],
    ['She can sing ___. ★★★★☆', ['really well', 'at all'], '★★★★ = *really well*.', 'really well — өте жақсы.'],
    ['We can swim ___. ★★★☆☆', ['quite well', 'at all'], '★★★ = *quite well*.', 'quite well — жақсы.']
  ]);
  G.BANK.pron = Q([
    ['“I *can* swim.” — can is…', ['short /kən/', 'long /kɑːnt/'], '*can* is short.', 'can — қысқа.'],
    ['“I *can\'t* swim.” — can\'t is…', ['long /kɑːnt/', 'short /kən/'], '*can\'t* is long.', 'can\'t — ұзын, екпінді.']
  ]);

  /* Sound lab: can or can't? */
  const soundLab = { render(inner, def, api) {
    const SENT = ['I {} swim.', 'She {} speak French.', 'He {} play the guitar.', 'We {} come to the party.', 'My dad {} cook.', 'I {} hear you.', 'Dexter {} ride a bike.', 'They {} meet us at six.', 'My sister {} ski.', 'You {} always get what you want.'];
    const items = G.shuffle(SENT).slice(0, 8).map(s => { const neg = Math.random() < .5; return { s: s.replace('{}', neg ? 'can\'t' : 'can'), neg }; });
    const awards = items.map(() => new Set());
    let step = 0, revealed = false, doReveal = null;
    const view = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(14px,2.6vh,28px)', width: '100%' } });
    inner.append(view);
    const wave = bars => h('div', { class: 'wave' }, bars.map(([w, ht], n) => h('div', null, h('i', { style: { height: ht + 'px', animationDelay: (n * .12) + 's', opacity: ht > 60 ? 1 : .45 } }), w)));
    const card = (word, ipa, desc, bars, sent) => h('div', { class: 'tile' },
      h('div', { class: 'w grad' }, word), h('div', { class: 'note' }, ipa + ' · ' + desc), wave(bars),
      h('button', { class: 'pill dark sm', onclick: () => G.speak(sent, { rate: .8 }) }, '▶ ' + sent));
    function intro() {
      view.innerHTML = '';
      view.append(head('Sound lab', 'Hear the difference.'),
        h('div', { class: 'duo' }, card('can', '/kən/', 'short · weak', [['You', 34], ['can', 34], ['SING', 92]], 'You can sing.'), card('can\'t', '/kɑːnt/', 'long · strong', [['I', 34], ['CAN\'T', 92], ['sing', 56]], 'I can\'t sing.')),
        h('div', { class: 'note' }, 'In a sentence, *can* is almost silent. *can\'t* is loud and long. Listen for the stress.'.replace(/\*(.+?)\*/g, '$1')),
        G.kk('Сөйлемде can қысқа, әлсіз естіледі — екпін етістікке түседі. can\'t созылып, екпінмен айтылады.'));
      api.hint('Екі мысалды тыңдаңдар (▶ батырмасы). Айырмашылықты байқаңдар. Сосын → — тыңдау тесті басталады.');
    }
    function item() {
      revealed = false;
      const it = items[step - 1];
      view.innerHTML = '';
      const play = h('button', { class: 'play', 'aria-label': 'Play the sentence' }, '▶');
      const doPlay = rate => { play.classList.add('on'); G.speak(it.s, { rate, onend: () => play.classList.remove('on') }); };
      play.onclick = () => doPlay();
      const tCan = h('button', { class: 'tile', onclick: () => reveal(false) }, h('div', { class: 'w' }, '👍 can'));
      const tCant = h('button', { class: 'tile', onclick: () => reveal(true) }, h('div', { class: 'w' }, '👎 can\'t'));
      const out = h('div', { style: { minHeight: '170px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } });
      view.append(eyebrow('Sound lab · ' + step + ' / ' + items.length), h('div', { class: 'mid' }, 'can — or can\'t?'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '28px' } }, play, h('button', { class: 'link', onclick: () => doPlay(.62) }, 'Баяулау')),
        h('div', { class: 'duo' }, tCan, tCant), out);
      api.after(() => doPlay(), 500);
      api.hint('Сөйлемді тыңдаңдар (▶). Сынып қолымен көрсетеді: 👍 can немесе 👎 can\'t. Сосын → — дұрыс жауап.');
      function reveal(neg) {
        if (revealed) return; revealed = true;
        (it.neg ? tCant : tCan).classList.add('right');
        G.burstAt(it.neg ? tCant : tCan, ['#ff9004', '#ff2e54', '#30d158', '#ffd60a'], 60);
        if (neg !== undefined && neg !== it.neg) { (neg ? tCant : tCan).classList.add('wrong'); G.sfx('bad'); } else G.sfx('ok');
        out.append(h('div', { class: 'mid', html: G.fmt(it.s.replace(/(can't|can)/, '*$1*')) }), h('div', { class: 'note' }, it.neg ? '/kɑːnt/ — long and strong' : '/kən/ — short and weak'), G.kk(it.neg ? 'can\'t — созылып, екпінмен айтылды.' : 'can — қысқа, әлсіз айтылды.'), G.picker(100, awards[step - 1]));
        api.hint('Дұрыс тапқан командаларды басыңыз. Сосын → — ' + (step < items.length ? 'келесі сөйлем.' : 'келесі бөлім.'));
      }
      doReveal = reveal;
    }
    intro();
    return {
      next: () => { if (step === 0) { step = 1; item(); return true; } if (!revealed) { doReveal(undefined); return true; } if (step < items.length) { step++; item(); return true; } return false; },
      prev: () => { if (step > 1) { step--; item(); return true; } if (step === 1) { step = 0; intro(); return true; } return false; }
    };
  } };

  /* How well: a scale the teacher slides along */
  const scale = { hint: 'Шкала: «мүлдем»-нен «тамаша»-ға дейін. → басқан сайын келесі деңгей ашылады. Әр сөйлемді бірге қайталаңдар.', render(inner) {
    const STOPS = [['not at all', 'I can\'t sing *at all*.'], ['a little bit', 'I can sing *a little bit*.'], ['quite well', 'I can sing *quite well*.'], ['really well', 'I can sing *really well*.'], ['brilliantly', 'I can sing *brilliantly*.']];
    const pos = n => 4 + n * 23;
    let k = 0;
    const fill = h('div', { class: 'fillbar' });
    const knob = h('div', { class: 'knob', role: 'slider', 'aria-valuemin': '0', 'aria-valuemax': '4', tabindex: '0' });
    const stops = STOPS.map(([w], n) => h('button', { class: 'stop', style: { left: pos(n) + '%' }, onclick: () => set(n) }, h('i'), w));
    const sc = h('div', { class: 'scale' }, h('div', { class: 'track' }), fill, stops, knob);
    const sentence = h('div', { style: { minHeight: '1.3em' } });
    inner.append(head('How well?', 'From zero to brilliant.'), sc, sentence,
      h('div', { class: 'note', html: G.fmt('For languages, the top is *fluently*: I can speak English *fluently*.') }),
      G.kk('not at all — мүлдем · a little bit — сәл · quite well — жақсы · really well — өте жақсы · brilliantly — тамаша · fluently — еркін (тілге)'));
    function set(n) {
      k = Math.max(0, Math.min(4, n));
      fill.style.width = (pos(k) - 4) + '%';
      knob.style.left = pos(k) + '%'; knob.setAttribute('aria-valuenow', String(k));
      stops.forEach((s, j) => s.classList.toggle('on', j <= k));
      sentence.innerHTML = '';
      sentence.append(G.split(STOPS[k][1], { cls: 'big', stagger: .06 }));
      G.sfx('tap');
      if (k === 4) setTimeout(() => G.burstAt(knob, ['#ff9004', '#ff2e54', '#ffd60a'], 70), 450);
    }
    let drag = false;
    const fromX = x => { const r = sc.getBoundingClientRect(); const p = (x - r.left) / r.width * 100; set(Math.round((p - 4) / 23)); };
    sc.addEventListener('pointerdown', e => { drag = true; try { sc.setPointerCapture(e.pointerId); } catch (er) {} fromX(e.clientX); });
    sc.addEventListener('pointermove', e => { if (drag) { const before = k; const r = sc.getBoundingClientRect(); const n = Math.round(((e.clientX - r.left) / r.width * 100 - 4) / 23); if (n !== before) fromX(e.clientX); } });
    sc.addEventListener('pointerup', () => { drag = false; });
    set(0);
    return {
      next: () => { if (k < 4) { set(k + 1); return true; } return false; },
      prev: () => { if (k > 0) { set(k - 1); return true; } return false; }
    };
  } };

  /* Live class survey */
  const survey = { render(inner, def, api) {
    const AB = [['swim', '🏊'], ['ride a bike', '🚲'], ['cook', '🍳'], ['ski', '⛷️'], ['speak three languages', '🗣️'], ['play a musical instrument', '🎸'], ['fly', '🦸']];
    const S = G.S;
    const counts = Array.isArray(S.survey) && S.survey.length === AB.length ? S.survey.slice() : AB.map(() => 0);
    let phase = 0;
    const view = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(14px,2.4vh,26px)', width: '100%' } });
    inner.append(view);
    const persist = () => { S.survey = counts.slice(); G.save(); };
    function counting() {
      view.innerHTML = '';
      const sizeN = h('b', { style: { fontFamily: 'var(--f-display)', fontSize: '28px', minWidth: '2ch', display: 'inline-block', textAlign: 'center', fontVariantNumeric: 'tabular-nums' } }, S.size);
      const rows = [];
      const drawRow = n => { const r = rows[n]; r.num.textContent = counts[n]; r.bar.style.width = Math.min(100, counts[n] / S.size * 100) + '%'; };
      const setSize = v => { S.size = Math.max(2, Math.min(80, v)); sizeN.textContent = S.size; counts.forEach((c, n) => { if (c > S.size) counts[n] = S.size; drawRow(n); }); persist(); G.save(); };
      view.append(head('Class survey', 'Who in this room can…?'),
        h('div', { class: 'note' }, 'Ask the question. Count the hands. Tap + or −.'),
        G.kk('Сұрақты қой: «Who can swim?». Қол көтергендерді санап, + немесе − бас.'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 } }, 'We are', h('button', { class: 'say', onclick: () => setSize(S.size - 1), 'aria-label': 'fewer students' }, '−'), sizeN, h('button', { class: 'say', onclick: () => setSize(S.size + 1), 'aria-label': 'more students' }, '+'), 'students'),
        h('div', { class: 'srows' }, AB.map(([a, e], n) => {
          const num = h('span', { class: 'num' }), bar = h('i');
          const change = d => { counts[n] = Math.max(0, Math.min(S.size, counts[n] + d)); drawRow(n); persist(); G.sfx('tap'); num.animate([{ transform: 'scale(1.5)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.2,.8,.2,1)' }); };
          const row = h('div', { class: 'srow' }, h('span', { class: 'em' }, e), h('span', { class: 'nm' }, 'Who can ' + a + '?'),
            h('span', { class: 'ctl' }, h('button', { onclick: () => change(-1), 'aria-label': 'minus' }, '−'), h('button', { onclick: () => change(1), 'aria-label': 'plus' }, '+')),
            h('span', { class: 'bar' }, bar), num);
          rows[n] = { num, bar };
          return row;
        })));
      AB.forEach((x, n) => drawRow(n));
      api.hint('Әр сұрақты сыныпқа қойыңыз: «Who can swim?» Қол көтергендерді санап, + басыңыз. Бәрі біткенде → басыңыз.');
    }
    const line = (c, n, a) => {
      if (a === 'fly') return c === 0 ? 'Nobody can fly. *Yet.*' : c + ' of us can fly?! *Superheroes!*';
      if (c === n) return '*All of us* can ' + a + '.';
      if (c === 0) return '*Nobody* can ' + a + '.';
      if (c === 1) return '*Only one of us* can ' + a + '.';
      if (c / n >= .7) return '*Most of us* can ' + a + ' — ' + c + ' of ' + n + '.';
      if (c / n >= .4) return '*' + c + ' of us* can ' + a + '.';
      return '*Only ' + c + ' of us* can ' + a + '.';
    };
    function report() {
      view.innerHTML = '';
      const n = S.size;
      const real = AB.map((x, k) => ({ a: x[0], c: counts[k] })).filter(x => x.a !== 'fly');
      const best = real.slice().sort((x, y) => y.c - x.c)[0], worst = real.slice().sort((x, y) => x.c - y.c)[0];
      view.append(head('Our class. In English.', 'This is what *we* can do.'),
        h('div', { class: 'lines', style: { gap: '10px' } }, AB.map(([a], k) => h('div', { class: 'small-q', style: { animationDelay: (k * .22) + 's' }, html: G.fmt(line(counts[k], n, a)) }))),
        h('div', { class: 'card', style: { animation: 'rise .9s 1.7s var(--ease) both' } }, h('div', { class: 'mid', html: G.fmt('Our superpower: *' + best.a + '*. Our challenge: *' + worst.a + '*.') })),
        G.kk('All of us — барлығымыз · Most of us — көпшілігіміз · Only 3 of us — тек үшеуміз · Nobody — ешкім. Енді әр студент бір сөйлемді дауыстап оқысын.'));
      G.sfx('unlock'); setTimeout(() => G.confetti(90), 1500);
      api.hint('Сыныптың нәтижесі ағылшынша шықты. Әр студент бір сөйлемді дауыстап оқысын. Сосын → басыңыз.');
    }
    counting();
    return {
      next: () => { if (phase === 0) { phase = 1; report(); return true; } return false; },
      prev: () => { if (phase === 1) { phase = 0; counting(); return true; } return false; }
    };
  } };

  G.lesson({
    id: 'power', n: 1, title: 'Power', chip: 'can', grad: 'var(--g-power)', glow: 'rgba(255,46,84,.6)', glowColor: '#ff2e54', colors: ['#ff9004', '#ff2e54', '#ffd60a'], fx: 'embers',
    grammar: 'can · can\'t · how well', minutes: 85,
    blurb: 'Суперқаһармандар, дыбыс зертханасы және сыныптағы тікелей сауалнама. Біз не істей аламыз?',
    specs: { grammar: 'can / can\'t — қабілет · сұрақ және қысқа жауап · қаншалықты жақсы: a little bit, quite well, really well, brilliantly, fluently, not at all', words: 'swim, ski, cook, sing, ride a bike, play the guitar, speak a foreign language', skills: 'Тыңдау: /kən/ мен /kɑːnt/ айырмашылығы · Сөйлеу: сұхбат, сынып туралы есеп', games: 'Hero check · Sound lab · Сынып сауалнамасы · Superhero draft · Диктант · Class vs Boss' },
    scenes: [
      { type: 'film', dark: true, roll: true, lines: ['Everyone has a superpower.', 'Some people can *fly*.', 'Some people can *read minds*.', 'What can *you* do?'], kicker: 'Lesson 1', title: 'Power.', sub: 'can · can\'t · how well', kk: 'Әр адамның бір күші бар. Бүгін — can: не істей аламыз?' },
      { type: 'task', kicker: 'Warm-up · 3 minutes', title: 'Name the superhero.', note: 'In teams: name 5 superheroes. What can they do?', kk: 'Жылыну: командамен 5 суперқаһарманның атын атаңдар. Олар не істей алады? Мысалы: Spider-Man can climb buildings.', minutes: 3,
        prompts: ['Who can *fly*?', 'Who can *climb buildings*?', 'Who can *run very fast*?', 'Who can *talk to animals*?', 'Who can *read people\'s minds*?'],
        model: ['Who can fly?', 'Superman can fly!', 'Can Batman fly?', 'No, he can\'t.'] },
      { type: 'explain', kicker: 'Grammar', title: 'Meet *can*.', beats: [
        { lines: ['I *can* fly.'], note: '*can* = ability. What you are able to do.', kk: 'can — «істей аламын». Қабілетті білдіреді.' },
        { lines: ['I *can* fly.', 'She *can* fly.', 'They *can* fly.'], note: '*can* never changes. No -s. No “to”.', kk: 'can ешқашан өзгермейді: she cans емес, can to fly емес.' },
        { lines: ['Batman *can\'t* fly.'], note: '*can\'t* = cannot.', kk: 'can\'t — «істей алмайды».' },
        { lines: ['*Can* you fly?', 'Yes, I *can*. · No, I *can\'t*.'], note: 'In questions, *can* comes first. Short answers have no main verb.', kk: 'Сұрақта can алға шығады. Қысқа жауапта негізгі етістік қайталанбайды.' }
      ] },
      { type: 'quiz', title: 'Hero check', timer: 20, pts: 100, items: G.BANK.can, count: 5 },
      { type: 'standup', items: [['🏊', 'I can swim.'], ['🚲', 'I can ride a bike.'], ['🍳', 'I can cook.'], ['⛷️', 'I can ski.'], ['🎤', 'I can sing.'], ['🎸', 'I can play the guitar.'], ['🦸', 'I can fly!']] },
      soundLab,
      scale,
      { type: 'quiz', title: 'How well?', timer: 20, pts: 100, items: G.BANK.adv },
      survey,
      { type: 'unscramble', items: ['I can swim.', 'Can you cook?', 'He can\'t ski.', 'She can sing really well.', 'I can\'t fly at all.'] },
      { type: 'task', kicker: 'Pair work · 4 minutes', title: 'Interview your partner.', note: 'Ask. Answer with *how well*. Then tell the class.', kk: 'Жұбыңнан сұра, «how well» арқылы жауап бер. Соңында сыныпқа айт: Aliya can cook really well, but she can\'t ski at all.', minutes: 4,
        prompts: ['Can you *ski*?', 'Can you *cook*?', 'Can you *speak Spanish*?', 'Can you *play a musical instrument*?', 'Can you *ride a motorbike*?', 'Can you *draw*?'],
        model: ['Can you cook?', 'Yes, I can. I can cook quite well.', 'Can you ski?', 'No, I can\'t ski at all!'] },
      { type: 'task', kicker: 'Team challenge · 5 minutes', title: 'Superhero draft.', note: 'Every team creates a new superhero. Then present it to the class!', kk: 'Әр команда жаңа суперқаһарман ойлап табады: аты, 3 күші (can), 2 әлсіздігі (can\'t). Сосын сыныпқа таныстырады, ең жақсысына дауыс береміз.', minutes: 5,
        prompts: ['Our hero\'s name is …', 'He / She *can* … (3 powers)', 'He / She *can\'t* … (2 weaknesses)', 'He / She can … *really well*.', 'He / She can\'t … *at all*!'],
        model: ['Our hero is Captain Steppe!', 'She can fly and she can speak every language.', 'Can she swim?', 'No, she can\'t swim at all!'] },
      { type: 'dictation', items: ['I can swim.', 'Can you cook?', 'He can\'t ski.', 'She can sing really well.'] },
      { type: 'boss', dark: true, villain: 'Dr. Can\'t', emoji: '🦹', taunt: 'Ha! You can\'t beat me!', items: [].concat(G.BANK.can, G.BANK.adv, G.BANK.pron), count: 6 },
      { type: 'recap', rules: ['I *can* swim.', 'She *can\'t* ski.', '*Can* you…? — Yes, I *can*.', '/kən/ · /kɑːnt/', 'a little bit → *brilliantly*'], starters: ['Today I learned that I *can* …', 'I *can\'t* … at all.', 'My partner can … really well.'], kk: 'Бүгін: can/can\'t, сұрақ пен қысқа жауап, айтылуы және «how well».' },
      { type: 'unlock', dark: true, lesson: 'power', line: 'Power unlocked.', note: 'You can say what you can — and can\'t — do.', kk: 'Бірінші күш ашылды! Енді не істей алатыныңды және не істей алмайтыныңды ағылшынша айта аласың.' }
    ]
  });
})();
