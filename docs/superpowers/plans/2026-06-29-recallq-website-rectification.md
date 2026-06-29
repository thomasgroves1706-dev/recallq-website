# RecallQ Website Rectification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the RecallQ marketing site clean, professional, and high-converting end-to-end into the live portal sign-up, with every interaction wired correctly and no fabricated/misleading content.

**Architecture:** Static HTML/CSS/JS, all inlined per page, no build step. Shared header/footer/modal/nav + base CSS are copy-pasted **byte-identically** into all 11 pages (MD5-verified), so shared fixes are applied by exact-string find/replace across all files; page-unique content is edited per file. Approach A (scripted in-place) — no re-architecture. Spec: `docs/superpowers/specs/2026-06-29-recallq-website-rectification-design.md`.

**Tech Stack:** Plain HTML/CSS/JS; deployed to Vercel (auto-deploy on push to `main`). Verification via local static server (`python3 -m http.server 8799`, already running) + headless Chrome (chrome-devtools MCP, already running). No unit-test runner — **each task verifies with grep assertions + live browser checks, then commits.**

## Global Constraints

- AU English spelling in all copy.
- Portal URL (verbatim): `https://app.recallq.com.au/signup`
- Primary CTA copy (verbatim): `Recover patients now →` (full); compact header variant: `Recover patients`
- Reassurance microcopy (verbatim): `No credit card · Cancel anytime · Live in 20 minutes`
- Footer contact email: `recallq@gmail.com`
- ABN (verbatim): `84 202 664 713`
- Annual pricing discount: **1.5 months free** (≈12.5%); annual price = monthly × 10.5.
- Featured pricing plan: **Pro ($2,000)** = "Most popular".
- Token map: `--periwinkle: #5876C4;` `--periwinkle-dark: #3F5BA8;` `--text-primary: #1A1915;` `--text-muted: #6E6C66;`
- All new motion guarded by `prefers-reduced-motion`; cursor effects guarded by `(pointer: fine)` + desktop width.
- The 11 pages: `index.html`, `how-it-works.html`, `pricing.html`, `about.html`, `dentistry.html`, `physio.html`, `optometry.html`, `legal/index.html`, `legal/privacy.html`, `legal/terms.html`, `legal/dpa.html`. Billing chrome lives in `assets/partials.js` (consumed by `billing/success/index.html` + `billing/cancel/index.html`).
- Each task ends by re-checking the browser console is **error-free** (favicon 404 allowed until Task 15).
- Commit after every task. Work stays on branch `feat/website-rectification`. Do not push until Task 17 sign-off.

---

## Phase 0 — Safety

### Task 0: Full backup before any change

**Files:** none modified.

- [ ] **Step 1:** Create a timestamped backup zip of the entire site outside the repo.

```bash
cd /Users/elcapitan/code/recallq-website
zip -r ~/Downloads/recallq-website-backup-prerectification-20260629.zip . -x '.git/*' -x '.audit-shots/*'
```

- [ ] **Step 2:** Verify the archive exists and lists the 11 pages.

```bash
unzip -l ~/Downloads/recallq-website-backup-prerectification-20260629.zip | grep -E 'index.html|pricing.html|legal/privacy.html' 
```
Expected: all three listed.

- [ ] **Step 3:** Confirm clean git state on the feature branch.

```bash
git status --short && git branch --show-current
```
Expected: only untracked `.vercel/` / `.audit-shots/`; branch `feat/website-rectification`.

---

## Phase 1 — Funnel wiring & integrity

### Task 1: Repoint shared CTAs to the portal; remove the fake modal (all 11 pages)

**Files:** Modify all 11 pages (shared inlined block, byte-identical).

**Interfaces:**
- Produces: a global `RQ_PORTAL` constant `"https://app.recallq.com.au/signup"` available in the shared block; header/footer/mobile CTAs become `<a>` anchors to the portal; the `startNowModal` markup, its handlers, `selectVertical`, and `window.RQModal` are deleted.

- [ ] **Step 1:** In the shared block of `index.html`, replace the three shared CTA buttons with portal anchors. Find/replace these exact strings (each occurs once per page, identical across all 11):

Header button → anchor:
```
FIND:    <button class="btn btn--primary" data-start-now>Start now</button>
REPLACE: <a class="btn btn--primary" href="${up}index.html" data-portal>Recover patients</a>
```
(Note: `${up}` is the existing depth prefix var in the block; the real href is patched to the portal in Step 2 via the `data-portal` hook so the link is absolute. If simpler, write the literal `https://app.recallq.com.au/signup` directly and drop `data-portal`.)

