# Technical Reference

## Route sampling

Sample a polyline by cumulative geographic distance, not by point index. Return:

- current coordinate;
- local bearing;
- path traveled so far.

Flight paths should use spherical great-circle interpolation. Road paths should use cached routing geometry. Coastal paths should use GPX/AIS data or coastline-aware routing.

## Route simplification

Use Douglas–Peucker simplification before embedding road geometry. A tolerance around `0.00005–0.00015` degrees is typically sufficient for web maps while keeping visible curves.

Store generated data:

```ts
export const ROAD_ROUTES: Record<string, Coordinate[]> = {
  'airport-hotel': [/* simplified navigation points */],
}
```

Resolve cached routes when building a segment:

```ts
path: mode === 'car' ? ROAD_ROUTES[id] ?? fallbackPath : fallbackPath
```

## Flight motion

Use smoothstep:

```ts
const smoothstep = (value: number) => {
  const p = Math.min(Math.max(value, 0), 1)
  return p * p * (3 - 2 * p)
}
```

Typical flight profile:

```ts
const climb = smoothstep(progress / 0.16)
const descent = smoothstep((progress - 0.78) / 0.22)
const altitude = ground + (cruise - ground) * climb * (1 - descent)
```

Use positive pitch for climb and mild negative pitch for approach. A preceding takeoff segment may set `startsAirborne` on the next segment to avoid a second climb.

## Three.js model normalization

For Y-up glTF:

```ts
const bounds = new THREE.Box3().setFromObject(source)
const center = bounds.getCenter(new THREE.Vector3())
const sphere = bounds.getBoundingSphere(new THREE.Sphere())

source.position.set(-center.x, -bounds.min.y, -center.z)
source.scale.multiplyScalar(targetRadius / sphere.radius)
```

Do not apply an extra X-axis conversion when `getMatrixForModel()` already handles globe tangency.

## Model georeferencing

Inside the custom layer:

```ts
const modelMatrix = map.transform.getMatrixForModel(coordinates, altitude)
const projection = new THREE.Matrix4()
  .fromArray(args.defaultProjectionData.mainMatrix)
const local = new THREE.Matrix4()
  .fromArray(modelMatrix)
  .scale(new THREE.Vector3(scale, scale, scale))

camera.projectionMatrix = projection.multiply(local)
renderer.resetState()
renderer.render(scene, camera)
```

Set `renderingMode = '3d'`.

## Vehicle heading

With glTF +Z-forward and MapLibre's local model frame:

```ts
model.rotation.y = THREE.MathUtils.degToRad(180 - geographicBearing)
```

Always verify visually because individual assets may violate the glTF forward convention.

## Model screen size

Full inverse zoom compensation makes a model stay the same pixel size:

```ts
scale = base / 2 ** (zoom - referenceZoom)
```

Partial compensation allows natural growth:

```ts
scale = base / 2 ** ((zoom - referenceZoom) * 0.8)
```

Use full compensation for vehicles that must remain readable. Use partial compensation for hotels and landmarks.

## Scroll synchronization

Create one ScrollTrigger per real chapter element:

```ts
ScrollTrigger.create({
  trigger: chapterElement,
  start: 'top top',
  end: 'bottom top',
  onUpdate: ({ isActive, progress }) => {
    if (isActive) updateChapter(index, progress)
  },
})
```

Do not infer chapter index by multiplying total page progress.

## Mobile interaction contract

Narrative:

- map handlers disabled;
- single-finger scroll belongs to the page;
- no nested card scrolling.

Final explorer:

- drawer defaults collapsed;
- date/POI selection collapses drawer;
- mobile drag pan disabled if it blocks page scroll;
- two-finger zoom may remain enabled;
- `overscroll-behavior: auto` allows scroll chaining.

## Popup stability

Use:

```ts
new maplibregl.Popup({
  focusAfterOpen: false,
  closeOnMove: false,
})
```

Stop existing camera motion before starting another. Preserve `window.scrollY` around popup creation if the browser still repositions the page.

## Hybrid map layering

Recommended order:

1. satellite raster;
2. semi-transparent water tint;
3. shoreline;
4. vector road/boundary lines;
5. vector labels;
6. route progress;
7. 3D hotels and vehicles;
8. DOM markers/popups.

Hide vector fill/background layers when they obscure satellite imagery.

## Lessons from iteration

- A route with many points can still be wrong if the underlying coordinates cross land.
- Hotel visibility must span both check-in and departure chapters.
- Public asset paths must include the Vite base URL on GitHub Pages.
- Model bounding dimensions alone do not guarantee consistent perceived size.
- Direct map gestures and page scrolling compete on mobile.
- Popup autofocus can move the entire document.
- Public demo routing APIs should be used during development, not at runtime.
- Booking PDFs often contain names, PINs, and private links; never commit them.

