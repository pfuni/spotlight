// ==UserScript==
// @name         Spotlight
// @namespace    spotlight-web-launcher
// @version      2.0.0
// @author       pfuni
// @updateURL    https://github.com/pfuni/spotlight/raw/refs/heads/main/spotlight.user.js
// @downloadURL  https://github.com/pfuni/spotlight/raw/refs/heads/main/spotlight.user.js
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://unpkg.com/react@18.2.0/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js
// @connect      text.pollinations.ai
// @connect      generativelanguage.googleapis.com
// @connect      api.groq.com
// @connect      openrouter.ai
// @connect      *
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const h = React.createElement;
  const { useState, useEffect, useRef, useCallback, useMemo } = React;

  /* ════════════════════════════════════════════════════════════════════════════
   *  LUCIDE-STYLE SVG ICONS (inline paths)
   * ════════════════════════════════════════════════════════════════════════════ */
  const ICON_PATHS = {
    search:       ['M21 21l-4.35-4.35','M11 19a8 8 0 100-16 8 8 0 000 16z'],
    sparkles:     ['M12 3l1.09 3.26L16.36 7.5l-3.27 1.09L12 11.86l-1.09-3.27L7.64 7.5l3.27-1.24L12 3z','M7 12l.72 2.16L10 14.88l-2.28.72L7 17.76l-.72-2.16L4 14.88l2.28-.72L7 12z','M18 14l.54 1.62 1.62.54-1.62.54L18 18.32l-.54-1.62-1.62-.54 1.62-.54L18 14z'],
    arrowLeft:    ['M19 12H5','M12 19l-7-7 7-7'],
    settings:     ['M12 15a3 3 0 100-6 3 3 0 000 6z','M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'],
    globe:        ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z','M2 12h20','M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z'],
    calculator:   ['M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z','M8 10V8','M12 10V8','M16 10V8','M8 14v2','M12 14v2','M16 14v2'],
    externalLink: ['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6','M15 3h6v6','M10 14L21 3'],
    clock:        ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z','M12 6v6l4 2'],
    bookmark:     ['M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z'],
    command:      ['M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z'],
    send:         ['M22 2L11 13','M22 2l-7 20-4-9-9-4 20-7z'],
    x:            ['M18 6L6 18','M6 6l12 12'],
    plus:         ['M12 5v14','M5 12h14'],
    trash:        ['M3 6h18','M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6','M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2'],
    download:     ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M7 10l5 5 5-5','M12 15V3'],
    upload:       ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
    palette:      ['M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10c0 .9-.1 1.8-.4 2.6-.5 1.5-2 2.4-3.6 2.4h-1.8c-.5 0-1 .2-1.3.5s-.5.8-.5 1.3c0 .5-.2 1-.5 1.3s-.8.5-1.3.5H12z'],
    zap:          ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    bot:          ['M12 8V4H8','M6 8h12a4 4 0 014 4v2a4 4 0 01-4 4H6a4 4 0 01-4-4v-2a4 4 0 014-4z','M2 14h2','M20 14h2','M15 13a1 1 0 100-2 1 1 0 000 2z','M9 13a1 1 0 100-2 1 1 0 000 2z'],
    sun:          ['M12 16a4 4 0 100-8 4 4 0 000 8z','M12 2v2','M12 20v2','M4.93 4.93l1.41 1.41','M17.66 17.66l1.41 1.41','M2 12h2','M20 12h2','M6.34 17.66l-1.41 1.41','M19.07 4.93l-1.41 1.41'],
    moon:         ['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'],
    monitor:      ['M2 3h20v14H2z','M8 21h8','M12 17v4'],
    check:        ['M20 6L9 17l-5-5'],
    chevronRight: ['M9 18l6-6-6-6'],
    user:         ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2','M12 11a4 4 0 100-8 4 4 0 000 8z'],
  };

  function LucideIcon(props) {
    var name = props.name || 'search';
    var size = props.size || 18;
    var color = props.color || 'currentColor';
    var paths = ICON_PATHS[name] || ICON_PATHS.search;
    return h('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
      className: props.className || '', style: Object.assign({ flexShrink: 0 }, props.style || {}),
    }, paths.map(function (d, i) { return h('path', { d: d, key: i }); }));
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  THEMES
   * ════════════════════════════════════════════════════════════════════════════ */
  const THEMES = {
    midnight: {
      name: 'Midnight', icon: 'moon',
      overlay: 'rgba(0,0,0,0.52)',
      bg: 'rgba(16,16,20,0.96)', bgSolid: '#101014',
      surface: 'rgba(255,255,255,0.035)', surfaceHover: 'rgba(255,255,255,0.055)', surfaceActive: 'rgba(129,140,248,0.14)',
      border: 'rgba(255,255,255,0.055)', borderFocus: 'rgba(129,140,248,0.5)',
      text: '#e4e4e7', textSecondary: '#71717a', textMuted: '#52525b',
      accent: '#818cf8', accentBg: 'rgba(129,140,248,0.11)',
      danger: '#f87171', dangerBg: 'rgba(239,68,68,0.09)',
      success: '#34d399',
      shadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      inputBg: 'rgba(255,255,255,0.025)', scrollThumb: 'rgba(255,255,255,0.05)',
      caret: '#818cf8', kbdBg: 'rgba(255,255,255,0.06)', kbdText: '#a1a1aa',
      badgeBg: 'rgba(129,140,248,0.11)', badgeText: '#a5b4fc',
      aiUser: '#818cf8', aiBot: '#c084fc', blur: '60px',
    },
    dark: {
      name: 'Carbon', icon: 'monitor',
      overlay: 'rgba(0,0,0,0.45)',
      bg: 'rgba(24,24,27,0.95)', bgSolid: '#18181b',
      surface: 'rgba(255,255,255,0.04)', surfaceHover: 'rgba(255,255,255,0.065)', surfaceActive: 'rgba(59,130,246,0.14)',
      border: 'rgba(255,255,255,0.06)', borderFocus: 'rgba(59,130,246,0.5)',
      text: '#f0f0f2', textSecondary: '#71717a', textMuted: '#52525b',
      accent: '#60a5fa', accentBg: 'rgba(59,130,246,0.11)',
      danger: '#f87171', dangerBg: 'rgba(239,68,68,0.09)',
      success: '#34d399',
      shadow: '0 25px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
      inputBg: 'rgba(255,255,255,0.03)', scrollThumb: 'rgba(255,255,255,0.06)',
      caret: '#60a5fa', kbdBg: 'rgba(255,255,255,0.07)', kbdText: '#a1a1aa',
      badgeBg: 'rgba(59,130,246,0.11)', badgeText: '#93c5fd',
      aiUser: '#60a5fa', aiBot: '#c084fc', blur: '50px',
    },
    light: {
      name: 'Light', icon: 'sun',
      overlay: 'rgba(0,0,0,0.15)',
      bg: 'rgba(255,255,255,0.96)', bgSolid: '#ffffff',
      surface: 'rgba(0,0,0,0.025)', surfaceHover: 'rgba(0,0,0,0.045)', surfaceActive: 'rgba(59,130,246,0.08)',
      border: 'rgba(0,0,0,0.07)', borderFocus: 'rgba(59,130,246,0.45)',
      text: '#18181b', textSecondary: '#71717a', textMuted: '#a1a1aa',
      accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.07)',
      danger: '#ef4444', dangerBg: 'rgba(239,68,68,0.07)',
      success: '#10b981',
      shadow: '0 25px 80px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)',
      inputBg: 'rgba(0,0,0,0.015)', scrollThumb: 'rgba(0,0,0,0.07)',
      caret: '#3b82f6', kbdBg: 'rgba(0,0,0,0.055)', kbdText: '#71717a',
      badgeBg: 'rgba(59,130,246,0.07)', badgeText: '#2563eb',
      aiUser: '#3b82f6', aiBot: '#8b5cf6', blur: '50px',
    },
    nord: {
      name: 'Nord', icon: 'palette',
      overlay: 'rgba(0,0,10,0.45)',
      bg: 'rgba(46,52,64,0.96)', bgSolid: '#2e3440',
      surface: 'rgba(255,255,255,0.035)', surfaceHover: 'rgba(255,255,255,0.06)', surfaceActive: 'rgba(136,192,208,0.14)',
      border: 'rgba(255,255,255,0.05)', borderFocus: 'rgba(136,192,208,0.5)',
      text: '#eceff4', textSecondary: '#81a1c1', textMuted: '#616e88',
      accent: '#88c0d0', accentBg: 'rgba(136,192,208,0.11)',
      danger: '#bf616a', dangerBg: 'rgba(191,97,106,0.10)',
      success: '#a3be8c',
      shadow: '0 25px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.035)',
      inputBg: 'rgba(255,255,255,0.025)', scrollThumb: 'rgba(255,255,255,0.05)',
      caret: '#88c0d0', kbdBg: 'rgba(255,255,255,0.06)', kbdText: '#81a1c1',
      badgeBg: 'rgba(136,192,208,0.12)', badgeText: '#8fbcbb',
      aiUser: '#88c0d0', aiBot: '#b48ead', blur: '50px',
    },
    rosepine: {
      name: 'Rosé Pine', icon: 'palette',
      overlay: 'rgba(0,0,0,0.48)',
      bg: 'rgba(25,23,36,0.96)', bgSolid: '#191724',
      surface: 'rgba(255,255,255,0.04)', surfaceHover: 'rgba(255,255,255,0.06)', surfaceActive: 'rgba(196,167,231,0.14)',
      border: 'rgba(255,255,255,0.055)', borderFocus: 'rgba(196,167,231,0.5)',
      text: '#e0def4', textSecondary: '#908caa', textMuted: '#6e6a86',
      accent: '#c4a7e7', accentBg: 'rgba(196,167,231,0.11)',
      danger: '#eb6f92', dangerBg: 'rgba(235,111,146,0.10)',
      success: '#9ccfd8',
      shadow: '0 25px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
      inputBg: 'rgba(255,255,255,0.025)', scrollThumb: 'rgba(255,255,255,0.05)',
      caret: '#c4a7e7', kbdBg: 'rgba(255,255,255,0.06)', kbdText: '#908caa',
      badgeBg: 'rgba(196,167,231,0.12)', badgeText: '#c4a7e7',
      aiUser: '#c4a7e7', aiBot: '#f6c177', blur: '55px',
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   *  DEFAULT CONFIG
   * ════════════════════════════════════════════════════════════════════════════ */
  const DEFAULT_CONFIG = {
    shortcuts: {
    },
    aiProvider: 'pollinations',
    aiModel: 'openai',
    customApiKey: '',
    theme: 'midnight',
    maxHistory: 500,
  };

  /* ════════════════════════════════════════════════════════════════════════════
   *  STORAGE  (GM_setValue + localStorage fallback — auto-loads on start)
   * ════════════════════════════════════════════════════════════════════════════ */
  function _gmGet(k, d) { try { if (typeof GM_getValue === 'function') return GM_getValue(k, d); } catch(_){} return d; }
  function _gmSet(k, v) { try { if (typeof GM_setValue === 'function') GM_setValue(k, v); } catch(_){} }
  function _lsGet(k) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch(_){ return null; } }
  function _lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(_){} }

  function getConfig() {
    try {
      var stored = _gmGet('sl_config', null) || _lsGet('sl_config');
      if (!stored) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      return { ...DEFAULT_CONFIG, ...stored, shortcuts: { ...DEFAULT_CONFIG.shortcuts, ...(stored.shortcuts || {}) } };
    } catch (_) { return JSON.parse(JSON.stringify(DEFAULT_CONFIG)); }
  }
  function saveConfig(c) { _gmSet('sl_config', c); _lsSet('sl_config', c); }
  function getHistory() { return _gmGet('sl_history', null) || _lsGet('sl_history') || []; }
  function saveHistory(list) { _gmSet('sl_history', list); _lsSet('sl_history', list); }

  // AI Sessions
  function getSessions() { return _gmGet('sl_ai_sessions', null) || _lsGet('sl_ai_sessions') || []; }
  function saveSessions(s) { _gmSet('sl_ai_sessions', s); _lsSet('sl_ai_sessions', s); }
  function getActiveSessionId() { return _gmGet('sl_ai_active', null) || _lsGet('sl_ai_active') || null; }
  function saveActiveSessionId(id) { _gmSet('sl_ai_active', id); _lsSet('sl_ai_active', id); }

  function trackCurrentPage() {
    try {
      var url = location.href, title = document.title || '', domain = location.hostname;
      if (!title || !domain) return;
      if (/^(about|chrome|edge|moz-extension|chrome-extension):/.test(url)) return;
      var hist = getHistory();
      var idx = hist.findIndex(function (e) { return e.url === url; });
      if (idx >= 0) {
        hist[idx].visits = (hist[idx].visits || 1) + 1;
        hist[idx].lastVisit = Date.now();
        hist[idx].title = title || hist[idx].title;
      } else {
        hist.unshift({ url: url, title: title, domain: domain, visits: 1, lastVisit: Date.now() });
      }
      var max = getConfig().maxHistory || 500;
      if (hist.length > max) hist.length = max;
      saveHistory(hist);
    } catch (_) {}
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  NETWORK
   * ════════════════════════════════════════════════════════════════════════════ */
  function gmFetch(url, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        url: url, method: opts.method || 'GET',
        headers: opts.headers || {}, data: opts.body || undefined,
        timeout: opts.timeout || 60000,
        onload: function (r) { resolve(r); },
        onerror: function () { reject(new Error('Network error — check your connection.')); },
        ontimeout: function () { reject(new Error('Request timed out.')); },
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  AI PROVIDERS  (Pollinations = free, no key needed)
   * ════════════════════════════════════════════════════════════════════════════ */
  const AI_PROVIDERS = {
    pollinations: {
      name: 'Pollinations AI  ·  Free, no key',
      models: [
        { id: 'openai',            name: 'GPT-4o Mini' },
        { id: 'openai-large',      name: 'GPT-4o' },
        { id: 'mistral',           name: 'Mistral Small' },
        { id: 'mistral-large',     name: 'Mistral Large' },
        { id: 'deepseek',          name: 'DeepSeek V3' },
        { id: 'deepseek-r1',       name: 'DeepSeek R1' },
        { id: 'qwen-coder',        name: 'Qwen 2.5 Coder' },
        { id: 'llama',             name: 'Llama 3.3 70B' },
        { id: 'claude-hybridspace', name: 'Claude Sonnet' },
      ],
    },
    groq: {
      name: 'Groq  ·  API key required',
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 8B (fast)' },
        { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8x7B' },
        { id: 'gemma2-9b-it',            name: 'Gemma 2 9B' },
      ],
    },
    openrouter: {
      name: 'OpenRouter  ·  API key required  (many free models)',
      models: [
        { id: 'google/gemini-2.0-flash-exp:free',          name: 'Gemini 2.0 Flash (Free)' },
        { id: 'meta-llama/llama-3.3-70b-instruct:free',    name: 'Llama 3.3 70B (Free)' },
        { id: 'deepseek/deepseek-chat:free',                name: 'DeepSeek V3 (Free)' },
        { id: 'qwen/qwen-2.5-72b-instruct:free',           name: 'Qwen 2.5 72B (Free)' },
      ],
    },
  };

  async function queryAI(messages, config) {
    var provider = config.aiProvider || 'pollinations';
    var model = config.aiModel || 'openai';
    var apiKey = (config.customApiKey || '').trim();

    if (provider === 'pollinations') {
      return await queryPollinations(messages, model);
    } else if (provider === 'groq') {
      if (!apiKey) throw new Error('Groq requires an API key. Add it in /settings → AI Provider.');
      return await queryOpenAICompat('https://api.groq.com/openai/v1/chat/completions', apiKey, messages, model);
    } else if (provider === 'openrouter') {
      if (!apiKey) throw new Error('OpenRouter requires an API key. Add it in /settings → AI Provider.');
      return await queryOpenAICompat('https://openrouter.ai/api/v1/chat/completions', apiKey, messages, model);
    }
    throw new Error('Unknown AI provider.');
  }

  async function queryPollinations(messages, model) {
    var resp = await gmFetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, model: model || 'openai', stream: false }),
      timeout: 120000,
    });
    var text = (resp.responseText || '').trim();
    if (!text) throw new Error('Empty AI response. Try a different model in /settings.');

    // Pollinations can return raw text OR various JSON formats
    try {
      var parsed = JSON.parse(text);

      // OpenAI-style: { choices: [{ message: { content, reasoning_content } }] }
      if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
        var msg = parsed.choices[0].message;
        return stripPollinationsAd(msg.content || msg.reasoning_content || '');
      }

      // Flat message object: { role: "assistant", content: "...", reasoning_content: "..." }
      if (parsed.role === 'assistant') {
        return stripPollinationsAd(parsed.content || parsed.reasoning_content || '');
      }

      // Plain string wrapped in JSON
      if (typeof parsed === 'string') return stripPollinationsAd(parsed);

      // Object with just content/reasoning_content at top level
      if (parsed.content) return stripPollinationsAd(parsed.content);
      if (parsed.reasoning_content) return stripPollinationsAd(parsed.reasoning_content);
    } catch (_) {}

    // If it looks like raw JSON that we failed to extract content from, warn
    if (text[0] === '{' || text[0] === '[') {
      try {
        var fallback = JSON.parse(text);
        // Last resort: stringify readable parts
        if (fallback.content) return fallback.content;
        if (fallback.reasoning_content) return fallback.reasoning_content;
      } catch (_) {}
    }
    return text;
  }

  /** Strip Pollinations ad / support banners from response text */
  function stripPollinationsAd(text) {
    if (!text) return text;
    // Remove lines containing the ad patterns
    return text
      .replace(/---\s*\n\s*\*{0,2}\s*Support Pollinations\.AI[\s\S]*?---/gi, '')
      .replace(/\n?\s*🌸\s*\*{0,2}\s*Ad\s*\*{0,2}\s*🌸[\s\S]*$/gi, '')
      .replace(/\n?\s*Powered by Pollinations\.AI[^\n]*/gi, '')
      .replace(/\n?\s*\[Support our mission\][^\n]*/gi, '')
      .replace(/\n?\s*\*{0,2}Support Pollinations\.AI\*{0,2}[^\n]*/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async function queryOpenAICompat(url, apiKey, messages, model) {
    var resp = await gmFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: model, messages: messages, stream: false }),
      timeout: 120000,
    });
    var body;
    try { body = JSON.parse(resp.responseText); } catch (_) { throw new Error('Invalid response from API.'); }
    if (body.error) throw new Error(body.error.message || 'API error.');
    if (body.choices && body.choices[0]) return stripPollinationsAd(body.choices[0].message.content);
    throw new Error('Unexpected API response.');
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  SEARCH UTILITIES
   * ════════════════════════════════════════════════════════════════════════════ */
  function fuzzyMatch(query, text) {
    if (!query || !text) return { match: false, score: 0 };
    var q = query.toLowerCase(), t = text.toLowerCase();
    var si2 = t.indexOf(q);
    if (si2 !== -1) return { match: true, score: 100 + (si2 === 0 ? 50 : 0) + (q.length / t.length) * 50 };
    var words = t.split(/[\s\-_.\/]+/), qw = q.split(/[\s\-_.\/]+/), wp = 0;
    for (var a = 0; a < qw.length; a++) for (var b = 0; b < words.length; b++) { if (words[b].indexOf(qw[a]) === 0) { wp += 40; break; } }
    if (wp > 0) return { match: true, score: wp };
    var qi = 0, sc = 0, co = 0;
    for (var ti = 0; ti < t.length && qi < q.length; ti++) { if (t[ti] === q[qi]) { sc += 1 + co; co++; qi++; } else co = 0; }
    return qi === q.length ? { match: true, score: sc } : { match: false, score: 0 };
  }

  function getFrecency(e) { return (e.visits || 1) * (100 / (Math.max(0, (Date.now() - (e.lastVisit || 0)) / 86400000) + 1)); }

  function evalMath(expr) {
    try {
      var s = expr.trim().replace(/^=\s*/, '');
      if (!s || !/^[\d+\-*\/().%^ \t]+$/.test(s)) return null;
      s = s.replace(/\^/g, '**');
      var r = new Function('return (' + s + ')')();
      return typeof r === 'number' && isFinite(r) ? r : null;
    } catch (_) { return null; }
  }

  function isURLLike(str) {
    return /^(https?:\/\/|www\.)/i.test(str) || /^[\w][\w-]*\.(com|org|net|io|dev|co|app|me|ai|edu|gov)\b/i.test(str);
  }

  function buildResults(query, config, history) {
    var q = (query || '').trim(), results = [];
    if (!q) {
      var recent = history.slice().sort(function (a, b) { return (b.lastVisit || 0) - (a.lastVisit || 0); }).slice(0, 7);
      if (recent.length) results.push({ category: 'Recent', icon: 'clock', items: recent.map(function (e) {
        return { type: 'site', title: e.title, subtitle: e.domain, url: e.url, domain: e.domain };
      }) });
      return results;
    }
    var ql = q.toLowerCase();

    // Shortcuts
    var sc = config.shortcuts || {}, ms2 = [];
    Object.keys(sc).forEach(function (k) {
      var v = sc[k], fm = fuzzyMatch(ql, k + ' ' + (v.title || ''));
      if (fm.match || k.indexOf(ql) === 0) ms2.push({ type: 'shortcut', title: v.title || k, subtitle: v.url, url: v.url, customIcon: v.icon, score: k.indexOf(ql) === 0 ? 200 : fm.score, badge: k });
    });
    ms2.sort(function (a, b) { return b.score - a.score; });
    if (ms2.length) results.push({ category: 'Shortcuts', icon: 'zap', items: ms2.slice(0, 5) });

    // Visited
    var mv = [];
    history.forEach(function (e) {
      var ts = fuzzyMatch(ql, e.title || ''), us = fuzzyMatch(ql, e.url || ''), ds = fuzzyMatch(ql, e.domain || '');
      var best = Math.max(ts.score, us.score * 0.8, ds.score * 0.9);
      if (ts.match || us.match || ds.match) mv.push({ type: 'site', title: e.title, subtitle: e.domain, url: e.url, domain: e.domain, score: best + getFrecency(e) * 0.1 });
    });
    mv.sort(function (a, b) { return b.score - a.score; });
    if (mv.length) results.push({ category: 'Visited Sites', icon: 'globe', items: mv.slice(0, 6) });

    // Actions
    var actions = [];
    var mathVal = evalMath(q);
    if (mathVal !== null) actions.push({ type: 'calc', title: '= ' + mathVal, subtitle: 'Copy to clipboard', iconName: 'calculator', value: String(mathVal) });
    if (isURLLike(q)) {
      var nav = q.match(/^https?:\/\//i) ? q : 'https://' + q;
      actions.push({ type: 'navigate', title: 'Go to ' + q, subtitle: nav, url: nav, iconName: 'externalLink' });
    }
    actions.push({ type: 'search', title: 'Search Google for "' + q + '"', subtitle: 'google.com', url: 'https://www.google.com/search?q=' + encodeURIComponent(q), iconName: 'search' });
    actions.push({ type: 'ai', title: 'Ask AI: ' + q, subtitle: 'Open AI chat', iconName: 'sparkles', aiQuery: q });
    results.push({ category: 'Actions', icon: 'command', items: actions });
    return results;
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  DYNAMIC CSS BUILDER
   * ════════════════════════════════════════════════════════════════════════════ */
  function buildCSS(t) { return `
.sl-overlay{all:initial;position:fixed;top:0;left:0;width:100vw;height:100vh;background:${t.overlay};z-index:2147483647;display:flex;justify-content:center;align-items:flex-start;padding-top:12vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;animation:sl-ov-in .2s ease-out}
.sl-overlay.sl-closing{animation:sl-ov-out .15s ease-in forwards}
.sl-overlay *{box-sizing:border-box;margin:0;padding:0}

.sl-box{width:620px;max-width:92vw;max-height:68vh;background:${t.bg};backdrop-filter:blur(${t.blur}) saturate(180%);-webkit-backdrop-filter:blur(${t.blur}) saturate(180%);border-radius:16px;box-shadow:${t.shadow};overflow:hidden;display:flex;flex-direction:column;animation:sl-box-in .22s cubic-bezier(.16,1,.3,1)}
.sl-box.sl-box-ai{width:820px;height:72vh;max-height:72vh}
.sl-closing .sl-box{animation:sl-box-out .15s ease-in forwards}

.sl-bar{display:flex;align-items:center;padding:13px 16px;gap:10px}
.sl-bar-input{flex:1;border:none;background:transparent;color:${t.text};font-size:17px;font-weight:400;font-family:inherit;outline:none;caret-color:${t.caret}}
.sl-bar-input::placeholder{color:${t.textMuted};font-weight:300}

.sl-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:${t.accentBg};color:${t.accent};border-radius:20px;font-size:10px;font-weight:700;flex-shrink:0;letter-spacing:.5px;text-transform:uppercase}

.sl-hr{height:1px;background:${t.border};flex-shrink:0}

.sl-list{overflow-y:auto;flex:1;padding:4px 0}
.sl-cat{padding:9px 16px 3px;font-size:10px;font-weight:700;color:${t.textMuted};text-transform:uppercase;letter-spacing:.8px;display:flex;align-items:center;gap:5px}
.sl-row{display:flex;align-items:center;padding:7px 10px;gap:11px;cursor:pointer;border-radius:10px;margin:1px 6px;transition:background .08s ease,transform .08s ease}
.sl-row:hover{background:${t.surfaceHover}}
.sl-row.sl-on{background:${t.surfaceActive}}
.sl-row.sl-on .sl-row-ic{color:${t.accent};background:${t.accentBg}}

.sl-row-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;background:${t.surface};color:${t.textSecondary};transition:all .1s ease}
.sl-row-ic img{width:15px;height:15px;border-radius:2px}
.sl-row-tx{flex:1;min-width:0}
.sl-row-t{color:${t.text};font-size:13px;font-weight:450;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-row-s{color:${t.textMuted};font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.sl-badge{font-size:10px;color:${t.badgeText};padding:2px 8px;background:${t.badgeBg};border-radius:20px;flex-shrink:0;font-weight:600;letter-spacing:.3px}

.sl-foot{display:flex;align-items:center;justify-content:space-between;padding:7px 16px;flex-shrink:0;border-top:1px solid ${t.border};font-size:10px;color:${t.textMuted}}
.sl-foot-h{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.sl-foot-i{display:inline-flex;align-items:center;gap:3px}
.sl-kbd{display:inline-block;background:${t.kbdBg};color:${t.kbdText};padding:1px 5px;border-radius:4px;font-size:9px;font-family:'SF Mono',Consolas,'Courier New',monospace;line-height:1.7}

.sl-empty{padding:40px 16px;text-align:center;color:${t.textMuted};font-size:13px;line-height:1.6}
.sl-empty svg{margin:0 auto 8px;display:block;opacity:.35}

/* AI Chat */
.sl-ai-wrap{display:flex;flex:1;min-height:0}
.sl-ai-side{width:170px;flex-shrink:0;border-right:1px solid ${t.border};display:flex;flex-direction:column;overflow:hidden}
.sl-ai-side-h{padding:8px 10px 5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${t.textMuted};display:flex;align-items:center;justify-content:space-between}
.sl-ai-side-new{background:none;border:none;color:${t.accent};cursor:pointer;padding:2px;display:flex;align-items:center;border-radius:5px;transition:background .1s}
.sl-ai-side-new:hover{background:${t.surface}}
.sl-ai-sl{flex:1;overflow-y:auto;padding:2px 4px}
.sl-ai-si{display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:11px;color:${t.textSecondary};transition:all .1s;margin-bottom:1px;overflow:hidden}
.sl-ai-si:hover{background:${t.surfaceHover};color:${t.text}}
.sl-ai-si.sl-ai-si-on{background:${t.surfaceActive};color:${t.text};font-weight:500}
.sl-ai-si-t{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sl-ai-si-d{background:none;border:none;color:${t.textMuted};cursor:pointer;padding:2px;display:flex;opacity:0;transition:opacity .1s}
.sl-ai-si:hover .sl-ai-si-d{opacity:1}
.sl-ai-si-d:hover{color:${t.danger}}

.sl-ai-main{flex:1;display:flex;flex-direction:column;min-width:0}
.sl-ai-w{flex:1;overflow-y:auto;padding:14px 16px}
.sl-ai-hi{text-align:center;padding:28px 0;color:${t.textMuted};font-size:13px}
.sl-ai-hi-ic{margin:0 auto 8px;display:flex;justify-content:center;color:${t.accent};opacity:.7}
.sl-ai-msg{margin-bottom:14px;animation:sl-msg-in .2s ease-out}
.sl-ai-rl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;display:flex;align-items:center;gap:4px}
.sl-ai-rl-u{color:${t.aiUser}}
.sl-ai-rl-a{color:${t.aiBot}}
.sl-ai-tx{color:${t.text};font-size:13px;line-height:1.75;word-break:break-word;opacity:.9}
.sl-ai-tx p{margin:0 0 8px}
.sl-ai-tx p:last-child{margin-bottom:0}
.sl-ai-tx code{background:${t.surface};padding:1px 5px;border-radius:4px;font-size:12px;font-family:'SF Mono',Consolas,'Courier New',monospace}
.sl-ai-tx pre{background:${t.surface};border-radius:8px;padding:10px 12px;margin:6px 0;overflow-x:auto;font-size:12px;line-height:1.5}
.sl-ai-tx pre code{background:none;padding:0;font-size:12px}
.sl-ai-tx strong{font-weight:700}
.sl-ai-tx em{font-style:italic}
.sl-ai-tx ul,.sl-ai-tx ol{margin:4px 0 8px 18px;padding:0}
.sl-ai-tx li{margin:2px 0}
.sl-ai-tx blockquote{border-left:3px solid ${t.accent};padding:2px 10px;margin:6px 0;color:${t.textSecondary};font-style:italic}
.sl-ai-tx h1,.sl-ai-tx h2,.sl-ai-tx h3{margin:10px 0 4px;font-weight:700;line-height:1.3}
.sl-ai-tx h1{font-size:16px}.sl-ai-tx h2{font-size:14px}.sl-ai-tx h3{font-size:13px}
.sl-ai-tx a{color:${t.accent};text-decoration:underline}
.sl-ai-tx hr{border:none;border-top:1px solid ${t.border};margin:8px 0}
.sl-ai-er{color:${t.danger};font-size:12px;padding:4px 0}
.sl-ai-ld{display:flex;gap:4px;padding:6px 0}
.sl-ai-dt{width:5px;height:5px;background:${t.accent};border-radius:50%;animation:sl-pulse 1.4s infinite both}
.sl-ai-dt:nth-child(2){animation-delay:.16s}.sl-ai-dt:nth-child(3){animation-delay:.32s}

.sl-ai-br{display:flex;gap:8px;padding:10px 16px;border-top:1px solid ${t.border};flex-shrink:0}
.sl-ai-in{flex:1;border:1px solid ${t.border};background:${t.inputBg};border-radius:10px;color:${t.text};padding:8px 12px;font-size:13px;font-family:inherit;outline:none;transition:border-color .15s}
.sl-ai-in:focus{border-color:${t.borderFocus}}
.sl-ai-in::placeholder{color:${t.textMuted}}
.sl-ai-go{padding:0 14px;background:${t.accent};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .12s;display:flex;align-items:center;gap:4px}
.sl-ai-go:hover{opacity:.85}
.sl-ai-go:disabled{opacity:.3;cursor:default}

/* Settings */
.sl-set{flex:1;overflow-y:auto;padding:16px}
.sl-set-t{color:${t.text};font-size:15px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:7px}
.sl-set-s{margin-bottom:18px}
.sl-set-l{color:${t.textSecondary};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-bottom:7px}
.sl-sr{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid ${t.border}}
.sl-sr-k{color:${t.accent};font-weight:700;min-width:72px;font-size:12px}
.sl-sr-n{color:${t.text};font-size:12px;min-width:90px;opacity:.8}
.sl-sr-u{color:${t.textMuted};font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sl-sr-d{background:${t.dangerBg};color:${t.danger};border:none;padding:3px 7px;border-radius:5px;cursor:pointer;font-size:10px;font-family:inherit;font-weight:600;display:flex;align-items:center;gap:2px;transition:opacity .1s}
.sl-sr-d:hover{opacity:.7}
.sl-sadd{display:grid;grid-template-columns:1fr 1fr 2fr auto;gap:5px;margin-top:8px}
.sl-sinp{background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;color:${t.text};padding:7px 9px;font-size:12px;font-family:inherit;outline:none;transition:border-color .12s}
.sl-sinp:focus{border-color:${t.borderFocus}}
.sl-sinp::placeholder{color:${t.textMuted}}
.sl-ssel{background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;color:${t.text};padding:7px 9px;font-size:12px;font-family:inherit;outline:none;cursor:pointer;appearance:auto}
.sl-ssel option{background:${t.bgSolid};color:${t.text}}

.sl-btn{padding:6px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .1s;display:inline-flex;align-items:center;gap:4px}
.sl-btn:hover{opacity:.8}
.sl-bp{background:${t.accent};color:#fff}
.sl-bg{background:${t.surface};color:${t.text}}
.sl-bd{background:${t.dangerBg};color:${t.danger}}
.sl-sact{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}
.sl-sexp{margin-top:8px;width:100%;background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;color:${t.textSecondary};padding:7px;font-size:11px;font-family:'SF Mono',Consolas,monospace;resize:vertical;min-height:50px;outline:none}
.sl-sexp:focus{border-color:${t.borderFocus}}

.sl-themes{display:flex;gap:5px;flex-wrap:wrap}
.sl-tp{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid ${t.border};background:${t.surface};color:${t.textSecondary};display:inline-flex;align-items:center;gap:4px;transition:all .12s}
.sl-tp:hover{border-color:${t.textMuted};color:${t.text}}
.sl-tp.sl-tp-on{border-color:${t.accent};background:${t.accentBg};color:${t.accent}}

.sl-autosaved{display:inline-flex;align-items:center;gap:3px;color:${t.success};font-size:11px;font-weight:600;animation:sl-msg-in .2s ease-out}

.sl-back{display:flex;align-items:center;gap:7px;padding:13px 16px;cursor:pointer;color:${t.textSecondary};font-size:13px;font-weight:400;transition:color .1s}
.sl-back:hover{color:${t.text}}

/* Scrollbar */
.sl-list::-webkit-scrollbar,.sl-ai-w::-webkit-scrollbar,.sl-set::-webkit-scrollbar{width:4px}
.sl-list::-webkit-scrollbar-track,.sl-ai-w::-webkit-scrollbar-track,.sl-set::-webkit-scrollbar-track{background:transparent}
.sl-list::-webkit-scrollbar-thumb,.sl-ai-w::-webkit-scrollbar-thumb,.sl-set::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:2px}

/* Animations */
@keyframes sl-ov-in{from{opacity:0}to{opacity:1}}
@keyframes sl-ov-out{from{opacity:1}to{opacity:0}}
@keyframes sl-box-in{from{opacity:0;transform:scale(.95) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes sl-box-out{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(.95) translateY(-8px)}}
@keyframes sl-msg-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes sl-pulse{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}
@keyframes sl-item-in{from{opacity:0;transform:translateX(-3px)}to{opacity:1;transform:translateX(0)}}
.sl-row{animation:sl-item-in .15s ease-out backwards}
`; }

  var styleEl = null;
  function applyThemeCSS(id) {
    var t = THEMES[id] || THEMES.midnight;
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'sl-css'; (document.head || document.documentElement).appendChild(styleEl); }
    styleEl.textContent = buildCSS(t);
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  COMPONENTS
   * ════════════════════════════════════════════════════════════════════════════ */

  function ResultItem(p) {
    var item = p.item, on = p.active;
    var ic;
    if (item.customIcon) ic = h('span', { style: { fontSize: '15px' } }, item.customIcon);
    else if (item.iconName) ic = h(LucideIcon, { name: item.iconName, size: 15 });
    else if (item.domain) ic = h('img', { src: 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(item.domain) + '&sz=32', alt: '', loading: 'lazy', onError: function (e) { e.target.style.display = 'none'; } });
    else ic = h(LucideIcon, { name: 'globe', size: 15 });

    return h('div', {
      className: 'sl-row' + (on ? ' sl-on' : ''),
      style: { animationDelay: (p.index || 0) * 0.018 + 's' },
      onClick: function () { p.onActivate(item); }, onMouseEnter: p.onHover,
    },
      h('div', { className: 'sl-row-ic' }, ic),
      h('div', { className: 'sl-row-tx' },
        h('div', { className: 'sl-row-t' }, item.title || 'Untitled'),
        item.subtitle ? h('div', { className: 'sl-row-s' }, item.subtitle) : null
      ),
      item.badge ? h('span', { className: 'sl-badge' }, item.badge) : null
    );
  }

  function ResultsList(p) {
    if (!p.results.length) return h('div', { className: 'sl-empty' },
      h(LucideIcon, { name: 'search', size: 26 }),
      'Type to search, or ', h('b', null, '>ai'), ' to chat with AI'
    );
    var fi = 0, els = [];
    p.results.forEach(function (c, ci) {
      els.push(h('div', { className: 'sl-cat', key: 'c' + ci }, c.icon ? h(LucideIcon, { name: c.icon, size: 11 }) : null, c.category));
      c.items.forEach(function (item, ii) {
        var cur = fi;
        els.push(h(ResultItem, { key: 'r' + ci + ii, item: item, active: cur === p.selectedIndex, index: cur, onActivate: p.onActivate, onHover: function () { p.onHover(cur); } }));
        fi++;
      });
    });
    return h('div', { className: 'sl-list' }, els);
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  LIGHTWEIGHT MARKDOWN → React elements
   * ════════════════════════════════════════════════════════════════════════════ */
  function renderMarkdown(text) {
    if (!text) return null;
    var lines = text.split('\n'), blocks = [], i = 0;
    while (i < lines.length) {
      var l = lines[i];
      // Code block
      if (/^```/.test(l)) {
        var lang = l.replace(/^```+/, '').trim(), code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++; // skip closing ```
        blocks.push({ type: 'code', lang: lang, text: code.join('\n') });
        continue;
      }
      // Heading
      var hm = l.match(/^(#{1,3})\s+(.+)/);
      if (hm) { blocks.push({ type: 'h', level: hm[1].length, text: hm[2] }); i++; continue; }
      // Blockquote
      if (/^>\s?/.test(l)) {
        var bq = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { bq.push(lines[i].replace(/^>\s?/, '')); i++; }
        blocks.push({ type: 'bq', text: bq.join('\n') }); continue;
      }
      // Unordered list
      if (/^\s*[-*+]\s/.test(l)) {
        var items = [];
        while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s/, '')); i++; }
        blocks.push({ type: 'ul', items: items }); continue;
      }
      // Ordered list
      if (/^\s*\d+[.)\s]/.test(l)) {
        var oitems = [];
        while (i < lines.length && /^\s*\d+[.)\s]/.test(lines[i])) { oitems.push(lines[i].replace(/^\s*\d+[.)\s]+/, '')); i++; }
        blocks.push({ type: 'ol', items: oitems }); continue;
      }
      // HR
      if (/^---+$/.test(l.trim())) { blocks.push({ type: 'hr' }); i++; continue; }
      // Empty line
      if (!l.trim()) { i++; continue; }
      // Paragraph (collect consecutive lines)
      var para = [l]; i++;
      while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i]) && !/^#{1,3}\s/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^\s*[-*+]\s/.test(lines[i]) && !/^\s*\d+[.)\s]/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
        para.push(lines[i]); i++;
      }
      blocks.push({ type: 'p', text: para.join('\n') });
    }
    // Inline formatting
    function inl(s) {
      if (!s) return s;
      var parts = [], re = /(\*\*\*|___)(.+?)\1|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5|(`+)(.+?)\7|\[([^\]]+)\]\(([^)]+)\)/g, last = 0, m2;
      while ((m2 = re.exec(s)) !== null) {
        if (m2.index > last) parts.push(s.slice(last, m2.index));
        if (m2[2]) parts.push(h('strong', { key: 'b'+m2.index }, h('em', null, m2[2])));
        else if (m2[4]) parts.push(h('strong', { key: 'b'+m2.index }, m2[4]));
        else if (m2[6]) parts.push(h('em', { key: 'i'+m2.index }, m2[6]));
        else if (m2[8]) parts.push(h('code', { key: 'c'+m2.index }, m2[8]));
        else if (m2[9]) parts.push(h('a', { key: 'a'+m2.index, href: m2[10], target: '_blank', rel: 'noopener' }, m2[9]));
        last = m2.index + m2[0].length;
      }
      if (last < s.length) parts.push(s.slice(last));
      return parts.length ? parts : s;
    }
    return blocks.map(function (b, idx) {
      if (b.type === 'code') return h('pre', { key: idx }, h('code', null, b.text));
      if (b.type === 'h') return h('h' + b.level, { key: idx }, inl(b.text));
      if (b.type === 'bq') return h('blockquote', { key: idx }, inl(b.text));
      if (b.type === 'ul') return h('ul', { key: idx }, b.items.map(function (it, j) { return h('li', { key: j }, inl(it)); }));
      if (b.type === 'ol') return h('ol', { key: idx }, b.items.map(function (it, j) { return h('li', { key: j }, inl(it)); }));
      if (b.type === 'hr') return h('hr', { key: idx });
      return h('p', { key: idx }, inl(b.text));
    });
  }

  function AIChat(p) {
    var sessions = p.sessions, activeId = p.activeSessionId;
    var activeSession = sessions.find(function(s){ return s.id === activeId; });
    var msgs = activeSession ? activeSession.messages : [];
    var ld = p.loading;
    var ir = useRef(null), sr = useRef(null);
    var _s = useState(''), v = _s[0], sv = _s[1];
    useEffect(function () { if (sr.current) sr.current.scrollTop = sr.current.scrollHeight; }, [msgs, ld]);
    useEffect(function () { if (ir.current) ir.current.focus(); }, [activeId]);
    function go() { var x = v.trim(); if (!x || ld) return; sv(''); p.onSend(x); }

    var prov = AI_PROVIDERS[p.provider || 'pollinations'] || AI_PROVIDERS.pollinations;
    var mName = ''; (prov.models || []).forEach(function (m) { if (m.id === p.model) mName = m.name; });

    // Session sidebar
    var sidebar = h('div', { className: 'sl-ai-side' },
      h('div', { className: 'sl-ai-side-h' },
        'Sessions',
        h('button', { className: 'sl-ai-side-new', onClick: p.onNewSession, title: 'New session' },
          h(LucideIcon, { name: 'plus', size: 13 }))
      ),
      h('div', { className: 'sl-ai-sl' },
        sessions.map(function (ses) {
          var title = ses.title || 'New chat';
          return h('div', {
            key: ses.id,
            className: 'sl-ai-si' + (ses.id === activeId ? ' sl-ai-si-on' : ''),
            onClick: function () { p.onSwitchSession(ses.id); },
          },
            h(LucideIcon, { name: 'sparkles', size: 11 }),
            h('span', { className: 'sl-ai-si-t' }, title),
            h('button', {
              className: 'sl-ai-si-d',
              onClick: function (e) { e.stopPropagation(); p.onDeleteSession(ses.id); },
              title: 'Delete',
            }, h(LucideIcon, { name: 'x', size: 11 }))
          );
        })
      )
    );

    // Chat content
    var els = [];
    if (!msgs.length) els.push(h('div', { className: 'sl-ai-hi', key: 'w' },
      h('div', { className: 'sl-ai-hi-ic' }, h(LucideIcon, { name: 'sparkles', size: 26 })),
      h('div', { style: { fontWeight: 500, marginBottom: '3px' } }, 'Ask anything'),
      h('div', { style: { fontSize: '11px', opacity: .5 } }, (mName || p.model) + '  \u00b7  ' + prov.name.split('\u00b7')[0])
    ));

    msgs.forEach(function (m, i) {
      var content;
      if (m.error) content = h('div', { className: 'sl-ai-er' }, m.content);
      else if (m.role === 'assistant') content = h('div', { className: 'sl-ai-tx' }, renderMarkdown(m.content));
      else content = h('div', { className: 'sl-ai-tx' }, m.content);
      els.push(h('div', { className: 'sl-ai-msg', key: 'm' + i },
        h('div', { className: 'sl-ai-rl ' + (m.role === 'user' ? 'sl-ai-rl-u' : 'sl-ai-rl-a') },
          h(LucideIcon, { name: m.role === 'user' ? 'user' : 'sparkles', size: 10 }),
          m.role === 'user' ? 'You' : 'AI'
        ),
        content
      ));
    });
    if (ld) els.push(h('div', { className: 'sl-ai-ld', key: 'ld' }, h('div', { className: 'sl-ai-dt' }), h('div', { className: 'sl-ai-dt' }), h('div', { className: 'sl-ai-dt' })));

    return h('div', { className: 'sl-ai-wrap' },
      sidebar,
      h('div', { className: 'sl-ai-main' },
        h('div', { className: 'sl-ai-w', ref: sr }, els),
        h('div', { className: 'sl-ai-br' },
          h('input', { ref: ir, className: 'sl-ai-in', placeholder: 'Ask a question\u2026', value: v,
            onChange: function (e) { sv(e.target.value); },
            onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } } }),
          h('button', { className: 'sl-ai-go', onClick: go, disabled: ld || !v.trim() },
            h(LucideIcon, { name: 'send', size: 13, color: '#fff' }), 'Send')
        )
      )
    );
  }

  function SettingsPanel(p) {
    var config = p.config;
    var _sc = useState(JSON.parse(JSON.stringify(config.shortcuts || {}))), sc = _sc[0], sSc = _sc[1];
    var _nk = useState(''), nk = _nk[0], snk = _nk[1];
    var _nt = useState(''), nt = _nt[0], snt = _nt[1];
    var _nu = useState(''), nu = _nu[0], snu = _nu[1];
    var _pr = useState(config.aiProvider || 'pollinations'), prov = _pr[0], sPr = _pr[1];
    var _md = useState(config.aiModel || 'openai'), mod = _md[0], sMd = _md[1];
    var _ak = useState(config.customApiKey || ''), ak = _ak[0], sAk = _ak[1];
    var _th = useState(config.theme || 'midnight'), th = _th[0], sTh = _th[1];
    var _ex = useState(''), ex = _ex[0], sEx = _ex[1];
    var _saved = useState(false), saved = _saved[0], sSaved = _saved[1];
    var initRef = useRef(true);

    // ── Auto-save on every change ──
    useEffect(function () {
      if (initRef.current) { initRef.current = false; return; }
      var updated = Object.assign({}, config, { shortcuts: sc, aiProvider: prov, aiModel: mod, customApiKey: ak, theme: th });
      p.onAutoSave(updated);
      sSaved(true);
      var t = setTimeout(function () { sSaved(false); }, 1500);
      return function () { clearTimeout(t); };
    }, [sc, prov, mod, ak, th]);

    function chProv(np) { sPr(np); var f = (AI_PROVIDERS[np] || { models: [] }).models[0]; if (f) sMd(f.id); }
    function addSC() {
      var k = nk.trim().toLowerCase().replace(/\s+/g, '-'), u = nu.trim();
      if (!k || !u) return; if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      var up = Object.assign({}, sc); up[k] = { url: u, title: nt.trim() || k, icon: '⚡' };
      sSc(up); snk(''); snt(''); snu('');
    }
    function remSC(k) { var up = Object.assign({}, sc); delete up[k]; sSc(up); }
    function reset() { sSc(JSON.parse(JSON.stringify(DEFAULT_CONFIG.shortcuts))); sPr(DEFAULT_CONFIG.aiProvider); sMd(DEFAULT_CONFIG.aiModel); sAk(''); sTh(DEFAULT_CONFIG.theme); applyThemeCSS(DEFAULT_CONFIG.theme); }

    var provModels = (AI_PROVIDERS[prov] || { models: [] }).models;
    var rows = Object.keys(sc).map(function (k) { var s = sc[k]; return h('div', { className: 'sl-sr', key: k },
      h('span', { className: 'sl-sr-k' }, k), h('span', { className: 'sl-sr-n' }, s.title || k), h('span', { className: 'sl-sr-u' }, s.url),
      h('button', { className: 'sl-sr-d', onClick: function () { remSC(k); } }, h(LucideIcon, { name: 'x', size: 10 }))
    ); });

    return h('div', { className: 'sl-set' },
      h('div', { className: 'sl-set-t' }, h(LucideIcon, { name: 'settings', size: 16 }), 'Settings'),

      h('div', { className: 'sl-set-s' }, h('div', { className: 'sl-set-l' }, 'Theme'),
        h('div', { className: 'sl-themes' }, Object.keys(THEMES).map(function (tid) {
          return h('div', { key: tid, className: 'sl-tp' + (th === tid ? ' sl-tp-on' : ''), onClick: function () { sTh(tid); applyThemeCSS(tid); } },
            h(LucideIcon, { name: THEMES[tid].icon, size: 11 }), THEMES[tid].name);
        }))
      ),

      h('div', { className: 'sl-set-s' }, h('div', { className: 'sl-set-l' }, 'Shortcuts'),
        rows.length ? rows : h('div', { style: { opacity: .35, fontSize: '12px', padding: '4px 0' } }, 'No shortcuts.'),
        h('div', { className: 'sl-sadd' },
          h('input', { className: 'sl-sinp', placeholder: 'Key', value: nk, onChange: function (e) { snk(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter') addSC(); } }),
          h('input', { className: 'sl-sinp', placeholder: 'Title', value: nt, onChange: function (e) { snt(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter') addSC(); } }),
          h('input', { className: 'sl-sinp', placeholder: 'URL', value: nu, onChange: function (e) { snu(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter') addSC(); } }),
          h('button', { className: 'sl-btn sl-bp', onClick: addSC }, h(LucideIcon, { name: 'plus', size: 11 }), 'Add')
        )
      ),

      h('div', { className: 'sl-set-s' }, h('div', { className: 'sl-set-l' }, 'AI Provider'),
        h('select', { className: 'sl-ssel', value: prov, onChange: function (e) { chProv(e.target.value); }, style: { width: '100%', marginBottom: '6px' } },
          Object.keys(AI_PROVIDERS).map(function (pid) { return h('option', { value: pid, key: pid }, AI_PROVIDERS[pid].name); })
        ),
        h('div', { className: 'sl-set-l', style: { marginTop: '2px' } }, 'Model'),
        h('select', { className: 'sl-ssel', value: mod, onChange: function (e) { sMd(e.target.value); }, style: { width: '100%' } },
          provModels.map(function (m) { return h('option', { value: m.id, key: m.id }, m.name); })
        ),
        prov !== 'pollinations' ? h('div', null,
          h('div', { className: 'sl-set-l', style: { marginTop: '8px' } }, 'API Key'),
          h('input', { className: 'sl-sinp', type: 'password', placeholder: 'sk-...', style: { width: '100%' }, value: ak, onChange: function (e) { sAk(e.target.value); } })
        ) : null
      ),

      h('div', { className: 'sl-set-s' }, h('div', { className: 'sl-set-l' }, 'Import / Export'),
        h('textarea', { className: 'sl-sexp', placeholder: 'Paste JSON or click Export', value: ex, onChange: function (e) { sEx(e.target.value); }, rows: 3 }),
        h('div', { className: 'sl-sact', style: { marginTop: '4px' } },
          h('button', { className: 'sl-btn sl-bg', onClick: function () { sEx(JSON.stringify({ shortcuts: sc, aiProvider: prov, aiModel: mod, theme: th }, null, 2)); } }, h(LucideIcon, { name: 'download', size: 11 }), 'Export'),
          h('button', { className: 'sl-btn sl-bg', onClick: function () {
            try { var im = JSON.parse(ex); if (im.shortcuts) sSc(im.shortcuts); if (im.aiProvider) chProv(im.aiProvider); if (im.aiModel) sMd(im.aiModel);
              if (im.theme) { sTh(im.theme); applyThemeCSS(im.theme); }
            } catch (_) { alert('Invalid JSON'); }
          } }, h(LucideIcon, { name: 'upload', size: 11 }), 'Import')
        )
      ),

      h('div', { className: 'sl-sact', style: { alignItems: 'center' } },
        saved ? h('span', { className: 'sl-autosaved' }, h(LucideIcon, { name: 'check', size: 10 }), ' Saved') : null,
        h('span', { style: { flex: 1 } }),
        h('button', { className: 'sl-btn sl-bd', onClick: reset }, h(LucideIcon, { name: 'trash', size: 11 }), 'Reset Defaults'),
        h('button', { className: 'sl-btn sl-bp', onClick: p.onClose }, 'Done')
      )
    );
  }

  function Footer(p) {
    var hints;
    if (p.mode === 'search') hints = [
      h('span', { className: 'sl-foot-i', key: 1 }, h('span', { className: 'sl-kbd' }, '↑↓'), ' nav'),
      h('span', { className: 'sl-foot-i', key: 2 }, h('span', { className: 'sl-kbd' }, '⏎'), ' open'),
      h('span', { className: 'sl-foot-i', key: 3 }, h('span', { className: 'sl-kbd' }, '>ai'), ' chat'),
      h('span', { className: 'sl-foot-i', key: 4 }, h('span', { className: 'sl-kbd' }, '/settings')),
    ];
    else if (p.mode === 'ai') hints = [
      h('span', { className: 'sl-foot-i', key: 1 }, h('span', { className: 'sl-kbd' }, 'Esc'), ' back'),
      h('span', { className: 'sl-foot-i', key: 2 }, h('span', { className: 'sl-kbd' }, '⏎'), ' send'),
    ];
    else hints = [h('span', { className: 'sl-foot-i', key: 1 }, h('span', { className: 'sl-kbd' }, 'Esc'), ' back')];
    return h('div', { className: 'sl-foot' }, h('div', { className: 'sl-foot-h' }, hints), h('span', null, '@upietrzy'));
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  MAIN APP
   * ════════════════════════════════════════════════════════════════════════════ */
  function App() {
    var _v = useState(false), vis = _v[0], sVis = _v[1];
    var _cl = useState(false), cls = _cl[0], sCls = _cl[1];
    var _q = useState(''), q = _q[0], sQ = _q[1];
    var _m = useState('search'), mode = _m[0], sMode = _m[1];
    var _si = useState(0), si = _si[0], sSi = _si[1];
    var _cfg = useState(getConfig), cfg = _cfg[0], sCfg = _cfg[1];
    var _ail = useState(false), ail = _ail[0], sAil = _ail[1];
    var ir = useRef(null);
    var hist = useMemo(getHistory, [vis]);

    // ── AI Sessions (persisted) ──
    var _sess = useState(function () {
      var loaded = getSessions();
      if (!loaded.length) {
        var s = { id: Date.now().toString(36), title: 'New chat', messages: [], created: Date.now() };
        loaded = [s];
        saveSessions(loaded);
        saveActiveSessionId(s.id);
      }
      return loaded;
    }), sessions = _sess[0], sSessions = _sess[1];

    var _aid = useState(function () {
      var id = getActiveSessionId();
      if (!id || !getSessions().find(function(s){ return s.id === id; })) {
        var ss = getSessions(); id = ss.length ? ss[0].id : null;
      }
      return id;
    }), activeSessionId = _aid[0], sActiveSessionId = _aid[1];

    function persistSessions(next) { sSessions(next); saveSessions(next); }
    function persistActiveId(id) { sActiveSessionId(id); saveActiveSessionId(id); }

    function newSession() {
      var s = { id: Date.now().toString(36), title: 'New chat', messages: [], created: Date.now() };
      var next = [s].concat(sessions);
      persistSessions(next); persistActiveId(s.id);
    }
    function deleteSession(id) {
      var next = sessions.filter(function(s){ return s.id !== id; });
      if (!next.length) { var s = { id: Date.now().toString(36), title: 'New chat', messages: [], created: Date.now() }; next = [s]; }
      persistSessions(next);
      if (activeSessionId === id) persistActiveId(next[0].id);
    }
    function switchSession(id) { persistActiveId(id); }
    function updateSessionMessages(id, msgs) {
      var next = sessions.map(function(s) {
        if (s.id !== id) return s;
        var title = s.title;
        if (title === 'New chat' && msgs.length) {
          var first = msgs.find(function(m){ return m.role === 'user'; });
          if (first) title = first.content.slice(0, 40) + (first.content.length > 40 ? '…' : '');
        }
        return Object.assign({}, s, { messages: msgs, title: title });
      });
      persistSessions(next);
    }

    useEffect(function () { applyThemeCSS(cfg.theme || 'midnight'); }, [cfg.theme]);
    useEffect(function () { if (vis && ir.current && mode === 'search') setTimeout(function () { ir.current && ir.current.focus(); }, 50); }, [vis, mode]);

    // Ctrl+Alt
    useEffect(function () {
      function onK(e) {
        if (e.ctrlKey && e.altKey) {
          e.preventDefault(); e.stopPropagation();
          if (vis) doClose(); else { sVis(true); sCls(false); sQ(''); sMode('search'); sSi(0); }
        }
      }
      document.addEventListener('keydown', onK, true);
      return function () { document.removeEventListener('keydown', onK, true); };
    }, [vis]);

    useEffect(function () {
      function onT() { if (vis) doClose(); else { sVis(true); sCls(false); sQ(''); sMode('search'); sSi(0); } }
      document.addEventListener('spotlight-toggle', onT);
      return function () { document.removeEventListener('spotlight-toggle', onT); };
    }, [vis]);

    function doClose() { sCls(true); setTimeout(function () { sVis(false); sCls(false); sQ(''); sMode('search'); sSi(0); }, 160); }

    // On open in AI mode, reload sessions from storage (cross-page sync)
    useEffect(function () {
      if (vis && mode === 'ai') {
        var loaded = getSessions();
        if (loaded.length) sSessions(loaded);
        var aid = getActiveSessionId();
        if (aid && loaded.find(function(s){ return s.id === aid; })) sActiveSessionId(aid);
      }
    }, [vis, mode]);

    var res = useMemo(function () { return mode !== 'search' ? [] : buildResults(q, cfg, hist); }, [q, cfg, hist, mode]);
    var flat = useMemo(function () { return res.reduce(function (a, c) { return a.concat(c.items); }, []); }, [res]);
    useEffect(function () { if (si >= flat.length) sSi(Math.max(0, flat.length - 1)); }, [flat.length]);

    function activate(item, nt) {
      if (item.type === 'ai') { var aiQ = item.aiQuery || q.trim(); sMode('ai'); sQ(''); if (aiQ) sendAI(aiQ); return; }
      if (item.type === 'calc') { if (navigator.clipboard) navigator.clipboard.writeText(item.value).catch(function () {}); doClose(); return; }
      if (item.url) { if (nt) window.open(item.url, '_blank'); else location.href = item.url; doClose(); }
    }

    function sendAI(text) {
      if (!text.trim() || ail) return;
      var curSession = sessions.find(function(s){ return s.id === activeSessionId; });
      if (!curSession) return;
      var um = { role: 'user', content: text.trim() };
      var up = curSession.messages.concat([um]);
      updateSessionMessages(activeSessionId, up);
      sAil(true);
      var apiM = up.filter(function (m) { return !m.error; }).map(function (m) { return { role: m.role, content: m.content }; });
      queryAI(apiM, cfg)
        .then(function (r) {
          var curMsgs = getSessions().find(function(s){ return s.id === activeSessionId; });
          var latest = curMsgs ? curMsgs.messages : up;
          var next = latest.concat([{ role: 'assistant', content: r }]);
          updateSessionMessages(activeSessionId, next); sAil(false);
        })
        .catch(function (e) {
          var curMsgs = getSessions().find(function(s){ return s.id === activeSessionId; });
          var latest = curMsgs ? curMsgs.messages : up;
          var next = latest.concat([{ role: 'assistant', content: e.message || 'Error', error: true }]);
          updateSessionMessages(activeSessionId, next); sAil(false);
        });
    }

    function saveCfg(u) { saveConfig(u); sCfg(u); sMode('search'); sQ(''); }
    function updateCfg(u) { saveConfig(u); sCfg(u); }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (mode === 'ai' || mode === 'settings') { sMode('search'); sQ(''); sAil(false); } else doClose();
        return;
      }
      if (mode !== 'search') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sSi(function (i) { return (i + 1) % Math.max(1, flat.length); }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sSi(function (i) { return (i - 1 + flat.length) % Math.max(1, flat.length); }); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var qt = q.trim();
        if (/^>ai\b/i.test(qt)) {
          var aiQ = qt.replace(/^>ai\s*/i, '').trim();
          sMode('ai'); sQ('');
          if (aiQ) { setTimeout(function(){ sendAI(aiQ); }, 50); }
          return;
        }
        if (qt === '/settings' || qt === '/config') { sMode('settings'); return; }
        if (flat[si]) activate(flat[si], e.ctrlKey || e.metaKey);
      }
    }

    if (!vis) return null;

    var pill = null;
    if (mode === 'ai') pill = h('span', { className: 'sl-pill' }, h(LucideIcon, { name: 'sparkles', size: 10 }), 'AI');
    if (mode === 'settings') pill = h('span', { className: 'sl-pill' }, h(LucideIcon, { name: 'settings', size: 10 }), 'Settings');

    var content;
    if (mode === 'ai') content = h(AIChat, {
      sessions: sessions, activeSessionId: activeSessionId,
      onSend: sendAI, loading: ail, provider: cfg.aiProvider, model: cfg.aiModel,
      onNewSession: newSession, onDeleteSession: deleteSession, onSwitchSession: switchSession,
    });
    else if (mode === 'settings') content = h(SettingsPanel, { config: cfg, onAutoSave: updateCfg, onClose: function () { sMode('search'); sQ(''); } });
    else content = h(ResultsList, { results: res, selectedIndex: si, onActivate: function (it) { activate(it, false); }, onHover: function (i) { sSi(i); } });

    return h('div', { className: 'sl-overlay' + (cls ? ' sl-closing' : ''), onClick: function (e) { if (e.target === e.currentTarget) doClose(); }, onKeyDown: onKey },
      h('div', { className: 'sl-box' + (mode === 'ai' ? ' sl-box-ai' : ''), onClick: function (e) { e.stopPropagation(); } },
        mode === 'search'
          ? h('div', { className: 'sl-bar' },
              h(LucideIcon, { name: 'search', size: 17, style: { opacity: .3 } }),
              h('input', { ref: ir, className: 'sl-bar-input', type: 'text', placeholder: 'Search, or >ai to chat\u2026', value: q, onChange: function (e) { sQ(e.target.value); sSi(0); }, autoFocus: true, spellCheck: false, autoComplete: 'off' }),
              pill
            )
          : h('div', { className: 'sl-back', onClick: function () { sMode('search'); sQ(''); sAil(false); } },
              h(LucideIcon, { name: 'arrowLeft', size: 15 }),
              h('span', null, 'Back'),
              h('span', { style: { flex: 1 } }),
              pill
            ),
        h('div', { className: 'sl-hr' }),
        content,
        h(Footer, { mode: mode })
      )
    );
  }

  /* ════════════════════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════════════════════ */
  trackCurrentPage();

  function init() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', init); return; }
    applyThemeCSS(getConfig().theme || 'midnight');
    var m = document.createElement('div');
    m.id = 'sl-root-' + Math.random().toString(36).slice(2, 8);
    m.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(m);
    if (ReactDOM.createRoot) ReactDOM.createRoot(m).render(h(App));
    else ReactDOM.render(h(App), m);
  }
  init();

  GM_registerMenuCommand('Toggle Spotlight (Ctrl+Alt)', function () {
    document.dispatchEvent(new CustomEvent('spotlight-toggle'));
  });
})();
