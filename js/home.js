/* =========================================================
   DOPPIO — home.js
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = window.DP, { $, $$ } = D;
  const DATA = window.DP_DATA;
  const M = D.motion;

  /* =======================================================
     1 · HERO — letters pour in, the second P lands late
     ======================================================= */
  const word = $('#heroWord');
  const chars = D.split(word);
  D.fit(word);
  const x2 = $('#heroX2');
  // offsets, not rects: the letters are mid-animation most of the time
  const placeX2 = () => {
    const p2 = chars[3];
    x2.style.left = `${word.offsetLeft + p2.offsetLeft + p2.offsetWidth * .55}px`;
    x2.style.top = `${word.offsetTop + p2.offsetTop - p2.offsetHeight * .02}px`;
  };
  // the hand-drawn arrow sits next to the pour photo
  const arrow = $('#heroArrow'), pour = $('.shelf__pour'), shelf = $('#shelf');
  const placeArrow = () => {
    arrow.style.left = `${shelf.offsetLeft + pour.offsetLeft - arrow.getBoundingClientRect().width - 8}px`;
    arrow.style.top = `${shelf.offsetTop + pour.offsetTop - 40}px`;
  };
  const placeAll = () => { placeX2(); placeArrow(); };
  placeAll();
  addEventListener('resize', () => setTimeout(placeAll, 120));
  document.fonts?.ready.then(() => { D.fit(word); placeAll(); });

  const stampSvg = $('#stamp svg');
  let stampSpin;

  if (M) {
    const arrowPaths = $$('path', arrow);
    arrowPaths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.set(chars, { yPercent: 105, opacity: 0 });
    gsap.set(chars[3], { yPercent: -160, rotate: -14 });
    gsap.set('.hero__echo', { opacity: 0, y: -40 });
    gsap.set(x2, { scale: 0, rotate: -40 });
    gsap.set('#heroMix > *', { yPercent: 60, opacity: 0 });
    gsap.set('.shelf > *', { y: 120, opacity: 0 });
    gsap.set('#stamp', { scale: .4, rotate: -90, opacity: 0 });

    D.ready.then(() => {
      gsap.timeline({ delay: .05 })
        .to(chars.filter((c, i) => i !== 3), { yPercent: 0, opacity: 1, duration: .9, stagger: .06, ease: 'expo.out' })
        // the second P drops in late, like the second shot
        .to(chars[3], { yPercent: 0, opacity: 1, rotate: 0, duration: .9, ease: 'bounce.out' }, .45)
        .to(x2, { scale: 1, rotate: -10, duration: .7, ease: 'back.out(3)' }, 1.1)
        .to('.hero__echo', { opacity: (i) => (i ? .6 : 1), y: 0, duration: 1.1, stagger: .12, ease: 'power3.out' }, .5)
        .to('#heroMix > *', { yPercent: 0, opacity: 1, duration: .8, stagger: .07, ease: 'power3.out' }, .6)
        .to('.shelf > *', { y: 0, opacity: 1, duration: 1, stagger: { each: .08, from: 'center' }, ease: 'expo.out' }, .7)
        .to('#stamp', { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, .8)
        .to(arrowPaths, { strokeDashoffset: 0, duration: .7, stagger: .5, ease: 'power2.inOut' }, 1.3);
    });

    // the stamp spins, faster when you scroll
    stampSpin = gsap.to(stampSvg, { rotate: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    let vT;
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom top',
      onUpdate: (s) => {
        stampSpin.timeScale(1 + Math.min(Math.abs(s.getVelocity()) / 250, 8));
        clearTimeout(vT); vT = setTimeout(() => gsap.to(stampSpin, { timeScale: 1, duration: .8 }), 120);
      },
    });

    // double vision: on scroll the echoes drift apart from the word
    gsap.to('.hero__echo', { yPercent: (i) => 30 + i * 35, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('#heroWord', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

    // mouse parallax on the shelf
    if (D.fine) {
      const items = $$('.shelf [data-depth]').map((el) => ({ d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }), r: gsap.quickTo(el, 'rotate', { duration: 1, ease: 'power3.out' }) }));
      $('#hero').addEventListener('pointermove', (e) => {
        const nx = e.clientX / innerWidth - .5;
        items.forEach((it) => { it.x(nx * 26 * it.d); it.r(nx * 3 * it.d); });
      });
    }
  }
  // a glass jumps you to its drink in the menu
  $$('.glass[data-drink]').forEach((g) => g.addEventListener('click', () => D.toProduct(+g.dataset.drink)));
  // tap the x2: it pours again
  x2.style.pointerEvents = 'auto';
  x2.dataset.cursor = 'again';
  x2.addEventListener('click', () => {
    if (!M) return;
    gsap.fromTo(chars[3], { yPercent: -160, rotate: -14 }, { yPercent: 0, rotate: 0, duration: .9, ease: 'bounce.out' });
    gsap.fromTo(x2, { scale: 1.6 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
  });

  /* =======================================================
     2 · THE FLAP BOARD — MATCHA MATCHA MATCHA, flipping like a departure board
     ======================================================= */
  const drinks = DATA.drinks, N = drinks.length;
  const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
  const rows = $$('.flap__word');
  const glassBox = $('#flapGlass');
  glassBox.innerHTML = drinks.map((d) => `<div class="slot slot--cut" data-img="img/HOME/front/${d.id}.png" data-label="HOME/front/${d.id}.png · ${d.name}, front view, no background. 3:4"></div>`).join('');
  D.slots(glassBox);
  const gl = $$('.slot', glassBox);
  const setWord = (el, w) => {
    el.textContent = '';
    [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'fl'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; el.append(s); });
    el.setAttribute('aria-label', w);
    fitFlap(el);
  };
  // as wide as the board, but three rows + the price always fit in one screen
  const fitFlap = (el) => {
    D.fit(el);
    const max = (Math.max(innerHeight, 560) * .56) / 3 / .8;
    if (parseFloat(el.style.fontSize) > max) el.style.fontSize = `${max}px`;
  };
  addEventListener('resize', () => setTimeout(() => rows.forEach(fitFlap), 100));
  const flapName = $('#flapName'), flapPrice = $('#flapPrice'), flapDesc = $('#flapDesc'), flapN = $('#flapN');
  let fi = -1, flipTl;
  const flip = (i, dir = 1) => {
    if (i === fi) return;
    const prev = fi; fi = i;
    const d = drinks[i];
    flapName.textContent = d.name; flapPrice.textContent = d.price; flapDesc.textContent = d.desc;
    flapN.textContent = `${D.pad(i + 1)} / ${D.pad(N)}`;
    if (!M || prev < 0) {
      rows.forEach((r) => setWord(r, d.flap));
      gl.forEach((g, k) => (g.style.opacity = k === i ? 1 : 0));
      return;
    }
    flipTl?.progress(1).kill();
    const tl = (flipTl = gsap.timeline());
    rows.forEach((r, ri) => {
      const old = $$('.fl', r);
      tl.to(old, { rotateX: dir * 90, opacity: 0, duration: .2, stagger: .025, ease: 'power2.in' }, ri * .07);
      tl.call(() => {
        setWord(r, d.flap);
        gsap.from($$('.fl', r), { rotateX: -dir * 100, opacity: 0, duration: .55, stagger: .035, ease: 'back.out(2.2)' });
      }, null, ri * .07 + .2 + old.length * .025);
    });
    gsap.to(gl[prev], { yPercent: -dir * 110, rotate: dir * -40, opacity: 0, duration: .55, ease: 'power3.in', overwrite: true });
    gsap.fromTo(gl[i], { yPercent: dir * 120, rotate: dir * 30, opacity: 0, scale: .8 }, { yPercent: 0, rotate: 0, opacity: 1, scale: 1, duration: 1, delay: .2, ease: 'back.out(1.5)', overwrite: true });
    gsap.fromTo('#flapFest', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, delay: .15, ease: 'expo.out', overwrite: true });
    gsap.fromTo(flapDesc, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .6, delay: .3, overwrite: true });
  };
  flip(2);
  document.fonts?.ready.then(() => rows.forEach(fitFlap));
  if (M) {
    ScrollTrigger.create({
      trigger: '#flap', start: 'top top', end: `+=${N * 50}%`, pin: true,
      onUpdate: (s) => flip((2 + Math.min(N - 1, Math.floor(s.progress * N))) % N, s.direction),
    });
  } else $('#flap').addEventListener('click', () => flip((fi + 1) % N));

  /* =======================================================
     3 · PULLED TWICE — two halves slide in and lock around the glass
     ======================================================= */
  const twSlot = $('#twGlass .slot');
  if (M) {
    const clink = () => {
      gsap.fromTo(twSlot, { rotate: -10 }, { rotate: 0, duration: 1.4, ease: 'elastic.out(1.2, .25)' });
      gsap.fromTo(['#twL', '#twR'], { scaleY: .9 }, { scaleY: 1, duration: .9, ease: 'elastic.out(1, .3)', transformOrigin: '50% 100%' });
    };
    let clinked = false;
    gsap.timeline({
      scrollTrigger: {
        trigger: '#twice', start: 'top top', end: '+=130%', pin: true, scrub: 1,
        onUpdate: (s) => { if (s.progress > .82 && !clinked) { clinked = true; clink(); } if (s.progress < .5) clinked = false; },
      },
    })
      .fromTo('#twL', { xPercent: -105, rotate: -18 }, { xPercent: 0, rotate: 0, ease: 'power3.out', duration: 1 }, 0)
      .fromTo('#twR', { xPercent: 105, rotate: 18 }, { xPercent: 0, rotate: 0, ease: 'power3.out', duration: 1 }, 0)
      .fromTo('#twTop', { xPercent: 80, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power3.out', duration: .9 }, .1)
      .fromTo('#twBot', { xPercent: -80, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power3.out', duration: .9 }, .1)
      .fromTo('#twGlass', { yPercent: -170, rotate: -28, scale: .55 }, { yPercent: 0, rotate: 0, scale: 1, ease: 'back.out(1.7)', duration: .8 }, .35)
      .fromTo('.twice__txt', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .4 }, .8);
    if (D.fine) {
      const rx = gsap.quickTo(twSlot, 'rotationY', { duration: .8, ease: 'power3.out' });
      const ry = gsap.quickTo(twSlot, 'x', { duration: .8, ease: 'power3.out' });
      $('#twice').addEventListener('pointermove', (e) => { const nx = e.clientX / innerWidth - .5; rx(nx * 30); ry(nx * 30); });
    }
  }

  /* =======================================================
     4 · THE SHOP WINDOW — a horizontal counter that leans when you rush
     ======================================================= */
  const prodsEl = $('#shopProds');
  prodsEl.innerHTML = drinks.map((d, i) => `
    <article class="prod" data-cursor="(( ${d.name} ))">
      <span class="prod__n">${D.pad(i + 1)}</span><span class="prod__price">${d.price}</span>
      <div class="prod__img"><div class="slot slot--cut" data-img="img/HOME/front/${d.id}.png" data-label="HOME/front/${d.id}.png · ${d.name}, front view, no background. 3:4"></div></div>
      <h3 class="prod__name">(( ${cap(d.name)} ))</h3>
      <p class="prod__desc mono">${d.desc}</p>
    </article>`).join('');
  D.slots(prodsEl);
  const prods = $$('.prod', prodsEl);
  const track = $('#shopTrack');
  // layout width, not scrollWidth: the skew would count as extra counter
  const dist = () => { const l = track.lastElementChild; return Math.max(0, l.offsetLeft + l.offsetWidth - track.parentElement.clientWidth); };
  let hs = null;
  if (M && innerWidth > 860) {
    const skew = gsap.quickTo(prods, 'skewX', { duration: .6, ease: 'power3.out' });
    const shopN = $('#shopN');
    hs = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#menu', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => {
          skew(D.clamp(s.getVelocity() / -260, -12, 12));
          shopN.textContent = s.progress > .97 ? 'that was all. for now.' : `${Math.round(s.progress * 100)}% of the counter →`;
        },
      },
    });
    prods.forEach((p) => {
      gsap.fromTo($('.slot', p), { rotate: -50, yPercent: 40, scale: .6 }, { rotate: 0, yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: hs, start: 'left 100%', end: 'left 45%', scrub: true } });
    });
    gsap.fromTo('.shop__mlogo', { yPercent: -10, scale: 1.6 }, { yPercent: -50, scale: 1, ease: 'none', scrollTrigger: { trigger: '.shop__split', containerAnimation: hs, start: 'left 100%', end: 'left 20%', scrub: true } });
    gsap.fromTo('.shop__inside', { rotate: 30, xPercent: 60, opacity: 0 }, { rotate: 0, xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.shop__pink', containerAnimation: hs, start: 'left 100%', end: 'left 40%', scrub: true } });
    gsap.from('.shop__card', { rotate: -10, yPercent: 30, ease: 'none', scrollTrigger: { trigger: '#menu', start: 'top 90%', end: 'top top', scrub: 1 } });
    gsap.from('.shop__line', { xPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#menu', start: 'top 80%', end: 'top 10%', scrub: 1 } });
  }
  // a glass in the hero jumps you to its card on the counter
  D.toProduct = (i) => {
    const p = prods[i];
    if (!hs) { D.scrollTo('#menu'); return; }
    const st = hs.scrollTrigger;
    const x = D.clamp(p.offsetLeft - (innerWidth - p.offsetWidth) / 2, 0, dist());
    D.scrollTo(st.start + (x / dist()) * (st.end - st.start));
    setTimeout(() => gsap.fromTo($('.slot', p), { rotate: 0 }, { rotate: 360, duration: 1.2, ease: 'expo.inOut' }), 1500);
  };

  /* =======================================================
     5 · WHAT'S YOUR NAME? — two cups, one sospeso
     ======================================================= */
  const nameIn = $('#nameIn'), wrongIn = $('#nameWrong'), nameYou = $('#nameYou'), nameSos = $('#nameSos');
  // how the other place would write it
  const misspell = (n) => {
    if (!n) return n;
    let s = n.toLowerCase();
    const rules = [[/ph/g, 'f'], [/c(?=[aou])/g, 'k'], [/i/g, 'y'], [/y/g, 'ie'], [/ee/g, 'i'], [/ck/g, 'k'], [/th/g, 't'], [/([aeiou])$/, '$1h'], [/s/g, 'z'], [/([lnmt])/, '$1$1'], [/ar/, 'arr']];
    const used = [...rules].sort(() => Math.random() - .5).slice(0, 2);
    used.forEach(([r, w]) => (s = s.replace(r, w)));
    if (s === n.toLowerCase()) s = s.slice(0, -1) + s.slice(-1) + s.slice(-1);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  let wrongCache = {};
  const shown = () => {
    const v = nameIn.value.trim();
    if (!wrongIn.checked) return v;
    if (!wrongCache[v]) wrongCache[v] = misspell(v);
    return wrongCache[v];
  };
  // the name always stays on the cup: shrink the marker until it fits the paper
  const fitName = (el) => {
    el.style.fontSize = '';
    const w = el.scrollWidth, room = el.clientWidth;
    if (w > room) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * room / w * .96}px`;
  };
  addEventListener('resize', () => [nameYou, nameSos].forEach(fitName));
  const write = (el, text, pop = true) => {
    el.textContent = text;
    fitName(el);
    if (!M || !text) return;
    const cs = D.split(Object.assign(el, { _split: null }));
    if (pop) gsap.from(cs, { yPercent: 60, rotate: () => D.rand(-18, 18), opacity: 0, duration: .5, stagger: .035, ease: 'back.out(2.5)' });
  };
  let lastShown = '';
  const refresh = (pop) => {
    const t = shown();
    if (t === lastShown) return;
    // only the new letters pop while typing
    const grow = t.startsWith(lastShown) && t.length === lastShown.length + 1;
    lastShown = t;
    if (grow && M) {
      const s = document.createElement('span');
      s.className = 'c'; s.setAttribute('aria-hidden', 'true'); s.textContent = t.slice(-1);
      nameYou.append(s); nameYou.setAttribute('aria-label', t);
      fitName(nameYou);
      gsap.from(s, { yPercent: 60, rotate: D.rand(-20, 20), opacity: 0, duration: .45, ease: 'back.out(2.5)' });
    } else write(nameYou, t, pop);
  };
  nameIn.addEventListener('input', () => refresh(true));
  wrongIn.addEventListener('change', () => {
    wrongCache = {}; lastShown = '\u0000'; refresh(true);
    if (wrongIn.checked && nameIn.value.trim()) D.toast(`there you go, ${shown()}. just like old times.`);
  });
  const saved = D.store.get('name');
  if (saved) { nameIn.value = saved; refresh(false); }
  else nameYou.textContent = '';

  let sos = +(D.store.get('sospeso') || 0);
  const countEl = $('#sosCount');
  const paintCount = () => {
    countEl.innerHTML = sos ? `<b>${sos}</b> ${sos === 1 ? 'cup' : 'cups'} left for strangers from this browser. good karma, ×2.` : 'no cups left for strangers yet. be the first.';
  };
  paintCount();
  nameSos.textContent = D.pick(DATA.strangers);
  fitName(nameSos);
  document.fonts?.ready.then(() => [nameYou, nameSos].forEach(fitName));

  $('#nameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = nameIn.value.trim();
    if (!v) {
      nameIn.focus();
      if (M) gsap.fromTo(nameIn, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1, .25)' });
      D.toast("we can't write nothing on a cup. we tried. it looked sad.");
      return;
    }
    D.store.set('name', v);
    sos += 1; D.store.set('sospeso', sos);
    const stamp = $('#sosStamp');
    if (M) {
      gsap.timeline()
        .to('#cupYou', { y: -40, rotate: -6, duration: .35, ease: 'power2.out' })
        .to('#cupYou', { y: 0, rotate: 0, duration: .8, ease: 'bounce.out' })
        .to('#cupSos', { x: 40, rotate: 8, duration: .4, ease: 'power2.out' }, .15)
        .call(() => write(nameSos, D.pick(DATA.strangers)))
        .to('#cupSos', { x: 0, rotate: 0, duration: .9, ease: 'elastic.out(1, .4)' })
        .fromTo(stamp, { scale: 2.4, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: 14, duration: .45, ease: 'power4.in' }, .55)
        .fromTo('#cupSos', { y: 0 }, { y: 6, duration: .08, yoyo: true, repeat: 1 }, 1);
    } else { stamp.style.opacity = 1; stamp.style.transform = 'rotate(14deg)'; nameSos.textContent = D.pick(DATA.strangers); fitName(nameSos); }
    paintCount();
    D.toast(`two coffees for ${shown()}: one for you, one for ${nameSos.textContent === "whoever's next" ? 'whoever walks in next' : nameSos.textContent}. €0 today, this is a concept.`, 4200);
  });
  if (M) {
    gsap.from('.cup', { y: 140, rotate: (i) => (i ? 10 : -10), opacity: 0, duration: 1.2, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '#cups', start: 'top 85%' } });
    gsap.from('.name__q', { yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#name', start: 'top 70%' } });
  }

  /* =======================================================
     6 · ICED AMBER LATTE — act 1 the brewed numbers, act 2 the cup opens up
     ======================================================= */
  const amber = $('#amber'), aStage = $('#amberStage'), aCup = $('#amberCup'), aSvg = $('#amberLines');
  const ings = $$('.ing', aStage);
  ings.forEach((f) => {
    const [x, y] = f.dataset.hot.split(',');
    const h = document.createElement('i');
    h.className = 'hot'; h.style.left = `${x}%`; h.style.top = `${y}%`;
    aCup.append(h); f._hot = h;
  });
  // positions from offsets (layout only), so the lines ignore whatever is mid-animation
  const box = (el) => {
    let x = 0, y = 0, e = el;
    while (e && e !== aStage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const line = { p: M ? 0 : 1 };
  const paintLines = () => $$('path', aSvg).forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l * (1 - line.p); });
  const drawLines = () => {
    aSvg.setAttribute('viewBox', `0 0 ${aStage.offsetWidth} ${aStage.offsetHeight}`);
    aSvg.innerHTML = ings.map((f) => {
      const sq = box($('.slot', f)), h = box(f._hot), left = f.classList.contains('ing--l');
      // like the ref: from the square's inner top corner to the box on the cup
      const x1 = left ? sq.x + sq.w : sq.x, y1 = sq.y;
      const x2 = left ? h.x - h.w / 2 : h.x + h.w / 2, y2 = h.y - h.h / 2 + h.h / 2;
      return `<path d="M${x1} ${y1} L${x2} ${y2}" />`;
    }).join('');
    paintLines();
  };
  drawLines();
  addEventListener('resize', () => setTimeout(drawLines, 120));
  document.fonts?.ready.then(drawLines);
  aStage.addEventListener('slot:loaded', drawLines);

  // the numbers count up
  const statNums = $$('[data-count]', amber);
  const countUp = () => statNums.forEach((b) => {
    const to = +b.dataset.count, dec = +(b.dataset.dec || 0), o = { v: 0 };
    if (!M) { b.textContent = to.toLocaleString('en-US', { minimumFractionDigits: dec }); return; }
    gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', onUpdate: () => (b.textContent = o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })) });
  });

  const aRows = $$('.amber__row span', amber);
  if (M && innerWidth > 860) {
    // act 1 arrives: rows slide in from alternate sides, the cup rises
    gsap.set('.a2', { opacity: 0, y: 30 });
    gsap.set('.hot', { scale: 0 });
    ings.forEach((f) => {
      const c = box(aCup), sq = box(f);
      gsap.set(f, { x: c.x + c.w / 2 - sq.x - sq.w / 2, y: c.y + c.h * .45 - sq.y - sq.h / 2, scale: .15, opacity: 0, rotate: D.rand(-40, 40) });
    });
    gsap.timeline({ scrollTrigger: { trigger: amber, start: 'top 65%', once: true }, onStart: countUp })
      .from(aRows, { xPercent: (i) => (i % 2 ? 50 : -50), opacity: 0, duration: 1.3, stagger: .1, ease: 'expo.out' }, 0)
      .from($('.slot', aCup), { yPercent: 70, rotate: -12, duration: 1.4, ease: 'expo.out' }, .1)
      .from(['.amber__made', '.amber__deal', '.amber__left'], { y: 30, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out' }, .3)
      .from('.amber__stats p', { x: 50, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out' }, .4);

    // act 2 on scroll: everything brewed flies away (wrappers, so the act 1 intro never fights it), the cup opens up into its ingredients
    gsap.timeline({ scrollTrigger: { trigger: amber, start: 'top top', end: '+=220%', pin: true, scrub: 1, onRefresh: drawLines } })
      .to({}, { duration: .25 })
      .to($$('.amber__row', amber), { xPercent: (i) => (i % 2 ? -70 : 70), opacity: 0, duration: 1, ease: 'power2.in' }, .25)
      .to('.amber__a1', { y: -40, opacity: 0, duration: .6, stagger: .05, ease: 'power2.in' }, .25)
      .to(aCup, { rotate: -5, duration: .5, ease: 'power2.inOut' }, .5)
      .to(aCup, { rotate: 0, duration: .5, ease: 'back.out(3)' }, 1)
      .to('.a2', { opacity: 1, y: 0, duration: .6, stagger: .1, ease: 'power3.out' }, 1)
      .to('.hot', { scale: 1, duration: .4, stagger: .06, ease: 'back.out(3)' }, 1.1)
      .to(ings, { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, duration: 1, stagger: .08, ease: 'back.out(1.3)' }, 1.2)
      .to(line, { p: 1, duration: .8, ease: 'power2.inOut', onUpdate: paintLines }, 2.1)
      .to({}, { duration: .4 });
    $$('.amber__title', amber).forEach((t) => ScrollTrigger.create({ trigger: amber, start: () => `top+=${innerHeight * .9} top`, onEnter: () => D.scramble(t, t.textContent, .9) }));
  } else {
    countUp();
    if (M) ings.forEach((f) => gsap.from(f, { y: 40, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 90%' } }));
  }
  // hover a square: its box on the cup blinks
  ings.forEach((f) => f.addEventListener('pointerenter', () => {
    if (M) gsap.fromTo(f._hot, { scale: 1.7, backgroundColor: 'rgba(236,138,160,.45)' }, { scale: 1, backgroundColor: 'rgba(236,138,160,0)', duration: .8, ease: 'power3.out' });
  }));

  /* ---------- footer word ---------- */
  if (M) gsap.from('.ft__word', { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });
})();