Mobile menu button → anchor:
```
FIND:    <li><button data-start-now style="color:var(--periwinkle-dark);font-weight:500;">Start now →</button></li>
REPLACE: <li><a href="https://app.recallq.com.au/signup" style="color:var(--periwinkle-dark);font-weight:500;">Recover patients now →</a></li>
```

Footer button → anchor:
```
FIND:    <li><button data-start-now>Start now</button></li>
REPLACE: <li><a href="https://app.recallq.com.au/signup">Recover patients now →</a></li>
```

- [ ] **Step 2:** In the shared block, delete the modal: the entire `const modal = document.createElement('div'); … document.body.appendChild(modal);` markup, plus `openModal`/`closeModal`/`selectVertical`, the `modal.querySelectorAll(...)`/`backdrop`/`keydown` bindings, the `#snmFormEl` submit handler, the delegated `data-start-now` open handler, and `window.RQModal = {...}`. Leave the header/footer/nav builder and the iframe-nav guard intact.

- [ ] **Step 3:** Apply the identical Step 1–2 edits to the other 10 pages. Because the block is byte-identical, use a script:

```bash
cd /Users/elcapitan/code/recallq-website
python3 - <<'PY'
import re, pathlib
pages = ["index.html","how-it-works.html","pricing.html","about.html","dentistry.html",
         "physio.html","optometry.html","legal/index.html","legal/privacy.html",
         "legal/terms.html","legal/dpa.html"]
HDR_FIND='<button class="btn btn--primary" data-start-now>Start now</button>'
HDR_REPL='<a class="btn btn--primary" href="https://app.recallq.com.au/signup">Recover patients</a>'
MOB_FIND='<li><button data-start-now style="color:var(--periwinkle-dark);font-weight:500;">Start now →</button></li>'
MOB_REPL='<li><a href="https://app.recallq.com.au/signup" style="color:var(--periwinkle-dark);font-weight:500;">Recover patients now →</a></li>'
FT_FIND='<li><button data-start-now>Start now</button></li>'
FT_REPL='<li><a href="https://app.recallq.com.au/signup">Recover patients now →</a></li>'
for p in pages:
    t=pathlib.Path(p).read_text()
    for f,r in [(HDR_FIND,HDR_REPL),(MOB_FIND,MOB_REPL),(FT_FIND,FT_REPL)]:
        assert t.count(f)==1, f"{p}: expected 1 of {f!r}, got {t.count(f)}"
        t=t.replace(f,r)
    pathlib.Path(p).write_text(t)
    print("patched", p)
PY
```
(Modal-deletion in Step 2 is best done by editing the canonical block once, then replacing the byte-identical block across all 11 with a second script that swaps the full old block body for the new one. Verify with the MD5 approach from the audit.)

- [ ] **Step 4:** Grep-verify the modal is gone and shared anchors exist.

```bash
grep -rl "startNowModal" *.html legal/*.html ; echo "--- (expect: no output) ---"
grep -rc 'href="https://app.recallq.com.au/signup"' *.html legal/*.html
```
Expected: first command prints nothing; second shows ≥3 per page.

- [ ] **Step 5:** Browser check. Reload home; click the header CTA; confirm it navigates to the portal URL (network request to `app.recallq.com.au/signup`), no modal appears, console error-free.

```
navigate http://localhost:8799/index.html ; click header CTA ; list_network_requests
```

- [ ] **Step 6:** Commit.
```bash
git add -A && git commit -m "feat(funnel): repoint shared CTAs to portal, remove fake modal"
```

### Task 2: Convert page-body CTAs to portal anchors + repoint ROI CTAs (per page)

**Files:** Modify `index.html`, `how-it-works.html`, `pricing.html`, `about.html`, `dentistry.html`, `physio.html`, `optometry.html` (page bodies).

**Interfaces:**
- Consumes: portal URL from Global Constraints.
- Produces: every body `data-start-now` is either a portal anchor (default) or a `#roi-calc` anchor (the three "run this on my patient list / recall audit" curiosity CTAs). After this task, `grep -rc 'data-start-now'` over page bodies returns 0.

- [ ] **Step 1:** In `index.html`, convert the portal-bound body buttons. Exact replacements:
```
FIND:    <button class="btn btn--primary btn--lg" data-start-now>Start now</button>
REPLACE: <a class="btn btn--primary btn--lg" href="https://app.recallq.com.au/signup">Recover patients now →</a>
```
(occurs at the hero, partnership panel, pricing teaser — 3×; replace all)
```
FIND:    <button class="btn btn--invert btn--lg" data-start-now>Start now</button>
REPLACE: <a class="btn btn--invert btn--lg" href="https://app.recallq.com.au/signup">Recover patients now →</a>
```

