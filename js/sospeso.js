/* =========================================================
   DOPPIO — sospeso.js (the second cup)
   halftone photos, a cup that walks the steps, a wall you can use
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = window.DP, { $, $$ } = D;
  const DATA = window.DP_DATA;
  const M = D.motion;
  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#2f3d12';

  /* =======================================================
     HALFTONE — a photo read as coffee dots. dots grow in as a wave,
     and swell under the cursor like a lens
     ======================================================= */
  const halftone = (canvas, srcSlot, fallback, o = {}) => {
    const ctx = canvas.getContext('2d');
    const sample = document.createElement('canvas'), sctx = sample.getContext('2d', { willReadFrequently: true });
    const st = { p: M ? 0 : 1, mx: -1e5, my: -1e5, lx: -1e5, ly: -1e5 };
    let W = 0, H = 0, dpr = 1, cell = 8, cols = 0, rows = 0, vals = null, img = null, raf = 0, color = ink();
    const sil = document.createElement('canvas'), silx = sil.getContext('2d'); let hasSil = false;
    const build = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = canvas.width = Math.round(r.width * dpr); H = canvas.height = Math.round(r.height * dpr);
      if (!W || !H) return;
      cell = Math.max(7, r.width / (o.density || 105)) * dpr;
      cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
      sample.width = cols; sample.height = rows;
      sctx.filter = 'none';
      sctx.clearRect(0, 0, cols, rows);
      const cut = img && o.cut; // a cut-out: keep its silhouette, never fill the background
      if (!cut) { sctx.fillStyle = '#fff'; sctx.fillRect(0, 0, cols, rows); }
      if (img) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        // photos cover the canvas; cut-outs sit inside it, bottom-right, and can be mirrored
        const s = cut ? Math.min(cols / iw, rows / ih) * (o.scale || 1) : Math.max(cols / iw, rows / ih);
        const w = iw * s, h = ih * s;
        const x = o.align === 'left' ? 0 : o.align === 'right' ? cols - w : (cols - w) / 2;
        const y = cut ? rows - h : (rows - h) / 2;
        sctx.save();
        if (o.flip) { sctx.translate(x + w, y); sctx.scale(-1, 1); sctx.drawImage(img, 0, 0, w, h); }
        else sctx.drawImage(img, x, y, w, h);
        sctx.restore();
        // a cut-out also gets a flat cream silhouette under the dots, so a white cup still reads
        hasSil = !!cut;
        if (cut) {
          sil.width = W; sil.height = H;
          const k = W / cols;
          silx.save();
          if (o.flip) { silx.translate((x + w) * k, y * k); silx.scale(-1, 1); silx.drawImage(img, 0, 0, w * k, h * k); }
          else silx.drawImage(img, x * k, y * k, w * k, h * k);
          silx.restore();
          silx.globalCompositeOperation = 'source-in';
          silx.fillStyle = o.silColor || '#f9faec'; silx.fillRect(0, 0, W, H);
          silx.globalCompositeOperation = 'source-over';
        }
      } else fallback(sctx, cols, rows);
      const d = sctx.getImageData(0, 0, cols, rows).data;
      vals = new Float32Array(cols * rows);
      // levels: stretch the photo's own darkest..lightest to the full dot range, so pale photos still read
      let lo = 1, hi = 0;
      const lum = new Float32Array(cols * rows);
      for (let i = 0; i < lum.length; i++) {
        lum[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
        if (img && d[i * 4 + 3] > 128) { if (lum[i] < lo) lo = lum[i]; if (lum[i] > hi) hi = lum[i]; }
      }
      if (!img || hi - lo < .1) { lo = 0; hi = 1; }
      const floor = cut ? (o.floor ?? .16) : 0; // even the white cup gets small dots
      for (let i = 0; i < vals.length; i++) {
        if (cut && d[i * 4 + 3] < 128) { vals[i] = 0; continue; }
        const t = D.clamp((lum[i] - lo) / (hi - lo), 0, 1);
        vals[i] = floor + (1 - floor) * Math.pow(1 - t, o.gamma || 1);
        // fade: the dots thin out towards one edge, like a print bleeding into the page
        if (o.fade) { const fx = (i % cols) / cols, f = o.fade === 'right' ? (1 - fx) / .35 : fx / .35; vals[i] *= D.clamp(f, 0, 1); }
      }
      color = ink();
      draw();
    };
    const draw = () => {
      if (!vals) return;
      ctx.clearRect(0, 0, W, H);
      if (hasSil) { ctx.globalAlpha = D.clamp(st.p * 1.6 - .2, 0, 1); ctx.drawImage(sil, 0, 0); ctx.globalAlpha = 1; }
      ctx.fillStyle = color;
      ctx.beginPath();
      const R = 170 * dpr, R2 = R * R, max = cell * .7;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = vals[y * cols + x];
          if (v < .05) continue;
          const delay = (o.from === 'left' ? x / cols : 1 - x / cols) * .55 + (y / rows) * .12;
          let a = (st.p - delay) / .35;
          if (a <= 0) continue;
          if (a > 1) a = 1; else a = a * a * (3 - 2 * a);
          const cx = (x + .5) * cell, cy = (y + .5) * cell;
          const dx = cx - st.lx, dy = cy - st.ly, d2 = dx * dx + dy * dy;
          const k = d2 < R2 ? 1 + 1.1 * (1 - Math.sqrt(d2) / R) : 1;
          const rad = Math.min(max * k, v * cell * .6 * a * k);
          if (rad < .35) continue;
          ctx.moveTo(cx + rad, cy);
          ctx.arc(cx, cy, rad, 0, 6.2832);
        }
      }
      ctx.fill();
    };
    // the lens eases after the cursor, and stops redrawing once it has caught up
    const loop = () => {
      raf = 0;
      const ex = st.mx - st.lx, ey = st.my - st.ly;
      st.lx += ex * .16; st.ly += ey * .16;
      draw();
      if (Math.abs(ex) + Math.abs(ey) > 1) raf = requestAnimationFrame(loop);
    };
    const host = canvas.parentElement;
    if (D.fine && M) {
      host.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        st.mx = (e.clientX - r.left) * dpr; st.my = (e.clientY - r.top) * dpr;
        if (st.lx < -1e4) { st.lx = st.mx; st.ly = st.my; }
        if (!raf) raf = requestAnimationFrame(loop);
      });
      host.addEventListener('pointerleave', () => { st.mx = st.lx; st.my = -1e5; st.ly = -1e5; st.lx = -1e5; draw(); });
    }
    srcSlot?.addEventListener('slot:loaded', (e) => { img = e.detail.img; build(); });
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 150); });
    new MutationObserver(() => { color = ink(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    build();
    return {
      grow: (dur = 2.4) => { if (!M) return; st.p = 0; gsap.to(st, { p: 1.05, duration: dur, ease: 'power2.out', onUpdate: draw }); },
    };
  };

  // fallbacks while the photos are missing: shapes drawn in grey, read as dots
  const cupShape = (c, cx, by, h, tilt = 0) => {
    const w = h * .62;
    c.save(); c.translate(cx, by); c.rotate(tilt);
    const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, '#222'); g.addColorStop(.55, '#666'); g.addColorStop(1, '#333');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-w / 2, -h); c.lineTo(w / 2, -h); c.lineTo(w * .38, 0); c.lineTo(-w * .38, 0); c.closePath(); c.fill();
    c.fillStyle = '#111'; c.fillRect(-w * .56, -h - h * .1, w * 1.12, h * .1);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-w * .46, -h * .62, w * .92, h * .22);
    c.restore();
  };
  const heroFallback = (c, w, h) => {
    const bg = c.createRadialGradient(w * .6, h * .5, 0, w * .6, h * .5, w * .7);
    bg.addColorStop(0, '#e6e6e6'); bg.addColorStop(1, '#fff');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.filter = 'blur(0.6px)';
    cupShape(c, w * .42, h * .88, h * .56, -.08);
    cupShape(c, w * .7, h * .84, h * .64, .07);
  };
  const storyFallback = (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.filter = 'blur(0.5px)';
    const cups = [[.3, .3, .2], [.62, .5, .26], [.32, .74, .22], [.8, .2, .16], [.12, .55, .14]];
    cups.forEach(([x, y, s]) => {
      const cx = w * x, cy = h * y, r = h * s;
      c.fillStyle = '#888'; c.beginPath(); c.ellipse(cx, cy + r * .5, r * 1.1, r * .32, 0, 0, 7); c.fill();
      const g = c.createLinearGradient(cx - r * .7, 0, cx + r * .7, 0);
      g.addColorStop(0, '#111'); g.addColorStop(.6, '#555'); g.addColorStop(1, '#222');
      c.fillStyle = g; c.beginPath(); c.moveTo(cx - r * .7, cy - r * .5); c.lineTo(cx + r * .7, cy - r * .5); c.quadraticCurveTo(cx + r * .65, cy + r * .5, cx, cy + r * .5); c.quadraticCurveTo(cx - r * .65, cy + r * .5, cx - r * .7, cy - r * .5); c.fill();
      c.strokeStyle = '#222'; c.lineWidth = r * .14; c.beginPath(); c.arc(cx + r * .78, cy - r * .1, r * .22, -1.3, 1.3); c.stroke();
      c.fillStyle = '#3a3a3a'; c.beginPath(); c.ellipse(cx, cy - r * .5, r * .7, r * .16, 0, 0, 7); c.fill();
    });
  };

  /* =======================================================
     1 · HERO — dots grow from the right, the count rolls
     ======================================================= */
  const heroHT = halftone($('#heroDots'), $('#heroSrc'), heroFallback, { align: 'right', from: 'right', density: 150, cut: true, flip: true, scale: .94, gamma: 1.45, floor: .04 });
  const countEl = $('#wallCount');
  if (M) {
    gsap.set('.sh__copy > *', { y: 40, opacity: 0 });
    D.ready.then(() => {
      heroHT.grow(2.6);
      gsap.to('.sh__copy > *', { y: 0, opacity: 1, duration: 1, stagger: .1, ease: 'expo.out' });
    });
  }

  /* =======================================================
     2 · HOW IT WORKS — a little cup walks the dashed line, step to step
     ======================================================= */
  const row = $('#howRow'), steps = $$('.step', row), line = $('#howLine'), runner = $('#howRunner');
  const pathSvg = $('#howPath');
  const layoutPath = () => {
    pathSvg.setAttribute('viewBox', `0 0 ${row.offsetWidth} ${row.offsetHeight}`);
    const pts = steps.map((s) => ({ x: s.offsetLeft + s.offsetWidth / 2, y: s.offsetTop - 26 }));
    const [a, b, c] = pts;
    // three hops: each one arcs over the gap and lands on top of the next photo
    const hop = (p, q) => { const top = Math.min(p.y, q.y) - 90, dx = q.x - p.x; return `C ${p.x + dx * .3} ${top} ${p.x + dx * .7} ${top} ${q.x} ${q.y}`; };
    const start = { x: a.x - (b.x - a.x) * .55, y: a.y + 40 }, end = { x: c.x + (c.x - b.x) * .55, y: c.y + 40 };
    line.setAttribute('d', `M${start.x} ${start.y} ${hop(start, a)} ${hop(a, b)} ${hop(b, c)} ${hop(c, end)}`);
  };
  layoutPath();
  addEventListener('resize', () => setTimeout(() => { layoutPath(); place(lastP); }, 120));
  document.fonts?.ready.then(layoutPath);
  row.addEventListener('slot:loaded', layoutPath);
  let lastP = 0;
  const hit = [false, false, false];
  const place = (p) => {
    lastP = p;
    const L = line.getTotalLength();
    if (!L) return;
    const at = L * p, pt = line.getPointAtLength(at), nx = line.getPointAtLength(Math.min(L, at + 2));
    const ang = Math.atan2(nx.y - pt.y, nx.x - pt.x) * 57.3;
    gsap.set(runner, { x: pt.x, y: pt.y, rotate: D.clamp(ang, -35, 35) });
    // a step jumps when the cup lands on it
    steps.forEach((s, i) => {
      const sx = s.offsetLeft + s.offsetWidth / 2, near = Math.abs(pt.x - sx) < 30;
      if (near && !hit[i]) { hit[i] = true; if (M) gsap.fromTo(s, { y: 0 }, { y: -18, duration: .25, yoyo: true, repeat: 1, ease: 'power2.out' }); }
      if (!near) hit[i] = false;
    });
  };
  place(0);
  if (M && innerWidth > 860) {
    ScrollTrigger.create({ trigger: row, start: 'top 80%', end: 'bottom 35%', scrub: .6, onUpdate: (s) => place(s.progress) });
    gsap.from(steps, { y: 90, rotate: (i) => [-5, 0, 5][i], opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 85%' } });
    gsap.from('.how__t', { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#how', start: 'top 80%' } });
  }

  /* =======================================================
     3 · THE WALL — leave one (it drops in), take one (it tears off)
     ======================================================= */
  const board = $('#wallBoard');
  const read = (k, d) => { try { return JSON.parse(D.store.get(k) || d); } catch (e) { return JSON.parse(d); } };
  let taken = read('taken', '[]'), mine = read('wall', '[]');
  const homeCups = +(D.store.get('sospeso') || 0); // cups left from the name section on the home
  const rot = (id) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return (h / 997) * 8 - 4; };
  const ticket = (t) => `
    <article class="tk${t.mine ? ' tk--mine' : ''}" data-id="${t.id}" data-cursor="${t.mine ? 'yours ♥' : 'take it'}">
      <i class="tk__pin"></i>
      <p class="tk__top"><span>sospeso</span><span>${t.time}</span></p>
      <p class="tk__what">${t.what}</p>
      <p class="tk__row"><span>from</span><span>${t.from}</span></p>
      <p class="tk__for">for ${t.for}</p>
    </article>`;
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const all = () => [...mine.map((t) => ({ ...t, mine: true })), ...DATA.wall.filter((t) => !taken.includes(t.id))];
  board.innerHTML = all().map(ticket).join('');
  $$('.tk', board).forEach((t) => gsap.set(t, { rotate: rot(t.dataset.id) }));
  const total = () => 132 + $$('.tk', board).length + homeCups;
  const paintCount = (from) => {
    const to = total();
    if (!M) { countEl.textContent = to; return; }
    const o = { v: from ?? +countEl.textContent };
    gsap.to(o, { v: to, duration: from === 0 ? 2 : .6, ease: 'expo.out', onUpdate: () => (countEl.textContent = Math.round(o.v)) });
    if (from !== 0) gsap.fromTo(countEl, { scale: 1.25 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
  };
  if (M) D.ready.then(() => paintCount(0)); else paintCount();

  if (M) {
    gsap.from($$('.tk', board), {
      y: -140, rotate: () => D.rand(-30, 30), opacity: 0, duration: 1.2, stagger: { each: .06, from: 'random' }, ease: 'bounce.out',
      scrollTrigger: { trigger: board, start: 'top 80%' },
      onComplete: () => $$('.tk', board).forEach((t) => gsap.set(t, { rotate: rot(t.dataset.id) })),
    });
    gsap.from('.wall__t', { yPercent: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#leave', start: 'top 75%' } });
  }
  // hover: the ticket swings on its pin
  board.addEventListener('pointerover', (e) => {
    const t = e.target.closest('.tk'); if (!t || !M || t._sw || t._gone) return;
    t._sw = 1;
    const r = rot(t.dataset.id);
    gsap.fromTo(t, { rotate: r + (Math.random() < .5 ? -9 : 9) }, { rotate: r, duration: 1.6, ease: 'elastic.out(1.2, .18)', onComplete: () => (t._sw = 0) });
  });
  const TAKE = ['it\'s yours. drink it slowly.', 'taken. somebody thought of you at 7am.', 'yours now. no thank you needed. (but you can leave one later.)', 'enjoy. the person who left it will never know, and that\'s the point.'];
  board.addEventListener('click', (e) => {
    const t = e.target.closest('.tk'); if (!t || t._gone) return;
    if (t.classList.contains('tk--mine')) { D.toast("that's the one you left. let someone else have it ♥"); return; }
    t._gone = 1;
    const id = t.dataset.id;
    taken.push(id); D.store.set('taken', JSON.stringify(taken));
    const done = () => { t.remove(); paintCount(); };
    if (M) {
      const r = rot(id);
      gsap.timeline({ onComplete: done })
        .to(t, { rotate: r + 22, duration: .25, ease: 'power2.out' })
        .to(t, { y: 420, rotate: r + 70, opacity: 0, duration: .8, ease: 'power2.in' });
    } else done();
    D.toast(D.pick(TAKE));
  });
  // the form
  const what = $('#lvWhat');
  what.innerHTML = DATA.menu.flatMap((b) => b.items).map((it) => `<option>${it.name}</option>`).join('');
  const lvFrom = $('#lvFrom'), lvFor = $('#lvFor');
  lvFrom.value = D.store.get('name') || '';
  $('#leaveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const t = {
      id: `m${Date.now()}`, from: esc(lvFrom.value.trim() || 'anon'), for: esc(lvFor.value.trim() || D.pick(DATA.strangers)),
      what: esc(what.value), time: `${D.pad(d.getHours())}:${D.pad(d.getMinutes())}`,
    };
    mine.unshift(t); D.store.set('wall', JSON.stringify(mine));
    if (lvFrom.value.trim()) D.store.set('name', lvFrom.value.trim());
    board.insertAdjacentHTML('afterbegin', ticket({ ...t, mine: true }));
    const el = board.firstElementChild, r = rot(t.id);
    if (M) gsap.fromTo(el, { y: -360, rotate: -40, opacity: 0 }, { y: 0, rotate: r, opacity: 1, duration: 1.3, ease: 'bounce.out' });
    else gsap.set(el, { rotate: r });
    paintCount();
    lvFor.value = '';
    D.toast(`pinned: one ${t.what} for ${t.for}. somebody's morning just got better.`, 3800);
  });

  /* =======================================================
     4 · THE STORY — dots grow from the left, the card rises
     ======================================================= */
  const storyHT = halftone($('#storyDots'), $('#storySrc'), storyFallback, { align: 'center', from: 'left', density: 120, cut: true, scale: .86, gamma: 1.3, floor: .05, silColor: '#f3d3da' });
  if (M) {
    ScrollTrigger.create({ trigger: '#story', start: 'top 70%', once: true, onEnter: () => storyHT.grow(2.4) });
    gsap.from('#storyCard', { y: 120, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#story', start: 'top 55%' } });
    gsap.from('.story__cols p', { y: 30, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '#story', start: 'top 45%' } });
  } else storyHT.grow();

  /* =======================================================
     5 · WHAT A SECOND CUP DOES — the cup lands, arrows shoot outward
     ======================================================= */
  const stage = $('#doesStage'), arrows = $('#doesArrows'), cup = $('#doesCup'), labs = $$('.lab', stage);
  gsap.set(labs, { xPercent: -50, yPercent: -50 });
  const drawArrows = () => {
    const W = stage.offsetWidth, H = stage.offsetHeight;
    arrows.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const cx = W / 2, cy = H / 2;
    arrows.innerHTML = labs.map((l) => {
      const lx = l.offsetLeft, ly = l.offsetTop; // offsets point at --x/--y (the label's centre)
      const lerp = (t) => ({ x: cx + (lx - cx) * t, y: cy + (ly - cy) * t });
      const a = lerp(.5), b = lerp(.66);
      const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1;
      const mx = (a.x + b.x) / 2 + (nx / nl) * 12, my = (a.y + b.y) / 2 + (ny / nl) * 12;
      const ang = Math.atan2(b.y - my, b.x - mx);
      const h1 = { x: b.x - 10 * Math.cos(ang - .5), y: b.y - 10 * Math.sin(ang - .5) }, h2 = { x: b.x - 10 * Math.cos(ang + .5), y: b.y - 10 * Math.sin(ang + .5) };
      return `<path d="M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y} M${h1.x} ${h1.y} L${b.x} ${b.y} L${h2.x} ${h2.y}" />`;
    }).join('');
    $$('path', arrows).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = doesDone ? 0 : L; });
  };
  let doesDone = !M;
  drawArrows();
  addEventListener('resize', () => setTimeout(drawArrows, 120));
  document.fonts?.ready.then(drawArrows);
  if (M) {
    gsap.set(labs, { scale: 0, opacity: 0 });
    ScrollTrigger.create({
      trigger: stage, start: 'top 65%', once: true,
      onEnter: () => {
        gsap.timeline({ onComplete: () => (doesDone = true) })
          .fromTo(cup, { yPercent: -260, rotate: -20 }, { yPercent: -50, rotate: 0, duration: 1, ease: 'bounce.out' })
          .fromTo(cup, { scaleY: .9, scaleX: 1.06 }, { scaleY: 1, scaleX: 1, duration: .5, ease: 'elastic.out(1, .4)', transformOrigin: '50% 100%' }, '-=.2')
          .to($$('path', arrows), { strokeDashoffset: 0, duration: .45, stagger: .08, ease: 'power2.out' }, '-=.4')
          .to(labs, { scale: 1, opacity: 1, duration: .6, stagger: .08, ease: 'back.out(2.4)' }, '-=.5');
      },
    });
    gsap.set(cup, { xPercent: -50, yPercent: -50 });
    if (D.fine) {
      const rx = gsap.quickTo(cup, 'rotate', { duration: .8, ease: 'power3.out' });
      stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 14); });
      stage.addEventListener('pointerleave', () => rx(0));
    }
    labs.forEach((l, i) => l.addEventListener('pointerenter', () => {
      gsap.fromTo(l, { scale: 1.12 }, { scale: 1, duration: .7, ease: 'elastic.out(1.2, .3)' });
      const p = $$('path', arrows)[i];
      if (p) gsap.fromTo(p, { strokeDashoffset: p.getTotalLength() }, { strokeDashoffset: 0, duration: .5, ease: 'power2.out' });
    }));
  }

  /* ---------- footer word ---------- */
  if (M) gsap.from('.ft__word', { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });
})();
