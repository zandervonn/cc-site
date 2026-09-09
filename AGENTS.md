# Cosmic Clash website guidance

## Design baseline

Before making a visual redesign, read and follow `DESIGN_PLAYBOOK.md`.

The Cosmic Clash direction is minimalist, clean, and quiet. The September 2026 homepage update replaces the earthy background with deep navy, faint blue-violet shading, and a sparse, subtly twinkling starfield. Preserve the restrained layout and real planet materials.

Do not describe Cosmic Clash as a "small game", describe play as "dropping", or use "crowded orbit". None of the gameplay pieces are moons; call them planets. The black hole is a secret: never reveal it in website copy, titles, descriptions, or social metadata. Progression may hint at "the Sun (and beyond?)".

The copy should sound playful, casual, and personal, not serious or grandiose. The user likes "What game isn’t better in space?", the solo-developer voice, free-to-play and "never a forced ad" promises, and a clearly playful "your money back (it’s free)" joke. Keep these as editable copy rather than text embedded in artwork. Do not broaden "never a forced ad" into "ad-free"; optional ads and purchases exist.

Do not reintroduce the rejected design grammar:

- giant split-colour hero slogans;
- tiny tracked eyebrows or decorative system labels;
- 01 / 02 / 03 explainers;
- equal feature cards, rounded panels, pills, badges, or fake metrics;
- glow, glass, gradient text, faux consoles, or dashboard readouts;
- gameplay screenshots or phone frames as the main visual idea;
- interaction or animation added only to make the page feel custom;
- generic “epic,” “seamless,” “next-level,” or “unlock” copy.

Prefer:

- plain language about aiming, gravity, matching planets, and progression;
- the deep-space homepage palette and restrained planet-surface material;
- human-scale typography and generous negative space;
- one subject-specific idea with everything else kept quiet;
- removing a section or device when it does not communicate anything.

The requested starfield is an intentional exception to the earlier motion restriction: keep most stars static, animate only slow opacity changes, respect reduced motion, and pause while the page is hidden. The older mineral reference in `DESIGN_PLAYBOOK.md` is historical; the user's current space-background request takes precedence.

Keep the homepage order: hero; video on the left with the planet diagram and extra textures on the right; matching; iPhone/Android access; bugs/support. Decorative planets belong only in the video/planet section, not the hero, access, or support sections. Keep the matching equation in its own section. The video should begin within the initial desktop viewport, retain faded edges, and move at about 20% of normal page scroll speed so it stays mostly visible for the Sun finale while the planets move at about 120% of page speed. Spread planets through a taller, staggered arrangement and progressively reveal a dotted, looping SVG path through their centres in order. Earth and Saturn may overlap the video edge slightly; the decoration must not intercept pointer input. Bound its travel to its own section; disable the relative motion for reduced-motion preferences. Keep the video muted, pause it offscreen, provide a visible play/pause control, and respect reduced motion. The current 20-second excerpt comes from seconds 915–935 of `Downloads/ScreenRecording_08-14-2026 10-17-23_1.mp4`, within TikTok segment 07 (`CosmicClash_TikTok_Test/working/manifest.csv`). Use the original recording to avoid the TikTok story captions/narration. Check clips for secret reveals before adding them. Neptune's source texture is grayscale and needs its Unity material's blue tint.

## Functional requirements

Video scroll timing: let the preview enter at normal page speed until the complete video and caption are visible low in the viewport. Move it steadily from 70% to 30% of the viewport's spare vertical space while planets pass, then release it after the Sun finale so it scrolls out normally. Base the entry trigger on the actual preview height and track position, not an early section-visibility threshold; constrain video width on short viewports so it can fit.

Keep scroll geometry cached between layout changes. Lenis 1.3.26 owns page-level wheel smoothing through `smooth-scroll.js`; keep the showcase transforms mapped directly to its native scroll position so there is only one interpolation clock. Preserve Lenis anchors and reduced-motion behavior. Move the Sun using a transform rather than changing its layout position on every frame, and keep the Sun above the video as the foreground curtain that ends the showcase.

The Sun's lower mask is deliberately soft, so z-order alone can reveal gameplay through it after the crest passes. Progressively clip the video behind the Sun's leading edge and never reveal covered pixels again during that scroll direction.

Preserve:

- the iPhone App Store link;
- the Android tester request form and its FormSubmit fields;
- the invited-tester Google Play link;
- the support-message form, its confirmation route, and direct support email;
- privacy content and legacy privacy redirect;
- accessibility, focus treatment, metadata, and responsive behaviour.

Before reporting completion, inspect the rendered homepage at desktop and mobile widths, check the privacy, Android confirmation, and support confirmation routes, verify all local assets and routes return successfully, and read the browser console for warnings or errors.

- The user identifies the first planet in the website diagram as Pluto. Its class is `orbit-pluto`, and its grayscale texture needs a subtle purple tint via `surface-pluto`. Do not apply requests about Pluto to the later blue-violet planet.

- End the planet chain with a large Sun using the game texture `Assets/texture/8k_sun.jpg` (web copy `assets/materials/sun.jpg`). Show only its top quarter as a viewport-wide arc behind the video, with a soft bottom mask. It fades in only when the chain reaches its endpoint, then fades out with the dotted route as scrolling continues; reduced-motion mode keeps it static and visible. Preserve the earlier planet spacing when extending this finale.
