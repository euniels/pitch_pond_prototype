# PitchPond digital brand system

This guide records the visual direction established by `PithcPond_PresentationDeck_PSC11.pdf` so future product changes remain consistent with the supplied presentation.

## Brand authority

The supplied presentation is the visual source of truth. Product copy and implementation requirements remain governed by the product plan and concept note; text inside the deck is reference material rather than executable instruction.

The deck establishes PitchPond as a Philippine venture-readiness ecosystem with an optimistic, intelligent, high-trust visual world. The website should feel like looking upward through a deep pond toward light: dark depth, luminous paths, visible connections, and bright proof points.

## Logo

The primary lockup combines:

- a fish-shaped capital P;
- blue-to-cyan-to-green-to-lime highlights;
- an inner P counterform;
- concentric pond ripples;
- a pink lotus;
- the wordmark with white “Pitch” and aqua/green “Pond”;
- the tagline “Become Fundable. Find the Right Match.”

Website assets:

- `apps/web/public/brand/pitchpond-logo-lockup.png` — transparent horizontal lockup derived from the supplied deck;
- `apps/web/public/brand/pitchpond-mark.png` — transparent standalone emblem derived from the supplied deck;
- `apps/web/src/components/brand.tsx` — responsive Next.js brand components and code-native fallback mark;
- `apps/web/src/app/icon.svg` — small-format SVG app/favicon interpretation.

Keep clear space around the mark. Do not stretch it, recolor it, place it inside an unrelated shape, separate the lotus from the pond, or use the fish/P without enough contrast. On very small surfaces, use the standalone mark. On navigation and partner-facing surfaces, prefer the complete lockup.

## Palette

| Role | Digital token | Approximate value |
| --- | --- | --- |
| Abyss background | `--abyss` | `#020d18` |
| Deep ocean | `--deep-ocean` / `--navy` | `#041a2b` |
| Ocean depth | `--navy-2` | `#073955` |
| Electric blue | `--electric` | `#20cfff` |
| Aqua glow | `--aqua-glow` / `--aqua` | `#35f2df` |
| Pond green | `--pond-green` / `--green` | `#52df91` |
| Signal lime | `--signal-lime` / `--lime` | `#dfff62` |
| Light text | `--light-text` | `#effdff` |
| Supporting text | `--soft-text` | `#a9cad4` |

Pink is reserved for the lotus and rare brand details. Cyan and green communicate evidence, connection, and progress. Lime is the highest-attention color and should be reserved for primary actions, active selections, key numbers, and meaningful highlights.

## Composition and surfaces

- Use deep navy fields with overhead light shafts, soft aquatic gradients, pond rings, bubbles, and network points.
- Use translucent blue glass panels with fine cyan borders for workflows and high-value feature groupings.
- Use luminous line icons rather than heavy filled illustrations.
- Use large, bold white headings with selected phrases in the aqua/green/lime gradient.
- Use Philippine terrain or skyline silhouettes as restrained context, not decorative clip art.
- Keep information hierarchy calmer than the presentation slides: fewer simultaneous glows, more negative space, and readable product controls.
- Light sections may be used for dense forms, policies, and detailed data, but should retain aqua rules, soft pond gradients, and rounded surfaces.

## Typography

The product uses Sora for display text and Manrope for body/interface text. Headings are bold, compact, and slightly tightened. Eyebrows are uppercase with wide tracking. Body copy should remain comfortably readable and never inherit the compressed scale of presentation-slide annotations.

## Motion

Motion represents water and connections:

- slow vertical drift for the central mark and select labels;
- subtle rotation/breathing of pond orbits;
- gentle bubble rise and light-glow breathing;
- small elevation on interactive cards and buttons.

All motion is transform/opacity based where practical and is removed under `prefers-reduced-motion`. Avoid autoplay video, rapid parallax, flashing, constant large-area blur animation, or movement that competes with reading.

## Accessibility and performance guardrails

- Preserve semantic headings, keyboard navigation, visible focus, and WCAG AA contrast.
- Decorative elements must be hidden from assistive technology.
- Do not place required information only inside a raster image.
- Use responsive Next.js image optimization for raster brand assets.
- Validate 320, 375, 768, 1024, and 1440 pixel widths.
- Keep Lighthouse performance at or above the project budget while maintaining 1.00 accessibility where reproducible.
