(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POOL = 'SHIVAM';
  const rand = (s) => s[Math.floor(Math.random() * s.length)];

  /* =========================================================
     Hero intro — a grid of jumbled S H I V A M letters rolls,
     the middle row locks into SHIVAM, everything else fades.
     Plays once per page load.
     ========================================================= */
  const NAME = 'SHIVAM';
  const ROWS = 5;
  const NAME_ROW = 2;              // zero-based, the centre row
  const REPLAY_ON_RETURN = false;  // flip to true to replay when scrolling back to the top

  const jumble = document.querySelector('.jumble');
  const stage = document.querySelector('.hero__stage');
  let cells = [];
  let running = false;

  function buildGrid() {
    jumble.textContent = '';
    cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < NAME.length; c++) {
        const el = document.createElement('div');
        el.className = 'jumble__cell';
        const span = document.createElement('span');
        span.textContent = rand(POOL);
        el.appendChild(span);
        jumble.appendChild(el);
        cells.push({ el, span, r, c, isName: r === NAME_ROW, locked: false });
      }
    }
    stage.style.setProperty('--name-row', NAME_ROW);
  }

  function roll(cell, letter, settle) {
    cell.span.textContent = letter;
    cell.span.animate(
      settle
        ? [{ transform: 'translateY(-40%)', opacity: 0 }, { transform: 'translateY(6%)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }]
        : [{ transform: 'translateY(45%)', opacity: .35 }, { transform: 'none', opacity: 1 }],
      { duration: settle ? 420 : 150, easing: 'cubic-bezier(.2,.75,.2,1)' }
    );
  }

  function showFinal() {
    buildGrid();
    cells.forEach((cell) => {
      if (cell.isName) {
        cell.span.textContent = NAME[cell.c];
        cell.el.classList.add('is-locked');
      } else {
        cell.el.style.opacity = '0';
      }
    });
    root.classList.add('intro-done');
  }

  function playIntro() {
    if (running) return;
    running = true;
    root.classList.remove('intro-done');
    buildGrid();

    jumble.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });

    // keep letters rolling
    const tick = setInterval(() => {
      cells.forEach((cell) => {
        if (cell.locked || Math.random() > .5) return;
        let next = rand(POOL);
        if (next === cell.span.textContent) next = rand(POOL);
        roll(cell, next, false);
      });
    }, 85);

    // lock the name, left to right
    const LOCK_START = 1100;
    const LOCK_STEP = 190;
    cells.filter((c) => c.isName).forEach((cell) => {
      setTimeout(() => {
        cell.locked = true;
        roll(cell, NAME[cell.c], true);
        cell.el.classList.add('is-locked');
      }, LOCK_START + cell.c * LOCK_STEP);
    });

    // stop, fade the rest away from the name outwards
    const allLocked = LOCK_START + (NAME.length - 1) * LOCK_STEP + 350;
    setTimeout(() => {
      clearInterval(tick);
      cells.filter((c) => !c.isName).forEach((cell) => {
        cell.locked = true;
        const distance = Math.abs(cell.r - NAME_ROW);
        cell.el.animate(
          [{ opacity: 1, filter: 'blur(0px)', transform: 'none' },
           { opacity: 0, filter: 'blur(6px)', transform: `translateY(${cell.r < NAME_ROW ? '-' : ''}12%)` }],
          { duration: 750, delay: distance * 110 + Math.random() * 160, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
        );
      });
    }, allLocked);

    setTimeout(() => {
      root.classList.add('intro-done');
      running = false;
    }, allLocked + 650);
  }

  if (jumble) {
    if (reduceMotion) {
      showFinal();
    } else {
      // start once the serif is ready, so letters never swap fonts mid-roll (max ~1.2s wait)
      const fontsReady = document.fonts ? document.fonts.load('400 1em "Instrument Serif"') : Promise.resolve();
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(playIntro, playIntro);

      if (REPLAY_ON_RETURN) {
        let left = false;
        new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) left = true;
          else if (left) { left = false; playIntro(); }
        }, { threshold: 0.6 }).observe(document.querySelector('.hero'));
      }
    }
  }

  /* =========================================================
     Scramble — small labels decode from the same letters
     ========================================================= */
  function scramble(el, duration = 700) {
    const final = el.dataset.text || el.textContent.trim();
    el.dataset.text = final;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', final);
    if (reduceMotion) return;

    const start = performance.now();
    const frame = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const settled = Math.floor(p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        const ch = final[i];
        out += i < settled || ch === ' ' ? ch : rand(POOL);
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = final;
    };
    requestAnimationFrame(frame);
  }

  /* =========================================================
     Reveal on scroll
     ========================================================= */
  const revealEls = document.querySelectorAll('.reveal, [data-scramble]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('reveal')) el.classList.add('is-in');
        if (el.hasAttribute('data-scramble')) scramble(el, el.classList.contains('site-footer__name') ? 1100 : 700);
        io.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* =========================================================
     Menu
     ========================================================= */
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => {
        menu.classList.add('is-open');
        menu.querySelector('a').focus({ preventScroll: true });
      });
    } else {
      menu.classList.remove('is-open');
      menu.addEventListener('transitionend', function done(e) {
        if (e.target !== menu) return;
        if (!menu.classList.contains('is-open')) menu.hidden = true;
        menu.removeEventListener('transitionend', done);
      });
    }
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* =========================================================
     Strips — hover / focus / tap expands one, collapses the rest
     ========================================================= */
  const strips = [...document.querySelectorAll('.strip')];
  function activate(strip) {
    strips.forEach((s) => {
      const on = s === strip;
      s.classList.toggle('is-active', on);
      s.querySelector('.strip__btn').setAttribute('aria-pressed', String(on));
    });
  }
  const canHover = window.matchMedia('(hover: hover)').matches;
  strips.forEach((strip) => {
    if (canHover) strip.addEventListener('mouseenter', () => activate(strip));
    strip.addEventListener('focusin', () => activate(strip));
    strip.addEventListener('click', () => activate(strip));
  });

  /* ---------- misc ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
