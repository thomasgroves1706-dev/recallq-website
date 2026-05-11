/* RecallQ — LivingBackground
   Universal always-on ambient layer. Mounted once per page by partials.js.

   Renders:
   1. Canvas particle field (fixed, full-viewport, z-index 0):
        - 60 drifting periwinkle dots (wrap at edges)
        - 4 expanding rings at fixed positions
        - Connection lines between nearby dots
   2. Live ticker strip (inserted after .site-header, bg stone-dark)
   3. Floating stat pills (ambient, every 6–8s, max 2 visible)

   All automations respect prefers-reduced-motion.
   Canvas pauses when tab backgrounded (visibilitychange).
*/
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById('rqa-lb-css')) return;
    const s = document.createElement('style');
    s.id = 'rqa-lb-css';
    s.textContent = `
      .rqa-lb-canvas{
        position:fixed;inset:0;width:100vw;height:100vh;
        pointer-events:none;z-index:0;
        opacity:.9;
      }
      /* Canvas is z:0 and pointer-events:none; normal stacking keeps content above it. */
      /* Ticker */
      .rqa-ticker{
        position:relative;z-index:2;
        background:#2A2823;color:#E8E2D6;
        height:36px;display:flex;align-items:center;overflow:hidden;
        border-bottom:.5px solid #3A3833;
        font-size:11px;letter-spacing:.08em;font-weight:500;
        text-transform:uppercase;
      }
      .rqa-ticker-track{
        display:inline-flex;white-space:nowrap;
        animation:rqaTickerSlide 60s linear infinite;
        will-change:transform;
      }
      .rqa-ticker-track > span{padding:0 24px;display:inline-flex;align-items:center;gap:8px;}
      .rqa-ticker-track .dot{width:4px;height:4px;border-radius:50%;background:#5876C4;display:inline-block;}
      @keyframes rqaTickerSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      /* Stat pills */
      .rqa-stat-pill{
        position:fixed;z-index:55;
        background:#2A2823;color:#E8E2D6;
        border-radius:20px;padding:6px 12px;
        font-size:11px;font-weight:500;letter-spacing:.02em;
        box-shadow:0 8px 24px rgba(42,40,35,.18);
        opacity:0;transform:translateY(8px) scale(.95);
        transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1);
        pointer-events:none;
        display:inline-flex;align-items:center;gap:8px;
      }
      .rqa-stat-pill.in{opacity:1;transform:none;}
      .rqa-stat-pill .pd{width:5px;height:5px;border-radius:50%;background:#8AA8E8;}
      @media (prefers-reduced-motion: reduce){
        .rqa-lb-canvas{display:none;}
        .rqa-ticker-track{animation:none;}
        .rqa-stat-pill{display:none;}
      }
      @media (max-width:640px){
        .rqa-stat-pill{display:none;}
        .rqa-ticker{height:32px;font-size:10px;}
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------- Canvas particle field ---------- */
  function mountCanvas() {
    if (reduced) return;
    if (document.querySelector('.rqa-lb-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'rqa-lb-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    function resize() {
      W = canvas.clientWidth = window.innerWidth;
      H = canvas.clientHeight = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Dots
    const DOTS = [];
    const N = 60;
    for (let i = 0; i < N; i++) {
      DOTS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 2 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        a: 0.08 + Math.random() * 0.10
      });
    }
    // Rings
    const RINGS = [
      { x: 0.2, y: 0.25, r: 0, max: 140, speed: 0.5, delay: 0 },
      { x: 0.8, y: 0.25, r: 0, max: 160, speed: 0.55, delay: 600 },
      { x: 0.2, y: 0.65, r: 0, max: 130, speed: 0.45, delay: 1200 },
      { x: 0.8, y: 0.85, r: 0, max: 150, speed: 0.6,  delay: 1800 }
    ];
    const startT = performance.now();

    let running = true;
    let rafId = null;

    function frame(now) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // Dots
      for (let i = 0; i < DOTS.length; i++) {
        const d = DOTS[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = W + 10; else if (d.x > W + 10) d.x = -10;
        if (d.y < -10) d.y = H + 10; else if (d.y > H + 10) d.y = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(88,118,196,${d.a})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines
      for (let i = 0; i < DOTS.length; i++) {
        for (let j = i + 1; j < DOTS.length; j++) {
          const a = DOTS[i], b = DOTS[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8100) { // 90px
            const d = Math.sqrt(d2);
            const alpha = (1 - d / 90) * 0.06;
            ctx.strokeStyle = `rgba(138,168,232,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Rings
      const elapsed = now - startT;
      for (const ring of RINGS) {
        if (elapsed < ring.delay) continue;
        ring.r += ring.speed;
        if (ring.r > ring.max) ring.r = 0;
        const alpha = Math.max(0, 0.06 * (1 - ring.r / ring.max));
        ctx.strokeStyle = `rgba(88,118,196,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ring.x * W, ring.y * H, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    });
  }

  /* ---------- Ticker strip ---------- */
  function mountTicker() {
    if (document.querySelector('.rqa-ticker')) return;
    const header = document.querySelector('.site-header');
    if (!header) return;

    const items = [
      'DentistryIQ', 'PhysioIQ', 'OptometryIQ',
      '1,247 reminders today', '89 bookings confirmed',
      '$18,400 recovered', 'Australian-owned',
      'AU data residency', 'Privacy Act compliant',
      'recallq.com.au'
    ];
    const buildTrack = () => items.map(t =>
      `<span><span class="dot"></span>${t}</span>`
    ).join('');

    const bar = document.createElement('div');
    bar.className = 'rqa-ticker';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = `<div class="rqa-ticker-track">${buildTrack()}${buildTrack()}</div>`;
    header.insertAdjacentElement('afterend', bar);
  }

  /* ---------- Floating stat pills ---------- */
  const STATS = [
    '1,247 reminders sent today',
    '89 bookings confirmed this week',
    '$18,400 recovered this month',
    '32 practices using RecallQ',
    '20 minutes to go live',
    'Privacy Act compliant'
  ];

  function mountStatPills() {
    if (reduced) return;
    if (matchMedia('(max-width: 640px)').matches) return;

    let visible = 0;
    let i = 0;

    function showPill() {
      if (visible >= 2) {
        setTimeout(showPill, 1500);
        return;
      }
      const text = STATS[i % STATS.length]; i++;
      const pill = document.createElement('div');
      pill.className = 'rqa-stat-pill';
      pill.innerHTML = `<span class="pd"></span>${text}`;

      // Random position, but avoid header/footer regions and ticker
      const vw = window.innerWidth, vh = window.innerHeight;
      const side = Math.random() < 0.5 ? 'L' : 'R';
      const x = side === 'L' ? 24 + Math.random() * 80 : vw - 280 - Math.random() * 80;
      const y = 140 + Math.random() * (vh - 280);
      pill.style.left = x + 'px';
      pill.style.top  = y + 'px';

      document.body.appendChild(pill);
      visible++;
      requestAnimationFrame(() => pill.classList.add('in'));

      setTimeout(() => {
        pill.classList.remove('in');
        setTimeout(() => { pill.remove(); visible--; }, 520);
      }, 3000);

      const wait = 6000 + Math.random() * 2000;
      setTimeout(showPill, wait);
    }
    setTimeout(showPill, 4000);
  }

  /* ---------- Boot ---------- */
  function boot() {
    injectCSS();
    mountCanvas();
    // Defer ticker + pills past header transition so we don't thrash layout on initial paint.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mountTicker();
      mountStatPills();
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
