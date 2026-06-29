# RecallQ Website Rectification — Design Spec

**Date:** 2026-06-29
**Status:** Awaiting approval
**Repo:** `recallq-website` (static, no build step; auto-deploys to Vercel on push to `main`)

## Goal

Make the RecallQ marketing site clean, professional, and **high-converting all the way through to the portal sign-up**. Fix every broken interaction, remove fabricated/misleading content, and wire the funnel to the live self-serve portal.

Success = a visitor can move landing → value → proof → pricing → sign-up with no dead ends, no fake claims, and a clear single primary action on every screen.

## Context & key findings (from full audit of all 11 pages + live browser inspection)

**Architecture (decisive):**
- Every page is self-contained: all CSS and JS are **inlined**. There is no build step.
- The shared header/footer/Start-Now-modal/nav is a **208-line `<script data-active="…">` block copy-pasted byte-identically into all 11 pages** (MD5-verified). Only the opening `data-active`/`data-vertical`/`data-depth` line varies.
- The shared `<style>` block (663 lines incl. `:root` tokens) is **byte-identical across all 11 pages**. Only `index.html` has extra page-specific CSS (~1045 lines).
- The entire `assets/` folder is **dead code** for the 11 main pages (referenced only inside a comment). **Exception:** `billing/success/index.html` and `billing/cancel/index.html` load the *external* `assets/partials.js`, `assets/site.css`, `assets/animate.js` — a maintenance trap (inline fixes won't reach them).
- The iframe-nav click-interceptor bug ("tabs not clickable") was already fixed this session (guarded with `if (window.parent !== window)`), committed and pushed.

**Funnel (the core problem):** Every CTA is a `data-start-now` trigger that opens an in-page modal which **fakes success and submits nowhere** ("a founder will email you within 24 hours"). The product is self-serve (`app.recallq.com.au/signup` is live), so the entire funnel contradicts the product and captures nothing. The hero/section "Run this on my patient list →" CTAs scroll to **static brochure cards**, not a calculator.

**Trust/compliance:** A polished dark dashboard asserts fabricated live telemetry as present-tense fact — "$2,385,907 recovered **across 32 practices right now**", "11,851 bookings", "43% reply rate" — plus invented patient testimonials and fake booking toasts. For an AU healthcare brand this is a trust and ACCC misleading-conduct exposure. The Privacy Policy also says "nothing is transferred outside Australia" while disclosing US/EU sub-processors (APP 8 gap), and no ABN appears.

**CSS bugs:** `--periwinkle`, `--periwinkle-dark`, `--text-primary`, `--text-muted` are used but **never defined** in `:root` → intended accent/money-emphasis silently renders flat. Pricing shows a `$ 1,799` space typo; the recommended plan is badged "Most popular" but never named "Growth" (yet Pro lists "Everything in Growth"); `.hero--short` is referenced but undefined → a large empty void above the pricing cards. Footer "Contact" `mailto:` is blank on every page. No OG/Twitter/canonical/JSON-LD anywhere; fonts load via render-blocking `@import`; no favicon (404).

## Approach

**Approach A — scripted in-place fixes (chosen).** Apply the byte-identical shared edits across all 11 pages programmatically; do per-page edits for unique content. No re-architecture (rejected Approach B: switching to external partials has high regression blast radius for a visually-complete static site, since the inlined copy is the canonical/newer version). The 2 billing pages are kept in sync via `assets/partials.js`. Inline duplication is accepted as known debt.

**Verification:** a local static server + headless Chrome is already running; every phase is checked in-browser (desktop 1440 + mobile 390) before commit. Screenshots saved to `.audit-shots/` (git-ignored).

## Locked decisions

| Topic | Decision |
|---|---|
| Sign-up flow | All CTAs link to `https://app.recallq.com.au/signup` (+ `?vertical=…&utm_source=site&utm_campaign=…` on vertical pages). Modal removed. |
| Fabricated stats | Reframe as **clearly illustrative** ("example / typical practice"); remove "right now / live" language and auto-incrementing counters; remove fake booking toasts. |
| Testimonials | Replace invented patient quotes with honest framing (e.g. founding-practice program) — no fabricated names. |
| Pricing | Presentation fixes **+ monthly/annual toggle** (annual = **1.5 months free**, ≈12.5%). Make **Pro ($2,000) the "Most popular"** featured card (dark + badge + subtle scale); Starter & Growth flank it; keep ascending price order. Fix `$ 1,799` typo; name the **Growth** plan; "no credit card · cancel anytime" on each card. **Make tier differences legible:** consistent "Everything in [lower tier], plus…" progression, visually emphasise each tier's key differentiator, and add a compact feature-comparison so a buyer instantly sees what each plan adds. Feature content sourced from the existing `pricing.html` lists (no invented features). |
| Info cards | **Site-wide consistent card-cleanup pass** across every informational card: spacing, alignment, muted-caption colour (fixed via token defs), borders, and hover states. |
| Legal | Add ABN **84 202 664 713**; redraft the overseas-transfer/APP 8 wording to match the disclosed sub-processors; add meta descriptions; fix flat "Read →" links. *(Lawyer sign-off still recommended before relying on the redraft.)* |
| ROI calculator | **Build** the real interactive calculator from the existing unused scaffolding; point "Run this…" CTAs at it; fix both `#roi-calc` dead-ends. |
| Primary CTA copy | **"Recover patients now →"** (outcome-led). Compact variant in the tight header. Reassurance line under each primary CTA. |
| Button animation | **Maximum polish:** hover lift + soft shadow + arrow nudge + scale-on-press site-wide; plus magnetic cursor-pull AND a periodic sheen sweep on the hero primary CTA. All disabled under `prefers-reduced-motion`; pointer/desktop-guarded. |
| Footer contact email | `recallq@gmail.com` (interim; legal pages keep their `privacy@`/`legal@`/`security@` addresses). |

## Work breakdown (phased)

### Phase 1 — Funnel wiring & integrity (highest impact)
- Convert all 77 `data-start-now` triggers to styled `<a href="https://app.recallq.com.au/signup">` (vertical pages append `?vertical=…&utm_*`). Edit the shared delegated handler accordingly; delete the modal markup, fake submit, and exit-intent auto-open.
- Build the interactive ROI calculator (patients × visit value × overdue/convert rates → recovered $/mo and $/yr); insert `#roi-calc` element on `index.html`; repoint "Run this on my patient list →" / "Run the recall audit →" to it.
- Add a mid-page CTA after the How-it-works timeline. Apply `"Recover patients now →"` copy + one reassurance line ("No credit card · cancel anytime · live in 20 min") under each primary CTA. Establish one clear primary per viewport.

### Phase 2 — Trust & honesty
- Reframe the "Live this month" dashboard as illustrative; remove `data-drift` auto-increment + the "right now" framing; remove fake booking toasts (inline). Replace fabricated testimonials.
- Legal: insert ABN + redrafted overseas-disclosure wording; add meta descriptions (all 4 legal pages currently have none); fix the `--periwinkle-dark`-driven flat "Read →" links (fixed via Phase 3 token definitions).

### Phase 3 — Visual / CSS correctness
- Define the 4 missing `:root` tokens (one shared edit → fixes money-emphasis on every page incl. inline usages). Map: `--periwinkle` → accent `#5876C4`; `--periwinkle-dark` → darker accent `#3F5BA8`; `--text-primary` → `--ink #1A1915`; `--text-muted` → `--ink-3 #6E6C66`.
- Pricing: `$ 1,799`→`$1,799`; name Growth; Pro = featured "Most popular"; monthly/annual toggle (annual = 1.5 months free, ≈12.5%); make tier differences legible (progressive "Everything in X, plus…" lists, emphasised per-tier differentiator, compact comparison).
- **Site-wide card cleanup pass:** normalise informational-card spacing/padding, alignment, muted-caption colour (resolved by token defs above), border/elevation consistency, and hover states across home + vertical + legal-hub cards.
- Fix footer `mailto:` (`recallq@gmail.com`) + about.html's second blank mailto; define `.hero--short` (kills pricing void); reduce scroll-reveal animation 0.8–0.9s → ~0.45s; guard `.tile:hover` with `@media (hover: hover)`; apply active-nav state from `data-active`; button-animation polish (see locked decision).

### Phase 4 — Performance / SEO / a11y / cleanup
- Fonts: drop `@import`; add `<link rel="preconnect">` + stylesheet `<link>` in `<head>`; reduce CLS.
- Per-page OG + Twitter Card + canonical + JSON-LD (Organization on home, FAQPage on pricing). Handle the 3 minified-head legal pages separately.
- `loading="lazy"` on non-hero images; add favicon (logo asset available); toggle `aria-expanded` on Solutions dropdown + hamburger; disambiguate repeated CTA `aria-label`s.
- Sync the 2 billing pages (via `assets/partials.js`). Cleanup (**backup first**): archive the current site to a timestamped zip outside the repo before deleting dead `assets/*` (unused subset), `RecallQ-final website.html`, and the stray `recall finished website.zip`.

## Per-file impact (summary)
- **Shared (all 11 pages, scripted, byte-identical):** `:root` token defs, footer mailto, modal→portal handler, animation timing, tile-hover guard, active-nav, font `<link>`, `aria-expanded`.
- **`index.html` only:** ROI calculator build, illustrative-stats reframe, fake-toast removal, testimonial replacement, home-specific CSS (`.hero--short`, button polish), OG/JSON-LD.
- **`pricing.html`:** typo, Growth naming, Pro-featured, annual toggle, reassurance, **tier-differentiation redesign (progressive feature lists + compact comparison)**, FAQ rewrite (self-serve), OG/FAQPage JSON-LD.
- **`how-it-works.html`:** mid-page CTA, "Calendly for MVP" copy removal, OG.
- **`dentistry/physio/optometry.html`:** CTA links (+vertical UTM), illustrative ROI numbers, fix optometry math (63×340=21,420), `$ 1,799` typo, OG.
- **`about.html`:** second blank mailto, OG.
- **`legal/*`:** ABN, APP 8 redraft, meta descriptions, OG/canonical.
- **`billing/*`:** sync chrome via `assets/partials.js`.

## Risks & mitigations
- *Scripted edits hit 11 files* → each shared string verified identical first (already MD5-confirmed); diff-review + in-browser check per phase.
- *Modal removal could orphan handlers* → remove handler + markup together; grep for residual references.
- *Legal redraft without lawyer* → factually align to sub-processors; explicitly flag for sign-off; keep change isolated and reversible.
- *Billing-page drift* → apply the same chrome fixes to `assets/partials.js` in the same change.

## Out of scope
- Portal (`recallq-portal`) changes — no query-param prefill added portal-side (UTMs are forward-compatible only).
- Actual pricing/plan value changes (presentation only; Pro-featured is a positioning change, not a price change).
- New brand/visual identity — the existing Apple-style design system is kept and corrected, not replaced.

## Open items to confirm
1. ~~Footer contact email~~ — **resolved: `recallq@gmail.com` (interim)**.
2. ~~Annual discount~~ — **resolved: 1.5 months free (≈12.5%)**.
3. ~~Cleanup~~ — **resolved: approved, with a full backup zip taken first**.

All open items resolved — spec is final.
