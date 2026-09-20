/* Ntikhabat — lightweight i18n.
   Phrase-dictionary translation: original English text is the lookup key, dictionaries
   are keyed by language. DOM text nodes are walked and swapped after every render (app.js
   is dynamic-HTML-driven, so a MutationObserver catches re-renders too). Numeric strings
   are matched via a "{n}" template so counts like "50 parties" translate without every
   possible number needing its own dictionary entry. Ported from the same approach used
   in the Majlis (morocco-politics) sister project, adapted to this repo's bundled-script
   loading (no fetch(), so pages keep working when opened directly from disk) and scoped
   to this repo's own UI strings rather than reused verbatim. */
(function () {
  'use strict';
  const DICTS = (window.I18N = window.I18N || {});
  const LANGS = { en: { label: 'English', dir: 'ltr' }, fr: { label: 'Français', dir: 'ltr' }, ary: { label: 'الدارجة', dir: 'rtl' } };
  const STORAGE_KEY = 'language';

  function currentLang() {
    try { const l = localStorage.getItem(STORAGE_KEY); if (l && LANGS[l]) return l; } catch (e) {}
    return 'en';
  }

  function templateKey(s) {
    return s.replace(/\d[\d,]*/g, '{n}');
  }

  function translate(lang, text) {
    if (lang === 'en' || !text) return text;
    const dict = DICTS[lang];
    if (!dict) return text;
    const trimmed = text.trim();
    if (!trimmed) return text;
    const lead = text.slice(0, text.length - text.trimStart().length);
    const trail = text.slice(text.trimEnd().length);
    if (dict[trimmed]) return lead + dict[trimmed] + trail;
    const key = templateKey(trimmed);
    if (key !== trimmed && dict[key]) {
      const nums = trimmed.match(/\d[\d,]*/g) || [];
      let i = 0;
      return lead + dict[key].replace(/\{n\}/g, () => nums[i++] ?? '') + trail;
    }
    return text;
  }

  // Track each text node's original (English) text so re-translating (e.g. after a
  // language switch, or after app.js re-renders a chart's table) never double-translates
  // already-translated output.
  const originals = new WeakMap();

  function localizeNode(node, lang) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || /^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)) return;
      let orig = originals.get(node);
      if (orig === undefined) { orig = node.textContent; originals.set(node, orig); }
      if (!/[A-Za-z]/.test(orig)) return; // skip pure numbers/punctuation, nothing to translate
      node.textContent = translate(lang, orig);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    for (const attr of ['placeholder', 'title', 'aria-label']) {
      if (node.hasAttribute && node.hasAttribute(attr)) {
        const key = 'attr:' + attr;
        let orig = (node[originals] || {})[key];
        const store = originals.get(node) || {};
        if (store[key] === undefined) { store[key] = node.getAttribute(attr); originals.set(node, store); }
        node.setAttribute(attr, translate(lang, store[key]));
      }
    }
    node.childNodes.forEach(child => localizeNode(child, lang));
  }

  function localizeDOM(lang, root) {
    (root || document.body).childNodes.forEach(n => localizeNode(n, lang));
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang === 'ary' ? 'ary' : lang;
    document.documentElement.dir = LANGS[lang].dir;
    document.documentElement.dataset.lang = lang;
    localizeDOM(lang);
    const sel = document.getElementById('language-select');
    if (sel) sel.value = lang;
    // Data-bank prose is resolved per language when app.js builds its markup, so a
    // language switch needs a content re-render, not only a text-node swap.
    document.dispatchEvent(new CustomEvent('ntk:languagechange', { detail: { lang } }));
  }

  function initLanguage() {
    const lang = currentLang();
    applyLanguage(lang);
    const sel = document.getElementById('language-select');
    if (sel) {
      sel.addEventListener('change', () => {
        try { localStorage.setItem(STORAGE_KEY, sel.value); } catch (e) {}
        applyLanguage(sel.value);
      });
    }
    // app.js renders page content by setting innerHTML after DOMContentLoaded; observe
    // the main content area so every re-render gets localized without app.js needing to
    // know i18n exists.
    const main = document.querySelector('main');
    if (main && window.MutationObserver) {
      new MutationObserver(() => localizeDOM(currentLang(), main)).observe(main, { childList: true, subtree: true });
    }
  }

  window.i18n = { currentLang, applyLanguage, localizeDOM };
  document.addEventListener('DOMContentLoaded', initLanguage);
})();
