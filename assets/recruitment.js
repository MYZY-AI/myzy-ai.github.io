(() => {
  'use strict';

  const dialog = document.querySelector('#recruitment-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const closeButton = dialog.querySelector('.recruitment-close');
  const copyButton = dialog.querySelector('.recruitment-copy');
  const copyLabel = dialog.querySelector('[data-copy-label]');
  const emailLink = dialog.querySelector('.recruitment-email');
  let trigger;
  let previousOverflow;
  let feedbackTimer;
  let copyRevision = 0;
  let backdropPress = false;

  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';

  function resetCopyLabel() {
    clearTimeout(feedbackTimer);
    copyRevision += 1;
    if (copyLabel) copyLabel.textContent = copyLabel.dataset[language()];
    if (copyButton) copyButton.disabled = false;
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-recruitment]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Keep the mailto link usable if the modal cannot be opened.
    if (!dialog.open) {
      try { dialog.showModal(); } catch (_) { return; }
      trigger = link;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      resetCopyLabel();
      closeButton?.focus({ preventScroll: true });
    }
    event.preventDefault();
  });

  closeButton?.addEventListener('click', close);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || event.ctrlKey || event.metaKey) return;
    const controls = [...dialog.querySelectorAll('a[href], button:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow ?? '';
    previousOverflow = undefined;
    resetCopyLabel();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    trigger = undefined;
  });

  function outsidePanel(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  dialog.addEventListener('pointerdown', event => {
    backdropPress = event.target === dialog && outsidePanel(event);
  });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outsidePanel(event)) close();
    backdropPress = false;
  });

  function legacyCopy(value) {
    const field = document.createElement('textarea');
    field.value = value;
    field.readOnly = true;
    field.tabIndex = -1;
    field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;width:1px;height:1px;';
    dialog.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) {}
    field.remove();
    copyButton?.focus({ preventScroll: true });
    return copied;
  }

  copyLabel?.setAttribute('aria-live', 'polite');
  copyButton?.addEventListener('click', async () => {
    if (!emailLink || !copyLabel) return;
    const email = emailLink.textContent.trim();
    const revision = ++copyRevision;
    let copied = false;
    copyButton.disabled = true;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        copied = true;
      } else {
        copied = legacyCopy(email);
      }
    } catch (_) {
      // If permission is denied, fall back only while this dialog is active.
      if (dialog.open && revision === copyRevision) copied = legacyCopy(email);
    }
    if (!dialog.open || revision !== copyRevision) return;
    copyButton.disabled = false;
    clearTimeout(feedbackTimer);
    if (copied) {
      copyLabel.textContent = copyLabel.dataset[`${language()}Copied`];
      feedbackTimer = setTimeout(resetCopyLabel, 2200);
    } else {
      // Leave the exact source label intact; select the address for manual copy.
      const range = document.createRange();
      range.selectNodeContents(emailLink);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      emailLink.focus({ preventScroll: true });
    }
  });

  new MutationObserver(resetCopyLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  });
})();
