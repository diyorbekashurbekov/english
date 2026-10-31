/* Super U — Lesson 3 · Connect: noun + noun, verb + noun, prepositions, polite requests, a formal email, and the awards */
(function () {
  'use strict';
  const h = G.h;
  const Q = list => list.map(x => ({ q: x[0], o: x[1], a: 0, e: x[2] || '', k: x[3] || '' }));
  const eyebrow = t => h('div', { class: 'eyebrow' }, t);
  const head = (k, t) => h('div', { class: 'lines', style: { gap: '4px' } }, eyebrow(k), h('h2', { class: 'headline', html: G.fmt(t) }));
  const col = () => h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px,2.3vh,26px)', width: '100%' } });
  const NN = [['motor', 'bike', 'motorbike', '🏍️'], ['motor', 'way', 'motorway', '🛣️'], ['bus', 'stop', 'bus stop', '🚏'], ['bus', 'station', 'bus station', '🚌'], ['business', 'woman', 'businesswoman', '👩‍💼'], ['sun', 'glasses', 'sunglasses', '🕶️'], ['coffee', 'shop', 'coffee shop', '☕'], ['living', 'room', 'living room', '🛋️'], ['hand', 'bag', 'handbag', '👜'], ['railway', 'station', 'railway station', '🚉'], ['car', 'park', 'car park', '🅿️'], ['traffic', 'lights', 'traffic lights', '🚦']];
  const RIDDLE = { motorbike: 'You ride this, but it isn\'t a horse or a bicycle.', motorway: 'A big, fast road between cities.', 'bus stop': 'You wait here for a bus.', 'bus station': 'A lot of buses start and finish their journeys here.', businesswoman: 'She works in business and has a lot of meetings.', sunglasses: 'You wear these when it\'s very sunny.', 'coffee shop': 'You can buy a cappuccino here.', 'living room': 'In a house, you watch TV and relax here.', handbag: 'You carry your phone, keys and money in this.', 'railway station': 'You catch a train here.', 'car park': 'You leave your car here.', 'traffic lights': 'Red, yellow, green — cars stop and go.' };

  G.BANK.vn = Q([
    ['🎻 ___ the violin', ['play', 'make'], '*play* the violin.', 'аспапта ойнау — play.'],
    ['🗣️ ___ a foreign language', ['speak', 'say'], '*speak* a language.', 'тілде сөйлеу — speak.'],
    ['🏍️ ___ a motorbike', ['ride', 'play'], '*ride* a motorbike.', 'мотоцикл айдау — ride.'],
    ['👔 ___ a shirt and tie', ['wear', 'play'], '*wear* clothes.', 'киім кию — wear.'],
    ['🏖️ ___ on holiday', ['go', 'make'], '*go* on holiday.', 'демалысқа бару — go.'],
    ['📺 ___ films online', ['watch', 'listen'], '*watch* films.', 'фильм көру — watch.']
  ]);
  G.BANK.prep = Q([
    ['Where are you ___? — Kazakhstan.', ['from', 'of'], 'Where are you *from*?', 'Қайдансың — from.'],
    ['I\'m worried ___ the exam. 😟', ['about', 'to'], 'worried *about*.', 'worried about — алаңдау.'],
    ['Come with me! I go shopping ___ you.', ['with', 'of'], '*with* = together.', 'with — бірге.'],
    ['I was ___ holiday. 🏖️', ['on', 'of'], '*on* holiday.', 'on holiday — демалыста.'],
    ['He is ___ work. 💼', ['at', 'about'], '*at* work.', 'at work — жұмыста.']
  ]);
  G.BANK.req = Q([
    ['💧 ___ have some water, please?', ['Can I', 'Could you'], 'You want something → *Can I…?*', 'Өзіңе керек → Can I…?'],
    ['🚪 ___ open the door, please?', ['Could you', 'Can I'], 'Help me → *Could you…?*', 'Көмек сұрау → Could you…?'],
    ['Which is polite? 🙂', ['Could you help me, please?', 'Help me!'], '*Could you…, please?* is polite.', 'Сыпайы түрі — Could you…, please?']
  ]);

  /* Fusion lab */
  const fusion = { hint: 'Командалар кезекпен екі сөз таңдайды: сол жақтан біреу, оң жақтан біреу. Жаңа сөз шықса — «бірге ме, бөлек пе?» шешіңдер. Біткенде → басыңыз.', render(inner) {
    const A = [...new Set(NN.map(x => x[0]))], B = [...new Set(NN.map(x => x[1]))];
    const T = G.S.teams, found = {};
    let turn = 0, sa = null, sb = null, busy = false;
    const turnEl = h('div'), count = h('div', { class: 'note' }), list = h('div', { class: 'found' });
    const reactor = h('div', { class: 'reactor' });
    const tokA = A.map(w => h('button', { class: 'tok', onclick: () => pick('A', w, tokA) }, w));
    const tokB = B.map(w => h('button', { class: 'tok', onclick: () => pick('B', w, tokB) }, w));
    inner.append(head('Fusion lab', 'Two words. One new thing.'), turnEl,
      h('div', { class: 'lab3' }, h('div', { class: 'tokens' }, tokA), reactor, h('div', { class: 'tokens' }, tokB)),
      count, list, G.kk('Команда кезекпен екі сөз таңдайды. Жаңа сөз шықса — бірге жазыла ма, бөлек пе, соны шешеді.'));
    const drawTurn = () => { const x = T[turn]; turnEl.innerHTML = ''; turnEl.append(h('span', { class: 'tp on' }, h('span', { class: 'dot', style: { '--c': x.color } }), 'Кезек: ' + x.emoji + ' ' + x.name)); };
    const drawCount = () => { count.textContent = Object.keys(found).length + ' / ' + NN.length + ' сөз табылды'; };
    const idle = (msg) => { reactor.classList.remove('hot'); reactor.innerHTML = ''; reactor.append(h('div', { class: 'rw', style: { color: 'var(--ink-3)' } }, msg || ((sa || '?') + ' + ' + (sb || '?')))); };
    const passTurn = () => { turn = (turn + 1) % T.length; drawTurn(); };
    function pick(side, w, toks) {
      if (busy) return;
      G.sfx('tap');
      if (side === 'A') sa = w; else sb = w;
      toks.forEach(t => t.classList.toggle('on', t.textContent === w));
      idle();
      if (sa && sb) setTimeout(react, 250);
    }
    function clearSel() { sa = sb = null; tokA.concat(tokB).forEach(t => t.classList.remove('on')); }
    function flyIn() {
      const [cx, cy] = G.center(reactor);
      [tokA.find(t => t.textContent === sa), tokB.find(t => t.textContent === sb)].forEach(t => {
        if (!t) return;
        const [x0, y0] = G.center(t);
        const cl = h('div', { class: 'flydot', style: { background: 'var(--ink)' } }, t.textContent);
        document.body.append(cl);
        cl.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) translate(-50%,-50%) scale(1)' }, { transform: 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%) scale(.3)', opacity: .1 }], { duration: 520, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => cl.remove();
      });
    }
    function react() {
      const hit = NN.find(x => x[0] === sa && x[1] === sb);
      if (!hit) { G.sfx('bad'); reactor.innerHTML = ''; reactor.append(h('div', null, h('div', { style: { fontSize: '48px' } }, '💨'), h('div', { class: 'rw' }, 'Мұндай сөз жоқ'), h('div', { style: { fontSize: '14px', color: 'var(--ink-2)' } }, 'Кезек келесі командаға өтті'))); clearSel(); passTurn(); return; }
      if (found[hit[2]]) { reactor.innerHTML = ''; reactor.append(h('div', { class: 'rw' }, hit[3] + ' Бұл сөз табылған')); clearSel(); return; }
      busy = true; G.sfx('whoosh'); flyIn(); reactor.classList.add('hot');
      setTimeout(() => { G.sfx('boom'); G.burstAt(reactor, ['#00c7be', '#30d158', '#ffd60a', '#ffffff'], 110); reactor.animate([{ transform: 'scale(.85)' }, { transform: 'scale(1.08)' }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,1.4,.4,1)' }); }, 470);
      const joined = hit[0] + hit[1], spaced = hit[0] + ' ' + hit[1];
      reactor.innerHTML = '';
      reactor.append(h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' } },
        h('div', { style: { fontSize: 'clamp(46px,5vw,70px)', animation: 'pop .6s .45s cubic-bezier(.2,1.4,.4,1) both' } }, hit[3]),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Бірге ме, бөлек пе?'),
        G.shuffle([joined, spaced]).map(o => h('button', { class: 'pill dark sm', onclick: () => {
          const ok = o === hit[2];
          found[hit[2]] = true; busy = false;
          if (ok) G.award(turn, 100, reactor); else G.sfx('bad');
          reactor.classList.remove('hot'); reactor.innerHTML = '';
          reactor.append(h('div', null, h('div', { style: { fontSize: '44px' } }, hit[3]), h('div', { class: 'rw' }, hit[2]), h('div', { style: { fontSize: '14px', color: ok ? 'var(--green-ink)' : 'var(--red-ink)', fontWeight: 600 } }, (ok ? '✓ ' : '✗ ') + (hit[2] === joined ? 'бірге жазылады' : 'бөлек жазылады'))));
          list.append(h('span', null, hit[3] + ' ' + hit[2]));
          drawCount(); clearSel(); passTurn();
          if (Object.keys(found).length === NN.length) { G.sfx('unlock'); G.confetti(80); count.textContent = 'Барлық 12 сөз табылды! Жалғастыру үшін → басыңыз.'; }
        } }, o))));
    }
    drawTurn(); drawCount(); idle('Екі сөз таңдаңыз');
    return {};
  } };

  /* City riddles */
  const city = { render(inner, def, api) {
    const POS = { 'bus station': [8, 34], 'coffee shop': [29, 40], 'living room': [49, 25], 'railway station': [68, 31], motorway: [93, 40], 'traffic lights': [44, 55], 'bus stop': [15, 57], 'car park': [86, 56], motorbike: [58, 76], sunglasses: [22, 93], handbag: [36, 93], businesswoman: [74, 92] };
    const BLD = [[1, 15, 18, '#ffd9a0'], [21, 16, 26, '#ffc2c7'], [40, 19, 10, '#d9ccff'], [61, 15, 18, '#bfeedd'], [80, 12, 30, '#ffd4b0']];
    const items = G.shuffle(Object.keys(POS)).slice(0, 10);
    const awards = items.map(() => new Set());
    let i = 0, revealed = false;
    const scene = h('div', { class: 'city' },
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: '84%', top: '6%', fontSize: '6cqw' } }, '☀️'),
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: '16%', top: '6%', fontSize: '5cqw', opacity: .9 } }, '☁️'),
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: '58%', top: '3%', fontSize: '4cqw', opacity: .8 } }, '☁️'),
      BLD.map(([l, w, t, c]) => h('div', { class: 'b', 'aria-hidden': 'true', style: { left: l + '%', width: w + '%', top: t + '%', background: c } })),
      h('div', { class: 'lane', 'aria-hidden': 'true' }));
    const objs = {};
    NN.forEach(x => {
      const [px, py] = POS[x[2]];
      const tag = h('span', { class: 'tagc', hidden: true }, x[2]);
      const b = h('button', { class: 'o', style: { left: px + '%', top: py + '%' }, 'aria-label': 'object in the city', onclick: () => click(x[2], b, tag) }, x[3], tag);
      objs[x[2]] = { b, tag }; scene.append(b);
    });
    const ey = eyebrow(''), riddle = h('div', { class: 'mid', style: { maxWidth: '26ch', minHeight: '2.4em' } }), foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minHeight: '80px' } });
    inner.append(ey, riddle, scene, foot);
    function show() {
      revealed = false;
      const w = items[i];
      ey.textContent = 'City riddles · ' + (i + 1) + ' / ' + items.length;
      riddle.innerHTML = ''; riddle.append(h('span', { html: G.fmt(RIDDLE[w]) }), ' ', G.sayBtn(RIDDLE[w]));
      foot.innerHTML = ''; foot.append(h('div', { class: 'note' }, 'What is it? Find it in the city.'), G.kk('Бұл не? Қаладан тауып көрсет.'));
      Object.values(objs).forEach(o => { o.b.classList.remove('hit'); o.tag.hidden = true; });
      api.hint('Жұмбақты оқыңдар (🔈). Командалар жауабын ағылшынша айтып, қаладан көрсетеді (суретті басуға болады). → — жауап.');
    }
    function reveal() {
      revealed = true; const w = items[i], o = objs[w];
      o.b.classList.add('hit'); o.tag.hidden = false; G.sfx('ok');
      const [px, py] = POS[w];
      const ring = h('span', { class: 'punch', style: { left: px + '%', top: py + '%' }, 'aria-hidden': 'true' });
      scene.append(ring); setTimeout(() => ring.remove(), 1300);
      scene.style.transformOrigin = px + '% ' + py + '%';
      scene.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)', offset: .35 }, { transform: 'scale(1)' }], { duration: 1400, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(() => G.burstAt(o.b, ['#00c7be', '#30d158', '#ffd60a'], 50), 120);
      foot.innerHTML = ''; foot.append(h('div', { class: 'mid', html: G.fmt('*' + w + '*') }), G.picker(100, awards[i]));
      api.hint('Дұрыс тапқан командаларды басыңыз. Сосын → — ' + (i < items.length - 1 ? 'келесі жұмбақ.' : 'келесі бөлім.'));
    }
    function click(w, b, tag) {
      if (revealed) return;
      if (w === items[i]) reveal();
      else { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); tag.hidden = false; G.sfx('bad'); setTimeout(() => { if (!b.classList.contains('hit')) tag.hidden = true; }, 1600); }
    }
    show();
    return {
      next: () => { if (!revealed) { reveal(); return true; } if (i < items.length - 1) { i++; show(); return true; } return false; },
      prev: () => { if (i > 0) { i--; show(); return true; } return false; }
    };
  } };

  /* Polite requests: messages on a phone */
  const cafe = { render(inner, def, api) {
    const SC = [
      { ico: '☕', place: 'A café', goal: 'Order an espresso and a medium latte.', kk: 'Эспрессо мен орташа латте тапсырыс бер.', npc: 'Barista', turns: [
        ['Hi there! What can I get you?', [['Can I have an espresso and a medium latte, please?', 'ok'], ['Give me an espresso and a latte.', 'rude'], ['Can I to have an espresso and a latte?', 'grammar']]],
        ['Sure. To go or have here?', [['To go, thanks.', 'ok'], ['Yes, I can.', 'meaning'], ['I go.', 'grammar']]]], end: 'Here you are. Have a nice day!' },
      { ico: '🚪', place: 'A shop door', goal: 'You are on crutches. Ask someone to open the door.', kk: 'Сен балдақпен жүрсің. Біреуден есікті ашып беруін сұра.', npc: 'Stranger', turns: [
        ['(Someone is walking to the door.)', [['Excuse me, could you open the door for me, please?', 'ok'], ['Open the door!', 'rude'], ['Could you opening the door, please?', 'grammar']]],
        ['Sure. No problem.', [['Thanks. That\'s very kind of you.', 'ok'], ['Yes, you can.', 'meaning'], ['OK. Go.', 'rude']]]], end: 'You\'re welcome!' },
      { ico: '🍽️', place: 'A restaurant', goal: 'Ask for the bill.', kk: 'Есепшотты сұра.', npc: 'Waiter', turns: [
        ['Was everything OK with your meal?', [['Yes, it was delicious. Can we have the bill, please?', 'ok'], ['Bill. Now.', 'rude'], ['Yes, it were delicious. Can we has the bill?', 'grammar']]],
        ['Certainly. Here you are.', [['Thank you. Is service included?', 'ok'], ['Thank you. Was service include?', 'grammar'], ['Finally!', 'rude']]]], end: 'Yes, it is. Thank you!' },
      { ico: '💊', place: 'A pharmacy', goal: 'Ask for advice about allergy pills.', kk: 'Аллергия дәрісі туралы кеңес сұра.', npc: 'Pharmacist', turns: [
        ['Hello. Can I help you?', [['Yes. Could you give me some advice, please?', 'ok'], ['Advice me something.', 'grammar'], ['You must help me now.', 'rude']]],
        ['Of course. What\'s the problem?', [['I need some allergy pills, but I don\'t know what sort.', 'ok'], ['I need allergy pills, but I don\'t know what sort of.', 'grammar'], ['Pills. Give.', 'rude']]]], end: 'Well, what exactly is your allergy?' },
      { ico: '📚', place: 'The classroom', goal: 'Borrow a dictionary from a classmate.', kk: 'Сыныптасыңнан сөздік сұрап ал.', npc: 'Classmate', turns: [
        ['Hi! What\'s up?', [['Could I borrow your dictionary, please?', 'ok'], ['Could you borrow me your dictionary?', 'grammar'], ['Dictionary. Now.', 'rude']]],
        ['Sure. Here you are.', [['Thanks a lot!', 'ok'], ['Yes, I can.', 'meaning'], ['Here you are.', 'meaning']]]], end: 'No problem 🙂' },
      { ico: '🚗', place: 'After class', goal: 'Ask a friend with a car to take you home.', kk: 'Көлігі бар досыңнан үйге жеткізіп салуын сұра.', npc: 'Friend', turns: [
        ['Bye! See you tomorrow!', [['Wait! Could you give me a lift home, please?', 'ok'], ['Can I give you a lift home?', 'meaning'], ['Take me home.', 'rude']]],
        ['Of course. Get in!', [['Thanks! You\'re a star!', 'ok'], ['No problem.', 'meaning'], ['Could I to get in?', 'grammar']]]], end: '😄🚗' }
    ];
    const WHY = { rude: 'Too rude', grammar: 'Grammar mistake', meaning: 'Wrong meaning' };
    const awards = {};
    let s = 0, tn = 0, revealed = false;
    const sit = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' } });
    const chat = h('div', { class: 'chat' });
    const top = h('div', { class: 'phone-top' });
    const phone = h('div', { class: 'phone' }, top, chat);
    const opts = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' } });
    const foot = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', minHeight: '60px' } });
    inner.append(h('div', { class: 'g2', style: { alignItems: 'center' } }, h('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } }, sit, opts, foot), h('div', { style: { display: 'flex', justifyContent: 'center' } }, phone)));
    const bubble = (txt, out) => { const b = h('div', { class: out ? 'bout' : 'bin' }, txt); chat.append(b); chat.scrollTop = chat.scrollHeight; return b; };
    const typing = then => { const t = h('div', { class: 'typing' }, h('i'), h('i'), h('i')); chat.append(t); chat.scrollTop = chat.scrollHeight; api.after(() => { t.remove(); then(); }, 750); };
    function scene() {
      const S = SC[s]; tn = 0;
      sit.innerHTML = '';
      sit.append(h('div', { class: 'eyebrow' }, 'Polite English · ' + (s + 1) + ' / ' + SC.length), h('div', { style: { fontSize: 'clamp(48px,5vw,72px)', lineHeight: 1 } }, S.ico), h('div', { class: 'headline', style: { fontSize: 'clamp(30px,4vw,54px)' } }, S.place), h('div', { class: 'small-q', style: { color: 'var(--ink-2)' } }, S.goal), G.kk(S.kk));
      top.innerHTML = ''; top.append(h('div', { class: 'av' }, '🧑'), h('b', null, S.npc), 'Messages');
      chat.innerHTML = ''; chat.append(h('div', { class: 'sp' }));
      turn();
    }
    function turn() {
      revealed = false;
      const S = SC[s], T = S.turns[tn];
      opts.innerHTML = ''; foot.innerHTML = '';
      typing(() => {
        if (T[0].startsWith('(')) chat.append(h('div', { style: { textAlign: 'center', fontSize: '12px', color: '#8e8e93', padding: '4px' } }, T[0]));
        else { bubble(T[0]); G.speak(T[0]); }
      });
      G.shuffle(T[1]).forEach(([txt, kind], n) => {
        const b = h('button', { class: 'opt', style: { fontSize: 'clamp(16px,1.7vw,22px)', animation: 'rise .6s ' + (.1 + n * .07) + 's var(--ease) both' }, onclick: () => reveal(kind === 'ok' ? null : b) }, h('span', { class: 'L' }, 'ABC'[n]), h('span', null, txt));
        b._kind = kind; b._txt = txt; opts.append(b);
      });
      foot.append(h('button', { class: 'reveal-btn', onclick: () => reveal(null) }, 'Жауапты көрсету →'));
      api.hint('Жағдайды оқыңдар. Қай жауап әрі сыпайы, әрі дұрыс? Командалар A, B немесе C деп таңдайды. → — жауап.');
    }
    function reveal(wrongBtn) {
      if (revealed) return; revealed = true;
      const S = SC[s], key = s + '-' + tn;
      [...opts.children].forEach(b => {
        if (b._kind === 'ok') { b.classList.add('right'); }
        else { b.classList.add(b === wrongBtn ? 'wrong' : 'dim'); b.append(h('span', { class: 'tagw' }, WHY[b._kind])); }
      });
      G.sfx(wrongBtn ? 'bad' : 'ok');
      const ok = [...opts.children].find(b => b._kind === 'ok');
      bubble(ok._txt, true);
      foot.innerHTML = '';
      foot.append(G.picker(100, awards[key] || (awards[key] = new Set())));
      if (tn === S.turns.length - 1) typing(() => bubble(S.end));
      api.hint('Дұрыс тапқан командаларды басыңыз. Бір жұп диалогты рөлмен ойнап көрсетсін. → — жалғасы.');
    }
    scene();
    return {
      next: () => { if (!revealed) { reveal(null); return true; } if (tn < SC[s].turns.length - 1) { tn++; turn(); return true; } if (s < SC.length - 1) { s++; scene(); return true; } return false; },
      prev: () => { if (s > 0) { s--; scene(); return true; } return false; }
    };
  } };

  /* Formal email: the class writes it together */
  const email = { render(inner, def, api) {
    const group = G.S.group ? 'Group ' + G.S.group : 'The students of Unit 5';
    const LINES = [
      ['Dear Ms Sadykova,', 'Hi Aigerim!!', 'Hey you,'],
      ['We are interested in the job of junior superhero.', 'We want ur job lol.', 'We interested job superhero.'],
      ['We are first-year students at university.', 'We is first-year students at university.', 'We first-year students at university.'],
      ['We can speak Kazakh, Russian and English, and we can work in a team.', 'We can to speak three languages.', 'We cans speak three languages.'],
      ['Last summer we were volunteers at a children\'s camp.', 'Last summer we are volunteers at a children\'s camp.', 'Last summer we was volunteers at a children\'s camp.'],
      ['We look forward to hearing from you.', 'See ya!', 'Write us fast.'],
      ['Yours sincerely,', 'Love,', 'Bye bye,']
    ];
    const NF = 'Not formal', GM = 'Grammar mistake';
    const WHY = [[NF, NF], [NF, GM], [GM, GM], [GM, GM], [GM, GM], [NF, NF], [NF, NF]];
    const awards = LINES.map(() => new Set());
    let i = -1, revealed = false, sent = false;
    const body = h('div', { class: 'mbody' }, h('span', { class: 'caret' }));
    const mail = h('div', { class: 'mailw' },
      h('div', { class: 'mailbar' }, h('i', { style: { background: '#ff5f57' } }), h('i', { style: { background: '#febc2e' } }), h('i', { style: { background: '#28c840' } }), h('span', null, 'New Message')),
      h('div', { class: 'mrow' }, h('b', null, 'To:'), 'Ms Aigerim Sadykova — Super Hero Agency'),
      h('div', { class: 'mrow' }, h('b', null, 'Subject:'), 'Junior superhero job'), body);
    const ad = h('div', { class: 'ad' }, h('div', { style: { fontSize: '44px' } }, '🦸'), h('div', null, h('div', { class: 'eyebrow' }, 'Super Hero Agency · Astana'), h('h3', null, 'Junior superheroes wanted.'), h('ul', null, h('li', null, 'Can you speak two or more languages?'), h('li', null, 'Can you work in a team?'), h('li', null, 'Were you a volunteer before?'))));
    const opts = h('div', { class: 'opts', style: { gridTemplateColumns: '1fr', maxWidth: '800px' } });
    const foot = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minHeight: '60px' } });
    const ey = eyebrow('Writing · a formal email');
    inner.append(ey, ad, mail, opts, foot);
    function intro() {
      opts.innerHTML = ''; foot.innerHTML = '';
      foot.append(h('div', { class: 'note' }, 'Let\'s apply — together. Choose the formal sentence for every line.'), G.kk('Агенттікке бірге өтініш хат жазамыз. Әр жолға ресми сөйлемді таңдаңдар.'));
      api.hint('Хабарландыруды оқыңдар. → — хаттың бірінші жолы.');
    }
    function step() {
      revealed = false;
      ey.textContent = 'Writing · line ' + (i + 1) + ' / ' + LINES.length;
      opts.innerHTML = ''; foot.innerHTML = '';
      G.shuffle(LINES[i].map((t, k) => ({ t, k }))).forEach((o, n) => {
        const b = h('button', { class: 'opt', style: { fontSize: 'clamp(16px,1.7vw,22px)', animation: 'rise .6s ' + (.08 + n * .06) + 's var(--ease) both' }, onclick: () => reveal(o.k === 0 ? null : b) }, h('span', { class: 'L' }, 'ABC'[n]), h('span', null, o.t));
        b._k = o.k; opts.append(b);
      });
      api.hint('Қай сөйлем ресми хатқа сай? Командалар A, B немесе C деп таңдайды. → — жауап (ол хатқа жазылады).');
    }
    function typeLine(txt) {
      const caret = body.querySelector('.caret'); if (caret) caret.remove();
      const p = h('p', { style: { margin: i === 0 || i >= 5 ? '0 0 10px' : '0 0 6px' } });
      body.append(p, h('span', { class: 'caret' }));
      let n = 0;
      const id = api.every(() => { n++; p.textContent = txt.slice(0, n); if (n >= txt.length) clearInterval(id); }, 18);
    }
    function reveal(wrongBtn) {
      if (revealed) return; revealed = true;
      [...opts.children].forEach(b => { if (b._k === 0) b.classList.add('right'); else { b.classList.add(b === wrongBtn ? 'wrong' : 'dim'); b.append(h('span', { class: 'tagw' }, WHY[i][b._k - 1])); } });
      G.sfx(wrongBtn ? 'bad' : 'ok');
      typeLine(LINES[i][0]);
      if (i === LINES.length - 1) api.after(() => typeLine(group), 600);
      foot.innerHTML = ''; foot.append(G.picker(100, awards[i]));
      api.hint('Дұрыс тапқан командаларды басыңыз. Сосын → — ' + (i < LINES.length - 1 ? 'келесі жол.' : 'хатты жіберу! 📨'));
    }
    function send() {
      sent = true; opts.innerHTML = ''; foot.innerHTML = '';
      G.sfx('whoosh'); mail.classList.add('sent');
      api.after(() => {
        ad.remove(); mail.remove();
        ey.textContent = 'Inbox';
        inner.append(h('div', { html: '<svg class="drawcheck" width="96" height="96" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="#30d158" stroke-width="3" opacity=".25"/><path d="M14 27 l8 8 l16 -18" fill="none" stroke="#30d158" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' }),
          h('div', { class: 'display grad shimmer' }, 'Sent.'),
          h('div', { class: 'phone', style: { height: 'auto', minHeight: '0' } }, h('div', { class: 'phone-top' }, h('div', { class: 'av' }, '🦸'), h('b', null, 'Super Hero Agency'), 'now'),
            h('div', { class: 'chat' }, h('div', { class: 'bin' }, 'Dear ' + group + ', thank you for your email. You can start on Monday. Welcome to the Agency! 🦸'))));
        G.sfx('fanfare'); G.confetti(120);
        api.hint('Хат жіберілді, агенттік жауап берді! → — финалдық шайқас.');
      }, 900);
    }
    intro();
    return {
      next: () => {
        if (sent) return false;
        if (i === -1) { i = 0; step(); return true; }
        if (!revealed) { reveal(null); return true; }
        if (i < LINES.length - 1) { i++; step(); return true; }
        send(); return true;
      }
    };
  } };

  /* The awards */
  const awardsScene = { dark: true, hint: 'Марапаттау! → басқан сайын келесі команда ашылады: соңғы орыннан біріншіге дейін.', render(inner, def, api, el) {
    el.prepend(h('div', { class: 'beams', 'aria-hidden': 'true' }, h('div', { class: 'beam l' }), h('div', { class: 'beam r' })));
    G.fx(el, 'stars');
    const T = G.S.teams.map((x, t) => ({ x, t })).sort((a, b) => a.x.score - b.x.score);
    const max = Math.max(1, ...T.map(r => r.x.score));
    let k = -1;
    const rows = h('div', { class: 'awards' });
    const final = h('div', { style: { minHeight: '10px' } });
    inner.append(eyebrow('Headway Elementary · Unit 5'), h('h1', { class: 'display grad shimmer', style: { '--g': 'var(--g-brand)' } }, 'Super U Awards.'),
      h('div', { class: 'chips', style: { marginTop: '6px' } }, G.ORDER.map((id, n) => h('div', { class: 'float', style: { animationDelay: (-n * 2) + 's' } }, G.chip(G.LESSONS[id], { tag: 'div', size: 'clamp(90px,10vw,130px)', cls: 'spin-in', delay: (n * .2) + 's' })))),
      rows, final);
    function revealNext() {
      k++;
      if (k < T.length) {
        const r = T[k], place = T.length - k;
        const bar = h('i', { style: { width: '0%', '--c': r.x.color } }), sc = h('span', { class: 'sc' }, '0');
        const rowEl = h('div', { class: 'arow' }, h('span', { class: 'pl' }, place), h('span', { class: 'nm' }, h('span', { class: 'dot', style: { '--c': r.x.color } }), r.x.emoji + ' ' + r.x.name), h('span', { class: 'bar' }, bar), sc);
        rows.prepend(rowEl);
        G.sfx(place === 1 ? 'drum' : 'point');
        setTimeout(() => { bar.style.width = (r.x.score / max * 100) + '%'; G.countUp(sc, 0, r.x.score, null, 1300); }, 60);
        setTimeout(() => G.burstAt(sc, [r.x.color, '#ffffff'], place === 1 ? 80 : 30), 1350);
        if (place === 1) setTimeout(() => {
          G.fx(el, 'fireworks', { colors: ['#ff9004', '#ff2e54', '#2997ff', '#a95cff', '#30d158', '#ffd60a'] });
          final.append(h('div', { class: 'winner', style: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' } }, h('div', { style: { fontSize: 'clamp(60px,8vw,110px)' } }, r.x.emoji), h('div', { class: 'headline', style: { color: 'var(--moon)' } }, 'Team ' + r.x.name + '.'), h('div', { class: 'lede', style: { color: 'var(--moon-2)' } }, 'Super U. Congratulations, everyone!')));
          G.sfx('fanfare'); G.confetti(240);
        }, 900);
        return true;
      }
      if (k === T.length && G.S.students.length) {
        k++;
        const top = G.S.students.slice().sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 3);
        rows.innerHTML = ''; final.innerHTML = '';
        const order = [top[1], top[0], top[2]], hts = ['150px', '210px', '110px'], pl = [2, 1, 3];
        final.append(h('div', { class: 'eyebrow', style: { animation: 'rise .8s var(--ease) both' } }, '⭐ Сабақтың MVP-лері'),
          h('div', { class: 'podium', style: { marginTop: '16px' } }, order.map((s, n) => s ? h('div', { style: { animationDelay: [.6, 1.4, .2][n] + 's' } },
            h('div', { style: { fontSize: '40px' } }, ['🥈', '🥇', '🥉'][n]),
            h('div', { class: 'nm' }, s.name),
            h('div', { style: { color: 'var(--moon-2)', fontWeight: 600 } }, '⭐ ' + (s.stars || 0)),
            h('div', { class: 'blk', style: { height: hts[n] } }, pl[n])) : h('div'))),
          h('div', { class: 'lede', style: { color: 'var(--moon-2)', marginTop: '18px', animation: 'rise 1s 2s var(--ease) both' } }, G.S.students.map(s => s.name).join(' · ')),
          h('div', { class: 'headline', style: { color: 'var(--moon)', animation: 'rise 1s 2.4s var(--ease) both' } }, 'Thank you, ' + (G.S.group || 'everyone') + '!'));
        G.sfx('drum'); setTimeout(() => { G.sfx('fanfare'); G.confetti(220); }, 1500);
        api.hint('MVP — ең көп ⭐ жинаған оқушылар. Құттықтаймыз!');
        return true;
      }
      return false;
    }
    return { next: () => revealNext() };
  } };

  G.lesson({
    id: 'connect', n: 3, title: 'Connect', chip: 'please', grad: 'var(--g-connect)', glow: 'rgba(48,209,88,.55)', glowColor: '#21c47a', colors: ['#00c7be', '#30d158', '#64d2ff'], fx: 'orbs',
    grammar: 'words that go together · polite requests · formal email', minutes: 95,
    blurb: 'Сөз біріктіру зертханасы, жұмбақ қала, нақты диалогтар және жұмысқа нақты өтініш хат.',
    specs: { grammar: 'Can I…? / Could you…? — сыпайы өтініш және жауаптар · ресми хат тіркестері', words: 'noun + noun: bus stop, sunglasses, traffic lights… · verb + noun: play the violin, earn money… · предлогтар: about, of, to, from, on, at, with, for', skills: 'Сөйлеу: рөлдік ойын · Жазу: жұмысқа ресми хат', games: 'Fusion lab · City riddles · Messages · The email · Super U Awards' },
    scenes: [
      { type: 'film', dark: true, lines: ['Some words are strong.', 'Together, they are *stronger*.', 'bus + stop.', 'sun + glasses.'], kicker: 'Lesson 3', title: 'Connect.', sub: 'words that go together · polite requests · a formal email', kk: 'Бүгін — бірге жүретін сөздер және сыпайы ағылшын тілі.' },
      { type: 'task', kicker: 'Warm-up · 3 minutes', title: 'On the street.', note: 'In teams: write 6 things you can see on the street.', kk: 'Жылыну: командамен көшеде көретін 6 нәрсені ағылшынша жазыңдар. Қай команда көп жазады?', minutes: 3,
        prompts: ['a *bus*…', 'a *car*…', '*traffic*…', 'a *coffee*…', 'a *railway*…'],
        model: ['What can you see?', 'A bus, a car and traffic lights!'] },
      { type: 'explain', kicker: 'Words', title: 'noun + noun', beats: [
        { lines: ['*sun* + *glasses*', '= sunglasses'], note: 'One word.', kk: 'Бірге жазылады.' },
        { lines: ['*bus* + *stop*', '= bus stop'], note: 'Two words.', kk: 'Бөлек жазылады.' },
        { lines: ['One word: *motorbike · motorway · handbag · businesswoman*', 'Two words: *car park · coffee shop · living room · traffic lights*'], note: 'Learn them. The stress is on the first word: BUS stop.', kk: 'Бұларды жатта. Екпін бірінші сөзге түседі.' }
      ] },
      fusion,
      city,
      { type: 'blur', items: [['🚦', 'traffic lights'], ['🕶️', 'sunglasses'], ['🏍️', 'motorbike'], ['🚏', 'bus stop'], ['☕', 'coffee shop'], ['👜', 'handbag']] },
      { type: 'explain', kicker: 'Words', title: 'verb + noun', beats: [
        { lines: ['*play* the violin', '*speak* a foreign language', '*ride* a motorbike'], kk: 'Бұл етістіктер осы зат есімдермен бірге жүреді.' },
        { lines: ['*earn* a lot of money', '*look after* your health', '*wear* a shirt and tie'], note: 'Don\'t translate word by word.', kk: '«Ақша табу» — earn money (find money емес).' },
        { lines: ['*go* on holiday · *go* by train', '*send* text messages · *watch* films online', '*live* on the third floor'] }
      ] },
      { type: 'memory', kicker: 'Memory', title: 'Find the *pairs*.', kk: 'Етістік пен оның жұбын табыңдар: play — the violin.', pairs: [['play', 'the violin'], ['speak', 'a language'], ['ride', 'a motorbike'], ['wear', 'a shirt and tie'], ['go', 'on holiday'], ['watch', 'films online']] },
      { type: 'explain', kicker: 'Little words', title: 'about · of · to · from · on · at · with · for', beats: [
        { lines: ['worried *about*', 'married *to*', 'proud *of*'], note: 'Some words always take the same preposition.', kk: 'Кейбір сөздерден кейін үнемі бір предлог келеді.' },
        { lines: ['*on* holiday', '*at* work · *at* home', 'Where are you *from*?'], note: 'In questions, the preposition often goes at the end.', kk: 'Сұрақта предлог соңына шығады.' }
      ] },
      { type: 'quiz', title: 'Little words', timer: 15, pts: 100, items: G.BANK.prep, count: 5 },
      { type: 'explain', kicker: 'Everyday English', title: 'Can I…? Could you…?', beats: [
        { lines: ['*Can I* have a latte, please?'], note: 'You want something.', kk: 'Өзіңе бір нәрсе керек болғанда — Can I…?' },
        { lines: ['*Could you* open the door, please?'], note: 'Someone does something for you.', kk: 'Біреу саған бір нәрсе істеп бергенде — Could you…?' },
        { lines: ['*Could* is more polite.', 'Always say *please*.'], kk: 'Could — сыпайылау. please сөзін ұмытпа.' },
        { lines: ['Sure. · Of course.', 'Here you are. · No problem.'], note: 'Replies.', kk: 'Жауаптар.' }
      ] },
      cafe,
      email,
      { type: 'quiz', title: 'Final battle · triple points', timer: 15, pts: 300, items: [].concat(G.BANK.can, G.BANK.adv, G.BANK.waswere, G.BANK.could, G.BANK.born, G.BANK.vn, G.BANK.prep, G.BANK.req), count: 8 },
      { type: 'recap', rules: ['*bus stop* · *sunglasses*', '*play* the violin', 'worried *about*', '*Can I* …? · *Could you* …?', '*Dear* … · *Yours sincerely*'], starters: ['Today I learned the word …', '*Could you* … , please?', 'In a formal email we write …'], kk: 'Бүгін: бірге жүретін сөздер, предлогтар, сыпайы өтініш және ресми хат.' },
      { type: 'unlock', dark: true, lesson: 'connect', line: 'Connect unlocked.', note: 'Three powers. One group. Time for the awards.', kk: 'Үшінші күш ашылды! Енді → басыңыз — марапаттау басталады.', hint: 'Үш күш те ашылды! → — Super U Awards марапаттауы.' },
      awardsScene
    ]
  });
})();
