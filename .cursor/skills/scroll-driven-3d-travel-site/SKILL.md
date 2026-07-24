---
name: scroll-driven-3d-travel-site
description: Designs and implements scroll-driven 3D travel itinerary websites with MapLibre, Three.js, GSAP, real transport routes, hotel markers, responsive story cards, local assets, and GitHub Pages deployment. Use when building or extending an interactive trip website, synchronizing itinerary documents, animating cars/planes/ships on a globe, or debugging map storytelling.
---

# Scroll-Driven 3D Travel Site

Build a travel story where structured itinerary data drives narrative cards, map routes, camera motion, 3D vehicles, hotels, POIs, and the final overview.

## Non-negotiable rules

1. Treat the user's latest itinerary document as the source of truth.
2. Never publish booking confirmations, PINs, private share URLs, names, or receipts.
3. Keep private inputs under an ignored directory such as `.tmp/`.
4. Verify changing facts—schedules, booking sites, customs rules, opening periods—against current sources.
5. Do not represent road, flight, or sea travel with the same route algorithm.
6. Validate build and lint after substantive edits.

## Workflow

### 1. Inspect and normalize source material

- Read the itinerary, confirmation PDFs, screenshots, and existing app data.
- Extract dates, local times, IATA/port codes, confirmed/pending status, hotel names, GPS coordinates, party size, and cancellation constraints.
- Resolve conflicts by preferring the newest explicit user update.
- Convert coordinates to `[longitude, latitude]`.
- Keep a distinction between:
  - confirmed booking;
  - candidate;
  - optional/weather-dependent;
  - pending purchase.

### 2. Build the journey data model

Use one canonical chapter per travel day. Each chapter should contain:

```ts
type TransportMode = 'car' | 'plane' | 'ship' | 'stay'

type NarrativeSegment = {
  id: string
  mode: TransportMode
  path: [number, number][]
  label: string
  weight?: number
}
```

Keep hotels and POIs separate from transport segments. A hotel needs stable coordinates, date range, name, and associated chapter IDs.

### 3. Generate mode-correct routes

**Road**
- Generate actual navigation geometry once.
- Simplify to roughly 5–15 m precision.
- Commit the coordinates to a local TypeScript file.
- Never depend on a public routing API at page runtime.

**Flight**
- Use great-circle interpolation between real airports.
- Split transfers into separate flight segments.
- Animate climb, cruise, descent, and landing.
- Keep the initial takeoff as its own short segment when a cinematic departure is required.

**Ship**
- Prefer public GPX/AIS-derived tracks with compatible licensing.
- Split the track at actual ports.
- For local fjord tours, branch from a verified channel track into the correct fjord coordinates.
- Never connect ports with straight lines across islands.
- Attribute route data in the UI or repository.

### 4. Implement the map and 3D layers

- Use one MapLibre instance for narrative and final overview.
- Use `globe` projection during the story and `mercator` for the final explorer.
- Use a detailed hybrid basemap: high-resolution imagery underneath vector roads, labels, and boundaries.
- Render vehicles and hotels as `CustomLayerInterface` layers using the map's WebGL context.
- Use `map.transform.getMatrixForModel()` with `defaultProjectionData.mainMatrix`; do not manually fake globe alignment.

For model conventions:

- glTF is Y-up and +Z-forward.
- Normalize imported models by bounding sphere.
- Place the model base at local `y = 0`.
- Rotate moving vehicles around local Y according to geographic bearing.
- Keep hotel orientation fixed unless the design explicitly requests billboard behavior.
- Use different visual families for routes and hotels; do not rely on oversized halos.

See [reference.md](reference.md) for formulas and custom-layer patterns.

### 5. Drive motion from real scroll sections

- Use GSAP ScrollTrigger or equivalent observers.
- Measure each chapter element's real `top` and `bottom`.
- Do not divide total page height into equal chapter fractions.
- Map local chapter progress to the active segment using segment weights.
- Scrolling must be reversible and deterministic.
- Stop scrolling = stop motion.

The final overview activates only when its own section enters the viewport.

### 6. Separate narrative and exploration modes

**Narrative mode**
- Camera, zoom, route progress, and model motion are scroll-controlled.
- Disable direct map interaction.
- Keep the vehicle near the visual center.
- Use a moderate camera pitch so building and vehicle side profiles are visible.

**Final overview**
- Reveal date selection, POIs, food, accommodation, and complete route.
- Allow desktop pan/rotate.
- On mobile, preserve one-finger page scrolling; reserve map gestures for two-finger zoom or card-driven navigation.
- Use a collapsible bottom drawer so the map is not covered.
- Disable popup autofocus and preserve page scroll position.

### 7. Design responsive story cards

- Desktop: alternate left/right cards over a pinned map.
- Mobile: compact bottom cards with no nested scroll during the narrative.
- Clamp long summaries and route lists.
- Respect safe-area insets.
- Keep HUD away from the card.
- Final overview drawer should default collapsed on small screens and auto-collapse after selecting a date or POI.

### 8. Handle images and public assets

- Download stable, license-compatible assets locally.
- Match images to the exact place or product; do not reuse unrelated regional photos.
- Resolve public assets with `import.meta.env.BASE_URL`, never root-relative URLs.
- Preconnect map hosts and preload critical images/GLBs.
- Idle-preload the next few narrative images, not the entire gallery.

### 9. Optimize load order

1. HTML, fonts, hero image, map host preconnects.
2. Map style and base tiles.
3. GLB models.
4. Current/next chapter images.
5. Noncritical POI imagery.

Do not launch many routing requests during map startup. Prefer committed route geometry.

### 10. Validate

Check:

- forward and reverse scroll;
- chapter boundary alignment;
- route continuity and no land crossings;
- vehicle heading and altitude;
- hotel tangent alignment, size, and visibility across checkout/departure days;
- popup behavior without page jumps;
- mobile one-finger scrolling;
- reduced-motion behavior;
- GitHub Pages base paths;
- all local images and GLBs returning HTTP 200.

Run:

```bash
npm run build
npm run lint
```

### 11. Deploy safely

- Configure Vite's Pages base path.
- Use GitHub Actions to build and deploy `dist`.
- Keep private source documents ignored.
- Verify the Pages workflow and public URL after deployment.
- Do not push or commit unless the user has authorized repository publication.

## Project architecture

Prefer:

```text
src/
  components/       narrative, overview, booking, notes
  data/             itinerary, road routes, sea routes, POIs, hotels
  geo/              great-circle and path sampling math
  hooks/            scroll progress
  map/              MapLibre map and Three.js custom layers
```

Keep `App.tsx` as composition only. Avoid returning to a monolithic map/UI component.

## Handoff format

Report:

- itinerary facts synchronized;
- route sources and licenses;
- interaction changes;
- responsive behavior;
- verification commands;
- deployment URL if published.

