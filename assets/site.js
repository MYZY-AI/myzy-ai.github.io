(() => {
  const languageButton = document.querySelector('.language');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  let language = 'zh';
  const updateMenuLabel = () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', language === 'en' ? (open ? 'Close navigation' : 'Open navigation') : (open ? '关闭导航' : '打开导航'));
  };
  const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); mobileNav.hidden = true; updateMenuLabel(); };
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      if (el.tagName === 'META') el.content = el.dataset[language];
      else el.textContent = el.dataset[language];
    });
    document.querySelectorAll('[data-zh-alt]').forEach(el => { el.alt = el.getAttribute(`data-${language}-alt`); });
    document.querySelectorAll('[data-zh-label]').forEach(el => { el.setAttribute('aria-label', el.getAttribute(`data-${language}-label`)); });
    languageButton.textContent = language === 'en' ? '中文' : 'EN';
    languageButton.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : '切换为英文');
    document.title = document.querySelector('meta[property="og:title"]').content;
    updateMenuLabel();
    try { localStorage.setItem('muyan-language', language); } catch (_) { /* Browsing remains usable when storage is unavailable. */ }
  }
  languageButton.hidden = false;
  menuButton.hidden = false;
  try { if (localStorage.getItem('muyan-language') === 'en') setLanguage('en'); } catch (_) {}
  languageButton.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); mobileNav.hidden = !open; updateMenuLabel(); });
  mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const film = document.querySelector('.starry-film');
  const filmPlay = document.querySelector('.film-play');
  const filmError = document.querySelector('.film-error');
  if (film && filmPlay) {
    filmPlay.hidden = false;
    filmPlay.addEventListener('click', async () => {
      filmError.hidden = true;
      filmPlay.hidden = true;
      film.controls = true;
      film.tabIndex = 0;
      // The film is requested only after an explicit play action.
      if (!film.getAttribute('src')) film.src = film.dataset.src;
      film.focus({ preventScroll: true });
      try { await film.play(); } catch (error) {
        // Leaving the film may cancel a pending play request without an error.
        if (error.name === 'AbortError') return;
        filmError.hidden = false;
        filmPlay.hidden = false;
      }
    });
    film.addEventListener('error', () => { filmError.hidden = false; filmPlay.hidden = false; });
    // Do not keep a manually started film playing after its viewer leaves.
    document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) film.pause();
      }, { threshold: 0 }).observe(film);
    }
  }
})();
