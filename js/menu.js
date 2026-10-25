/* =========================================================
   DOPPIO — menu.js
   four posters, four boards, three sizes, one receipt
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = window.DP, { $, $$ } = D;
  const { menu, sizes } = window.DP_DATA;
  const M = D.motion;
  const FIXED = new Set(['cornetto', 'sandwich', 'cookie']); // food: one size, and it's two
  const eur = (n) => `€${n.toFixed(2)}`;
  const ITEMS = {};
  menu.forEach((b) => b.items.forEach((it) => (ITEMS[it.id] = { ...it, board: b.id })));

  /* =======================================================
     1 · POSTERS — dealt from one pile onto the 2×2 grid
     ======================================================= */
  const posters = $$('.poster');
  if (M) {
    gsap.set(posters, { opacity: 0 });
    D.ready.then(() => {
      const g = $('#posterGrid').getBoundingClientRect();
      const cx = g.left + g.width / 2, cy = g.top + g.height / 2;
      posters.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        gsap.fromTo(p,
          { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) + 80, rotate: [-14, 9, -6, 12][i], scale: .7, opacity: 1 },
          { x: 0, y: 0, rotate: 0, scale: 1, duration: 1.1, delay: .25 + (3 - i) * .12, ease: 'expo.out' });
      });
      gsap.from('.posters__t', { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out' });
      gsap.from('.posters__s', { opacity: 0, y: 20, duration: .9, delay: .2 });
    });
    // the glasses drift as the posters scroll away
    posters.forEach((p, i) => gsap.to($('.poster__glass', p), { yPercent: i % 2 ? -14 : -24, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  /* =======================================================
     2 · THE BOARDS — cards dealt per board, prices roll on size change
     ======================================================= */
  const list = $('#boardList');
  list.innerHTML = menu.map((b, bi) => `
    <div class="board" id="${b.id}">
      <div class="board__head">
        <span class="board__n">${D.pad(bi + 1)}</span>
        <h2 class="board__t">(( ${b.name} ))</h2>
        <p class="board__note">${b.note} · ${b.items.length} things</p>
      </div>
      <div class="board__grid">
        ${b.items.map((it, i) => `
        <article class="card" data-id="${it.id}" data-cursor="(( ${it.name} ))">
          <span class="card__n">${D.pad(i + 1)}</span>
          <span class="card__price" data-price></span>
          <div class="card__img">
            ${FIXED.has(it.id) ? '<span class="card__fixed">one size: two</span>' : '<span class="card__x">+1 shot</span>'}
            <div class="card__scale"><div class="slot slot--cut" data-img="${it.img}" data-label="${it.img.replace('img/', '')} · ${it.name}, cut out, no background. 3:4"></div></div>
          </div>
          <h3 class="card__name">(( ${it.name} ))</h3>
          <p class="card__desc">${it.desc}</p>
          <button class="card__add" data-add="${it.id}" data-cursor="+2">+ add two</button>
        </article>`).join('')}
      </div>
    </div>`).join('');
  D.slots(list);
  D.mag(list);

  // the size switch
  const seg = $('#sizeSeg');
  seg.innerHTML = `<i class="size__thumb" id="sizeThumb"></i>` + sizes.map((s, i) => `<button class="size" role="radio" data-size="${i}" aria-checked="false">${s.name}</button>`).join('');
  const thumb = $('#sizeThumb'), sizeBtns = $$('.size', seg);
  const NOTES = ['the normal one. still two shots.', 'four shots. your heart is fine. probably.', 'six shots. we will call your mum.'];
  let size = +(D.store.get('size') || 0);
  const moveThumb = (instant) => {
    const b = sizeBtns[size];
    const vars = { x: b.offsetLeft - 4, width: b.offsetWidth };
    if (instant || !M) gsap.set(thumb, vars); else gsap.to(thumb, { ...vars, duration: .6, ease: 'elastic.out(1, .7)' });
    sizeBtns.forEach((x, i) => x.setAttribute('aria-checked', i === size));
  };
  const priceOf = (id, s = size) => ITEMS[id].price + (FIXED.has(id) ? 0 : sizes[s].add);
  // a price rolls like a till: old digits up and out, new ones up from below
  const roll = (el, text, dir = 1) => {
    if (!M || !el.textContent) { el.textContent = text; return; }
    let old = $$('.c', el);
    if (!old.length) old = D.split(Object.assign(el, { _split: null }));
    gsap.to(old, { yPercent: -110 * dir, opacity: 0, duration: .2, stagger: .02, ease: 'power2.in', onComplete: () => {
      el.textContent = text;
      const cs = D.split(Object.assign(el, { _split: null }));
      gsap.fromTo(cs, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, stagger: .03, ease: 'back.out(2)' });
    } });
  };
  const paintPrices = (dir) => $$('.card', list).forEach((c) => roll($('[data-price]', c), eur(priceOf(c.dataset.id)), dir));
  const setSize = (s, quiet) => {
    const dir = s >= size ? 1 : -1;
    size = s; D.store.set('size', s);
    moveThumb(quiet);
    paintPrices(dir);
    $('#sizeNote').textContent = NOTES[s];
    const sc = sizes[s].scale;
    const scales = $$('.card', list).filter((c) => !FIXED.has(c.dataset.id)).map((c) => $('.card__scale', c));
    const xs = $$('.card__x', list);
    if (M) {
      gsap.to(scales, { scale: sc, duration: .8, stagger: .015, ease: 'elastic.out(1, .45)' });
      gsap.to(xs, { scale: s ? 1 : 0, rotate: -12, duration: .5, stagger: .02, ease: s ? 'back.out(3)' : 'power2.in' });
      xs.forEach((x) => (x.textContent = s === 2 ? '+4 shots' : '+2 shots'));
      if (!quiet) gsap.fromTo('#sizeNote', { y: 14, opacity: 0, rotate: -8 }, { y: 0, opacity: 1, rotate: -2, duration: .6, ease: 'back.out(2)' });
    } else {
      scales.forEach((x) => (x.style.transform = `scale(${sc})`));
      xs.forEach((x) => { x.style.transform = `rotate(-12deg) scale(${s ? 1 : 0})`; x.textContent = s === 2 ? '+4 shots' : '+2 shots'; });
    }
    if (!quiet && s === 2) D.toast('please stop it is. six shots, one cup, two of them. we are legally worried.');
  };
  seg.addEventListener('click', (e) => { const b = e.target.closest('.size'); if (b && +b.dataset.size !== size) setSize(+b.dataset.size); });
  $$('.card [data-price]', list).forEach((el) => (el.textContent = ''));
  setSize(size, true);
  addEventListener('resize', () => moveThumb(true));
  document.fonts?.ready.then(() => moveThumb(true));

  // cards get dealt when their board arrives, the title slides up letter by letter
  if (M) {
    $$('.board', list).forEach((b) => {
      const cards = $$('.card', b);
      gsap.from(cards, { y: 160, rotate: () => D.rand(-9, 9), opacity: 0, duration: 1.1, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 75%' } });
      const t = $('.board__t', b);
      gsap.from(D.split(t), { yPercent: 110, duration: .9, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 85%' } });
    });
  }

  /* =======================================================
     3 · THE TRAY — everything goes in twice, the receipt prints
     ======================================================= */
  let tray = {};
  try { tray = JSON.parse(D.store.get('tray') || '{}'); } catch (e) {}
  const chip = $('#trayChip'), trayN = $('#trayN');
  const count = () => Object.values(tray).reduce((a, b) => a + b, 0);
  const save = () => D.store.set('tray', JSON.stringify(tray));
  const rcLines = $('#rcLines'), rcTot = $('#rcTot');
  const render = () => {
    trayN.textContent = count();
    const keys = Object.keys(tray);
    let total = 0;
    rcLines.innerHTML = keys.length ? keys.map((k) => {
      const [id, s] = k.split('|'), q = tray[k], p = priceOf(id, +s) * q;
      total += p;
      const sz = FIXED.has(id) ? 'one size: two' : sizes[+s].name;
      return `<p class="rc__row"><span>${q}× ${ITEMS[id].name}<small>${sz}</small></span><span>${eur(p)}</span></p>`;
    }).join('') : '<p class="rc__empty">your tray is empty.<br />that\'s a single. we don\'t do singles.</p>';
    rcTot.textContent = eur(total);
    if (D.hasGsap) { clearTimeout(render.t); render.t = setTimeout(() => ScrollTrigger.refresh(), 200); }
  };
  render();

  // the cut-out flies from the card to the tray chip, in an arc
  const fly = (card) => {
    if (!M) return;
    const src = $('.card__img .slot', card), r = src.getBoundingClientRect(), t = chip.getBoundingClientRect();
    const img = $('img', src);
    for (let k = 0; k < 2; k++) {
      const f = document.createElement('div');
      f.className = 'flyer' + (img ? '' : ' flyer--empty');
      if (img) f.append(img.cloneNode());
      const w = img ? r.width : 40;
      Object.assign(f.style, { width: `${w}px`, height: `${img ? r.height : 40}px` });
      document.body.append(f);
      const x0 = r.left + r.width / 2 - w / 2, y0 = r.top + r.height / 2 - (img ? r.height : 40) / 2;
      const x1 = t.left + t.width / 2 - w / 2, y1 = t.top + t.height / 2 - (img ? r.height : 40) / 2;
      gsap.set(f, { x: x0, y: y0 });
      gsap.timeline({ delay: k * .12, onComplete: () => f.remove() })
        .to(f, { x: x1, duration: .8, ease: 'power1.inOut' }, 0)
        .to(f, { y: Math.min(y0, y1) - 160, duration: .38, ease: 'power2.out' }, 0)
        .to(f, { y: y1, duration: .42, ease: 'power2.in' }, .38)
        .to(f, { scale: .12, rotate: D.rand(-200, 200), duration: .8, ease: 'power1.in' }, 0);
    }
    gsap.timeline({ delay: .8 })
      .fromTo(chip, { scale: 1.25 }, { scale: 1, duration: .7, ease: 'elastic.out(1.2, .35)' })
      .fromTo(trayN, { rotate: -30 }, { rotate: 0, duration: .5, ease: 'back.out(3)' }, 0);
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const id = b.dataset.add, key = `${id}|${FIXED.has(id) ? 0 : size}`;
    tray[key] = (tray[key] || 0) + 2; save();
    fly(b.closest('.card'));
    setTimeout(render, M ? 800 : 0);
    const n = count();
    if (n === 2) D.toast(`two ${ITEMS[id].name}. obviously. it's in your tray.`);
    else if (n >= 12 && n < 14) D.toast('that is a lot of coffee. we respect it. we are also calling someone.');
  });
  $('#trayClear').addEventListener('click', () => {
    if (!count()) { D.toast('already empty. like a monday at 6:59.'); return; }
    if (M) gsap.to('#receipt', { yPercent: -100, duration: .6, ease: 'power3.in', onComplete: () => { tray = {}; save(); render(); gsap.to('#receipt', { yPercent: 0, duration: 1, ease: 'power2.out' }); } });
    else { tray = {}; save(); render(); }
  });
  $('#trayOrder').addEventListener('click', () => {
    if (!count()) { D.toast('the tray is empty. add two of something first.'); D.scrollTo('#boards'); return; }
    D.toast(`order sent: ${count()} things and one sospeso for a stranger. it's a concept, so it's free.`, 4400);
    if (M) gsap.fromTo('#receipt', { rotate: 0 }, { rotate: 3, duration: .12, yoyo: true, repeat: 5, ease: 'sine.inOut' });
  });

  // pinned on desktop: the receipt prints out of the slot as you scroll
  const printer = $('.printer');
  if (M && innerWidth > 860) {
    gsap.fromTo('#receipt', { yPercent: -100 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: {
        trigger: '#tray', start: 'top top', end: '+=90%', pin: '.tray__pin', scrub: .6,
        onUpdate: (s) => printer.classList.toggle('is-printing', s.progress > 0 && s.progress < 1 && Math.abs(s.getVelocity()) > 10),
        onLeave: () => printer.classList.remove('is-printing'),
      },
    });
    gsap.from('.tray__t', { yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#tray', start: 'top 70%' } });
  }

  /* ---------- footer word ---------- */
  if (M) gsap.from('.ft__word', { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });
})();
