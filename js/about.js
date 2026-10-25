/* =========================================================
   DOPPIO — about.js
   the steam clears, two cards shuffle, a year rolls, a signature writes itself
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const D = window.DP, { $, $$ } = D;
  const M = D.motion;

  /* =======================================================
     1 · HERO — kōhi glass: two lids drop onto the O's, the steam clears on scroll
     ======================================================= */
  const letters = $('#ahLetters'), word = $('#ahWord');
  const chars = D.split(letters);
  const lids = $$('.ah__lid', word);
  const os = [chars[1], chars[5]]; // the two O's: two cups seen from above
  const placeLids = () => os.forEach((c, i) => {
    const w = c.offsetWidth * .66;
    Object.assign(lids[i].style, { width: `${w}px`, left: `${letters.offsetLeft + c.offsetLeft + (c.offsetWidth - w) / 2}px`, top: `${letters.offsetTop + c.offsetTop + c.offsetHeight * .04}px` });
  });
  placeLids(); addEventListener('resize', placeLids); document.fonts?.ready.then(placeLids);
  if (M) {
    gsap.set(chars, { y: 50, opacity: 0 });
    gsap.set(lids, { y: -260, rotate: (i) => (i ? 24 : -24), opacity: 0 });
    gsap.set(['.ah__bar', '.ah__l', '.ah__r', '.ah__hint'], { opacity: 0, y: 20 });
    D.ready.then(() => {
      gsap.timeline()
        .to(chars, { y: 0, opacity: 1, duration: 1.1, stagger: .07, ease: 'expo.out' })
        .to(lids, { y: 0, rotate: 0, opacity: 1, duration: 1, stagger: .18, ease: 'bounce.out' }, .5)
        .to(['.ah__bar', '.ah__l', '.ah__r', '.ah__hint'], { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out' }, .7);
    });
    gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('#ahSharp', { opacity: 1, ease: 'none' }, 0)
      .to('.ah__frost', { opacity: 0, ease: 'none' }, 0)
      .to(word, { yPercent: -80, letterSpacing: '.22em', opacity: .15, ease: 'none' }, 0)
      .to('.ah__hint', { opacity: 0, duration: .3 }, 0);
    if (D.fine) {
      const px = gsap.quickTo('.ah__photo', 'x', { duration: 1.2, ease: 'power3.out' });
      const py = gsap.quickTo('.ah__photo', 'y', { duration: 1.2, ease: 'power3.out' });
      $('#hero').addEventListener('pointermove', (e) => { px((e.clientX / innerWidth - .5) * -30); py((e.clientY / innerHeight - .5) * -20); });
      // the lids lift when you come near the word, like checking a cup
      $('#hero').addEventListener('pointermove', (e) => {
        lids.forEach((l, i) => {
          const r = os[i].getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          gsap.to(l, { y: d < 160 ? -40 * (1 - d / 160) : 0, rotate: d < 160 ? (i ? 10 : -10) * (1 - d / 160) : 0, duration: .5, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    }
  }

  /* =======================================================
     2 · WHY TWO? — two flash photos that shuffle
     ======================================================= */
  const deck = $('#deck'), cards = $$('.fc', deck);
  // back, front (in %); on a phone the pair sits tighter so neither card leaves the screen
  const POS = innerWidth > 860 ? [{ x: -78, y: -54, rotate: -7, z: 1 }, { x: -22, y: -46, rotate: 5, z: 2 }] : [{ x: -66, y: -54, rotate: -6, z: 1 }, { x: -36, y: -46, rotate: 5, z: 2 }];
  let order = [0, 1]; // order[0] is the card at the back
  const lay = (instant) => order.forEach((ci, slot) => {
    const p = POS[slot], v = { xPercent: p.x, yPercent: p.y, rotate: p.rotate, zIndex: p.z };
    if (instant || !M) gsap.set(cards[ci], v); else gsap.to(cards[ci], { ...v, duration: .8, ease: 'expo.out' });
  });
  lay(true);
  let busy = false;
  const shuffle = () => {
    if (busy) return;
    const front = cards[order[1]], back = cards[order[0]];
    order = [order[1], order[0]];
    if (!M) { lay(true); return; }
    busy = true;
    gsap.timeline({ onComplete: () => (busy = false) })
      .to(front, { xPercent: 40, yPercent: -70, rotate: 16, duration: .4, ease: 'power2.out' })
      .set(front, { zIndex: 1 }).set(back, { zIndex: 2 })
      .to(back, { xPercent: POS[1].x, yPercent: POS[1].y, rotate: POS[1].rotate, duration: .7, ease: 'expo.out' }, .3)
      .to(front, { xPercent: POS[0].x, yPercent: POS[0].y, rotate: POS[0].rotate, duration: .7, ease: 'expo.out' }, .4);
  };
  deck.addEventListener('click', shuffle);
  if (M) {
    gsap.from($$('.two__t .ln').flatMap((l) => D.split(l)), { yPercent: 100, opacity: 0, duration: 1, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '#two', start: 'top 70%' } });
    gsap.from('.two__p', { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '#two', start: 'top 55%' } });
    gsap.from(cards, { y: 300, opacity: 0, duration: 1.2, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: deck, start: 'top 80%' } });
    // halfway through the section the deck shuffles on its own, so nobody misses the second one
    ScrollTrigger.create({ trigger: '#two', start: 'center 55%', onEnter: shuffle, onLeaveBack: shuffle });
  }

  /* =======================================================
     3 · HOW WE GOT HERE — the year rolls digit by digit like an odometer
     ======================================================= */
  const digits = $$('.tl__d', $('#tlYear')), sub = $('#tlSub');
  let year = '2019';
  const setYear = (y, s, dir) => {
    if (y === year) return;
    const prev = year; year = y;
    [...y].forEach((ch, i) => {
      if (prev[i] === ch) return;
      const d = digits[i];
      if (!M) { d.textContent = ch; return; }
      gsap.timeline()
        .to(d, { yPercent: -100 * dir, duration: .25, ease: 'power2.in' })
        .call(() => (d.textContent = ch))
        .fromTo(d, { yPercent: 100 * dir }, { yPercent: 0, duration: .45, ease: 'back.out(2)' });
    });
    D.scramble(sub, s, .6);
    $('#tlYear').setAttribute('aria-label', y);
  };
  $$('.tl__item').forEach((it) => {
    ScrollTrigger.create({ trigger: it, start: 'top 60%', end: 'bottom 60%', onEnter: () => setYear(it.dataset.year, it.dataset.sub, 1), onEnterBack: () => setYear(it.dataset.year, it.dataset.sub, -1) });
    if (M) gsap.fromTo($('.slot', it), { scale: .82, rotate: it.matches(':nth-child(even)') ? 4 : -4 }, { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'top 35%', scrub: true } });
  });

  /* =======================================================
     4 · SAY HI — the form (nothing leaves the page), the signature writes itself
     ======================================================= */
  $('#hiForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#hiMail').value = '';
    D.toast('signed up, twice. (not really: it\'s a concept, so your email never left this page.)', 4200);
  });
  const name = $('#sigName');
  const nChars = D.split(name);
  if (M) {
    gsap.from($$('.hi__t .ln').flatMap((l) => D.split(l)), { yPercent: 80, opacity: 0, duration: 1, stagger: .04, ease: 'expo.out', scrollTrigger: { trigger: '#hi', start: 'top 70%' } });
    gsap.from(nChars, { yPercent: 70, rotate: -14, opacity: 0, duration: .9, stagger: .07, ease: 'back.out(2)', scrollTrigger: { trigger: '#sigBig', start: 'top 80%' } });
    gsap.from('.sig-big__heart', { scale: 0, duration: .8, ease: 'back.out(4)', scrollTrigger: { trigger: '#sigBig', start: 'top 60%' } });
    gsap.to('.sig-big__heart', { scale: 1.18, duration: .45, yoyo: true, repeat: -1, ease: 'sine.inOut', repeatDelay: .3 });
    name.addEventListener('pointerenter', () => gsap.fromTo(nChars, { y: 0 }, { y: -18, duration: .25, stagger: .04, yoyo: true, repeat: 1, ease: 'sine.out' }));
  }

  /* ---------- footer word ---------- */
  if (M) gsap.from('.ft__word', { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });
})();
