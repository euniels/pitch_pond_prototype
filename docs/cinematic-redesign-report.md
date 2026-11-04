# PitchPond cinematic venture-tech redesign report

**Release branch:** `feat/cinematic-venture-tech`  
**Report date:** 4 November 2026  
**Application root:** `apps/web`

## Delivered experience

PitchPond now presents venture readiness as an authored visual story rather than a repeated SaaS card grid. The public product defaults to deep cinematic navy and forest, uses Newsreader for narrative statements, retains Sora and Manrope for product and data interfaces, and balances fictional Filipino venture photography with code-owned dashboards, charts, and evidence flows.

The homepage contains a full-bleed founder hero, an inspectable synthetic projection, four credibility principles, six venture field notes, three role narratives, a forecasting stage, an Evidence Vault journey, the interactive product tour, honest pilot targets, and a network-led final call to action. Founder, Evidence, Matching, Institution, How It Works, and Responsible AI pages now use distinct image-led editorial heroes and an asymmetric workflow system. Demo records include photographic operating context; Intelligence uses the pond-network visual; sign-in uses a focused cinematic split shell; workspaces receive role-aware header imagery without changing authorization or data behavior.

No database schema, Server Action, Route Handler, RLS policy, projection calculation, compatibility score, permission rule, or public URL changed.

## Original asset suite

The built-in OpenAI image generator produced twelve project-bound assets. The selected PNG outputs were inspected as a contact sheet, optimized to WebP, and stored in `apps/web/public/images/editorial`. Next.js negotiates AVIF or WebP delivery at runtime.

| Asset | Intended use |
| --- | --- |
| `hero-founders.webp` | Homepage and authentication hero |
| `climate-microgrid.webp` | Climate venture story |
| `agritech-greenhouse.webp` | Agriculture venture story |
| `circular-materials.webp` | Circular-materials venture story |
| `health-logistics.webp` | Rural-health venture story |
| `education-technology.webp` | Education venture story |
| `enterprise-operations.webp` | Enterprise-software venture story |
| `founder-evidence-work.webp` | Founder Studio narrative |
| `mentor-evidence-review.webp` | Evidence Vault narrative |
| `investor-review.webp` | Blind review and matching narrative |
| `institution-cohort.webp` | Institutional cohort narrative |
| `pond-network.webp` | Intelligence and ecosystem atmosphere |

The prompts used the `photorealistic-natural` taxonomy for people and operating scenes and `stylized-concept` for the pond network. Shared constraints required fictional Philippine people and organizations, natural gestures, realistic hands and materials, deep pond color cues, no visible text or trademarks, no money, no staged handshakes, no fundraising spectacle, and no watermarks. The network prompt explicitly excluded crypto, circuit-board, and outer-space imagery.

All supporting images meet the approximate 180 KB target; the largest supporting asset is 162 KB. The hero is 98 KB and the pond network is 74 KB. Only the hero uses priority loading. Alternative text and focal metadata live in `src/lib/editorial-media.ts`.

## Validation

| Gate | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Unit tests | 62 passed |
| Playwright | 22 passed, 2 intentionally skipped duplicate mobile visual jobs |
| Axe | No serious or critical violations on primary public routes |
| Responsive overflow | Passed at 320, 375, 768, 1024, 1105, and 1440 pixels |
| Production build | Passed on Next.js 16.4.4 |
| Lighthouse Performance | 99 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 96 |
| Lighthouse SEO | 100 |
| Largest Contentful Paint | 1.4 seconds |
| Cumulative Layout Shift | 0 |
| Production dependency vulnerabilities | 0 |

Visual baselines cover Home, Intelligence, Demo, Sign-in, and synthetic Founder, Investor, and Institution workspace presentations. Reduced motion disables cinematic drift, light shafts, image zoom, and non-essential transition effects.

## Release state

The production-mode application runs locally at `http://127.0.0.1:3109`. Promotion to `pitchpondprototype.vercel.app` remains dependent on access to the Vercel team that owns that existing project. A replacement Vercel project must not be created because it would break the required deployment identity and rollback chain.
