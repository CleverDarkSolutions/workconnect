# Agent Operating Standard — Multi-Step Product Form (WorkConnect Recruitment Task)

This file governs how an AI coding agent works in this repository. It is not
a style guide — it is a set of gates. If a gate isn't satisfied, the agent
does not move to the next phase.

Read this in full, and read the original brief in full, before touching any
file. Section 3 below is a reconstruction of the brief's field/validation
tables (the source PDF/page extracts jumbled the table layout) — treat it as
authoritative, but re-verify it against the actual Figma file and original
document before coding, since this reconstruction could contain a
transcription error.

## 0. Why this exists, and why it's scoped the way it is

This is a real, graded recruitment task with a fixed stack, a fixed field
spec, a Figma design to match pixel-for-pixel, and an explicit list of what
the reviewer will actually look at (Section 4). "Meticulous" here means
**nailing that graded list precisely** — not maximum ceremony. A previous
draft of this file leaned toward full-scale-production practices (CI
pipelines, ADR folders, performance budgets, security audits, PR rituals).
Section 9 explicitly walks back the parts of that which don't fit a 7-
business-day, single-repo, mock-data take-home with a named grading
rubric. Spend the time budget on what's graded, not on infrastructure
nobody asked for.

## 1. Ownership, end to end

Treat this as one person's feature. Read the Figma file, design the form
state/step architecture, wire TanStack Form + Zod per step, build the
table + pagination, and write the README — the same agent (or a clearly
briefed continuation) owns all of it. Don't leave a slice half-done with
an implicit "someone else finishes this."

## 2. Read the brief before code — the first gate

Before writing implementation code:

1. Restate the task in your own words: a 3-step product form inside a
   shadcn/ui Dialog, gated step-by-step validation, submission appends a
   row to a product table on the home page, pagination synced to the URL
   via nuqs.
2. Confirm the field spec in Section 3 against the actual Figma file and
   original brief — don't build from a possibly-garbled reconstruction
   without checking it once against the source.
3. Write a short plan: how step state is shared across the 3 steps (one
   form instance vs. per-step forms merged on submit), how the Zod
   schemas compose (one schema per step vs. one discriminated schema),
   how net/gross/VAT recalculation avoids update loops, how the
   "limitowany" checkbox conditionally requires a field.
