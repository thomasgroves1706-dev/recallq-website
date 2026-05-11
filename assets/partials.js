/* RecallQ — header, footer, Start Now modal
   Usage: <script src="assets/partials.js"
          data-active="home|dentistry|physio|optometry|how|pricing|about|legal"
          data-vertical="Dentistry|Physio|Optometry" (optional modal preset)
          data-depth="0|1"></script>
*/
(function () {
  const me = document.currentScript;
  const active = me?.dataset.active || '';
  const vPreset = me?.dataset.vertical || '';
  const depth = (parseInt(me?.dataset.depth || '0', 10)) || 0;
  const up = '../'.repeat(depth);
  const ver = '?v=g1';

  // HEADER
  const hdr = document.createElement('div');
  hdr.innerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="container hdr-inner">
        <a class="wordmark" href="${up}index.html" aria-label="RecallQ home">Recall<span class="q">Q</span></a>
        <nav class="nav" aria-label="Primary">
          <div class="nav-dd">
            <button aria-haspopup="true" aria-expanded="false">Solutions</button>
            <div class="nav-dd-menu" role="menu">
              <a href="${up}dentistry.html"><span class="dot" style="background:#5C5A54"></span><span><strong>DentistryIQ</strong><span class="sub-desc">Recall for dental practices</span></span></a>
              <a href="${up}physio.html"><span class="dot" style="background:#7A6A5C"></span><span><strong>PhysioIQ</strong><span class="sub-desc">Recall for physiotherapy</span></span></a>
              <a href="${up}optometry.html"><span class="dot" style="background:#5A6470"></span><span><strong>OptometryIQ</strong><span class="sub-desc">Recall for optometry</span></span></a>
            </div>
          </div>
          <a href="${up}how-it-works.html">How it works</a>
          <a href="${up}pricing.html">Pricing</a>
          <a href="${up}about.html">About</a>
        </nav>
        <button class="btn btn--primary" data-start-now>Start now</button>
        <button class="hamb" aria-label="Menu" id="hambBtn"><span></span></button>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <ul>
          <li><a href="${up}dentistry.html"><span class="dot" style="background:#5C5A54;margin-right:8px;display:inline-block;"></span>DentistryIQ</a></li>
          <li><a href="${up}physio.html"><span class="dot" style="background:#7A6A5C;margin-right:8px;display:inline-block;"></span>PhysioIQ</a></li>
          <li><a href="${up}optometry.html"><span class="dot" style="background:#5A6470;margin-right:8px;display:inline-block;"></span>OptometryIQ</a></li>
          <li><a href="${up}how-it-works.html">How it works</a></li>
          <li><a href="${up}pricing.html">Pricing</a></li>
          <li><a href="${up}about.html">About</a></li>
          <li><button data-start-now style="color:var(--periwinkle-dark);font-weight:500;">Start now →</button></li>
        </ul>
      </div>
    </header>
  `;
  document.body.insertBefore(hdr.firstElementChild, document.body.firstChild);
  // Double-rAF + forced reflow to guarantee the transition starts from the initial state.
  // Without this, iframes that are backgrounded on load can stall the transition in
  // "pending" state (playState:running, startTime:null) and opacity stays at 0 forever.
  const hdrEl = document.getElementById('siteHeader');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    // Force reflow
    // eslint-disable-next-line no-unused-expressions
    hdrEl.offsetHeight;
    hdrEl.classList.add('ready');
    // Fallback: if transitions stalled (bg'd tab at load), finish them after 800ms.
    setTimeout(() => {
      if (getComputedStyle(hdrEl).opacity !== '1') {
        hdrEl.getAnimations && hdrEl.getAnimations().forEach(a => { try { a.finish(); } catch(e){} });
      }
    }, 800);
  }));

  document.getElementById('hambBtn')?.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  // FOOTER
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container" data-anim="fade-up">
      <div class="grid" data-stagger>
        <div class="brand-col">
          <div class="wordmark">Recall<span class="q">Q</span></div>
          <p class="tag">AI-powered patient recall. Built in Australia.</p>
        </div>
        <div>
          <h4>Solutions</h4>
          <ul>
            <li><a href="${up}dentistry.html">DentistryIQ</a></li>
            <li><a href="${up}physio.html">PhysioIQ</a></li>
            <li><a href="${up}optometry.html">OptometryIQ</a></li>
          </ul>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><a href="${up}how-it-works.html">How it works</a></li>
            <li><a href="${up}pricing.html">Pricing</a></li>
            <li><button data-start-now>Start now</button></li>
          </ul>
        </div>
        <div>
          <h4>Company &amp; Legal</h4>
          <ul>
            <li><a href="${up}about.html">About</a></li>
            <li><a href="mailto:hello@recallq.com.au">Contact</a></li>
            <li><a href="${up}legal/privacy.html">Privacy Policy</a></li>
            <li><a href="${up}legal/terms.html">Terms</a></li>
            <li><a href="${up}legal/dpa.html">DPA</a></li>
          </ul>
        </div>
      </div>
      <div class="compliance">
        <span>Australian-owned</span><span class="sep">·</span>
        <span>AU data residency</span><span class="sep">·</span>
        <span>Privacy Act 1988</span><span class="sep">·</span>
        <span>Spam Act 2003</span>
      </div>
      <div class="copy">© RecallQ Pty Ltd · ABN placeholder · recallq.com.au · Made in Australia</div>
    </div>
  `;
  document.body.appendChild(footer);

  // MODAL
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'startNowModal';
  modal.innerHTML = `
    <div class="modal" role="dialog" aria-labelledby="snmTitle" aria-modal="true">
      <button class="close" aria-label="Close" data-close>✕</button>
      <div id="snmForm">
        <h2 id="snmTitle">Start with RecallQ</h2>
        <p class="sub">Tell us about your practice. We'll run the numbers and get back to you within 24 hours.</p>
        <form id="snmFormEl" novalidate>
          <div><label>Your name</label><input name="name" required placeholder="First and last name" autocomplete="name"></div>
          <div><label>Work email</label><input name="email" type="email" required placeholder="you@yourpractice.com.au" autocomplete="email"></div>
          <div><label>Mobile</label><input name="mobile" type="tel" placeholder="+61 4XX XXX XXX" autocomplete="tel"></div>
          <div><label>Practice name</label><input name="practice" required placeholder="Your practice name"></div>
          <div>
            <label>Your vertical</label>
            <div class="vpicker" role="group" aria-label="Vertical">
              <button type="button" data-v="Dentistry">Dentistry</button>
              <button type="button" data-v="Physio">Physio</button>
              <button type="button" data-v="Optometry">Optometry</button>
            </div>
            <input type="hidden" name="vertical" id="snmVertical" value="">
          </div>
          <div><label>Active patients</label><select name="patients"><option>Under 500</option><option>500–1,500</option><option>1,500–3,000</option><option>3,000+</option></select></div>
          <div><label>Biggest recall problem (optional)</label><textarea name="problem" rows="2" placeholder="e.g. Hundreds of patients are overdue but we can't reach them all."></textarea></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Start now →</button>
          <p class="privacy-note">By submitting you agree to our <a href="${up}legal/privacy.html">Privacy Policy</a>. No spam, ever.</p>
        </form>
      </div>
      <div id="snmSuccess" class="success" style="display:none;">
        <div class="icon"><svg viewBox="0 0 24 24"><path d="M5 12.5 l4 4 L19 7"/></svg></div>
        <h3 id="snmThanks">Thanks. We've got it.</h3>
        <p>One of the founders will email you within 24 hours with a link to book a 15-minute call.</p>
        <a href="${up}how-it-works.html" class="btn btn--link">See how RecallQ works →</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal;
  const verticalHidden = modal.querySelector('#snmVertical');

  function openModal(preset) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    const preselect = preset || vPreset;
    if (preselect) selectVertical(preselect);
    setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 300);
  }
  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  function selectVertical(v) {
    verticalHidden.value = v;
    modal.querySelectorAll('.vpicker button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  }

  modal.querySelectorAll('.vpicker button').forEach(b => b.addEventListener('click', () => selectVertical(b.dataset.v)));
  modal.querySelector('[data-close]').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  modal.querySelector('#snmFormEl').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const first = (data.name || '').split(' ')[0] || '';
    document.getElementById('snmForm').style.display = 'none';
    const success = document.getElementById('snmSuccess');
    success.style.display = 'block';
    document.getElementById('snmThanks').textContent = `Thanks${first ? ', ' + first : ''}. We've got it.`;
  });

  // Bind all Start now triggers
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-start-now]');
    if (!t) return;
    e.preventDefault();
    openModal(t.dataset.vertical);
  });

  window.RQModal = { open: openModal, close: closeModal, selectVertical };

  /* LivingBackground removed — Apple-style restraint */
})();
