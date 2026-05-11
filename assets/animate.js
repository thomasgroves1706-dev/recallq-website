/* RecallQ — animation helpers (vanilla, framer-motion-free) */
(function () {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        // Force reflow so the transition starts from the pre-class initial state,
        // avoiding a stuck "pending" transition in backgrounded/iframed load.
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('in');
        // per-child delays for staggered containers
        if (el.hasAttribute('data-stagger')) {
          const kids = el.children;
          for (let i = 0; i < kids.length; i++) {
            kids[i].style.transitionDelay = prefersReduced ? '0s' : (0.1 + i * 0.12) + 's';
          }
        }
        // Fallback: finish stalled transitions after 900ms so opacity never sticks at 0.
        setTimeout(() => {
          const targets = el.hasAttribute('data-stagger') ? [el, ...el.children] : [el];
          targets.forEach(t => {
            if (t.getAnimations) {
              t.getAnimations().forEach(a => {
                if (a.playState === 'running' && a.startTime == null) { try { a.finish(); } catch(err){} }
              });
            }
          });
        }, 900);
        io.unobserve(el);
      }
    });
  }, { rootMargin: '-80px', threshold: 0.01 });

  function register(root = document) {
    root.querySelectorAll('[data-anim], [data-stagger]').forEach(el => {
      if (el.dataset.animOn) return;
      el.dataset.animOn = '1';
      io.observe(el);
    });
  }

  // Stagger on mount (hero): add 'hero-in' class which matches same rules
  function mountStagger(root) {
    const els = root.querySelectorAll('[data-mount]');
    els.forEach((el, i) => {
      el.style.transitionDelay = prefersReduced ? '0s' : (i * 0.1) + 's';
      requestAnimationFrame(() => el.classList.add('in'));
    });
    // Safety: finish any stuck transitions (happens in backgrounded/iframed loads)
    setTimeout(() => {
      els.forEach(el => {
        if (el.getAnimations) {
          el.getAnimations().forEach(a => {
            if (a.playState === 'running' && (a.currentTime === 0 || a.startTime == null)) {
              try { a.finish(); } catch (err) {}
            }
          });
        }
      });
    }, 1200);
  }

  function countUp(el, target, duration = 1800, prefix = '', suffix = '') {
    if (prefersReduced) {
      el.textContent = prefix + Math.round(target).toLocaleString() + suffix;
      return;
    }
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function observeCount(el, target, opts = {}) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          countUp(el, target, opts.duration, opts.prefix, opts.suffix);
          obs.unobserve(el);
        }
      });
    }, { rootMargin: '-40px' });
    obs.observe(el);
  }

  window.RQA = { register, mountStagger, countUp, observeCount, prefersReduced };

  function init() {
    register();
    document.querySelectorAll('[data-mount-stagger]').forEach(c => mountStagger(c));
    // Safety net: if for any reason transitions don't fire (background tab,
    // bundled blob-script timing, etc.), force-reveal everything after 1.5s
    // by disabling transitions and applying the end state directly.
    setTimeout(() => {
      document.querySelectorAll('[data-mount], [data-anim], [data-stagger]').forEach(el => {
        const op = parseFloat(getComputedStyle(el).opacity);
        if (op < 0.99) {
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.classList.add('in');
        }
      });
    }, 1500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Belt-and-braces: also run on window load in case DOMContentLoaded fired before this script.
  window.addEventListener('load', () => {
    if (!document.querySelector('[data-mount].in')) init();
  });
})();
