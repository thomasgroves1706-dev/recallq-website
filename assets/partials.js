/* RecallQ — header, footer
   Usage: <script src="assets/partials.js"
          data-active="home|dentistry|physio|optometry|how|pricing|about|legal"
          data-depth="0|1|2"></script>
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
        <a class="btn btn--primary" href="https://app.recallq.com.au/signup" aria-label="Recover patients now — create your RecallQ account">Recover patients</a>
        <button class="hamb" aria-label="Menu" id="hambBtn" aria-expanded="false"><span></span></button>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <ul>
          <li><a href="${up}dentistry.html"><span class="dot" style="background:#5C5A54;margin-right:8px;display:inline-block;"></span>DentistryIQ</a></li>
          <li><a href="${up}physio.html"><span class="dot" style="background:#7A6A5C;margin-right:8px;display:inline-block;"></span>PhysioIQ</a></li>
          <li><a href="${up}optometry.html"><span class="dot" style="background:#5A6470;margin-right:8px;display:inline-block;"></span>OptometryIQ</a></li>
          <li><a href="${up}how-it-works.html">How it works</a></li>
          <li><a href="${up}pricing.html">Pricing</a></li>
          <li><a href="${up}about.html">About</a></li>
          <li><a href="https://app.recallq.com.au/signup" style="color:var(--periwinkle-dark);font-weight:500;">Recover patients now →</a></li>
        </ul>
      </div>
    </header>
  `;
  document.body.insertBefore(hdr.firstElementChild, document.body.firstChild);

  // Wire aria-expanded on Solutions dropdown — reflects open state to screen readers
  (function(){
    var _dd = document.querySelector('.nav-dd');
    var _ddBtn = _dd && _dd.querySelector('button[aria-haspopup]');
    if (_dd && _ddBtn) {
      _dd.addEventListener('mouseenter', function(){ _ddBtn.setAttribute('aria-expanded','true'); });
      _dd.addEventListener('mouseleave', function(){ _ddBtn.setAttribute('aria-expanded','false'); });
      _dd.addEventListener('focusin',    function(){ _ddBtn.setAttribute('aria-expanded','true'); });
      _dd.addEventListener('focusout',   function(){ _ddBtn.setAttribute('aria-expanded','false'); });
    }
  })();

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
    var _mm = document.getElementById('mobileMenu');
    _mm.classList.toggle('open');
    var _hb = document.getElementById('hambBtn');
    if (_hb) _hb.setAttribute('aria-expanded', _mm.classList.contains('open') ? 'true' : 'false');
  });

  // Active nav state
  if (active) {
    var _fileMap = { home: 'index.html', how: 'how-it-works.html', pricing: 'pricing.html', about: 'about.html', dentistry: 'dentistry.html', physio: 'physio.html', optometry: 'optometry.html' };
    var _target = _fileMap[active];
    if (_target) {
      var _link = document.getElementById('siteHeader') && document.getElementById('siteHeader').querySelector('a[href$="' + _target + '"]');
      if (_link) _link.classList.add('is-active');
    }
  }

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
            <li><a href="https://app.recallq.com.au/signup">Recover patients now →</a></li>
          </ul>
        </div>
        <div>
          <h4>Company &amp; Legal</h4>
          <ul>
            <li><a href="${up}about.html">About</a></li>
            <li><a href="mailto:recallq@gmail.com">Contact</a></li>
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
      <div class="copy">© RecallQ Pty Ltd ABN 84 202 664 713 · recallq.com.au · Made in Australia</div>
    </div>
  `;
  document.body.appendChild(footer);

  // Wrap trailing → in .btn CTAs for arrow nudge animation
  document.querySelectorAll('a.btn, button.btn').forEach(function(b){
    if (/→\s*$/.test(b.textContent) && !b.querySelector('.cta-arrow')) {
      b.innerHTML = b.innerHTML.replace(/→(\s*)$/, '<span class="cta-arrow">→</span>$1');
    }
  });

  // Wire aria-label on portal signup CTAs — disambiguates repeated labels for screen readers
  document.querySelectorAll('a.btn[href*="app.recallq.com.au/signup"]').forEach(function(a){
    if (!a.getAttribute('aria-label')) {
      a.setAttribute('aria-label', 'Recover patients now — create your RecallQ account');
    }
  });

  /* LivingBackground removed — Apple-style restraint */
})();
