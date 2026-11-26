(() => {
  'use strict';

  const body = document.body;
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.hero-scene');
  const productImage = document.querySelector('.product-image');
  const revealGroups = [...document.querySelectorAll('[data-reveal]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const coarsePointer = matchMedia('(any-pointer: coarse)');
  const desktop = matchMedia('(min-width: 761px)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let frame = 0;
  let entranceFrame = 0;
  let revealObserver;
  let sceneVisible = true;
  let productVisible = false;
  let pointerX = 0;
  let pointerY = 0;
  let magnetTarget;
  let magnetBounds;
  let magnetX = 0;
  let magnetY = 0;
  let sheenX = 50;
  let sheenY = 50;

  const isPaused = () => reducedMotion.matches;
  const canMoveScene = () => !isPaused() && finePointer.matches && !coarsePointer.matches && desktop.matches;

  // Reveal independent pieces instead of hiding a whole, potentially tall,
  // product or culture section until enough of that section intersects.
  const revealUnits = [];
  revealGroups.forEach(group => {
    const children = [...group.querySelectorAll('[data-reveal-item]')]
      .filter(item => item.closest('[data-reveal]') === group);
    if (children.length) {
      group.classList.add('reveal-group', 'is-visible');
      children.forEach((item, index) => {
        item.classList.add('reveal-unit');
        item.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 60}ms`);
        revealUnits.push(item);
      });
    } else {
      group.classList.add('reveal-unit');
      revealUnits.push(group);
    }
  });

  function reveal(element) {
    element.classList.add('is-visible');
    revealObserver?.unobserve(element);
  }

  function revealAll() {
    revealGroups.forEach(group => group.classList.add('is-visible'));
    revealUnits.forEach(reveal);
  }

  function revealTarget(target) {
    if (!(target instanceof Element)) return;
    revealUnits.forEach(element => {
      if (element === target || element.contains(target) || target.contains(element)) reveal(element);
    });
  }

  function revealHashTarget() {
    if (!location.hash) return;
    try {
      revealTarget(document.getElementById(decodeURIComponent(location.hash.slice(1))));
    } catch (_) { /* An unrelated or malformed hash should not affect the page. */ }
  }

  function resetMagnet() {
    if (magnetTarget) {
      magnetTarget.style.setProperty('--magnet-x', '0px');
      magnetTarget.style.setProperty('--magnet-y', '0px');
      magnetTarget.classList.remove('is-magnetic');
    }
    magnetTarget = undefined;
    magnetBounds = undefined;
    magnetX = 0;
    magnetY = 0;
  }

  function render() {
    frame = 0;
    if (document.hidden) return;

    const viewportHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
    body.style.setProperty('--page-progress', progress.toFixed(4));

    if (scene) {
      if (!canMoveScene()) {
        scene.style.setProperty('--pointer-x', '0px');
        scene.style.setProperty('--pointer-y', '0px');
        scene.style.setProperty('--scene-scroll', '0px');
      } else if (sceneVisible && hero) {
        const heroBounds = hero.getBoundingClientRect();
        const scrollOffset = clamp(-heroBounds.top / Math.max(heroBounds.height, 1), 0, 1) * 70;
        scene.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
        scene.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
        scene.style.setProperty('--scene-scroll', `${scrollOffset.toFixed(2)}px`);
      }
    }

    if (productImage) {
      if (!canMoveScene()) {
        productImage.style.setProperty('--product-shift', '0px');
      } else if (productVisible) {
        const bounds = productImage.getBoundingClientRect();
        const travel = (viewportHeight / 2 - (bounds.top + bounds.height / 2)) / ((viewportHeight + bounds.height) / 2);
        productImage.style.setProperty('--product-shift', `${(clamp(travel, -1, 1) * 24).toFixed(2)}px`);
      }
    }

    if (magnetTarget) {
      magnetTarget.style.setProperty('--magnet-x', `${magnetX.toFixed(2)}px`);
      magnetTarget.style.setProperty('--magnet-y', `${magnetY.toFixed(2)}px`);
      magnetTarget.style.setProperty('--sheen-x', `${sheenX.toFixed(1)}%`);
      magnetTarget.style.setProperty('--sheen-y', `${sheenY.toFixed(1)}%`);
    }
  }

  function scheduleRender() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function prepareReveals() {
    revealObserver?.disconnect();
    revealObserver = undefined;
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
      }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });

      revealUnits.forEach(element => {
        const bounds = element.getBoundingClientRect();
        if (element.classList.contains('is-visible') ||
            (bounds.top < window.innerHeight - 24 && bounds.bottom > 0)) {
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
    if (!document.hidden) hero?.classList.add('is-ready');
  }

  function updatePreferences() {
    const paused = isPaused();
    body.classList.toggle('motion-paused', paused);
    body.classList.toggle('motion-fine', canMoveScene());
    pointerX = 0;
    pointerY = 0;
    resetMagnet();
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

  // Translation stays within four pixels, so the button keeps its natural hit
  // area and never moves away from the pointer. Keyboard and touch stay still.
  document.querySelectorAll('.button').forEach(button => {
    button.classList.add('motion-button');
    button.addEventListener('pointerenter', event => {
      if (!canMoveScene() || event.pointerType === 'touch' || button.matches(':focus-visible, :disabled')) return;
      resetMagnet();
      magnetTarget = button;
      magnetBounds = button.getBoundingClientRect();
      button.classList.add('is-magnetic');
    }, { passive: true });
    button.addEventListener('pointermove', event => {
      if (magnetTarget !== button || !magnetBounds || !canMoveScene()) return;
      const x = clamp((event.clientX - magnetBounds.left) / magnetBounds.width, 0, 1);
      const y = clamp((event.clientY - magnetBounds.top) / magnetBounds.height, 0, 1);
      magnetX = (x - 0.5) * 8;
      magnetY = (y - 0.5) * 8;
      sheenX = x * 100;
      sheenY = y * 100;
      scheduleRender();
    }, { passive: true });
    button.addEventListener('pointerleave', resetMagnet, { passive: true });
    button.addEventListener('pointerdown', resetMagnet, { passive: true });
    button.addEventListener('blur', resetMagnet);
  });

  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      sceneVisible = entries[0].isIntersecting;
      body.classList.toggle('scene-offscreen', !sceneVisible);
      if (sceneVisible) scheduleRender();
    });
    if (hero) sceneObserver.observe(hero);
    const productObserver = new IntersectionObserver(entries => {
      productVisible = entries[0].isIntersecting;
      productImage?.classList.toggle('has-depth', productVisible);
      if (productVisible) scheduleRender();
    });
    if (productImage) productObserver.observe(productImage);
  } else {
    productVisible = true;
  }

  window.addEventListener('scroll', () => {
    resetMagnet();
    scheduleRender();
  }, { passive: true });
  window.addEventListener('resize', () => {
    resetMagnet();
    scheduleRender();
  }, { passive: true });
  window.addEventListener('hashchange', revealHashTarget);
  document.addEventListener('focusin', event => {
    revealTarget(event.target);
    if (event.target.matches(':focus-visible')) resetMagnet();
  });
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('motion-hidden', document.hidden);
    if (document.hidden) {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(entranceFrame);
      frame = 0;
      entranceFrame = 0;
      pointerX = 0;
      pointerY = 0;
      resetMagnet();
    } else {
      finishEntrance();
      scheduleRender();
    }
  });

  [reducedMotion, finePointer, coarsePointer, desktop].forEach(query => {
    if (query.addEventListener) query.addEventListener('change', updatePreferences);
    else query.addListener(updatePreferences);
  });

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
