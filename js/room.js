/* =========================================================
   DOPPIO — room.js (the room)
   a dot that drops, a sun you drag through the day, a floor you can sit on
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = window.DP, { $, $$ } = D;
  const DATA = window.DP_DATA;
  const M = D.motion;
  const milan = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const hhmm = (m) => `${D.pad(Math.floor(m / 60) % 24)}:${D.pad(m % 60)}`;

  /* =======================================================
     1 · HERO — the letters rise, the full stop drops like coffee and ripples
     ======================================================= */
  const word = $('.rh__w'), dot = $('#rhDot'), ring = $('#rhRing'), plate = $('#rhPlate');
  const chars = D.split(word);
  const placeRing = () => { ring.style.left = `${dot.offsetLeft + dot.offsetWidth / 2}px`; ring.style.top = `${dot.offsetTop + dot.offsetHeight * .78}px`; };
  placeRing(); addEventListener('resize', placeRing); document.fonts?.ready.then(placeRing);
  const ripple = () => {
    if (!M) return;
    gsap.fromTo(ring, { scale: .2, opacity: .9 }, { scale: 3.4, opacity: 0, duration: 1.3, ease: 'power2.out', overwrite: true });
  };
  if (M) {
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    gsap.set(dot, { y: -innerHeight, opacity: 1 });
    gsap.set(plate, { scale: .6, rotate: -120, opacity: 0 });
    gsap.set(['.rh__p', '.rh__facts'], { y: 30, opacity: 0 });
    D.ready.then(() => {
      gsap.timeline()
        .to(plate, { scale: 1, rotate: 0, opacity: 1, duration: 1.6, ease: 'expo.out' }, 0)
        .to(chars, { yPercent: 0, opacity: 1, duration: .9, stagger: .05, ease: 'expo.out' }, .15)
        .to(dot, { y: 0, duration: .9, ease: 'bounce.out' }, .55)
        .call(ripple, null, .95)
        .to(['.rh__p', '.rh__facts'], { y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out' }, 1);
    });
    // the table turns like a record as you scroll away
    gsap.to(plate, { rotate: 70, yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    dot.parentElement.addEventListener('pointerenter', () => { gsap.fromTo(dot, { y: -60 }, { y: 0, duration: .8, ease: 'bounce.out', onComplete: ripple }); });
  }

  /* =======================================================
     2 · GOOD MORNING — drag the sun: the greeting, the colour and the offer follow
     ======================================================= */
  const gm = $('#day'), range = $('#gmRange'), knob = $('#gmKnob'), track = $('#gmTrack');
  const wordEl = $('#gmWord'), timeEl = $('#gmTime'), statusEl = $('#gmStatus'), whatEl = $('#gmWhat'), cup = $('#gmCup');
  const MIN = +range.min, MAX = +range.max;
  $('#gmTicks').innerHTML = Array.from({ length: 10 }, (_, i) => 6 + i * 2).map((h) => `<span style="left:${((h * 60 - MIN) / (MAX - MIN)) * 100}%">${D.pad(h % 24)}</span>`).join('');
  const greet = (m) => (m < 720 ? 'morning' : m < 1020 ? 'afternoon' : m < 1260 ? 'evening' : 'night');
  const TINT = { morning: '#eef3b7', afternoon: '#f9faec', evening: '#f3c3cd', night: '#2f3d12' };
  const setWord = (el, w) => {
    el.textContent = '';
    [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'fl'; s.textContent = c; el.append(s); });
    el.setAttribute('aria-label', w);
  };
  let cur = '', lastSlot = -1;
  const paint = (m, quiet) => {
    const p = (m - MIN) / (MAX - MIN);
    gsap.set(knob, { left: `${p * 100}%` });
    timeEl.textContent = hhmm(m);
    const slot = DATA.day.findIndex((s) => m >= s.from && m < s.to);
    const s = DATA.day[slot];
    if (slot !== lastSlot) {
      lastSlot = slot;
      whatEl.textContent = s.what;
      statusEl.textContent = s.open ? 'open' : 'closed';
      statusEl.classList.toggle('is-closed', !s.open);
      if (M && !quiet) gsap.fromTo(whatEl, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
    }
    const g = greet(m);
    if (g !== cur) {
      const prev = cur; cur = g;
      gm.classList.toggle('is-night', g === 'night');
      const icon = $('#gmIcon');
      if (M && !quiet) {
        gsap.to(gm, { '--tint': TINT[g], duration: .8, ease: 'power2.out' });
        const old = $$('.fl', wordEl);
        gsap.to(old, { rotateX: 90, opacity: 0, duration: .18, stagger: .02, ease: 'power2.in', onComplete: () => {
          setWord(wordEl, g);
          gsap.from($$('.fl', wordEl), { rotateX: -100, opacity: 0, duration: .5, stagger: .03, ease: 'back.out(2.2)' });
        } });
        gsap.fromTo(cup, { rotate: prev ? D.pick([-12, 12]) : 0, y: -20 }, { rotate: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, .4)' });
      } else { gm.style.setProperty('--tint', TINT[g]); setWord(wordEl, g); }
      const night = g === 'night';
      gsap.to($('.sun', icon), { opacity: night ? 0 : 1, scale: night ? .4 : 1, transformOrigin: '50% 50%', duration: M ? .4 : 0 });
      gsap.to($('.rays', icon), { opacity: night ? 0 : 1, rotate: night ? 90 : 0, duration: M ? .4 : 0 });
      gsap.to($('.moon', icon), { opacity: night ? 1 : 0, duration: M ? .4 : 0 });
    }
    // the cup drifts across with the sun
    if (M) gsap.to(cup, { x: (p - .5) * innerWidth * .16, duration: .6, ease: 'power3.out', overwrite: 'auto' });
  };
  // start at milano's real time (clamped to the day we draw)
  const now = milan(), nowMin = D.clamp(now.getHours() * 60 + now.getMinutes(), MIN, MAX);
  range.value = nowMin;
  $('#gmNow').style.left = `${((nowMin - MIN) / (MAX - MIN)) * 100}%`;
  paint(nowMin, true);
  range.addEventListener('input', () => paint(+range.value));
  range.addEventListener('change', () => {
    const m = +range.value;
    if (m >= 1410) D.toast('we are closing. the last doppio is on the house. (it\'s not. but nice try.)');
  });
  if (M) {
    gsap.from('.gm__w', { yPercent: 60, opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: gm, start: 'top 70%' } });
    gsap.from(cup, { yPercent: -60, rotate: -14, opacity: 0, duration: 1.3, ease: 'bounce.out', scrollTrigger: { trigger: gm, start: 'top 60%' } });
    gsap.from('#gmBadge', { x: 80, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: gm, start: 'top 55%' } });
    gsap.to($('#gmIcon .rays'), { rotate: 360, duration: 14, repeat: -1, ease: 'none' });
    // a little demo: the sun sweeps from 7:00 to now the first time you arrive
    ScrollTrigger.create({
      trigger: gm, start: 'top 40%', once: true,
      onEnter: () => { const o = { v: 420 }; gsap.to(o, { v: nowMin, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { range.value = Math.round(o.v / 5) * 5; paint(+range.value); } }); },
    });
  }

  /* =======================================================
     3 · THE FLOOR — walls draw, seats pop, callouts point at their zone
     ======================================================= */
  const pStage = $('#planStage'), svg = $('#planSvg'), seatsG = $('#planSeats'), lines = $('#planLines');
  const NS = 'http://www.w3.org/2000/svg';
  let mineSeat = D.store.get('seat');
  // seeded "busy" seats, so the room looks lived in but stays stable per day
  const day = new Date().getDate();
  let n = 0;
  DATA.zones.forEach((z) => z.seats.forEach(([x, y]) => {
    n++;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'seat'); g.dataset.zone = z.id; g.dataset.n = n;
    const busy = ((n * 7 + day * 3) % 10) < 4;
    if (busy && String(n) !== mineSeat) g.classList.add('is-busy');
    if (String(n) === mineSeat) g.classList.add('is-mine');
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 11);
    g.append(c); seatsG.append(g);
  }));
  const seats = $$('.seat', seatsG);
  const freeEl = $('#planFree');
  const paintFree = () => (freeEl.textContent = seats.filter((s) => !s.classList.contains('is-busy') && !s.classList.contains('is-mine')).length);
  paintFree();
  seatsG.addEventListener('click', (e) => {
    const s = e.target.closest('.seat'); if (!s) return;
    if (s.classList.contains('is-busy')) { D.toast('taken. by someone with a laptop and no intention of leaving.'); return; }
    const was = s.classList.contains('is-mine');
    seats.forEach((x) => x.classList.remove('is-mine'));
    if (!was) {
      s.classList.add('is-mine'); D.store.set('seat', s.dataset.n);
      const z = DATA.zones.find((q) => q.id === s.dataset.zone);
      D.toast(`seat ${s.dataset.n} at ${z.name} is yours for twenty minutes. we'll pretend we didn't see the third coffee.`, 3800);
      if (M) gsap.fromTo(s, { scale: 1.8, transformOrigin: '50% 50%' }, { scale: 1, duration: .7, ease: 'elastic.out(1.2, .35)' });
    } else { D.store.set('seat', ''); D.toast('seat released. someone else will love it.'); }
    paintFree();
  });
  seatsG.addEventListener('pointerover', (e) => { const s = e.target.closest('.seat'); if (s) s.dataset.cursor = s.classList.contains('is-busy') ? 'taken' : s.classList.contains('is-mine') ? 'yours ♥' : `seat ${s.dataset.n}`; });

  // callout lines: from each square's inner top corner to the middle of its zone
  const zcs = $$('.zc', pStage);
  const box = (el) => { let x = 0, y = 0, e = el; while (e && e !== pStage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
  let lp = M ? 0 : 1;
  const drawLines = () => {
    lines.setAttribute('viewBox', `0 0 ${pStage.offsetWidth} ${pStage.offsetHeight}`);
    const map = box($('.plan__map', pStage)), k = map.w / 800;
    lines.innerHTML = zcs.map((f) => {
      const z = DATA.zones.find((q) => q.id === f.dataset.zone);
      const cx = z.seats.reduce((a, s) => a + s[0], 0) / z.seats.length, cy = z.seats.reduce((a, s) => a + s[1], 0) / z.seats.length;
      const sq = box($('.slot', f)), left = f.classList.contains('zc--l');
      return `<path d="M${left ? sq.x + sq.w : sq.x} ${sq.y} L${map.x + cx * k} ${map.y + cy * k}" />`;
    }).join('');
    $$('path', lines).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L * (1 - lp); });
  };
  drawLines();
  addEventListener('resize', () => setTimeout(drawLines, 120));
  document.fonts?.ready.then(drawLines);
  zcs.forEach((f) => {
    f.addEventListener('pointerenter', () => pStage.classList.add(`is-zone-${f.dataset.zone}`));
    f.addEventListener('pointerleave', () => pStage.classList.remove(`is-zone-${f.dataset.zone}`));
  });
  if (M) {
    const walls = $$('.pl-walls path', svg);
    walls.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set($$('.pl-furn > *', svg), { opacity: 0, scale: .6, transformOrigin: 'center', transformBox: 'fill-box' });
    gsap.set(seats, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(zcs, { opacity: 0, scale: .7, rotate: (i) => (i % 2 ? 8 : -8) });
    ScrollTrigger.create({
      trigger: pStage, start: 'top 65%', once: true,
      onEnter: () => {
        drawLines();
        gsap.timeline()
          .to(walls, { strokeDashoffset: 0, duration: 1.2, stagger: .1, ease: 'power2.inOut' })
          .to($$('.pl-furn > *', svg), { opacity: 1, scale: 1, duration: .5, stagger: .04, ease: 'back.out(2)' }, .6)
          .to(seats, { scale: 1, duration: .4, stagger: { each: .015, from: 'random' }, ease: 'back.out(3)' }, 1)
          .to(zcs, { opacity: 1, scale: 1, rotate: 0, duration: .7, stagger: .1, ease: 'back.out(1.8)' }, 1.2)
          .to({ v: 0 }, { v: 1, duration: .8, ease: 'power2.inOut', onUpdate() { lp = this.targets()[0].v; $$('path', lines).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDashoffset = L * (1 - lp); }); } }, 1.5);
      },
    });
  }

  /* =======================================================
     4 · VISIT — the address rises, the pin pulses, open or closed right now
     ======================================================= */
  const addr = $('.visit__addr span');
  const aChars = D.split(addr);
  D.fit(addr);
  document.fonts?.ready.then(() => D.fit(addr));
  const m = now.getHours() * 60 + now.getMinutes(), wk = now.getDay() % 6 === 0;
  const open = wk ? m >= 480 : m >= 420 && m < 1380;
  $('#visitOpen').textContent = open ? `open right now · ${hhmm(m)} in milano` : `closed right now · we open at ${wk ? '8:00' : '7:00'}`;
  if (M) {
    gsap.from(aChars, { yPercent: 100, opacity: 0, duration: .9, stagger: .025, ease: 'expo.out', scrollTrigger: { trigger: '#visit', start: 'top 75%' } });
    gsap.from('#vmPin', { y: -80, duration: 1, ease: 'bounce.out', scrollTrigger: { trigger: '#visitMap', start: 'top 85%' } });
    gsap.from('.visit__col', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.visit__grid', start: 'top 85%' } });
  }

  /* ---------- footer word ---------- */
  if (M) gsap.from('.ft__word', { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });
})();
