/* RecallQ Ad — self-contained 13s loop, IntersectionObserver-paused */
(function () {
  function mount(root) {
    root.innerHTML = `
      <div class="stage">
        <div class="act act1">
          <span class="ey">THE RECALL GAP</span>
          <h3>Your patients are <span style="color:#5876C4">overdue</span>.</h3>
          <div class="grid-dots" id="rqaDots"></div>
          <p class="sub">Your software tracks them. It doesn't bring them back.</p>
        </div>
        <div class="act act2">
          <span class="ey">THE FIX</span>
          <h3>AI brings them back — automatically.</h3>
          <div class="act2-row">
            <div class="bubbles">
              <div class="bubble" style="border-left-color:#5C5A54">Hi Sarah, it's been 6 months since your last clean. Reply YES to book a time.</div>
              <div class="reply" style="background:#5C5A54">YES</div>
              <div class="bubble" style="border-left-color:#7A6A5C">Hi Tom, 3 weeks since your last session — how's the shoulder? Reply YES to book a review.</div>
              <div class="reply" style="background:#7A6A5C">YES</div>
              <div class="bubble" style="border-left-color:#5A6470">Hi Linh, your last eye exam was 23 months ago. Your rebate resets in 4 weeks — reply YES.</div>
              <div class="reply" style="background:#5A6470">YES</div>
            </div>
            <div class="vtags">
              <div class="vtag" data-v="0"><span class="vdot" style="background:#5C5A54"></span>DentistryIQ</div>
              <div class="vtag" data-v="1"><span class="vdot" style="background:#7A6A5C"></span>PhysioIQ</div>
              <div class="vtag" data-v="2"><span class="vdot" style="background:#5A6470"></span>OptometryIQ</div>
            </div>
          </div>
        </div>
        <div class="act act3">
          <span class="ey">THE RESULT</span>
          <div class="money" id="rqaMoney">$0</div>
          <p class="subline">Recovered this month — from patients you'd already earned.</p>
          <div class="closeblk">
            <div class="wm">Recall<span class="q">Q</span></div>
            <button class="btn btn--primary" data-start-now>Start now</button>
            <div class="tag">recallq.com.au · Made in Australia</div>
          </div>
        </div>
        <div class="progress" id="rqaProg"></div>
      </div>
    `;

    // Build dot grid
    const grid = root.querySelector('#rqaDots');
    const total = 120;
    for (let i = 0; i < total; i++) grid.appendChild(document.createElement('span'));

    const act1 = root.querySelector('.act1');
    const act2 = root.querySelector('.act2');
    const act3 = root.querySelector('.act3');
    const bubbles = act2.querySelectorAll('.bubble');
    const replies = act2.querySelectorAll('.reply');
    const vtags = act2.querySelectorAll('.vtag');
    const money = root.querySelector('#rqaMoney');
    const prog = root.querySelector('#rqaProg');
    const dots = grid.querySelectorAll('span');

    let timers = [];
    let running = false;
    let progStart = 0;
    let progRaf;

    function clearAll() {
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(progRaf);
      [act1, act2, act3].forEach(a => a.classList.remove('on'));
      dots.forEach(d => d.classList.remove('hi'));
      bubbles.forEach(b => b.classList.remove('on'));
      replies.forEach(r => r.classList.remove('on'));
      vtags.forEach(v => v.classList.remove('on'));
      money.textContent = '$0';
      prog.style.width = '0%';
    }

    function animateMoney(target, dur) {
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        money.textContent = '$' + Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function tick(now) {
      const elapsed = now - progStart;
      const pct = Math.min(elapsed / 13000, 1) * 100;
      prog.style.width = pct + '%';
      if (pct < 100 && running) progRaf = requestAnimationFrame(tick);
    }

    function play() {
      if (running) return;
      running = true;
      clearAll();
      progStart = performance.now();
      progRaf = requestAnimationFrame(tick);

      // ACT 1: 0 - 4s
      timers.push(setTimeout(() => act1.classList.add('on'), 100));
      // Light up ~32 dots starting at 1000ms, 55ms apart
      const picks = [];
      while (picks.length < 32) {
        const idx = Math.floor(Math.random() * total);
        if (!picks.includes(idx)) picks.push(idx);
      }
      picks.forEach((idx, i) => timers.push(setTimeout(() => dots[idx].classList.add('hi'), 1000 + i * 55)));

      // Fade out act1 at 4400ms
      timers.push(setTimeout(() => act1.classList.remove('on'), 4400));

      // ACT 2: 5100 - 9500
      timers.push(setTimeout(() => act2.classList.add('on'), 5100));
      [0, 1, 2].forEach(i => {
        const base = 5100 + 800 + i * 750;
        timers.push(setTimeout(() => { bubbles[i * 2].classList.add('on'); }, base));
        timers.push(setTimeout(() => { replies[i].classList.add('on'); vtags[i].classList.add('on'); }, base + 430));
      });
      timers.push(setTimeout(() => act2.classList.remove('on'), 9600));

      // ACT 3: 10300 - 13000
      timers.push(setTimeout(() => {
        act3.classList.add('on');
        animateMoney(3200, 1700);
      }, 10300));

      // Loop
      timers.push(setTimeout(() => {
        running = false;
        play();
      }, 13000 + 2600));
    }

    function stop() {
      running = false;
      clearAll();
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.intersectionRatio >= 0.5) play();
        else stop();
      });
    }, { threshold: [0, 0.5] });
    io.observe(root);
  }

  document.querySelectorAll('[data-recallq-ad]').forEach(mount);
})();
