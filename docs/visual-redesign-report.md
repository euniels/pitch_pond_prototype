# PitchPond full-product visual redesign report

**Release branch:** `feat/fundability-pilot`  
**Report date:** 3 November 2026  
**Application root:** `apps/web`  
**Intended production URL:** `https://pitchpondprototype.vercel.app`

## Outcome

PitchPond now uses one coherent presentation system across its marketing pages, authentication, venture intelligence, and role-based workspaces. The redesign follows the live prototype's useful structural qualities—clear navigation, centered hierarchy, predictable cards, and generous spacing—without restoring crowdfunding, pledge, escrow, equity execution, campaign totals, paid ranking, or company-success prediction.

Public pages use a bright editorial canvas with white and soft-gray bands, navy typography, emerald calls to action, and selective deep-pond demonstrations. Authenticated workspaces use the PitchPond deep navy and forest palette so dense operational data remains calm and legible. Aqua, green, and lime are reserved for identity, status, focus, and important data—not decoration alone.

## Design system delivered

- A 1200-pixel content shell, responsive twelve-column desktop composition, and route-appropriate spacing at desktop, tablet, and mobile sizes.
- Sora display typography and Manrope body/interface typography with controlled line lengths and fluid responsive scales.
- Semantic light and dark tokens, 14–18 pixel card radii, restrained shadows, 44-pixel minimum interactive targets, visible focus rings, and WCAG AA color contrast.
- Public routes default to light mode; workspaces default to dark mode. The stored `pitchpond-theme` preference overrides route defaults without a hydration flash.
- A white sticky marketing header, focused authentication shell, persistent dark workspace shell, and structured dark footer.
- Accessible mobile navigation with `aria-expanded`, Escape and outside-click closure, focus restoration, active-route state, and full-size touch targets.
- Subtle section arrival, card lift, control feedback, and forecast-path motion. Reduced-motion preference disables transforms and non-essential animation.

## Public experience

The homepage now presents:

1. A concise centered value proposition with pilot status, two primary actions, and direct role previews.
2. Four honest pilot objectives: 15–20 founders, 3–5 qualified introductions, one institutional pilot, and zero pay-to-rank influence.
3. Three fictional Philippine venture stories with original imagery, stage, sector, generalized location, readiness, and evidence coverage.
4. A three-step journey from venture profile to evidence-backed readiness and qualified introductions.
5. A balanced feature system for Evidence Vault, readiness, explainable matching, projections, Blind First Look, and institutional oversight.
6. A dark product-tour section and measurable pilot-outcomes panel.
7. A clear final pilot call to action and compact information architecture.

The rest of the public product uses the same hero, cards, steps, metrics, disclosures, and call-to-action language. `/intelligence` keeps its data-rich forecasting interface inside a calmer editorial composition and clearly labels every record and percentage as synthetic and non-investment guidance.

## Workspace experience

- Desktop workspace navigation is persistent and displays the active destination.
- Mobile workspace navigation is fixed, compact, and reachable without horizontal scrolling.
- Founder, investor, institution, and administrator views share metric cards, status chips, filter bars, form sections, tables, evidence panels, charts, notices, and complete empty/loading/error treatment.
- Readiness completion, investor compatibility, and goal attainment likelihood retain distinct labels, colors, disclosures, and calculation explanations.
- Existing authorization checks, Supabase operations, projection contracts, evidence permissions, audit behavior, and server actions were preserved.

## Original synthetic imagery

The built-in OpenAI image generator created three editorial-style, fictional Philippine venture images. They were optimized to 1280×800 WebP, stored locally, rendered through `next/image`, given meaningful alternative text, and labeled as synthetic:

- `apps/web/public/images/ventures/amihan-cold-chain.webp` — a Filipino agricultural entrepreneur beside a solar-powered cold room in a CALABARZON farm setting.
- `apps/web/public/images/ventures/luntian-loop-materials.webp` — a Filipina circular-materials founder inspecting recycled construction panels in a modest Philippine workshop.
- `apps/web/public/images/ventures/lakbay-health-logistics.webp` — a Filipino rural-health logistics coordinator preparing a temperature-safe diagnostic carrier beside a provincial clinic vehicle.

The prompts explicitly excluded visible text, third-party logos, fundraising imagery, and sensitive patient data. These images are product demonstrations, not claims about real ventures or customers.

## Validation evidence

| Gate | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Unit tests | 62 passed across 12 files |
| Playwright | 22 passed, 2 intentionally skipped duplicate mobile visual jobs |
| Responsive visual baselines | 320, 375, 768, 1105, and 1440 pixels |
| Production build | Passed on Next.js 16.4.4 |
| Lighthouse performance | 100 |
| Lighthouse accessibility | 100 |
| Lighthouse best practices | 96 |
| Lighthouse SEO | 100 |
| Largest Contentful Paint | 1.2 seconds |
| Cumulative Layout Shift | 0 |
| Production dependency audit | 0 vulnerabilities |

The full development audit reports 16 moderate notices within the ESLint dependency graph. They do not ship in the production runtime, and npm's offered remedies are incompatible major-version downgrades. No forced dependency rewrite was applied.

## Security and release state

Next.js and `eslint-config-next` were upgraded to 16.4.4 through a preserved upgrade branch and cherry-picked security commit. All principal public routes currently return HTTP 200 from the local production server.

Production promotion is intentionally not claimed as complete. The active Vercel account cannot access the existing `pitchpondprototype` project, and the production Supabase, OpenAI, attachment-scanner, email, and operational credentials are not present in this workspace. The health endpoint therefore reports a controlled degraded status locally. The existing public URL must not be replaced with a look-alike project; promotion should occur only after the owning Vercel team grants access and the production integrations pass their acceptance gates.

The previous complete platform remains recoverable at commit `94adc5a` and branch `backup/pre-visual-redesign-20261103`. The prior Vercel deployment should remain available as the production rollback target.