4. Do a **goal-backward check**: every planned piece of work should trace
   back to one of the six bullet points in Section 4 ("what we'll look
   at") or to the field spec in Section 3. If it doesn't trace back to
   either, cut it or move it to "nice-to-have, only if time remains."
5. Only after this plan is written does implementation begin.

State assumptions explicitly rather than guessing silently — see Section
3's open questions.

## 3. Field & validation spec (reconstructed from the brief)

### Step 1 — Informacje podstawowe (Basic info)

*"Dane identyfikujące produkt oraz jego klasyfikacja."*

| Field (as in brief) | Type | Validation |
|---|---|---|
| Nazwa produktu | Text | Required, min. 3 characters |
| SKU produktu | Text | Required, letters and digits only, max. 24 characters |
| Opis | Textarea | Optional |
| Producent | Select | Choice from a predefined list |
| Kategoria | Select | Choice from a predefined list |
| Cechy produktu | Multi-select | One or more values from the list |

**Open question to confirm against Figma, not guess:** the brief marks
`Opis` explicitly "Opcjonalne" but does not explicitly say `Producent` /
`Kategoria` are required. Convention used elsewhere in the brief is that
optional fields are called out explicitly, so treat `Producent`,
`Kategoria`, and `Cechy produktu` (at least one value) as required unless
the Figma file shows otherwise — and state this assumption in the README.

### Step 2 — Cena (Price)

*"Pola cenowe są powiązane i przeliczają się automatycznie."*

| Field | Type | Validation / behavior |
|---|---|---|
| Cena netto | Numeric | Editing it recalculates gross per the VAT rate |
| Cena brutto | Numeric | Editing it recalculates net per the VAT rate |
| VAT | Select (%) | Changing it updates gross (or net) |
| Waluta | Select | Choice from a predefined list |

Formula: **brutto = netto × (1 + VAT / 100)**. Editing any one of
net/gross/VAT immediately recalculates the other price field. This is the
trickiest piece of state in the whole task:

- Pick one field as "last edited" and derive the other from it on every
  change, rather than trying to keep both in sync bidirectionally with no
  source of truth — that's how you get infinite update loops or drift
  from floating-point rounding.
- Round money to sensible precision (2 decimals) at the point of display
  and storage, not mid-calculation on every keystroke.
- Changing VAT recalculates from whichever price field was last edited by
  the user (brief says "lub netto" — pick one deterministic rule, e.g.
  always re-derive gross from net when VAT changes, and state that
  choice explicitly since the brief leaves it open).

### Step 3 — Dostępność i stany magazynowe (Availability & stock)

*"Informacje o dostępności produktu oraz limity koszyka."*

| Field | Type | Validation |
|---|---|---|
| Czy produkt jest dostępny | Switch | Boolean |
| Produkt limitowany | Checkbox | When checked, reveals the stock quantity field |
| Ilość na magazynie | Numeric | Visible and required **only** when "limitowany" is checked. Non-negative integer |
| Min. ilość na koszyk | Numeric | Integer; must not exceed max |
| Maks. ilość na koszyk | Numeric | Integer; must not be less than min |

This step is a good test of Zod's conditional validation
(`.superRefine` / discriminated unions) — the stock-quantity requirement
and the min/max cross-field check both depend on other fields in the same
step, not just their own value.

### Table (home page)

Columns: nazwa (name), SKU, kategoria, cena brutto z walutą (gross price
with currency), dostępność (availability), stan magazynowy (stock level).
Seed with 5 mock products on first load. A submitted form appends a row.

### Pagination

Page number lives in the URL via **nuqs**. A page refresh must preserve
the current page — this is explicitly called out in the brief, so treat
losing pagination state on refresh as a hard bug, not a nice-to-have.

## 4. What the reviewer actually looks at (the real grading rubric)

Direct from the brief — treat this list as the priority order for where
effort goes:

1. **Zgodność z designem z Figmy** — visual and interaction fidelity to
   the provided Figma file, built with shadcn/ui components configured to
   match it (not default shadcn styling left untouched).
2. **Poprawność schematów Zod i ich integracja z TanStack Form** — each
   step's Zod schema is correct and actually drives TanStack Form's
   validation (not a schema that exists but isn't wired in, or
   duplicated manual validation logic alongside it).
3. **Nawigacja między krokami** — "Dalej" is blocked until the current
   step validates; going back preserves previously entered values (no
   resetting fields when navigating backward).
4. **Czytelne komunikaty błędów** — error messages appear next to the
   specific field they belong to, in plain language, not just a generic
   "form invalid" banner.
5. **Zachowanie dialogu** — opening via the "Dodaj produkt" button,
   closing (including via overlay click / Escape, if shadcn's Dialog
   supports it out of the box) resets the form back to step 1.
6. **Jakość kodu, typowanie TypeScript, spójne użycie shadcn/ui** — strict
   typing, no `any` without justification, consistent use of shadcn/ui
   primitives rather than mixing in ad-hoc styled elements.

## 5. Hard requirements — the stack is not a choice

The brief mandates specific libraries. Do not substitute a preferred
alternative even if it seems technically cleaner:

- **shadcn/ui** for all interface components — configure and theme it to
  match the Figma file rather than building custom components that
  duplicate what shadcn already provides (Dialog, Select, Switch,
  Checkbox, Form primitives, etc.).
- **TanStack Form** for form state and step management — not React Hook
  Form, not Formik, not hand-rolled `useState`.
- **Zod** for per-step validation schemas, integrated with TanStack Form's
  validator adapter — not a hand-written validation function that
  happens to look similar.
- **nuqs** for URL-synced table pagination — not a manual
  `useSearchParams` implementation that reinvents what nuqs already does.

## 6. Coding standards

- **TypeScript strict mode.** No `any` without a one-line justification.
  Infer the Zod schema types (`z.infer<...>`) rather than hand-writing
  parallel interfaces that can drift from the schema.
- **Components stay small and single-purpose** — one component per form
  step is a natural boundary; don't build one 400-line component for the
  whole dialog.
- **State lives at the right level** — the multi-step form state belongs
  to the dialog/form, not lifted to a global store it doesn't need.
- **No dead code, no commented-out blocks, no stray `console.log`.**
- **Accessibility follows from using shadcn/ui correctly**: labels
  associated with inputs, keyboard-operable dialog and step navigation,
  visible focus states — shadcn's primitives (Radix underneath) give you
  most of this for free as long as you don't override it away.
- **Naming is precise** — a reviewer skimming should be able to tell
  which file is step 1 vs. step 2 vs. the price-calculation logic without
  opening each one.

## 7. Testing — proportionate and targeted, not maximal

There's no backend and no real network calls (mock data throughout), which
makes this genuinely well-suited to end-to-end testing without any mocking
complexity — so it's worth doing, but scoped to what the brief actually
cares about, not a generic "cover every journey" ceremony:

- **Priority targets, straight from Section 4's rubric:**
  1. Step gating: attempting to advance with invalid data is blocked;
     each validation rule in Section 3 actually fires (e.g. SKU with a
     symbol, name under 3 characters, min > max cart quantity).
  2. Back navigation preserves previously entered values across all 3
     steps.
  3. Price calculation: editing net, gross, and VAT each independently
     produce the correct recalculated counterpart; verify the formula
     directly, not just "a number changed."
  4. Conditional field logic: "Ilość na magazynie" appears and becomes
     required only when "Produkt limitowany" is checked, and disappears
     (and stops being required) when unchecked.
  5. Dialog lifecycle: opening via "Dodaj produkt," submitting a valid
     product adds a row to the table, closing/reopening resets to step 1
     with cleared values.
  6. Pagination survives a full page reload (this is explicitly called
     out in the brief as nuqs's job).
- Use Playwright, with role-based locators (`getByRole`, `getByLabel`)
  over brittle CSS selectors, and no arbitrary `waitForTimeout` — wait on
  visible/enabled state or the URL.
- Unit-test the price-calculation function and the Zod schemas directly
  (pure logic, cheap to test exhaustively) rather than relying on e2e
  alone to catch a rounding edge case.
- **What to skip here:** don't build CI-gated flake-proofing ceremony
  (mandatory double-runs, trace-on-failure infra, axe accessibility
  scans) unless time genuinely remains after the six priority targets
  above are solid — none of that is in the graded list, and a thin,
  precise suite that covers the real risk areas beats a thick one that
  doesn't.

## 8. Git hygiene

- Commits are small and scoped; a reasonable split is roughly:
  scaffolding → step 1 → step 2 (price logic) → step 3 (conditional
  logic) → table + pagination → tests → polish.
- Commit messages describe *why*, not just *what*.
- No secrets or `.env` values committed (unlikely to be needed at all
  here, since everything is mock data — if an API key genuinely isn't
  needed, don't add one just to look production-like).

## 9. What NOT to build — walked-back from a previous draft

The brief has no backend, no auth, no real user data, a fixed 7-business-
day solo deadline, and a specific, narrow grading rubric (Section 4). None
of the following are asked for, graded, or worth the time against that
rubric — skip them:

- **CI/CD pipeline as a hard requirement.** A `.github/workflows/ci.yml`
  that runs lint/typecheck/build is a cheap, nice touch if a few minutes
  remain at the end, but it is not graded and not worth blocking on.
- **ADR folder / formal architecture decision records.** The stack is
  entirely prescribed by the brief — there's little decision space left
  to record. If you make a genuinely non-obvious call (like the VAT
  recalculation direction rule in Section 3), note it in the README in
  one sentence instead of a `docs/adr/` ceremony.
- **Performance budgets / Lighthouse scores / bundle analysis.** Not
  mentioned anywhere in the brief for a single-page form + table.
- **Formal security audit / dependency-vulnerability sign-off.** There's
  no backend, no auth, no real user data — a quick `npm audit` sanity
  check is fine, but it's not a deliverable.
- **Structured logging / error-boundary infrastructure.** Sensible inline
  error handling for form submission is enough; this isn't a production
  service that needs observability tooling.
- **PR-against-main ceremony with a solo "reviewer."** There's no second
  person reviewing this — submit via the repo link the brief asks for.
  Self-review the diff (Section 10) instead of performing a PR ritual for
  an audience of one.

## 10. Human is the last gate

Before considering the task finished:

- Re-read every changed file line by line, as if reviewing someone else's
  PR — don't trust a green test run alone.
- Open the deployed link and manually walk through: happy path across all
  3 steps, at least one validation failure per step, back-navigation
  value retention, the limited-product conditional field, dialog
  close/reopen reset, and a page refresh mid-pagination.
- Compare the running app side-by-side with the Figma file, not just from
  memory of having looked at it earlier.

## 11. Deliverables & deadline

Exactly what the brief asks for — don't substitute or add scope beyond
this list:

- [ ] Link to the repository (GitHub / GitLab)
- [ ] README with run instructions (install, dev server, build, and how
      to run tests if any exist) — plus a one-line note for any
      assumption made in Section 3's open question
- [ ] Link to a live, working deployment (Vercel / Netlify)
- [ ] Delivered within 7 business days of receiving the task

## 12. Definition of done (checklist)

- [ ] Field spec in Section 3 verified against the actual Figma file
      (not just this reconstruction)
- [ ] All 6 rubric items in Section 4 checked by hand, not assumed
- [ ] Required stack (shadcn/ui, TanStack Form, Zod, nuqs) used as
      specified, no substitutions
- [ ] `typecheck`, `lint`, `build` run and pass locally
- [ ] No `any`, no dead code, no leftover `console.log`
- [ ] Priority test targets from Section 7 covered and passing
- [ ] Pagination confirmed to survive a real page reload
- [ ] Price calculation formula verified against the spec, not just
      "looks about right"
- [ ] Every changed line has been read and can be explained
- [ ] README, repo link, and deployed link all in hand before the
      7-business-day deadline

## 13. What "meticulous" means here

Precisely matching the Figma design, wiring Zod and TanStack Form
correctly per step, getting the net/gross/VAT math and the conditional
field logic exactly right, and making the dialog and pagination behave
exactly as specified. It does not mean building infrastructure this task
was never going to be judged on. If a choice would impress a reviewer
grading against Section 4, do it well; if it would only impress a
reviewer grading a different, larger project, skip it.
