/* =========================================================
   DOPPIO — main.js (shared engine, every page)
   a coffee house where everything comes in twos
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = (window.DP = {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  D.$ = $; D.$$ = $$;
  D.page = document.body.dataset.page || 'home';
  D.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  D.fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  D.hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  D.motion = D.hasGsap && !D.reduced;
  document.documentElement.classList.toggle('motion', D.motion);
  D.rand = (a, b) => a + Math.random() * (b - a);
  D.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  D.pad = (n, l = 2) => String(Math.max(0, Math.floor(n))).padStart(l, '0');
  D.clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // storage that never throws
  D.store = {
    get(k) { try { return localStorage.getItem('dp-' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('dp-' + k, v); } catch (e) {} },
  };

  if (D.hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  if (window.Lenis && !D.reduced) {
    D.lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (D.hasGsap) {
      D.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => D.lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { D.lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  D.scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    // honour scroll-margin-top, so sticky bars never cover what you jumped to
    const off = el && el.nodeType ? -(parseFloat(getComputedStyle(el).scrollMarginTop) || 0) : 0;
    if (D.lenis) D.lenis.scrollTo(el ?? 0, { duration: 1.6, offset: off });
    else (el || document.body).scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- toast: a receipt out of the till ---------- */
  const toastEl = $('#toast');
  let toastT;
  D.toast = (msg, ms = 3400) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('is-on'); void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-toast]'); if (t) D.toast(t.dataset.toast); });

  /* ---------- image slots: drop a file at data-img and it shows up ---------- */
  D.slot = (slot) => {
    if (slot.dataset.label && !$('.slot-label', slot)) {
      const [file, ...rest] = slot.dataset.label.split(' · ');
      const lab = document.createElement('span');
      lab.className = 'slot-label';
      lab.innerHTML = `${file}<small>${rest.join(' · ')}</small>`;
      slot.append(lab);
    }
    const src = slot.dataset.img; if (!src || slot.dataset.loaded === src) return;
    slot.dataset.loaded = src;
    const img = new Image();
    img.decoding = 'async'; img.draggable = false;
    img.alt = slot.dataset.alt || '';
    if (slot.dataset.pos) img.style.objectPosition = slot.dataset.pos;
    img.onload = () => {
      if (slot.dataset.img !== src) return;
      $(':scope > img', slot)?.remove();
      slot.prepend(img);
      slot.classList.add('has-img');
      slot.dispatchEvent(new CustomEvent('slot:loaded', { bubbles: true, detail: { img } }));
    };
    img.src = src;
  };
  D.slots = (root = document) => $$('.slot', root).forEach(D.slot);
  D.slots();
  D.missing = () => console.table($$('.slot:not(.has-img)').map((s) => ({ put_your_photo_here: s.dataset.img })));

  /* ---------- text helpers ---------- */
  D.split = (el) => {
    if (el._split) return el._split;
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el._split = [...text].map((p) => {
      if (p === ' ') { el.append(' '); return null; }
      const s = document.createElement('span');
      s.className = 'c'; s.setAttribute('aria-hidden', 'true'); s.textContent = p;
      el.append(s);
      return s;
    }).filter(Boolean);
    return el._split;
  };
  // giant type: make a line exactly as wide as its box
  D.fit = (el) => {
    const p = getComputedStyle(el.parentElement);
    const box = (el.parentElement.clientWidth - parseFloat(p.paddingLeft) - parseFloat(p.paddingRight)) * (+el.dataset.fit || 1);
    el.style.fontSize = '100px';
    const w = el.scrollWidth;
    if (w) el.style.fontSize = `${(100 * box) / w}px`;
  };
  D.fitAll = () => $$('[data-fit]').forEach(D.fit);
  D.fitAll();
  document.fonts?.ready.then(() => { D.fitAll(); if (D.hasGsap) ScrollTrigger.refresh(); });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(D.fitAll, 80); });

  // scramble: letters shuffle like a grinder, then settle
  const GLYPHS = 'doppio×2#%&*+=-:./0123456789';
  D.scramble = (el, text = el.dataset.text || el.textContent, dur = .9) => {
    if (!el.dataset.text) el.dataset.text = el.textContent;
    if (!D.motion) { el.textContent = text; return; }
    const keepHTML = el.innerHTML;
    const hasMarkup = el.children.length && text === el.dataset.text;
    const o = { p: 0 };
    gsap.to(o, {
      p: 1, duration: dur, ease: 'none',
      onUpdate: () => {
        const n = Math.floor(o.p * text.length);
        el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      },
      onComplete: () => { if (hasMarkup) el.innerHTML = keepHTML; else el.textContent = text; },
    });
  };
  if (D.motion) {
    $$('[data-scramble]').forEach((el) => {
      el.dataset.html = el.innerHTML;
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => D.scramble(el, el.textContent) });
    });
  }

  /* ---------- cursor: a coffee bean with a label ---------- */
  const cur = $('#cursor');
  if (cur && D.fine && D.hasGsap) {
    document.documentElement.classList.add('has-cursor');
    const label = $('#cursorLabel');
    const xTo = gsap.quickTo(cur, 'x', { duration: .3, ease: 'power3.out' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .3, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, label');
      const txt = t ? (t.dataset.cursor || '') : '';
      label.textContent = txt;
      cur.classList.toggle('has-label', !!txt);
      cur.classList.toggle('is-hover', !!t);
    });
  }

  /* ---------- magnetic buttons ---------- */
  D.mag = (root = document) => {
    if (!D.fine || !D.hasGsap) return;
    $$('[data-mag]', root).forEach((b) => {
      if (b._mag) return; b._mag = 1;
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .35)' }));
    });
  };
  D.mag();

  /* ---------- clock (milano time) ---------- */
  const clocks = $$('[data-clock]');
  const tick = () => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    clocks.forEach((c) => (c.textContent = `${D.pad(d.getHours())}:${D.pad(d.getMinutes())}`));
    const m = $('#machine'); if (m) { const h = d.getHours(); m.textContent = h >= 7 && h < 23 ? 'the machine is on. come in.' : 'the machine is sleeping. so should you.'; }
  };
  tick(); setInterval(tick, 10000);

  /* ---------- header hides on the way down ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    hdr?.classList.toggle('is-hidden', y > lastY && y > innerHeight * .6);
    hdr?.classList.toggle('is-scrolled', y > 40);
    lastY = y;
  }, { passive: true });

  /* ---------- links: jumps + pages still brewing ---------- */
  const SOON = {
  };
  document.addEventListener('click', (e) => {
    const soon = e.target.closest('[data-soon]');
    if (soon) { e.preventDefault(); D.toast(SOON[soon.getAttribute('href')] || 'still brewing. soon.'); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); D.scrollTo(jump.getAttribute('href')); }
  });

  /* ---------- loader: the glass fills. shot 01, shot 02 ---------- */
  D.ready = new Promise((resolve) => {
    const loader = $('#loader');
    const done = () => { document.body.classList.remove('is-loading'); loader?.remove(); resolve(); };
    if (!loader || !D.motion) { done(); return; }
    const fill = $('#ldFill'), shot = $('#ldShot');
    gsap.set(fill, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.timeline({ onComplete: done })
      .to(fill, { scaleY: .5, duration: .75, ease: 'power2.inOut' })
      .call(() => (shot.textContent = '02'))
      .to(fill, { scaleY: 1.02, duration: .75, ease: 'power2.inOut' }, '+=.12')
      .from('.ld-word', { yPercent: 40, opacity: 0, duration: .9, ease: 'power3.out' }, 0)
      .to(loader, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '+=.15');
  });

  /* ---------- tab title ---------- */
  const baseTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.title = 'your coffee is getting cold ☕';
    else {
      document.title = 'reheated it for you ♥';
      setTimeout(() => (document.title = baseTitle), 2400);
    }
  });

  /* ---------- easter eggs ---------- */
  // konami: the night shift. same café, after closing
  const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
  D.nightShift = () => {
    const on = document.documentElement.classList.toggle('night');
    D.toast(on ? 'night shift. chairs on the tables, one last doppio for the staff.' : 'good morning. the machine is warming up.', 3800);
  };
  let keys = [], typed = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    keys = [...keys, e.key].slice(-10);
    if (keys.join(',') === KONAMI) D.nightShift();
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    const hit = (w) => typed.endsWith(w);
    if (hit('decaf')) D.toast('we do decaf. we just look at you a little longer.');
    if (hit('single')) D.toast('sorry, we only know how to count to two.');
    if (hit('sugar')) D.toast('two sugars. obviously.');
    if (hit('ghostly')) D.toast('concept, design & code by ghostly.grl ♥');
    if (hit('meow')) D.toast('/ᐠ｡ꞈ｡ᐟ\\  a cat is sleeping on table 4. she ordered a doppio.', 3800);
  });

  /* ---------- console ---------- */
  const css = 'font-family:monospace;color:#f3eee3;background:#0d5c3a;padding:6px 10px;line-height:1.4';
  console.log(`%c
   *    /\\_/\\      +
       ( o.o )   <3  ghostly.grl
   +    > ^ <   ☕     *

  DOPPIO — every coffee comes in twos.
  type doppio.help() for the barista's notes`, css);
  D.help = () => {
    console.log('%cdoppio.missing()     — which photos are still missing\ndoppio.nightShift()  — konami code: after closing\ndoppio.toast(msg)    — print a receipt\ntype "decaf", "single", "sugar", "meow"', 'font-family:monospace;color:#1f140d;background:#f3eee3;padding:8px');
    return '♥';
  };
  window.doppio = D;
})();
