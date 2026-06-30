# Homepage v2 — "Bold Statement" Design Spec

**Date:** 2026-06-30
**Status:** Approved — proceed
**Deliverable:** a new file `index-v2.html` (the current `index.html` stays untouched and live). Homepage only, first pass.

## Goal
A bolder, more distinctive homepage that converts risk-averse AU clinic owners by leading with **trust, proof, and product visibility** — addressing the design-analysis gap (the current site is beautiful but aesthetic-first, light on proof/product/human warmth). Direction chosen: **Bold Statement / vibrant editorial**.

## Build approach
Start from a **copy of the current `index.html`** (reuses the working shared chrome, the interactive ROI calculator JS, the accessible `:root` tokens, perf/a11y foundation), then apply the bold visual system + restructured section architecture + proof placeholders. Do NOT rebuild the plumbing. Save as `index-v2.html`. Current `index.html` is not modified.

## Visual system (the bold departure)
- **Palette:** deep ink `#14151A` (dramatic full-bleed bands) · warm sand `#F6F1EA` (warmth) · white · **primary accent emerald/teal `#0F8A6E`** (booked/recovered/go) · **secondary warm coral `#F4734B`** (energy/highlights) · link blue `#4C6BBC` (AA-safe, retained). High-contrast **colour-blocking**: sections alternate ink → sand → white → teal band.
- **Type:** Inter, pushed for display (very bold, tight tracking; one **accent-coloured word** per headline); body Inter. Fraunces retired for a unified bold-sans voice. No new heavy fonts (keep perf).
- **Motion:** keep fast transform/opacity reveals + button polish (lift/arrow/press; reduced-motion guarded). Bold section colour transitions. Maintain the 100/100/100 Lighthouse bar.
- **Constraints (non-negotiable):** WCAG AA contrast (4.5:1) on the new palette; `prefers-reduced-motion` guards; all inline JS passes `node --check`; CTAs → `https://app.recallq.com.au/signup`; CTA copy `Recover patients now →`; stats kept **illustrative** (no fabricated live/customer claims); AU English.

## Section architecture (`index-v2.html`)
1. **Hero** — deep-ink, dramatic: "Bring overdue patients back **automatically.**" (accent word) + subhead + `Recover patients now →` + reassurance line.
2. **"Works with your PMS" strip** — Cliniko · Dentally · Praktika · Optomate · Nookal · Power Diary *(placeholder logos, clearly marked)*.
3. **Problem stat band** (full-bleed colour) — oversized "**27%** of your active patients are overdue."
4. **ROI calculator** — pulled high, bold-framed (reuse the existing working calculator: `[data-roi]` + `roiCalc()`).
5. **How it works** — 4 bold steps (Export → Find → Message → Book), with product imagery slots.
6. **Product proof** — device-framed **dashboard + reply-inbox screenshots** *(placeholders)*, "see it work."
7. **Social proof** — testimonial block *(placeholder quote + photo)* + founding-practice framing.
8. **Verticals** — bold DentistryIQ / PhysioIQ / OptometryIQ cards (link to vertical pages).
9. **Security & compliance** — bold trust band (Privacy Act 1988 · APPs · AU data residency · Spam Act 2003).
10. **Pricing teaser** → `pricing.html`.
11. **Final CTA band** — bold full-bleed, `Recover patients now →` + reassurance.
12. **Footer** — shared chrome (reused).

## Placeholders (clearly marked, easy to swap)
PMS logos · product screenshots (dashboard, reply inbox) · testimonial quote + photo · founder photo. Use tasteful styled placeholders with a small "placeholder — swap with real asset" affordance in comments.

## De-risk checkpoint
Build **hero + stat band + PMS strip first**, screenshot at desktop + mobile for sign-off **before** building the rest.

## Out of scope (this pass)
Other pages (rollout later if approved); real asset content (user supplies); routing/redirect of `/` to v2 (stays a separate previewable file at `/index-v2.html`).

## Verification
Per-section browser screenshots (desktop 1440 + mobile 390); `node --check` after any JS edit; Lighthouse desktop (target a11y/best-practices/SEO ≥95); grep gates (no fabricated stats, CTAs → portal, AA contrast on new tokens). Current `index.html` unchanged (diff shows only new files).
