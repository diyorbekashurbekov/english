/* Super U — Lesson 1 · Power: can / can't, how well */
(function () {
  'use strict';
  const h = G.h;
  const Q = list => list.map(x => ({ q: x[0], o: x[1], a: 0, e: x[2] || '', k: x[3] || '' }));
  const eyebrow = t => h('div', { class: 'eyebrow' }, t);
  const head = (k, t) => h('div', { class: 'lines', style: { gap: '4px' } }, eyebrow(k), h('h2', { class: 'headline', html: G.fmt(t) }));

  G.BANK = G.BANK || {};
  G.BANK.can = Q([
    ['Superman ___ fly.', ['can', 'cans', 'can to'], '*can* + verb. No -s, no "to".', 'can-ге -s жалғанбайды, кейін to келмейді.'],
    ['Batman ___ fly. He has no superpowers.', ['can\'t', 'can', 'doesn\'t can'], 'Negative: *can\'t* + verb.', 'Болымсыз: can\'t + етістік.'],
    ['___ you speak Spanish?', ['Can', 'Do can', 'Are'], 'Questions start with *Can*.', 'Сұрақ Can-нан басталады.'],
    ['Can Spider-Man climb buildings? — Yes, he ___.', ['can', 'climbs', 'can climb'], 'Short answer: *Yes, he can.*', 'Қысқа жауапта етістік қайталанбайды.'],
    ['Can Ben speak Spanish? — No, he ___.', ['can\'t', 'doesn\'t', 'isn\'t'], 'Short answer: *No, he can\'t.*', 'Қысқа жауап: No, he can\'t.'],
    ['Which one is correct?', ['She can swim very well.', 'She cans swim very well.', 'She can to swim very well.'], '*can* + verb — always.', 'Әрқашан: can + етістік.'],
    ['Which question is correct?', ['Can he play the guitar?', 'Can he plays the guitar?', 'Does he can play the guitar?'], '*Can* + subject + verb.', 'Can + бастауыш + етістік.'],
    ['Sorry, I ___ hear you. The music is too loud!', ['can\'t', 'can', 'cans'], 'Loud music → not able to hear.', 'Музыка қатты — ести алмаймын.'],
    ['Dexter is only six, but he ___ play the guitar brilliantly!', ['can', 'can\'t', 'cans'], '*brilliantly* → he is able to.', 'brilliantly — өте жақсы істей алады.'],
    ['Which question is correct?', ['What can they do?', 'What they can do?', 'What do they can do?'], 'Question word + *can* + subject + verb.', 'Сұрақ сөз + can + бастауыш + етістік.']
  ]);
  G.BANK.adv = Q([
    ['Dexter can speak Spanish ___. ★★★★★', ['fluently', 'a little bit', 'at all'], '*fluently* — for languages, the top level.', 'fluently — тілді еркін білу.'],
    ['I can\'t ski ___. ☆☆☆☆☆', ['at all', 'quite well', 'fluently'], '*not … at all* = zero.', 'not … at all — мүлдем.'],
    ['Ben can speak French ___ — only “bonjour” and “merci”.', ['a little bit', 'fluently', 'brilliantly'], 'Two words → *a little bit*.', 'Екі сөз ғана — a little bit.'],
    ['She can play the guitar ___. ★★★★☆', ['really well', 'not at all', 'a little bit'], 'Four stars → *really well*.', 'Төрт жұлдыз — really well.'],
    ['He can cook ___. ★★★☆☆', ['quite well', 'at all', 'fluently'], 'Three stars → *quite well*.', 'Үш жұлдыз — quite well.'],
    ['Which one is correct?', ['I can\'t sing at all.', 'I can sing at all.', 'I can\'t at all sing.'], '*at all* goes with *can\'t*, at the end.', 'at all — can\'t-пен, сөйлем соңында.']
  ]);
  G.BANK.pron = Q([
    ['How do we say “can” in “I can swim”?', ['/kən/ — short and weak', '/kɑːnt/ — long and strong', '/kæn/ — loud'], 'Inside a sentence *can* is weak.', 'Сөйлем ішінде can әлсіз айтылады.'],
    ['How do we say “can\'t” in “I can\'t swim”?', ['/kɑːnt/ — long and strong', '/kən/ — short and weak', 'we don\'t say the t'], '*can\'t* is stressed.', 'can\'t екпінмен айтылады.'],
    ['“You can SING.” Which word has the stress?', ['sing', 'can', 'you'], 'The main verb is stressed.', 'Екпін негізгі етістікке түседі.']
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
    grammar: 'can · can\'t · how well', minutes: 75,
    blurb: 'Суперқаһармандар, дыбыс зертханасы және сыныптағы тікелей сауалнама. Біз не істей аламыз?',
    specs: { grammar: 'can / can\'t — қабілет · сұрақ және қысқа жауап · қаншалықты жақсы: a little bit, quite well, really well, brilliantly, fluently, not at all', words: 'swim, ski, cook, sing, ride a bike, play the guitar, speak a foreign language', skills: 'Тыңдау: /kən/ мен /kɑːnt/ айырмашылығы · Сөйлеу: сұхбат, сынып туралы есеп', games: 'Hero check · Sound lab · Сынып сауалнамасы · Power battle' },
    scenes: [
      { type: 'film', dark: true, lines: ['Everyone has a superpower.', 'Some people can *fly*.', 'Some people can *read minds*.', 'What can *you* do?'], kicker: 'Lesson 1', title: 'Power.', sub: 'can · can\'t · how well', kk: 'Әр адамның бір күші бар. Бүгін — can: не істей аламыз?' },
      { type: 'explain', kicker: 'Grammar', title: 'Meet *can*.', beats: [
        { lines: ['I *can* fly.'], note: '*can* = ability. What you are able to do.', kk: 'can — «істей аламын». Қабілетті білдіреді.' },
        { lines: ['I *can* fly.', 'She *can* fly.', 'They *can* fly.'], note: '*can* never changes. No -s. No “to”.', kk: 'can ешқашан өзгермейді: she cans емес, can to fly емес.' },
        { lines: ['Batman *can\'t* fly.'], note: '*can\'t* = cannot.', kk: 'can\'t — «істей алмайды».' },
        { lines: ['*Can* you fly?', 'Yes, I *can*. · No, I *can\'t*.'], note: 'In questions, *can* comes first. Short answers have no main verb.', kk: 'Сұрақта can алға шығады. Қысқа жауапта негізгі етістік қайталанбайды.' }
      ] },
      { type: 'quiz', title: 'Hero check', timer: 20, pts: 100, items: G.BANK.can, count: 8 },
      soundLab,
      scale,
      { type: 'quiz', title: 'How well?', timer: 20, pts: 100, items: G.BANK.adv },
      survey,
      { type: 'task', kicker: 'Pair work · 4 minutes', title: 'Interview your partner.', note: 'Ask. Answer with *how well*. Then tell the class.', kk: 'Жұбыңнан сұра, «how well» арқылы жауап бер. Соңында сыныпқа айт: Aliya can cook really well, but she can\'t ski at all.', minutes: 4,
        prompts: ['Can you *ski*?', 'Can you *cook*?', 'Can you *speak Spanish*?', 'Can you *play a musical instrument*?', 'Can you *ride a motorbike*?', 'Can you *draw*?'],
        model: ['Can you cook?', 'Yes, I can. I can cook quite well.', 'Can you ski?', 'No, I can\'t ski at all!'] },
      { type: 'quiz', title: 'Power battle · double points', timer: 15, pts: 200, items: [].concat(G.BANK.can, G.BANK.adv, G.BANK.pron), count: 10 },
      { type: 'unlock', dark: true, lesson: 'power', line: 'Power unlocked.', note: 'You can say what you can — and can\'t — do.', kk: 'Бірінші күш ашылды! Енді не істей алатыныңды және не істей алмайтыныңды ағылшынша айта аласың.' }
    ]
  });
})();
