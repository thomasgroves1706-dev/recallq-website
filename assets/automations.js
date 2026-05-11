/* RecallQ — automations layer
   - ScrollProgressBar
   - CursorTrail (desktop)
   - MagneticButton (on .btn--primary.btn--lg)
   - TypewriterHeadline ([data-typewriter] w/ <span data-hl>…</span>)
   - ParticleHero ([data-particle-hero])
   - OdometerNumber ([data-odometer] w/ target number)
   - ExitIntentModal (once per session)
   - StickyROIBar (after ROI calc, reads #roiMonth)
   - VerticalAutoDetect (UTM/referrer → pulse home card + preset modal)
*/
(function(){
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = matchMedia('(pointer: fine)').matches && matchMedia('(min-width: 820px)').matches;

  /* ---------- CSS injection ---------- */
  function css(){
    if(document.getElementById('rqa-autom-css')) return;
    const s=document.createElement('style'); s.id='rqa-autom-css';
    s.textContent=`
    #rqa-sp{position:fixed;top:0;left:0;height:2px;background:#5876C4;width:0;z-index:100;transition:width .08s linear;}
    #rqa-ct-layer{position:fixed;inset:0;pointer-events:none;z-index:9999;}
    .rqa-ct-dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#8AA8E8;transform:translate(-50%,-50%);transition:opacity .25s linear,transform .25s linear;}
    [data-magnetic]{transition:transform .25s cubic-bezier(.22,1,.36,1);will-change:transform;}
    [data-particle-hero]{position:relative;}
    [data-particle-hero] > .rqa-ph-canvas{position:absolute;inset:0;z-index:0;pointer-events:none;}
    [data-particle-hero] > .container{position:relative;z-index:1;}
    .rqa-tw-cursor{display:inline-block;width:2px;height:.9em;background:#2A2823;margin-left:2px;vertical-align:baseline;animation:rqaTW 1s step-start infinite;}
    @keyframes rqaTW{50%{opacity:0;}}
    .rqa-sticky-roi{position:fixed;left:0;right:0;bottom:0;background:#2A2823;color:#FAF7F2;padding:12px 20px;z-index:70;display:flex;align-items:center;justify-content:center;gap:18px;font-size:14px;transform:translateY(100%);transition:transform .4s cubic-bezier(.22,1,.36,1);box-shadow:0 -4px 20px rgba(0,0,0,.2);}
    .rqa-sticky-roi.in{transform:none;}
    .rqa-sticky-roi strong{color:#8AA8E8;font-weight:500;}
    .rqa-sticky-roi a{color:#8AA8E8;text-decoration:none;font-weight:500;}
    .rqa-sticky-roi button.rqa-dismiss{background:none;border:0;color:#7A7870;cursor:pointer;font-size:18px;margin-left:8px;}
    .rqa-vd-pulse{animation:rqaVDPulse 1.6s cubic-bezier(.22,1,.36,1) 1;}
    @keyframes rqaVDPulse{0%{box-shadow:0 0 0 0 rgba(88,118,196,0);transform:scale(1);}40%{box-shadow:0 0 0 14px rgba(88,118,196,.18);transform:scale(1.03);}100%{box-shadow:0 0 0 0 rgba(88,118,196,0);transform:scale(1);}}
    @media (prefers-reduced-motion: reduce){#rqa-ct-layer{display:none;}.rqa-tw-cursor{animation:none;}}
    @media (max-width:820px){.rqa-sticky-roi{font-size:13px;padding:10px 14px;gap:10px;flex-wrap:wrap;}#rqa-ct-layer{display:none;}}
    `;
    document.head.appendChild(s);
  }

  /* ---------- ScrollProgressBar ---------- */
  function scrollBar(){
    const b=document.createElement('div'); b.id='rqa-sp'; document.body.appendChild(b);
    function upd(){
      const h=document.documentElement.scrollHeight-innerHeight;
      b.style.width=h>0?(scrollY/h*100)+'%':'0';
    }
    addEventListener('scroll',upd,{passive:true}); upd();
  }

  /* ---------- CursorTrail ---------- */
  function cursorTrail(){
    if(!isDesktop||reduced) return;
    const layer=document.createElement('div'); layer.id='rqa-ct-layer'; document.body.appendChild(layer);
    const N=5; const dots=[];
    for(let i=0;i<N;i++){const d=document.createElement('div'); d.className='rqa-ct-dot'; d.style.opacity=(0.6*(1-i/N)).toFixed(2); layer.appendChild(d); dots.push({el:d,x:0,y:0});}
    let mx=-100,my=-100;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});
    function tick(){
      let px=mx,py=my;
      dots.forEach((d,i)=>{
        d.x+=(px-d.x)*0.28;
        d.y+=(py-d.y)*0.28;
        d.el.style.left=d.x+'px'; d.el.style.top=d.y+'px';
        px=d.x; py=d.y;
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- MagneticButton ---------- */
  function magnetic(){
    if(!isDesktop||reduced) return;
    document.querySelectorAll('.btn--primary.btn--lg').forEach(btn=>{
      if(btn.dataset.magnetic) return; btn.dataset.magnetic='1';
      btn.addEventListener('mousemove',e=>{
        const r=btn.getBoundingClientRect();
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const dx=e.clientX-cx, dy=e.clientY-cy;
        const dist=Math.hypot(dx,dy);
        if(dist<80){
          const f=Math.min(12/Math.max(dist,1),0.25);
          btn.style.transform=`translate(${dx*f}px, ${dy*f}px)`;
        }
      });
      btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
    });
  }

  /* ---------- TypewriterHeadline ---------- */
  function typewriter(){
    const el=document.querySelector('[data-typewriter]'); if(!el) return;
    if(reduced){el.dataset.tw='1';return;}
    // Tokenise original nodes: text -> char stream, preserve <span data-hl>
    const segments=[];
    el.childNodes.forEach(n=>{
      if(n.nodeType===3){ segments.push({t:n.nodeValue,hl:false}); }
      else if(n.nodeType===1 && n.hasAttribute('data-hl')){ segments.push({t:n.textContent,hl:true}); }
      else { segments.push({t:n.textContent,hl:false}); }
    });
    el.innerHTML='';
    const cur=document.createElement('span'); cur.className='rqa-tw-cursor'; el.appendChild(cur);
    let si=0,ci=0;
    function step(){
      if(si>=segments.length){ setTimeout(()=>{cur.style.transition='opacity .5s';cur.style.opacity='0';},1200); return; }
      const seg=segments[si];
      if(ci>=seg.t.length){ si++; ci=0; setTimeout(step,0); return; }
      const ch=document.createTextNode(seg.t[ci]);
      if(seg.hl){ const w=document.createElement('span'); w.style.color='#5876C4'; w.appendChild(ch); el.insertBefore(w,cur); }
      else { el.insertBefore(ch,cur); }
      ci++;
      setTimeout(step,38);
    }
    setTimeout(step,350);
  }

  /* ---------- ParticleHero ---------- */
  function particles(){
    if(reduced) return;
    const host=document.querySelector('[data-particle-hero]'); if(!host) return;
    const c=document.createElement('canvas'); c.className='rqa-ph-canvas'; host.appendChild(c);
    const ctx=c.getContext('2d');
    let w=0,h=0,P=[];
    function resize(){ w=c.width=host.offsetWidth; h=c.height=host.offsetHeight; }
    function init(){
      P=[];
      for(let i=0;i<40;i++) P.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.6,vy:(Math.random()-0.5)*0.6});
    }
    resize(); init(); addEventListener('resize',()=>{resize();init();});
    function tick(){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='rgba(138,168,232,0.18)';
      P.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>w) p.vx*=-1;
        if(p.y<0||p.y>h) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- OdometerNumber ---------- */
  function odometer(){
    document.querySelectorAll('[data-odometer]').forEach(el=>{
      const target=parseFloat(el.dataset.odometer)||0;
      const prefix=el.dataset.prefix||'';
      const obs=new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting){ run(); obs.unobserve(el); } });
      },{rootMargin:'-40px'});
      obs.observe(el);
      function run(){
        if(reduced){ el.textContent=prefix+Math.round(target).toLocaleString(); return; }
        const start=performance.now(), dur=1400;
        function frame(now){
          const t=Math.min((now-start)/dur,1);
          const eased=1-Math.pow(1-t,3);
          el.textContent=prefix+Math.round(target*eased).toLocaleString();
          if(t<1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
    });
  }

  /* ---------- ExitIntentModal ---------- */
  function exitIntent(){
    if(sessionStorage.getItem('rqa-exit')) return;
    function onMove(e){
      if(e.clientY<20){ trigger(); document.removeEventListener('mouseout',onMove); }
    }
    document.addEventListener('mouseout',onMove);
    function trigger(){
      sessionStorage.setItem('rqa-exit','1');
      const btn=document.querySelector('[data-start-now]');
      if(btn) btn.click();
    }
  }

  /* ---------- StickyROIBar ---------- */
  function stickyROI(){
    const roi=document.getElementById('roiMonth'); if(!roi) return;
    if(sessionStorage.getItem('rqa-sroi-dismissed')) return;
    const bar=document.createElement('div'); bar.className='rqa-sticky-roi';
    bar.innerHTML=`<span>Your estimated recovery:</span><strong id="rqa-sroi-amt">$0</strong><span>/month</span><a href="#" data-start-now>Start now →</a><button class="rqa-dismiss" aria-label="Dismiss">×</button>`;
    document.body.appendChild(bar);
    const amt=bar.querySelector('#rqa-sroi-amt');
    function sync(){ amt.textContent=roi.textContent; }
    new MutationObserver(sync).observe(roi,{childList:true,characterData:true,subtree:true});
    sync();
    bar.querySelector('.rqa-dismiss').addEventListener('click',()=>{
      bar.classList.remove('in');
      sessionStorage.setItem('rqa-sroi-dismissed','1');
      setTimeout(()=>bar.remove(),400);
    });
    const roiSection=roi.closest('section');
    const footerish=document.querySelector('.cta-band')||document.querySelector('footer');
    let past=false,nearEnd=false;
    const o1=new IntersectionObserver(es=>{ past=!es[0].isIntersecting && es[0].boundingClientRect.top<0; render(); },{threshold:0.1});
    if(roiSection) o1.observe(roiSection);
    const o2=new IntersectionObserver(es=>{ nearEnd=es[0].isIntersecting; render(); },{threshold:0.05});
    if(footerish) o2.observe(footerish);
    function render(){
      if(past && !nearEnd) bar.classList.add('in');
      else bar.classList.remove('in');
    }
  }

  /* ---------- VerticalAutoDetect ---------- */
  function verticalDetect(){
    const q=new URLSearchParams(location.search);
    let v=q.get('vertical')||'';
    if(!v){
      const ref=(document.referrer||'').toLowerCase();
      if(/dent/.test(ref)) v='dentistry';
      else if(/physio/.test(ref)) v='physio';
      else if(/optom/.test(ref)) v='optometry';
    }
    if(!v) return;
    v=v.toLowerCase();
    sessionStorage.setItem('rqa-vertical',v);
    // Pulse matching home card
    const map={dentistry:'a[href$="dentistry.html"]',physio:'a[href$="physio.html"]',optometry:'a[href$="optometry.html"]'};
    const sel=map[v]; if(sel){
      const link=document.querySelector(sel);
      const card=link && link.closest('.vcard');
      if(card) setTimeout(()=>card.classList.add('rqa-vd-pulse'),800);
    }
    // Hero eyebrow
    const eye=document.querySelector('.hero .eyebrow');
    if(eye) eye.textContent=`BUILT FOR ${v.toUpperCase()} PRACTICES`;
  }

  /* ---------- BOOT ---------- */
  function boot(){
    css();
    scrollBar();
    cursorTrail();
    magnetic();
    typewriter();
    particles();
    odometer();
    stickyROI();
    exitIntent();
    verticalDetect();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
