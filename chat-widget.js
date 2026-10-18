/* ─────────────────────────────────────────────────────────────
   Portfolio chat widget — built on the official @n8n/chat package.

   How it behaves
   • Launcher bubble (bottom-right) opens the chat window.
   • Minimize (–): hides the window, keeps the conversation in memory.
   • Close (×):    ends the conversation; the next open starts fresh.
   • Reload / closing the tab: conversation is gone (nothing is stored).
   • If n8n can't be reached, an "offline" panel shows contact options.
   • The n8n chat package (~1.7 MB) is only downloaded when a visitor
     first opens the chat, so it doesn't slow the page down.
   ───────────────────────────────────────────────────────────── */

const CONFIG = {
  // 1) The Chat Trigger node's "Production URL" (ends in /chat).
  chatWebhookUrl: 'https://n8n.naivegeek.xyz/webhook/eadf3433-b92f-4fc1-a5b4-3c00f05f6c41/chat',

  // 2) A tiny n8n webhook that answers GET with HTTP 200 (see setup notes).
  //    Used to tell whether n8n is up, so the offline panel can show.
  statusUrl: 'https://n8n.naivegeek.xyz/webhook/portfolio-chat-status',

  n8nChatVersion: '1.41.2',   // pinned on purpose; bump deliberately
  streaming: true,            // enable streaming responses
  statusTimeoutMs: 5000,      // no answer within 5s = offline
  recheckEveryMs: 30000,      // re-check while the window is open

  title: 'Ask about Bon',
  initialMessages: [
    'Hi there! 👋 I\'m Bon\'s assistant.',
    'Ask me about his services, tools, or projects.'
  ],
  inputPlaceholder: 'Ask about Bon\'s work…',

  contact: {
    email:    'bondionieluib@gmail.com',
    telegram: 'https://t.me/bon_luib',
    whatsapp: 'https://wa.me/639557933515',
    linkedin: 'https://www.linkedin.com/in/bondionie-luib',
    calendar: 'https://calendar.app.google/8JxHr8yGaSbAm5hw6'
  }
};

const CDN = 'https://cdn.jsdelivr.net/npm/@n8n/chat@' + CONFIG.n8nChatVersion + '/dist/';
const SESSION_KEY = 'n8n-chat/sessionId'; // key used by @n8n/chat internally
const isConfigured = !/REPLACE/.test(CONFIG.chatWebhookUrl) && !/REPLACE/.test(CONFIG.statusUrl);

const ICON = {
  chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  min:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
  mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  tg:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  wa:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.856L.057 23.997l6.304-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.006-1.371l-.36-.214-3.733.979 1-3.642-.234-.374A9.772 9.772 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>',
  in:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  cal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>'
};

const state = { open: false, app: null, view: 'connecting', timer: null, busy: false };
let els = {};

