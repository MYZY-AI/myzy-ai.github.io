(() => {
  const languageButton = document.querySelector('.language');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  let language = 'zh';
  const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); mobileNav.hidden = true; };
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = el.dataset[language]; });
    document.querySelectorAll('[data-zh-alt]').forEach(el => { el.alt = el.getAttribute(`data-${language}-alt`); });
    document.querySelectorAll('[data-zh-label]').forEach(el => { el.setAttribute('aria-label', el.getAttribute(`data-${language}-label`)); });
    languageButton.textContent = language === 'en' ? '中文' : 'EN';
    languageButton.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
    document.title = language === 'en' ? 'MUYAN — Make AI friends' : '沐言 MUYAN — Make AI friends';
    document.querySelector('meta[name="description"]').content = language === 'en' ? 'MUYAN creates AI friends. Meet Starry, where characters, stories and AI interaction become everyday companionship.' : '沐言 MUYAN，创造 AI 朋友。我们通过星眠，将角色、故事与 AI 互动融为一体，让相遇成为日常的陪伴。';
    try { localStorage.setItem('muyan-language', language); } catch (_) { /* Browsing remains usable when storage is unavailable. */ }
  }
  languageButton.hidden = false;
  menuButton.hidden = false;
  try { if (localStorage.getItem('muyan-language') === 'en') setLanguage('en'); } catch (_) {}
  languageButton.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); mobileNav.hidden = !open; });
  mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