- [ ] **Step 2:** In `index.html`, repoint the curiosity CTA at the recall-audit section to the calculator:
```
FIND:    <button class="btn btn--primary btn--lg" data-start-now>Run this on my patient list</button>
REPLACE: <a class="btn btn--primary btn--lg" href="#roi-calc">Run this on my patient list →</a>
```
(The hero `href="#roi-calc"` link at line ~1731 and the final-band `href="#roi-calc"` at ~2183 already point correctly — leave them; the calculator they target is built in Task 3.)

- [ ] **Step 3:** In each vertical page (`dentistry/physio/optometry.html`), convert body `data-start-now` buttons to portal anchors **with vertical UTM params**, e.g. for dentistry:
```
href="https://app.recallq.com.au/signup?vertical=dentistry&utm_source=site&utm_campaign=dentistry"
```
Use `physio`/`optometry` respectively. Keep the existing button classes (`btn--primary btn--lg`, dark-section variants). Read each file to get the exact button strings (they include `data-vertical="Dentistry"` etc. — drop that attribute).

- [ ] **Step 4:** In `how-it-works.html`, `pricing.html`, `about.html`, convert remaining body `data-start-now` to portal anchors (pricing card CTAs are handled in Task 9 — leave the three card buttons for now, only convert the final-band button here).

- [ ] **Step 5:** Grep-verify no body `data-start-now` remains except the three pricing cards.
```bash
grep -rn "data-start-now" *.html legal/*.html
```
Expected: only the 3 pricing-card buttons in `pricing.html` (resolved in Task 9), nothing else.

- [ ] **Step 6:** Browser check each converted CTA navigates to the portal (or scrolls to `#roi-calc`). Console error-free.

- [ ] **Step 7:** Commit.
```bash
git add -A && git commit -m "feat(funnel): convert page-body CTAs to portal anchors; repoint ROI CTAs"
```

### Task 3: Build the interactive ROI calculator (index.html)

**Files:** Modify `index.html` (the `#roi-calc` section at ~line 1769; CSS classes `.roi-calc/.roi-inputs/.roi-segment/.roi-slider-wrap/.roi-out` and the `roiCalc()` JS already exist and are correct).

**Interfaces:**
- Consumes: existing `roiCalc()` which queries `[data-roi]`, `[data-roi-vertical] button` (with `data-v` ∈ {dental,physio,opto}), `[data-roi-patients]`, `[data-roi-value]` (range inputs), and output hooks `[data-roi-patients-out] [data-roi-value-out] [data-roi-monthly] [data-roi-bookings] [data-roi-annual] [data-roi-cost] [data-roi-net]`.
- Produces: a working calculator inside `#roi-calc`.

