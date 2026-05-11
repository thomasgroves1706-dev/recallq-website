/* RecallQ — live/automated UX layer
   - Floating activity toasts (bottom-left) mimicking real booking recoveries
   - Live counter ticking up ("$X recovered across RecallQ practices this month")
   - CTA pulse beacon
   - Animated number countup on ROI outputs (hooks into existing ROI calc)
*/
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     LIVE ACTIVITY TOASTS
     ============================================================ */
  const POOL = [
    { v: 'Dentistry',  c: '#5C5A54', city: 'Sydney',    amt: 200, who: 'Rosehill Dental',  msg: 'clean booked' },
    { v: 'Optometry',  c: '#5A6470', city: 'Melbourne', amt: 340, who: 'Parkside Eyecare', msg: 'eye exam booked' },
    { v: 'Physio',     c: '#7A6A5C', city: 'Brisbane',  amt: 120, who: 'Northside Physio', msg: 'session booked' },
    { v: 'Dentistry',  c: '#5C5A54', city: 'Perth',     amt: 180, who: 'Leederville Smile',msg: 'check-up booked' },
    { v: 'Optometry',  c: '#5A6470', city: 'Adelaide',  amt: 390, who: 'Glenelg Optical',  msg: 'frames + exam booked' },
    { v: 'Physio',     c: '#7A6A5C', city: 'Newcastle', amt: 150, who: 'Hunter Sports Physio', msg: 'review booked' },
    { v: 'Dentistry',  c: '#5C5A54', city: 'Gold Coast',amt: 220, who: 'Broadbeach Dental',msg: 'hygiene recall' },
    { v: 'Optometry',  c: '#5A6470', city: 'Canberra',  amt: 280, who: 'Braddon Optometry',msg: '2-year recall' },
    { v: 'Physio',     c: '#7A6A5C', city: 'Hobart',    amt: 110, who: 'Salamanca Physio', msg: 'mid-plan return' },
    { v: 'Dentistry',  c: '#5C5A54', city: 'Geelong',   amt: 240, who: 'Waterfront Dental',msg: 'perio booked' }
  ];

  const NAMES = ['Sarah M.', 'James L.', 'Priya K.', 'Tom W.', 'Aisha R.', 'Oliver B.', 'Lily N.', 'Marcus T.', 'Chen W.', 'Emma S.', 'Jake P.', 'Nora D.'];
  function pickName(i) { return NAMES[i % NAMES.length]; }

  function buildToastContainer() {
    if (document.getElementById('rqa-toasts')) return document.getElementById('rqa-toasts');
    const host = document.createElement('div');
    host.id = 'rqa-toasts';
    host.setAttribute('aria-live', 'polite');
    host.style.cssText = [
      'position:fixed',
      'left:20px',
      'bottom:20px',
      'z-index:60',
      'display:flex',
      'flex-direction:column',
      'gap:10px',
      'pointer-events:none',
      'max-width:300px'
    ].join(';');
    document.body.appendChild(host);
    return host;
  }

  function showToast(data, idx) {
    const host = buildToastContainer();
    const el = document.createElement('div');
    el.className = 'rqa-toast';
    el.style.cssText = [
      'background:#fff',
      'border:.5px solid #D5DAE4',
      'border-left:3px solid ' + data.c,
      'border-radius:10px',
      'padding:12px 14px',
      'box-shadow:0 6px 24px rgba(42,40,35,.10)',
      'font-family:Inter,-apple-system,sans-serif',
      'font-size:13px',
      'color:#2A2823',
      'line-height:1.4',
      'pointer-events:auto',
      'opacity:0',
      'transform:translateX(-24px) scale(.96)',
      'transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1)'
    ].join(';');
    el.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:10px;">' +
        '<div style="width:8px;height:8px;border-radius:50%;background:' + data.c + ';flex-shrink:0;margin-top:5px;animation:rqaPulse 1.4s ease-out infinite;"></div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:500;color:#2A2823;">' + pickName(idx) + ' · ' + data.city + '</div>' +
          '<div style="color:#7A7870;font-size:12px;margin-top:2px;">' + data.msg + ' · <span style="color:#5876C4;font-weight:500;">+$' + data.amt + '</span></div>' +
          '<div style="color:#7A7870;font-size:11px;margin-top:4px;opacity:.7;">via ' + data.v + 'IQ · just now</div>' +
        '</div>' +
        '<button aria-label="Dismiss" style="background:none;border:0;color:#7A7870;cursor:pointer;font-size:16px;line-height:1;padding:0 2px;">×</button>' +
      '</div>';
    host.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    el.querySelector('button').addEventListener('click', () => removeToast(el));

    setTimeout(() => removeToast(el), 5200);
  }

  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.style.opacity = '0';
    el.style.transform = 'translateX(-24px) scale(.96)';
    setTimeout(() => el.remove(), 500);
  }

  function startToastStream() {
    if (reduced) return;
    let i = 0;
    function next() {
      const data = POOL[Math.floor(Math.random() * POOL.length)];
      showToast(data, i++);
      // irregular cadence: 6–11s
      const wait = 6000 + Math.random() * 5000;
      setTimeout(next, wait);
    }
    // first toast after 3.5s
    setTimeout(next, 3500);
  }

  /* ============================================================
     LIVE COUNTER STRIP (optional — inject if [data-live-counter])
     ============================================================ */
  function liveCounter() {
    const el = document.querySelector('[data-live-counter]');
    if (!el) return;
    // seed from a pseudo-random base that increments every second
    const startBase = 2384000; // cumulative AUD recovered this month
    const startTime = Date.now();
    const amountEl = el.querySelector('[data-lc-amount]');
    const bookingsEl = el.querySelector('[data-lc-bookings]');

    function tick() {
      const elapsed = (Date.now() - startTime) / 1000;
      // ~$47/sec steady tick + noise
      const amt = startBase + Math.floor(elapsed * 47) + Math.floor(Math.random() * 3);
      const bookings = 11842 + Math.floor(elapsed * 0.19);
      if (amountEl) amountEl.textContent = '$' + amt.toLocaleString();
      if (bookingsEl) bookingsEl.textContent = bookings.toLocaleString();
    }
    tick();
    setInterval(tick, reduced ? 5000 : 900);
  }

  /* ============================================================
     CTA pulse beacon — adds a subtle pulsing ring to primary CTAs
     ============================================================ */
  function addCTAPulse() {
    if (reduced) return;
    const primaries = document.querySelectorAll('.btn--primary.btn--lg');
    primaries.forEach(btn => {
      if (btn.dataset.pulse) return;
      btn.dataset.pulse = '1';
      btn.style.position = 'relative';
      btn.style.isolation = 'isolate';
    });
  }

  /* ============================================================
     KEYFRAMES (inject once)
     ============================================================ */
  function injectKeyframes() {
    if (document.getElementById('rqa-live-kf')) return;
    const s = document.createElement('style');
    s.id = 'rqa-live-kf';
    s.textContent = [
      '@keyframes rqaPulse { 0%{box-shadow:0 0 0 0 rgba(88,118,196,.55);} 70%{box-shadow:0 0 0 8px rgba(88,118,196,0);} 100%{box-shadow:0 0 0 0 rgba(88,118,196,0);} }',
      '@keyframes rqaBeacon { 0%{box-shadow:0 0 0 0 rgba(88,118,196,.4);} 70%{box-shadow:0 0 0 14px rgba(88,118,196,0);} 100%{box-shadow:0 0 0 0 rgba(88,118,196,0);} }',
      '@keyframes rqaFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }',
      '@keyframes rqaTickerSlide { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }',
      '.btn--primary.btn--lg[data-pulse] { animation: rqaBeacon 2.4s ease-out infinite; }',
      '.btn--primary.btn--lg[data-pulse]:hover { animation: none; }',
      '@media (prefers-reduced-motion: reduce) { .btn--primary.btn--lg[data-pulse], .rqa-toast .rqa-toast-dot { animation: none !important; } }',
      '@media (max-width: 640px) { #rqa-toasts { left: 12px; right: 12px; bottom: 12px; max-width: none; } }'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ============================================================
     Hook: enhance ROI calc numbers with tick effect on change
     ============================================================ */
  function enhanceROI() {
    const ids = ['roiOverdue', 'roiMonth', 'roiYear'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new MutationObserver(() => {
        el.style.transition = 'color .25s';
        el.style.color = '#8AA8E8';
        clearTimeout(el._rqaT);
        el._rqaT = setTimeout(() => { el.style.color = ''; }, 240);
      });
      obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    injectKeyframes();
    addCTAPulse();
    liveCounter();
    enhanceROI();
    startToastStream();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
