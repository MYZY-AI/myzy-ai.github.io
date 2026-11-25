(() => {
  'use strict';

  const body = document.body;
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.hero-scene');
  const toggle = document.querySelector('.motion-toggle');
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const coarsePointer = matchMedia('(any-pointer: coarse)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let userPaused = false;
  let frame = 0;
  let entranceFrame = 0;
  let revealObserver;
  let sceneObserver;
  let sceneVisible = true;
  let pointerX = 0;
  let pointerY = 0;

  try {
    userPaused = localStorage.getItem('muyan-motion-paused') === 'true';
  } catch (_) { /* The page also works when storage is unavailable. */ }

  const isPaused = () => userPaused || reducedMotion.matches;
  const canMoveScene = () => !isPaused() && finePointer.matches && !coarsePointer.matches;

  function reveal(element) {
    element.classList.add('is-visible');
    revealObserver?.unobserve(element);
  }

  function revealAll() {
    reveals.forEach(reveal);
  }

  function revealTarget(target) {
    if (!(target instanceof Element)) return;
    reveals.forEach(element => {
      if (element === target || element.contains(target) || target.contains(element)) reveal(element);
    });
  }

  function revealHashTarget() {
    if (!location.hash) return;
    try {
      revealTarget(document.getElementById(decodeURIComponent(location.hash.slice(1))));
    } catch (_) { /* An unrelated or malformed hash should not affect the page. */ }
  }

  function render() {
    frame = 0;
    if (document.hidden) return;

    const viewportHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
    body.style.setProperty('--page-progress', progress.toFixed(4));

    if (!scene) return;
    if (!canMoveScene()) {
      scene.style.setProperty('--pointer-x', '0px');
      scene.style.setProperty('--pointer-y', '0px');
      scene.style.setProperty('--scene-scroll', '0px');
      return;
    }
    if (!sceneVisible || !hero) return;

    const heroBounds = hero.getBoundingClientRect();
    const scrollOffset = clamp(-heroBounds.top / Math.max(heroBounds.height, 1), 0, 1) * 70;
    scene.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
    scene.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
    scene.style.setProperty('--scene-scroll', `${scrollOffset.toFixed(2)}px`);
  }

  function scheduleRender() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function prepareReveals() {
    revealObserver?.disconnect();
    revealObserver = undefined;

    // The unenhanced document is always visible. Only opt into reveal CSS
    // after an observer is successfully available and registered.
    body.classList.remove('motion-ready');
    if (isPaused() || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    try {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { rootMargin: '0px 0px -32px 0px', threshold: 0.08 });

      reveals.forEach(element => {
        element.querySelectorAll('[data-reveal-item]').forEach((item, index) => {
          item.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 80}ms`);
        });
        const bounds = element.getBoundingClientRect();
        if (element.classList.contains('is-visible') ||
            (bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0)) {
          reveal(element);
        } else {
          revealObserver.observe(element);
        }
      });
      revealHashTarget();
      body.classList.add('motion-ready');
    } catch (_) {
      revealObserver?.disconnect();
      revealAll();
    }
  }

  function finishEntrance() {
    entranceFrame = 0;
    if (document.hidden) return;
    hero?.classList.add('is-ready');
  }

  function updatePreferences() {
    const paused = isPaused();
    body.classList.toggle('motion-paused', paused);
    pointerX = 0;
    pointerY = 0;
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute('aria-pressed', String(paused));
      // Respect the operating-system preference even when the toggle is used.
      toggle.disabled = reducedMotion.matches;
    }
    if (paused) hero?.classList.add('is-ready');
    prepareReveals();
    scheduleRender();
  }

  hero?.addEventListener('pointermove', event => {
    if (!canMoveScene() || !sceneVisible || document.hidden || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    pointerX = clamp(((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 40, -20, 20);
    pointerY = clamp(((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 40, -20, 20);
    scheduleRender();
  }, { passive: true });

  hero?.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    scheduleRender();
  }, { passive: true });

  if (hero && 'IntersectionObserver' in window) {
    sceneObserver = new IntersectionObserver(entries => {
      sceneVisible = entries[0].isIntersecting;
      body.classList.toggle('scene-offscreen', !sceneVisible);
      if (sceneVisible) scheduleRender();
    });
    sceneObserver.observe(hero);
  }

  toggle?.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    userPaused = !userPaused;
    try {
      localStorage.setItem('muyan-motion-paused', String(userPaused));
    } catch (_) { /* Pausing is still available for the current visit. */ }
    updatePreferences();
  });

  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', scheduleRender, { passive: true });
  window.addEventListener('hashchange', revealHashTarget);
  document.addEventListener('focusin', event => revealTarget(event.target));
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('motion-hidden', document.hidden);
    if (document.hidden) {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(entranceFrame);
      frame = 0;
      entranceFrame = 0;
      pointerX = 0;
      pointerY = 0;
    } else {
      finishEntrance();
      scheduleRender();
    }
  });

  [reducedMotion, finePointer, coarsePointer].forEach(query => {
    if (query.addEventListener) query.addEventListener('change', updatePreferences);
    else query.addListener(updatePreferences);
  });

  // Re-measure after responsive images or a language change affect page height.
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(scheduleRender);
    resizeObserver.observe(body);
  }

  updatePreferences();
  body.classList.toggle('motion-hidden', document.hidden);
  entranceFrame = requestAnimationFrame(() => {
    entranceFrame = requestAnimationFrame(finishEntrance);
  });
})();