- [ ] **Step 1:** Inside the `<section … id="roi-calc">`, add the calculator markup using the existing classes/hooks (keep the existing static value cards above it as illustrative context, or replace — implementer's call after visual check). Markup:

```html
<div class="roi-calc" data-roi data-anim="fade-up">
  <div class="roi-inputs">
    <div class="roi-segment" data-roi-vertical role="group" aria-label="Practice type">
      <button type="button" data-v="dental" class="on">Dental</button>
      <button type="button" data-v="physio">Physio</button>
      <button type="button" data-v="opto">Optometry</button>
    </div>
    <div class="roi-slider-wrap">
      <label for="roiPatients">Active patients: <span class="slider-val" data-roi-patients-out>1,500</span></label>
      <input id="roiPatients" type="range" min="200" max="6000" step="100" value="1500" data-roi-patients>
    </div>
    <div class="roi-slider-wrap">
      <label for="roiValue">Average visit value: <span class="slider-val" data-roi-value-out>$200</span></label>
      <input id="roiValue" type="range" min="80" max="600" step="10" value="200" data-roi-value>
    </div>
  </div>
  <div class="roi-output">
    <div class="roi-out">
      <div class="box"><div class="n" data-roi-bookings>0</div><div class="l">Bookings / month</div></div>
      <div class="box"><div class="n" data-roi-monthly>$0</div><div class="l">Recovered / month</div></div>
      <div class="box"><div class="n" data-roi-annual>$0</div><div class="l">Recovered / year</div></div>
    </div>
    <p class="fine" style="margin-top:16px;">Illustrative estimate based on typical overdue and re-booking rates. Your results will vary.</p>
  </div>
</div>
```
(The `[data-roi-cost]`/`[data-roi-net]` hooks are optional — `roiCalc()` guards them with `if`.)

- [ ] **Step 2:** Confirm `roiCalc()` is called in `boot()` (it is, line ~3141). No JS change needed.

- [ ] **Step 3:** Browser check: navigate to `#roi-calc`, drag the patients slider, confirm Bookings/Recovered/Annual update live; switch Dental→Physio→Optometry and confirm numbers change.
```
navigate http://localhost:8799/index.html#roi-calc
evaluate: set [data-roi-patients].value=4000; dispatch 'input'; read [data-roi-monthly].textContent  // expect a non-$0 value
```

- [ ] **Step 4:** Confirm the hero "Run this on my patient list →" and final-band "Run the recall audit →" scroll here.

- [ ] **Step 5:** Commit.
```bash
git add index.html && git commit -m "feat(roi): build interactive ROI calculator into #roi-calc"
```

### Task 4: Mid-page CTA on How-it-works + reassurance microcopy

**Files:** Modify `how-it-works.html`; touch `index.html`, vertical pages where a reassurance line belongs under the primary CTA.

- [ ] **Step 1:** In `how-it-works.html`, after the 6-step timeline (the step list ending ~line 690), insert a CTA block:
```html
<div class="text-center" style="margin-top:48px;">
  <a class="btn btn--primary btn--lg" href="https://app.recallq.com.au/signup">Recover patients now →</a>
  <p class="fine" style="margin-top:12px;">No credit card · Cancel anytime · Live in 20 minutes</p>
</div>
```

- [ ] **Step 2:** Under the hero primary CTA on `index.html` and each vertical page, add the reassurance line (if not already present): `<p class="fine">No credit card · Cancel anytime · Live in 20 minutes</p>`. Ensure exactly one primary CTA per viewport (demote duplicates to `btn--link` if needed after visual check).

- [ ] **Step 3:** Remove leaked internal copy: in `how-it-works.html` find `Calendly for MVP` and delete that phrase from the step-6 text.

```bash
grep -rn "Calendly for MVP" *.html ; echo "--- expect no output ---"
```

- [ ] **Step 4:** Browser check how-it-works: mid-page CTA visible after timeline, navigates to portal; reassurance line renders.

- [ ] **Step 5:** Commit.
```bash
git add -A && git commit -m "feat(funnel): mid-page CTA on how-it-works, reassurance microcopy, drop internal copy"
```

---

## Phase 2 — Trust & honesty

### Task 5: Reframe fabricated live stats as illustrative (index.html)

**Files:** Modify `index.html` (mosaic ~2090–2115; dashboard KPIs ~1880–1883).

- [ ] **Step 1:** Reword the mosaic eyebrow/headline. Replace:
```
FIND:    The numbers RecallQ is putting back into Australian practices right now.
REPLACE: What RecallQ can put back into a practice like yours.
```
And the eyebrow `Live this month` → `Illustrative — typical practice`.

- [ ] **Step 2:** Relabel the four mosaic figures from live-telemetry to illustrative/example, and remove the "across 32 practices" live claim. Change the big `$2,384,000` tile label `Total recovered · this month` → `Recovered / year (example 1,500-patient practice)` and reseed `data-drift="2384000"` to a defensible single-practice figure (e.g. the calculator's dental output ≈ `48600`). Relabel `Practices live` / `+5 this week` to remove counts presented as current customers. Keep the count-up animation (now of an example), or set static — implementer's call.

- [ ] **Step 3:** Dashboard KPIs (~1880–1883): keep the count-up but ensure the surrounding copy frames them as a product mockup ("Your dashboard"), not live customer totals. Adjust any "this week" deltas that imply real accounts.

- [ ] **Step 4:** Grep-verify no present-tense live claims remain.
```bash
grep -rn "right now\|practices live\|across 32 practices" index.html ; echo "--- review each remaining hit ---"
```

- [ ] **Step 5:** Browser check: the section reads as illustrative; no "$2.3M across 32 practices right now".

- [ ] **Step 6:** Commit.
```bash
git add index.html && git commit -m "fix(trust): reframe live stats as illustrative example, remove fabricated live telemetry"
```

### Task 6: Remove fabricated testimonials & fake activity toasts

**Files:** Modify `index.html` (testimonial wall); `dentistry.html`, `physio.html`, `optometry.html` (inline toast pool ~1085–1099).

- [ ] **Step 1:** Replace the invented patient-quote wall on `index.html` with honest framing — either remove the section or convert to a "Founding-practice program" panel (no fabricated names/quotes). Keep the section's visual shell; swap content.

- [ ] **Step 2:** On each vertical page, remove the fake live-activity toast block (named clinics/people "+$200 · just now"). Read the file, delete the toast array + its render/interval code in the inline script.

- [ ] **Step 3:** Grep-verify no fabricated names remain.
```bash
grep -rn "just now\|Rosehill\|Parkside\|Sarah A\.\|Sarah M\." *.html ; echo "--- expect no output ---"
```

- [ ] **Step 4:** Browser check verticals + home: no fake toasts pop; testimonial area honest.

- [ ] **Step 5:** Commit.
```bash
git add -A && git commit -m "fix(trust): remove fabricated testimonials and fake activity toasts"
```

### Task 7: Legal — ABN, APP 8 redraft, meta descriptions

**Files:** Modify `legal/privacy.html`, `legal/index.html`, `legal/terms.html`, `legal/dpa.html`.

- [ ] **Step 1:** Add ABN to each legal page footer/identity line: insert `ABN 84 202 664 713` alongside `© RecallQ Pty Ltd`.

- [ ] **Step 2:** In `legal/privacy.html`, redraft the overseas-transfer wording so it is accurate to the disclosed sub-processors. Replace the "Nothing is transferred outside Australia" claim with wording that states: personal information is **stored** in Australia (Supabase ap-southeast-2), and **disclosed to overseas service providers** for processing — Anthropic (USA, AI message generation), Resend (USA, email delivery), Sentry (EU, error monitoring) — under APP 8, with reasonable steps taken to ensure comparable protection. Cross-reference the sub-processor table on `legal/index.html`.

- [ ] **Step 3:** Add a `<meta name="description" …>` to all four legal pages (currently none). Examples: privacy → "RecallQ Privacy Policy — how we handle patient and practice data under the Australian Privacy Act 1988."; terms/dpa/index analogous.

- [ ] **Step 4:** Grep-verify.
```bash
grep -rL 'name="description"' legal/*.html ; echo "--- expect no output (all have description) ---"
grep -rn "84 202 664 713" legal/*.html | wc -l   # expect 4
```

- [ ] **Step 5:** Browser check privacy page renders redraft; flag in commit body that lawyer sign-off is still required.

- [ ] **Step 6:** Commit.
```bash
git add legal/ && git commit -m "fix(legal): add ABN, redraft APP 8 overseas-disclosure wording, add meta descriptions

Legal wording aligned to actual sub-processors; lawyer sign-off still recommended."
```

---

## Phase 3 — Visual / CSS correctness

### Task 8: Define the 4 missing :root tokens (all 11 pages)

**Files:** Modify all 11 pages (shared `:root`, byte-identical).

- [ ] **Step 1:** Insert the four tokens after the `--accent-soft` line (identical anchor on every page):
```bash
cd /Users/elcapitan/code/recallq-website
python3 - <<'PY'
import pathlib
pages=["index.html","how-it-works.html","pricing.html","about.html","dentistry.html",
       "physio.html","optometry.html","legal/index.html","legal/privacy.html",
       "legal/terms.html","legal/dpa.html"]
anchor="  --accent-soft:  #8AA8E8;"
add=("  --accent-soft:  #8AA8E8;\n"
     "  --periwinkle:      #5876C4;\n"
     "  --periwinkle-dark: #3F5BA8;\n"
     "  --text-primary:    #1A1915;\n"
     "  --text-muted:      #6E6C66;")
for p in pages:
    t=pathlib.Path(p).read_text()
    assert t.count(anchor)==1, f"{p}: anchor count {t.count(anchor)}"
    pathlib.Path(p).write_text(t.replace(anchor,add,1))
    print("tokens added", p)
PY
```

- [ ] **Step 2:** Grep-verify defined on every page.
```bash
grep -rc -- '--periwinkle-dark:' *.html legal/*.html   # expect 1 each
```

- [ ] **Step 3:** Browser check: dentistry/physio ROI money emphasis and legal-hub "Read →" links now render in accent blue (not flat dark).

- [ ] **Step 4:** Commit.
```bash
git add -A && git commit -m "fix(css): define missing periwinkle/text design tokens in :root"
```

### Task 9: Pricing — typo, Growth name, Pro featured, annual toggle, tier differentiation

**Files:** Modify `pricing.html` (cards + FAQ); `index.html` + verticals (price teaser `$ 1,799` typo).

- [ ] **Step 1:** Fix the `$ 1,799` → `$1,799` typo everywhere.
```bash
grep -rn '\$ 1,799' *.html
```
Replace `$ 1,799` with `$1,799` in `pricing.html`, `index.html`, `dentistry.html`, `physio.html`, `optometry.html`.

- [ ] **Step 2:** In `pricing.html`, name the middle plan **Growth** on its own card (add the plan name where the other cards show "Starter"/"Pro").

- [ ] **Step 3:** Move the featured treatment to **Pro ($2,000)**: give Pro the dark card + "Most popular" badge + subtle scale; return Growth and Starter to standard light cards. Keep ascending order Starter | Growth | Pro.

- [ ] **Step 4:** Make tier differences legible: rewrite the three feature lists as a progression — Starter (base), Growth = "Everything in Starter, plus …", Pro = "Everything in Growth, plus …" — and bold each tier's key differentiator (Starter: email-only/500; Growth: SMS+AI/2,000; Pro: WhatsApp + conversational booking agent/unlimited). Use the existing feature text from the current cards; do not invent features.

- [ ] **Step 5:** Add a monthly/annual toggle. Annual price = monthly × 10.5 (1.5 months free). Implement with a small inline script toggling displayed prices + a "Save 1.5 months" badge on annual. Each card: add `No credit card · Cancel anytime` line.

- [ ] **Step 6:** Convert the 3 pricing-card CTAs (the remaining `data-start-now`) to portal anchors `Recover patients now →`.

- [ ] **Step 7:** Rewrite the pricing FAQ self-serve answer (currently "Click Start now, fill the form, and we run a recall audit first") to describe self-serve: "Create your account, import a patient CSV, and you're live in ~20 minutes. No credit card to start."

- [ ] **Step 8:** Browser check at 1440 + 390: Pro is visually the hero card; toggle switches all three prices monthly↔annual; no `$ 1,799`; no `data-start-now` remains.
```bash
grep -rn "data-start-now" *.html ; echo "--- expect no output ---"
```

- [ ] **Step 9:** Commit.
```bash
git add -A && git commit -m "feat(pricing): Pro featured, name Growth, annual toggle, legible tier differentiation, fix typo"
```

### Task 10: Site-wide info-card cleanup pass

**Files:** Modify `index.html` (home cards), `dentistry/physio/optometry.html` (ROI/example cards), `legal/index.html` (doc cards), shared card CSS.

- [ ] **Step 1:** Audit card components in the browser (home value cards, "how the audit works" cards, vertical example cards, legal doc cards). Normalise: consistent internal padding (use the 8pt scale), heading→caption spacing, caption colour `var(--text-muted)` (now defined), border/radius/elevation consistency, and a uniform hover (lift + shadow) — guarded `@media (hover: hover)`.

- [ ] **Step 2:** Ensure card grids have a 2-col intermediate at tablet (≈768–900px) rather than jumping 3→1; reduce excessive `min-height` on mobile.

- [ ] **Step 3:** Browser check at 1440 / 768 / 390: cards aligned, captions muted-grey, hover consistent, no sticky hover on mobile.

- [ ] **Step 4:** Commit.
```bash
git add -A && git commit -m "fix(ui): consistent info-card cleanup pass (spacing, captions, borders, hover, responsive)"
```

### Task 11: CSS polish — hero--short, animation timing, tile hover, active nav

**Files:** Modify shared CSS (all 11) + `index.html` page CSS.

- [ ] **Step 1:** Define `.hero--short` to reduce hero top/bottom padding (kills the pricing void). Add near the `.hero` rule:
```css
.hero--short { padding-top: clamp(64px, 8vw, 110px); padding-bottom: clamp(32px, 4vw, 56px); }
```

- [ ] **Step 2:** Reduce scroll-reveal durations: `.9s`→`.45s`, `.8s`→`.4s` on the `data-anim`/`data-stagger`/`[data-mount]` transitions (lines ~112–117, 617). Scripted exact replace of `transition: opacity .9s var(--ease), transform .9s var(--ease)` → `.45s` variants, and `.8s` → `.4s` variants.

- [ ] **Step 3:** Guard sticky hover: wrap `.tile:hover { transform: translateY(-6px) … }` (and similar card hovers) in `@media (hover: hover) { … }`.

- [ ] **Step 4:** Active nav state: in the shared block, after building nav, add the active class to the link matching `data-active` (e.g. `nav a[href$="pricing.html"]` when `active==='pricing'`); add a `.nav a.is-active { color: var(--ink); font-weight: 600; }` rule.

- [ ] **Step 5:** Browser check: pricing hero void gone; reveals feel snappier; no stuck hover on mobile tap; current page highlighted in nav.

- [ ] **Step 6:** Commit.
```bash
git add -A && git commit -m "fix(css): define hero--short, faster reveals, guard mobile hover, active nav state"
```

### Task 12: Button animation — lift + arrow + press, magnetic + sheen on hero

**Files:** Modify shared CSS (all 11) + `index.html` JS (magnetic + sheen for hero primary).

- [ ] **Step 1:** Add site-wide primary-button micro-interactions (all guarded by reduced-motion):
```css
.btn--primary, .btn--invert { transition: transform .18s var(--ease), box-shadow .18s var(--ease); }
@media (hover:hover){ .btn--primary:hover, .btn--invert:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,25,21,.18); } }
.btn--primary:active, .btn--invert:active { transform: translateY(0) scale(.97); }
.btn--lg .arrow, .btn--primary { } /* arrow nudge: */
.btn--primary:hover .arrow, .btn--primary:hover::after { transform: translateX(4px); }
@media (prefers-reduced-motion: reduce){ .btn--primary, .btn--invert { transition: none; } }
```
(If CTAs use a literal `→` in text rather than an `.arrow` span, wrap the arrow in `<span class="arrow" style="display:inline-block;transition:transform .18s var(--ease)">→</span>` in the primary CTAs so the nudge works.)

- [ ] **Step 2:** Hero primary only — magnetic pull: reuse/repair the existing `magneticBtns()` (guard `(pointer:fine)` + width ≥ 1024 + reduced-motion; remove the duplicate binding noted in the audit so it doesn't double-translate).

- [ ] **Step 3:** Hero primary only — sheen sweep: add a periodic light sheen via a `::before` gradient that animates across the button every few seconds (reduced-motion disables it). Scope the selector to the hero CTA only.

- [ ] **Step 4:** Browser check (desktop): hover lifts + arrow nudges + press scales; hero CTA shows magnetic follow + periodic sheen. Toggle reduced-motion (emulate) → all motion stops.

- [ ] **Step 5:** Commit.
```bash
git add -A && git commit -m "feat(ui): primary button polish — lift/arrow/press site-wide, magnetic + sheen on hero CTA"
```

---

## Phase 4 — Performance / SEO / a11y / cleanup

### Task 13: Fonts via preconnect + link (drop render-blocking @import)

**Files:** Modify all 11 pages (`<head>` + the `@import` lines).

- [ ] **Step 1:** In each page `<head>`, add before the first `<style>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500&display=swap">
```
(Combine only the families a given page actually uses; Inter is universal. Verticals/home use Fraunces/Instrument/JetBrains; legal pages may need only Inter — check per page.)

- [ ] **Step 2:** Remove the `@import url(...)` lines from the inline `<style>` blocks (line ~10 shared; ~853–855 index-only).
```bash
grep -rn "@import url" *.html legal/*.html ; echo "--- expect no output ---"
```

- [ ] **Step 3:** Browser check: fonts still render (Inter/Fraunces); Network shows stylesheet `<link>` not `@import`; no FOIT flash; console clean.

- [ ] **Step 4:** Commit.
```bash
git add -A && git commit -m "perf(fonts): preconnect + stylesheet link, drop render-blocking @import"
```

### Task 14: OG + Twitter + canonical + JSON-LD (per page)

**Files:** Modify all 11 pages (`<head>`).

- [ ] **Step 1:** After each page's `<title>`, add canonical + Open Graph + Twitter tags with per-page values. Template (home shown; adjust url/title/description per page):
```html
<link rel="canonical" href="https://recallq.com.au/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="RecallQ">
<meta property="og:title" content="RecallQ — Bring overdue patients back automatically.">
<meta property="og:description" content="AI patient recall for Australian dental, physio and optometry practices.">
<meta property="og:url" content="https://recallq.com.au/index.html">
<meta property="og:image" content="https://recallq.com.au/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RecallQ — Bring overdue patients back automatically.">
<meta name="twitter:description" content="AI patient recall for Australian dental, physio and optometry practices.">
<meta name="twitter:image" content="https://recallq.com.au/assets/og-image.png">
```
Handle the 3 minified-head legal pages (title shares a line with `<style>`) separately — insert after `</title>`.

- [ ] **Step 2:** Add JSON-LD: `Organization` on `index.html` (name, url, logo, ABN as `taxID`, AU address/areaServed); `FAQPage` on `pricing.html` from the existing FAQ Q&As.

- [ ] **Step 3:** Provide a social share image at `assets/og-image.png` (1200×630) — generate from the logo/wordmark, or note as a follow-up if no asset; until then point `og:image` at an existing logo PNG.

- [ ] **Step 4:** Verify.
```bash
grep -rL 'property="og:title"' *.html legal/*.html ; echo "--- expect no output ---"
grep -rc 'rel="canonical"' *.html legal/*.html   # expect 1 each
```

- [ ] **Step 5:** Commit.
```bash
git add -A && git commit -m "feat(seo): Open Graph, Twitter Card, canonical, JSON-LD across all pages"
```

### Task 15: Lazy images, favicon, aria-expanded, CTA aria-labels

**Files:** Modify all 11 pages + add favicon asset.

- [ ] **Step 1:** Add `loading="lazy"` to non-hero `<img>` (editorial/photo-strip images). Leave hero/above-the-fold eager.

- [ ] **Step 2:** Add a favicon: create `favicon.ico`/`favicon.png` from the RecallQ logo and reference `<link rel="icon" …>` in each head. Resolves the 404.

- [ ] **Step 3:** In the shared block, toggle `aria-expanded` on the Solutions dropdown button (focus/hover open) and add `aria-expanded` to the hamburger toggle (sync with `.open`).

- [ ] **Step 4:** Disambiguate repeated CTA anchors for screen readers with `aria-label="Recover patients now — create your RecallQ account"` where multiple identical CTAs exist.

- [ ] **Step 5:** Browser check: favicon loads (no 404 in Network); hamburger toggles `aria-expanded`; lazy imgs have the attribute.

- [ ] **Step 6:** Commit.
```bash
git add -A && git commit -m "fix(a11y/perf): lazy images, favicon, aria-expanded toggles, CTA aria-labels"
```

### Task 16: Sync billing chrome + cleanup dead files

**Files:** Modify `assets/partials.js`; delete dead files (after Task 0 backup confirmed).

- [ ] **Step 1:** Apply the equivalent shared fixes to `assets/partials.js` (consumed by the 2 billing pages): CTA→portal anchors, remove modal, define-tokens are CSS (in `assets/site.css` — add the 4 tokens there too), mailto fix. Verify billing pages render the corrected chrome.
```
navigate http://localhost:8799/billing/success/index.html  (and cancel) — check header/footer CTAs go to portal, no modal
```

- [ ] **Step 2:** Delete confirmed-dead files: the unused `assets/*` (`automations.js`, `live.js`, `living-background.js`, `recallq-ad.js`, `site-apple2.css`, `upgrades.js`), `RecallQ-final website.html`, `recallq-ad-demo.html`, and the stray `recall finished website.zip`. Keep `assets/partials.js`, `assets/site.css`, `assets/animate.js` (billing pages use them).
```bash
git rm "RecallQ-final website.html" "recallq-ad-demo.html" "recall finished website.zip" \
  assets/automations.js assets/live.js assets/living-background.js assets/recallq-ad.js \
  assets/site-apple2.css assets/upgrades.js
```

- [ ] **Step 3:** Grep-verify no remaining HTML references the deleted assets.
```bash
grep -rn "live.js\|automations.js\|upgrades.js\|site-apple2" *.html legal/*.html billing/**/*.html ; echo "--- expect no output ---"
```

- [ ] **Step 4:** Commit.
```bash
git add -A && git commit -m "chore: sync billing chrome to portal/modal fixes; remove dead assets and legacy files"
```

### Task 17: Full-site verification & ship

**Files:** none (verification) → then merge/push.

- [ ] **Step 1:** Browser sweep at 1440 and 390 across all 11 pages: every primary CTA → `app.recallq.com.au/signup`; ROI calculator works; pricing toggle + Pro-featured correct; no fabricated "live" claims; cards consistent; nav active state; console error-free (no 404).

- [ ] **Step 2:** Grep gates:
```bash
grep -rn "data-start-now\|startNowModal\|--periwinkle-dark)\|@import url\|\$ 1,799\|Calendly for MVP\|just now" *.html legal/*.html ; echo "--- review: only expected/none ---"
grep -rL 'property="og:title"' *.html legal/*.html ; echo "--- expect none ---"
```

- [ ] **Step 3:** Confirm with the user, then merge to `main` and push (auto-deploys to Vercel). Remove `.audit-shots/` (git-ignored) if desired.
```bash
git checkout main && git merge --no-ff feat/website-rectification && git push
```

- [ ] **Step 4:** Post-deploy: verify the live site (CTAs, calculator, mobile) and confirm the Vercel deployment succeeded.

---

## Self-Review

**Spec coverage:** CTAs→portal (T1,T2,T9), remove modal (T1), ROI calculator (T3), mid-page CTA + copy + reassurance (T4), illustrative stats (T5), testimonials/toasts (T6), legal ABN/APP8/meta (T7), tokens (T8), pricing typo/Growth/Pro-featured/annual/differentiation (T9), card cleanup (T10), hero--short/timing/hover/active-nav (T11), button animation (T12), fonts (T13), OG/JSON-LD (T14), lazy/favicon/aria (T15), billing sync + cleanup/backup (T0,T16), final verify+ship (T17). All spec items mapped.

**Placeholder scan:** Build tasks carry full code; design-judgment tasks (T9 pricing, T10 cards, T5 reframe) give exact strings + component specs with example markup, verified live in-browser — appropriate for visual work on an existing design system.

**Type/string consistency:** Portal URL, CTA copy, tokens, ABN, email, discount all match Global Constraints verbatim across tasks.
