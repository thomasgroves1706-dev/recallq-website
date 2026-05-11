/* RecallQ — visual upgrade behaviours
   - Calendar-fill hero with scroll zoom
   - Magnetic CTAs
   - AI message composer
   - Mosaic count-ups + drift
   - Section curve dividers (programmatic insertion)
*/
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. CALENDAR-FILL HERO + SMS FLY-BY
     ============================================================ */
  function buildCalHero() {
    const stage = document.querySelector('[data-cal-hero]');
    if (!stage) return;
    const inner = stage.querySelector('.cal-stage-inner');
    if (!inner) return;
    const grid = inner.querySelector('.cal-grid');
    if (!grid) return;

    // Generate 28-day calendar (4 weeks)
    const total = 28;
    grid.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const day = document.createElement('div');
      day.className = 'cal-day';
      day.dataset.idx = i;
      day.innerHTML = `<span class="d">${i + 1}</span>`;
      grid.appendChild(day);
    }

    const days = grid.querySelectorAll('.cal-day');
    const counter = stage.querySelector('[data-cal-counter]');

    const names = ['Sarah A.', 'James T.', 'Priya R.', 'Mia H.', 'Leo C.', 'Tom B.', 'Anna K.', 'Ben P.', 'Eve M.', 'Noah F.', 'Lily W.', 'Jack S.', 'Zoe D.', 'Ed R.'];
    const times = ['9:00am', '10:30am', '11:15am', '1:00pm', '2:30pm', '3:00pm', '4:15pm'];
    const previews = [
      'Hi Sarah — clean due. Thursday 3pm?',
      'Hi James — exam is overdue. Tue 10am?',
      'Hi Priya — 2-yr eye exam is up.',
      'Hi Mia — follow-up on your shoulder?',
      'Hi Leo — your 6-month check is due.',
      "Hi Tom — it's been a while. Book in?",
      'Hi Anna — recall window opening soon.'
    ];
    const fromLines = ['SMS · Recall', 'SMS · Peak Physio', 'SMS · ClearSight Optometry'];

    let bookings = 0;
    let revenue = 0;
    let weekIdx = 0;
    const weeksPerCycle = 4;
    const daysPerWeek = 7;

    function fireSMS() {
      const fly = document.createElement('div');
      fly.className = 'sms-fly';
      const from = fromLines[Math.floor(Math.random() * fromLines.length)];
      const text = previews[Math.floor(Math.random() * previews.length)];
      fly.innerHTML = `<div class="from">${from}</div>${text}`;
      // Random vertical position within the grid
      const top = 30 + Math.random() * 65;
      fly.style.top = top + '%';
      fly.style.left = '0';
      stage.appendChild(fly);
      requestAnimationFrame(() => fly.classList.add('in'));
      setTimeout(() => fly.remove(), 4000);
    }

    function landBooking() {
      // Pick a random unbooked day in the current "week"
      const start = (weekIdx % weeksPerCycle) * daysPerWeek;
      const end = start + daysPerWeek;
      const candidates = [];
      for (let i = start; i < end && i < days.length; i++) {
        const bookCount = days[i].querySelectorAll('.cal-booking').length;
        if (bookCount < 3) candidates.push(days[i]);
      }
      if (!candidates.length) return;
      const day = candidates[Math.floor(Math.random() * candidates.length)];
      day.classList.add('has-booking');
      const b = document.createElement('div');
      b.className = 'cal-booking';
      const name = names[Math.floor(Math.random() * names.length)];
      const time = times[Math.floor(Math.random() * times.length)];
      b.textContent = `${time} · ${name.split(' ')[0]}`;
      day.appendChild(b);
      bookings++;
      revenue += Math.floor(180 + Math.random() * 120);
      if (counter) counter.querySelector('.n').textContent = bookings;
    }

    function nextWeek() {
      weekIdx++;
      // Reset every 4 weeks for loop
      if (weekIdx % weeksPerCycle === 0 && weekIdx > 0) {
        // fade out then clear
        days.forEach(d => {
          d.style.transition = 'opacity .6s ease';
          d.style.opacity = '0.3';
        });
        setTimeout(() => {
          days.forEach(d => {
            d.classList.remove('has-booking');
            d.querySelectorAll('.cal-booking').forEach(b => b.remove());
            d.style.opacity = '';
          });
          bookings = 0;
          if (counter) counter.querySelector('.n').textContent = '0';
        }, 700);
      }
    }

    if (reduced) {
      // Static state: pre-fill some days
      for (let k = 0; k < 14; k++) landBooking();
      return;
    }

    // Run continuous loop
    let smsTimer = setInterval(fireSMS, 1100);
    let bookTimer = setInterval(() => {
      // 2-3 bookings per "tick"
      const burst = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < burst; k++) setTimeout(landBooking, k * 180);
    }, 700);
    let weekTimer = setInterval(nextWeek, 6500);

    // Pause when offscreen
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      // pause/resume could go here; keep simple for now
    });
    io.observe(stage);
  }

  /* ============================================================
     2. SCROLL-DRIVEN HERO ZOOM
     ============================================================ */
  function scrollZoomHero() {
    const stage = document.querySelector('[data-scroll-zoom]');
    if (!stage || reduced) return;
    const onScroll = () => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when stage top hits viewport top, 1 when stage bottom leaves
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      // Zoom up to 1.18x as we scroll past
      const scale = 1 + progress * 0.18;
      const opacity = 1 - Math.max(0, progress - 0.5) * 1.6;
      stage.style.transform = `scale(${scale})`;
      stage.style.opacity = Math.max(0, opacity);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ============================================================
     3. MAGNETIC CTAS
     ============================================================ */
  function magneticBtns() {
    if (reduced) return;
    const btns = document.querySelectorAll('.btn--primary, .btn--accent, .btn--invert, .btn--lg');
    btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================================
     4. AI MESSAGE COMPOSER
     ============================================================ */
  function composer() {
    const root = document.querySelector('[data-composer]');
    if (!root) return;
    const nameEl = root.querySelector('[data-c-name]');
    const verticalEl = root.querySelector('[data-c-vertical]');
    const lastEl = root.querySelector('[data-c-last]');
    const toneEl = root.querySelector('[data-c-tone]');
    const bubble = root.querySelector('[data-c-bubble]');
    const reply = root.querySelector('[data-c-reply]');
    if (!nameEl || !bubble) return;

    function buildMsg() {
      const name = (nameEl.value || 'Sarah').trim().split(' ')[0];
      const v = verticalEl.value;
      const last = lastEl.value;
      const tone = toneEl.value;

      let body = '';
      if (v === 'dental') {
        body = tone === 'warm'
          ? `Hi ${name}, it's lovely to hear from you again 💛 It's been ${last} since we last saw you, and we'd love to take care of your smile soon. We've saved a quiet spot on Thursday at 3pm with one of our dentists if that works — no pressure, just here whenever you're ready.`
          : `Hi ${name} — friendly nudge that you're due for a clean. We've kept Thursday 3pm aside for you. Reply YES and we'll lock it in.`;
      } else if (v === 'physio') {
        body = tone === 'warm'
          ? `Hi ${name}, hope you're keeping well. It's been ${last} since we worked together — we'd love to check in on how that shoulder is tracking and help you keep the progress going. Tuesday 10am is yours if you'd like it.`
          : `Hi ${name} — gentle reminder your follow-up is due. Tuesday 10am is open for you. Reply YES to grab it.`;
      } else {
        body = tone === 'warm'
          ? `Hi ${name}, hope life's treating you well 👋 It's been ${last} since your last eye check, and your Medicare rebate is about to reset. Would love to look after your eyes again — happy to hold a spot for you this week if you're keen.`
          : `Hi ${name} — your eye exam is due and your rebate resets soon. We'd love to see you this week. Reply YES to book.`;
      }
      return body;
    }

    let typingTO = null;
    let charI = 0;
    function typeOut() {
      const target = buildMsg();
      bubble.innerHTML = '';
      reply.classList.remove('on');
      charI = 0;
      const cur = document.createElement('span');
      cur.className = 'cursor';
      bubble.appendChild(cur);
      function tick() {
        if (charI < target.length) {
          cur.insertAdjacentText('beforebegin', target[charI]);
          charI++;
          typingTO = setTimeout(tick, 14 + Math.random() * 22);
        } else {
          cur.remove();
          setTimeout(() => reply.classList.add('on'), 600);
        }
      }
      tick();
    }

    function trigger() {
      if (typingTO) clearTimeout(typingTO);
      typeOut();
    }

    [nameEl, verticalEl, lastEl, toneEl].forEach(el => el.addEventListener('input', trigger));

    // Initial run on first scroll-into-view
    const io = new IntersectionObserver(([e]) => {
      if (e && e.isIntersecting) {
        trigger();
        io.disconnect();
      }
    }, { rootMargin: '-20%' });
    io.observe(root);
  }

  /* ============================================================
     5. DATA MOSAIC — drift counters
     ============================================================ */
  function mosaic() {
    const tiles = document.querySelectorAll('[data-drift]');
    tiles.forEach(t => {
      const target = parseInt(t.dataset.drift, 10);
      const prefix = t.dataset.prefix || '';
      const suffix = t.dataset.suffix || '';
      const dur = 2400 + Math.random() * 800;
      let started = false;
      const animate = () => {
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          t.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else if (!reduced) {
            // Keep drifting up slowly
            setInterval(() => {
              const cur = parseInt(t.textContent.replace(/\D/g, ''), 10) || target;
              const inc = Math.max(1, Math.floor(cur * 0.0008));
              t.textContent = prefix + (cur + inc).toLocaleString() + suffix;
            }, 5000 + Math.random() * 3000);
          }
        };
        requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([e]) => {
        if (e && e.isIntersecting && !started) { started = true; animate(); io.disconnect(); }
      }, { rootMargin: '-15%' });
      io.observe(t);
    });
  }

  /* ============================================================
     6. CURVED SECTION DIVIDERS — auto inject
     ============================================================ */
  function curveDividers() {
    // Auto-inject animated curves between adjacent sections of different bg
    const sections = Array.from(document.querySelectorAll(
      '.section, .idea, .v-block, .editorial, .cta-band, .hero-cine'
    ));
    function bgFor(el) {
      const cs = getComputedStyle(el);
      const c = cs.backgroundColor;
      // Walk up if transparent
      if (c === 'rgba(0, 0, 0, 0)' || c === 'transparent') {
        if (el.classList.contains('section--white')) return '#FFFFFF';
        if (el.classList.contains('section--soft')) return '#F5F5F7';
        if (el.classList.contains('idea--dark')) return '#1A1915';
        if (el.classList.contains('idea--soft')) return '#F5F5F7';
        if (el.classList.contains('idea--white')) return '#FFFFFF';
        if (el.classList.contains('cta-band')) return '#1A1915';
        if (el.classList.contains('v-dent')) return '#EBE3D5';
        if (el.classList.contains('v-physio')) return '#E9D9CB';
        if (el.classList.contains('v-opto')) return '#D8DDE6';
        if (el.classList.contains('editorial')) return '#0F0E0B';
        return '#FFFFFF';
      }
      return c;
    }
    function darken(c) { return c; }

    for (let i = 0; i < sections.length - 1; i++) {
      const a = sections[i];
      const b = sections[i + 1];
      const colorA = bgFor(a);
      const colorB = bgFor(b);
      if (colorA === colorB) continue;

      const curve = document.createElement('div');
      curve.className = 'section-curve';
      curve.style.background = colorA;
      curve.innerHTML = `
        <svg viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path class="sweep-fill" d="M0,90 C200,20 1000,20 1200,90 L1200,90 L0,90 Z" fill="${colorB}"/>
          <path class="sweep-path" d="M0,90 C200,20 1000,20 1200,90"
                fill="none" stroke="${colorB}" stroke-width="2" stroke-opacity=".4"/>
        </svg>
      `;
      a.parentNode.insertBefore(curve, b);
    }

    // Animate in on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.section-curve').forEach(c => io.observe(c));
  }

  /* PARALLAX EDITORIAL PHOTOS */
  function parallaxPhotos() {
    if (reduced) return;
    const els = document.querySelectorAll('.editorial img, .photo-strip .ps img');
    if (!els.length) return;
    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      els.forEach(img => {
        const wrap = img.parentElement;
        const r = wrap.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        const shift = -progress * 60;
        img.style.transform = `translateY(${shift}px) scale(1.05)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* MODAL PRESS FEEDBACK */
  function modalPress() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-start-now]');
      if (!t) return;
      t.classList.add('firing');
      setTimeout(() => t.classList.remove('firing'), 180);
    }, true);
  }

  

  /* ============================================================
     ROI CALCULATOR
     ============================================================ */
  function roiCalc() {
    const root = document.querySelector('[data-roi]');
    if (!root) return;
    const verticalBtns = root.querySelectorAll('[data-roi-vertical] button');
    const patientsEl = root.querySelector('[data-roi-patients]');
    const valueEl = root.querySelector('[data-roi-value]');
    const patientsOut = root.querySelector('[data-roi-patients-out]');
    const valueOut = root.querySelector('[data-roi-value-out]');
    const monthlyOut = root.querySelector('[data-roi-monthly]');
    const bookingsOut = root.querySelector('[data-roi-bookings]');
    const annualOut = root.querySelector('[data-roi-annual]');
    const costOut = root.querySelector('[data-roi-cost]');
    const netOut = root.querySelector('[data-roi-net]');

    const cost = { dental: 1000, physio: 1799, opto: 2000 };
    const rate = {
      dental: { overdue: 0.27, convert: 0.12 },
      physio: { overdue: 0.35, convert: 0.10 },
      opto:   { overdue: 0.42, convert: 0.14 },
    };

    let currentVertical = 'dental';

    function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
    function fmtN(n) { return Math.round(n).toLocaleString(); }

    function recompute() {
      const patients = parseInt(patientsEl.value, 10);
      const value = parseInt(valueEl.value, 10);
      const r = rate[currentVertical];
      const monthlyBookings = patients * r.overdue * r.convert / 12;
      const monthlyRev = monthlyBookings * value;
      const monthCost = cost[currentVertical];
      const annual = monthlyRev * 12;
      const net = monthlyRev - monthCost;

      patientsOut.textContent = fmtN(patients);
      valueOut.textContent = fmt(value);
      monthlyOut.textContent = fmt(monthlyRev);
      bookingsOut.textContent = fmtN(monthlyBookings);
      annualOut.textContent = fmt(annual);
      costOut.textContent = '−$' + monthCost.toLocaleString() + '/mo';
      netOut.textContent = fmt(net) + '/mo';
    }

    verticalBtns.forEach(b => b.addEventListener('click', () => {
      verticalBtns.forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      currentVertical = b.dataset.v;
      recompute();
    }));

    [patientsEl, valueEl].forEach(el => el.addEventListener('input', recompute));
    recompute();
  }


  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    buildCalHero();
    scrollZoomHero();
    magneticBtns();
    composer();
    mosaic();
    curveDividers();
    parallaxPhotos();
    modalPress();
    roiCalc();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