/* ── build the DOM ─────────────────────────────────────────── */
function build() {
  const mailto = 'mailto:' + CONFIG.contact.email +
    '?subject=' + encodeURIComponent('Message from your portfolio');

  const root = document.createElement('div');
  root.className = 'bdl-chat';
  root.innerHTML = `
    <button class="bdl-chat-launcher" type="button" aria-label="Open chat" aria-expanded="false">
      ${ICON.chat}<span class="bdl-chat-dot" aria-hidden="true"></span>
    </button>

    <div class="bdl-chat-window" role="dialog" aria-label="${CONFIG.title}" hidden>
      <header class="bdl-chat-head">
        <div class="bdl-chat-avatar" aria-hidden="true">BDL</div>
        <div class="bdl-chat-titles">
          <div class="bdl-chat-title">${CONFIG.title}</div>
          <div class="bdl-chat-status" aria-live="polite"><i class="bdl-s-dot"></i><span>Connecting…</span></div>
        </div>
        <button class="bdl-chat-btn" data-act="minimize" type="button" aria-label="Minimize chat" title="Minimize">${ICON.min}</button>
        <button class="bdl-chat-btn" data-act="close" type="button" aria-label="Close and reset chat" title="Close and reset">${ICON.close}</button>
      </header>

      <div class="bdl-chat-body">
        <div class="bdl-view bdl-view-connecting" data-view="connecting">
          <div class="bdl-spinner" aria-hidden="true"></div>
          <p>Connecting…</p>
        </div>

        <div class="bdl-view bdl-view-chat" data-view="chat">
          <div class="bdl-chat-mount"></div>
        </div>

        <div class="bdl-view bdl-view-offline" data-view="offline">
          <div class="bdl-off-title">Chat is offline right now</div>
          <p class="bdl-off-text">The assistant isn't available at the moment. You can message me directly instead and I'll get back to you:</p>
          <div class="bdl-off-links">
            <a href="${mailto}"><span class="i">${ICON.mail}</span><span>Email<small>${CONFIG.contact.email}</small></span></a>
            <a href="${CONFIG.contact.telegram}" target="_blank" rel="noopener"><span class="i">${ICON.tg}</span><span>Telegram<small>@bon_luib</small></span></a>
            <a href="${CONFIG.contact.whatsapp}" target="_blank" rel="noopener"><span class="i">${ICON.wa}</span><span>WhatsApp<small>Send a message</small></span></a>
            <a href="${CONFIG.contact.linkedin}" target="_blank" rel="noopener"><span class="i">${ICON.in}</span><span>LinkedIn<small>bondionie-luib</small></span></a>
            <a href="${CONFIG.contact.calendar}" target="_blank" rel="noopener"><span class="i">${ICON.cal}</span><span>Book a call<small>Pick a time that suits you</small></span></a>
          </div>
          <button class="bdl-retry" type="button">${ICON.retry}<span>Try the chat again</span></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);

  els = {
    root,
    launcher: root.querySelector('.bdl-chat-launcher'),
    win: root.querySelector('.bdl-chat-window'),
    status: root.querySelector('.bdl-chat-status'),
    mount: root.querySelector('.bdl-chat-mount'),
    views: Array.prototype.slice.call(root.querySelectorAll('.bdl-view'))
  };

  els.launcher.addEventListener('click', openWindow);
  root.querySelector('[data-act="minimize"]').addEventListener('click', minimizeWindow);
  root.querySelector('[data-act="close"]').addEventListener('click', closeAndReset);
  root.querySelector('.bdl-retry').addEventListener('click', function () { start(true); });
  els.win.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); minimizeWindow(); }
  });
}

/* ── views & status ────────────────────────────────────────── */
function showView(name) {
  state.view = name;
  els.views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
  const label = { connecting: 'Connecting…', chat: 'Online', offline: 'Offline' }[name];
  els.status.setAttribute('data-state', name);
  els.status.lastElementChild.textContent = label;
}

function ping() {
  if (!isConfigured) return Promise.resolve(false);
  const ctrl = new AbortController();
  const t = setTimeout(function () { ctrl.abort(); }, CONFIG.statusTimeoutMs);
  return fetch(CONFIG.statusUrl, { cache: 'no-store', signal: ctrl.signal })
    .then(function (res) { return res.ok; })
    .catch(function () { return false; })
    .then(function (ok) { clearTimeout(t); return ok; });
}

/* ── n8n chat loading / mounting ───────────────────────────── */
let n8nChatPromise = null;
function loadN8nChat() {
  if (!n8nChatPromise) {
    if (!document.getElementById('bdl-n8n-chat-css')) {
      const link = document.createElement('link');
      link.id = 'bdl-n8n-chat-css';
      link.rel = 'stylesheet';
      link.href = CDN + 'style.css';
      document.head.appendChild(link);
    }
    n8nChatPromise = import(CDN + 'chat.bundle.es.js').catch(function (err) {
      n8nChatPromise = null; // allow a retry
      throw err;
    });
  }
  return n8nChatPromise;
}

function mountChat(mod) {
  state.app = mod.createChat({
    webhookUrl: CONFIG.chatWebhookUrl,
    target: els.mount,
    mode: 'fullscreen',
    showWelcomeScreen: false,
    loadPreviousSession: false,       // every chat starts fresh; nothing is restored
    initialMessages: CONFIG.initialMessages,
    metadata: { source: 'portfolio', page: location.pathname },
    i18n: {
      en: {
        title: CONFIG.title,
        subtitle: '',
        footer: '',
        getStarted: 'New conversation',
        inputPlaceholder: CONFIG.inputPlaceholder,
        closeButtonTooltip: 'Close'
      }
    },
    enableStreaming: CONFIG.streaming
  });
  els.root.classList.add('has-chat');
}

/* ── flow ──────────────────────────────────────────────────── */
function start(force) {
  if (state.busy) return;
  if (state.app && !force) { showView('chat'); focusInput(); return; }
  state.busy = true;
  showView('connecting');
  ping().then(function (ok) {
    if (!ok) { showView('offline'); return; }
    if (state.app) { showView('chat'); focusInput(); return; }
    return loadN8nChat().then(function (mod) {
      mountChat(mod);
      showView('chat');
      focusInput();
    });
  }).catch(function () {
    showView('offline');          // CDN blocked / failed to load
  }).then(function () { state.busy = false; });
}

function recheck() {
  if (!state.open || state.busy) return;
  ping().then(function (ok) {
    if (!state.open) return;
    if (!ok && state.view === 'chat') showView('offline');       // chat stays mounted underneath
    else if (ok && state.view === 'offline') start(false);       // back online: restore / start
  });
}

function focusInput() {
  setTimeout(function () {
    const ta = els.mount.querySelector('textarea');
    if (ta) ta.focus();
  }, 150);
}

function openWindow() {
  state.open = true;
  els.win.hidden = false;
  els.launcher.hidden = true;
  els.launcher.setAttribute('aria-expanded', 'true');
  start(false);
  clearInterval(state.timer);
  state.timer = setInterval(recheck, CONFIG.recheckEveryMs);
}

function minimizeWindow() {
  state.open = false;
  clearInterval(state.timer);
  els.win.hidden = true;             // chat stays mounted → conversation preserved
  els.launcher.hidden = false;
  els.launcher.setAttribute('aria-expanded', 'false');
  els.launcher.focus();
}

function closeAndReset() {
  if (state.app) { try { state.app.unmount(); } catch (e) { /* ignore */ } }
  state.app = null;
  els.mount.innerHTML = '';
  els.root.classList.remove('has-chat');
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* storage may be blocked */ }
  showView('connecting');
  minimizeWindow();
}

function init() {
  build();
  showView('connecting');
  els.win.hidden = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
