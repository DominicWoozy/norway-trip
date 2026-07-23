import { useEffect, useRef, useState, type CSSProperties } from 'react'
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type Marker,
  type Popup,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  journeyChapters,
  journeyHotels,
  journeyPois,
  type JourneyHotel,
  type JourneyPoi,
  type TransportMode,
} from '../data/journey'
import { haversineDistance, samplePath, type Coordinate } from '../geo/routeMath'
import { Vehicle3DLayer } from './Vehicle3DLayer'
import { assetUrl } from '../assets'
import { Hotel3DLayer } from './Hotel3DLayer'

type JourneyGlobeProps = {
  activeChapter: number
  chapterProgress: number
  overviewActive: boolean
  overviewDay: number
  selectedPoi: JourneyPoi | null
  onSelectDay: (index: number) => void
  onSelectPoi: (poi: JourneyPoi) => void
}

type CurrentJourneyState = {
  position: Coordinate
  bearing: number
  mode: TransportMode
  travelled: Coordinate[][]
  label: string
  segmentIndex: number
  segmentProgress: number
}

const STORY_PITCH = 25

const smoothstep = (value: number) => {
  const progress = Math.min(Math.max(value, 0), 1)
  return progress * progress * (3 - 2 * progress)
}

const getFlightMotion = (progress: number, startsAirborne = false) => {
  const climbProgress = startsAirborne ? 1 : smoothstep(progress / 0.16)
  const descentProgress = smoothstep((progress - 0.78) / 0.22)
  const altitude = 180 + (28000 - 180) * climbProgress * (1 - descentProgress)

  let pitch = 0
  if (!startsAirborne && progress < 0.16) {
    pitch = Math.sin(Math.PI * (progress / 0.16)) * 14
  } else if (progress > 0.78) {
    pitch = -Math.sin(Math.PI * ((progress - 0.78) / 0.22)) * 9
  }

  return { altitude, pitch }
}

const VECTOR_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

const getAllRouteLines = () =>
  journeyChapters.flatMap((chapter) => chapter.segments.map((segment) => segment.path))

const getChapterState = (chapterIndex: number, progress: number): CurrentJourneyState => {
  const chapter = journeyChapters[chapterIndex]
  const weights = chapter.segments.map((segment) => segment.weight ?? 1)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let remaining = Math.min(Math.max(progress, 0), 1) * totalWeight
  let segmentIndex = 0

  for (let index = 0; index < weights.length; index += 1) {
    segmentIndex = index
    if (remaining <= weights[index] || index === weights.length - 1) break
    remaining -= weights[index]
  }

  const segment = chapter.segments[segmentIndex]
  const localProgress = weights[segmentIndex] === 0 ? 1 : Math.min(remaining / weights[segmentIndex], 1)
  const sample = samplePath(segment.path, localProgress)
  const completedPreviousChapters = journeyChapters
    .slice(0, chapterIndex)
    .flatMap((item) => item.segments.map((part) => part.path))
  const completedCurrentSegments = chapter.segments
    .slice(0, segmentIndex)
    .map((part) => part.path)

  return {
    position: sample.position,
    bearing: sample.bearing,
    mode: segment.mode,
    travelled: [...completedPreviousChapters, ...completedCurrentSegments, sample.travelled],
    label: segment.label,
    segmentIndex,
    segmentProgress: localProgress,
  }
}

const cameraZoomForSegment = (
  mode: TransportMode,
  path: Coordinate[],
  mobile: boolean,
) => {
  const distance = haversineDistance(path[0], path.at(-1)!)
  let zoom = 5
  if (mode === 'stay') zoom = 10.2
  else if (mode === 'car') zoom = 9.25
  else if (mode === 'ship') zoom = 7.65
  else if (distance > 4500) zoom = 2.15
  else if (distance > 1500) zoom = 3.25
  else if (distance > 600) zoom = 4.65
  else zoom = 5.75
  return zoom - (mobile ? 0.5 : 0)
}

const setSourceLines = (map: MapLibreMap, id: string, coordinates: Coordinate[][]) => {
  const source = map.getSource(id) as GeoJSONSource | undefined
  source?.setData({
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates },
  })
}

export function JourneyGlobe({
  activeChapter,
  chapterProgress,
  overviewActive,
  overviewDay,
  selectedPoi,
  onSelectDay,
  onSelectPoi,
}: JourneyGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const vehicleLayerRef = useRef<Vehicle3DLayer | null>(null)
  const hotelLayerRef = useRef<Hotel3DLayer | null>(null)
  const fallbackVehicleRef = useRef<Marker | null>(null)
  const dayMarkersRef = useRef<Array<{ marker: Marker; element: HTMLButtonElement }>>([])
  const poiMarkersRef = useRef<Array<{ marker: Marker; element: HTMLButtonElement }>>([])
  const popupRef = useRef<Popup | null>(null)
  const callbackRef = useRef({ onSelectDay, onSelectPoi })
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [routeLabel, setRouteLabel] = useState('北京 → 维也纳')
  const [routeMode, setRouteMode] = useState<TransportMode>('plane')
  const [activeHotel, setActiveHotel] = useState<JourneyHotel | null>(journeyHotels[0])

  callbackRef.current = { onSelectDay, onSelectPoi }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: MapLibreMap
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: VECTOR_STYLE_URL,
        center: journeyChapters[0].segments[0].path[0],
        zoom: window.matchMedia('(max-width: 720px)').matches ? 4.85 : 5.35,
        bearing: 0,
        pitch: STORY_PITCH,
        attributionControl: false,
        renderWorldCopies: false,
        interactive: false,
      })
    } catch {
      setMapError(true)
      return
    }
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.on('style.load', () => {
      const baseLayers = map.getStyle().layers
      baseLayers.forEach((layer) => {
        if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-opacity', 0)
        if (layer.type === 'fill') map.setPaintProperty(layer.id, 'fill-opacity', 0)
        if (layer.type === 'raster') map.setPaintProperty(layer.id, 'raster-opacity', 0)
        if (layer.type === 'fill-extrusion') map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0)
        if (layer.type === 'hillshade') map.setPaintProperty(layer.id, 'hillshade-exaggeration', 0)
      })
      const firstStyleLayer = baseLayers[0]
      map.addSource('satellite-hd', {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: 'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
      })
      map.addLayer(
        {
          id: 'satellite-hd',
          type: 'raster',
          source: 'satellite-hd',
          paint: {
            'raster-opacity': 1,
            'raster-saturation': -0.08,
            'raster-contrast': 0.08,
            'raster-fade-duration': 120,
          },
        },
        firstStyleLayer?.id,
      )
      map.addLayer(
        {
          id: 'water-atmosphere',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'water',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, '#082c3c',
              6, '#0d4257',
              12, '#155a6f',
            ],
            'fill-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0.82,
              7, 0.7,
              13, 0.56,
            ],
          },
        },
        firstStyleLayer?.id,
      )
      map.addLayer(
        {
          id: 'water-shoreline',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'water',
          paint: {
            'line-color': 'rgba(164, 215, 222, 0.48)',
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 0.35,
              10, 1.2,
              15, 2,
            ],
            'line-blur': 0.55,
          },
        },
        firstStyleLayer?.id,
      )
      map.setProjection({ type: 'globe' })
      map.setSky({
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.65, 8, 0],
      })
    })

    map.on('load', () => {
      map.addSource('journey-progress', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'MultiLineString', coordinates: [journeyChapters[0].segments[0].path.slice(0, 2)] },
        },
      })
      map.addLayer({
        id: 'journey-progress-glow',
        type: 'line',
        source: 'journey-progress',
        paint: {
          'line-color': '#ec5b36',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 7, 10, 16],
          'line-opacity': 0.22,
        },
      })
      map.addLayer({
        id: 'journey-progress-line',
        type: 'line',
        source: 'journey-progress',
        paint: {
          'line-color': '#ec5b36',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 6],
          'line-opacity': 0.98,
        },
      })

      const initialState = getChapterState(0, 0)
      const vehicleLayer = new Vehicle3DLayer({
        ...initialState,
        visible: initialState.mode !== 'stay',
        flightProgress: 0,
        altitude: 60,
        pitch: 0,
      })
      try {
        map.addLayer(vehicleLayer)
        vehicleLayerRef.current = vehicleLayer
      } catch {
        const element = document.createElement('div')
        element.className = 'fallback-vehicle'
        element.textContent = '✈'
        fallbackVehicleRef.current = new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat(initialState.position)
          .addTo(map)
      }

      const hotelLayer = new Hotel3DLayer(journeyHotels)
      map.addLayer(hotelLayer)
      hotelLayer.setVisibleHotels(
        journeyHotels
          .filter((hotel) => hotel.chapterIds.includes(journeyChapters[0].id))
          .map((hotel) => hotel.id),
      )
      hotelLayerRef.current = hotelLayer

      dayMarkersRef.current = journeyChapters.map((chapter, index) => {
        const element = document.createElement('button')
        element.className = 'overview-day-marker'
        element.type = 'button'
        element.innerHTML = `<span>${String(chapter.day.id).padStart(2, '0')}</span>`
        element.setAttribute('aria-label', `${chapter.day.date} ${chapter.day.place}`)
        element.addEventListener('click', () => callbackRef.current.onSelectDay(index))
        const marker = new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat(chapter.day.coordinates)
          .addTo(map)
        return { marker, element }
      })

      poiMarkersRef.current = journeyPois.map((poi) => {
        const element = document.createElement('button')
        element.className = `overview-poi-marker ${poi.kind}`
        element.type = 'button'
        element.innerHTML = `<span>${poi.kind === 'food' ? '味' : poi.kind === 'scenic' ? '景' : '游'}</span>`
        element.setAttribute('aria-label', poi.name)
        element.addEventListener('click', () => callbackRef.current.onSelectPoi(poi))
        const marker = new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat(poi.coordinates)
          .addTo(map)
        return { marker, element }
      })

      ;[...dayMarkersRef.current, ...poiMarkersRef.current].forEach(({ element }) => {
        element.style.display = 'none'
      })
      setMapReady(true)
    })

    mapRef.current = map
    return () => {
      popupRef.current?.remove()
      dayMarkersRef.current = []
      poiMarkersRef.current = []
      vehicleLayerRef.current = null
      hotelLayerRef.current = null
      fallbackVehicleRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || overviewActive) return

    const state = getChapterState(activeChapter, chapterProgress)
    const chapter = journeyChapters[activeChapter]
    const currentSegment = chapter.segments[state.segmentIndex]
    const hotelsForChapter = journeyHotels.filter((hotel) => hotel.chapterIds.includes(chapter.id))
    hotelLayerRef.current?.setVisibleHotels(hotelsForChapter.map((hotel) => hotel.id))
    setActiveHotel(hotelsForChapter[0] ?? null)
    const isInitialTakeoff = currentSegment.id === 'pek-takeoff'
    const takeoffProgress = isInitialTakeoff ? smoothstep(state.segmentProgress) : 1
    const takeoffPitchProgress = Math.min(state.segmentProgress / 0.82, 1)
    const isFlight = state.mode === 'plane'
    const flightMotion = isFlight
      ? getFlightMotion(state.segmentProgress, currentSegment.id === 'pek-vie')
      : null

    vehicleLayerRef.current?.setState({
      position: state.position,
      bearing: state.bearing,
      mode: state.mode,
      visible: state.mode !== 'stay',
      flightProgress: isFlight ? state.segmentProgress : 1,
      altitude: isInitialTakeoff
        ? 60 + 27940 * takeoffProgress
        : flightMotion?.altitude,
      pitch: isInitialTakeoff
        ? Math.sin(Math.PI * takeoffPitchProgress) * 15
        : flightMotion?.pitch,
      scaleMultiplier: isInitialTakeoff ? 1 + takeoffProgress * 0.16 : 1,
    })
    if (fallbackVehicleRef.current) {
      const fallback = fallbackVehicleRef.current
      fallback.setLngLat(state.position)
      fallback.getElement().textContent =
        state.mode === 'plane' ? '✈' : state.mode === 'ship' ? '◆' : state.mode === 'car' ? '●' : ''
      fallback.getElement().style.display = state.mode === 'stay' ? 'none' : ''
    }
    setSourceLines(map, 'journey-progress', state.travelled)
    setRouteLabel(state.label)
    setRouteMode(state.mode)

    const previousSegment = state.segmentIndex > 0
      ? chapter.segments[state.segmentIndex - 1]
      : activeChapter > 0
        ? journeyChapters[activeChapter - 1].segments.at(-1)!
        : currentSegment
    const mobile = window.matchMedia('(max-width: 720px)').matches
    const previousZoom = previousSegment.id === 'pek-takeoff'
      ? 6.7 - (mobile ? 0.5 : 0)
      : cameraZoomForSegment(previousSegment.mode, previousSegment.path, mobile)
    const targetZoom = cameraZoomForSegment(currentSegment.mode, currentSegment.path, mobile)
    const zoomTransition = smoothstep(state.segmentProgress / 0.2)
    const baseCameraZoom = isInitialTakeoff
      ? 5.35 - (mobile ? 0.5 : 0) + takeoffProgress * 1.35
      : previousZoom + (targetZoom - previousZoom) * zoomTransition
    const flightEdgeDistance = currentSegment.id === 'pek-vie'
      ? 1 - state.segmentProgress
      : Math.min(state.segmentProgress, 1 - state.segmentProgress)
    const flightEdgeZoom = isFlight && !isInitialTakeoff
      ? (1 - smoothstep(flightEdgeDistance / 0.18)) * 0.55
      : 0
    const cameraZoom = baseCameraZoom + flightEdgeZoom

    map.jumpTo({
      center: state.position,
      zoom: cameraZoom,
      bearing: 0,
      pitch: STORY_PITCH,
    })
  }, [activeChapter, chapterProgress, mapReady, overviewActive])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    const allMarkers = [...dayMarkersRef.current, ...poiMarkersRef.current]
    allMarkers.forEach(({ element }) => {
      element.style.display = overviewActive ? '' : 'none'
    })

    if (overviewActive) {
      const mobile = window.matchMedia('(max-width: 720px)').matches
      if (mobile) {
        map.dragPan.disable()
        map.dragRotate.disable()
      } else {
        map.dragPan.enable()
        map.dragRotate.enable()
      }
      map.doubleClickZoom.enable()
      map.touchZoomRotate.enable()
      map.keyboard.enable()
      map.setProjection({ type: 'mercator' })
      vehicleLayerRef.current?.setState({
        position: journeyChapters.at(-1)!.day.coordinates,
        bearing: 0,
        mode: 'stay',
        visible: false,
      })
      fallbackVehicleRef.current?.getElement().style.setProperty('display', 'none')
      hotelLayerRef.current?.setVisibleHotels(journeyHotels.map((hotel) => hotel.id))
      setSourceLines(map, 'journey-progress', getAllRouteLines())
      map.easeTo({ center: [12.8, 64.4], zoom: 4.05, pitch: 0, bearing: 0, duration: 1300 })
    } else {
      map.dragPan.disable()
      map.dragRotate.disable()
      map.doubleClickZoom.disable()
      map.touchZoomRotate.disable()
      map.keyboard.disable()
      map.scrollZoom.disable()
      popupRef.current?.remove()
      map.setProjection({ type: 'globe' })
    }
  }, [mapReady, overviewActive])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !overviewActive) return
    const day = journeyChapters[overviewDay].day
    dayMarkersRef.current.forEach(({ element }, index) => {
      element.classList.toggle('active', index === overviewDay)
    })
    map.flyTo({
      center: day.coordinates,
      zoom: Math.min(day.mapZoom, 9.2),
      pitch: 18,
      duration: 900,
      essential: true,
    })
  }, [mapReady, overviewActive, overviewDay])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !overviewActive || !selectedPoi) return
    popupRef.current?.remove()
    map.stop()
    const pageScrollTop = window.scrollY

    const content = document.createElement('div')
    content.className = 'journey-popup'
    const image = document.createElement('img')
    image.src = selectedPoi.image
    image.alt = selectedPoi.name
    const copy = document.createElement('div')
    const label = document.createElement('small')
    label.textContent = selectedPoi.kind === 'food' ? 'LOCAL TASTE' : selectedPoi.kind === 'scenic' ? 'SCENERY' : 'PLACE'
    const title = document.createElement('h3')
    title.textContent = selectedPoi.name
    const description = document.createElement('p')
    description.textContent = selectedPoi.description
    copy.append(label, title, description)
    content.append(image, copy)

    popupRef.current = new maplibregl.Popup({
      offset: 22,
      maxWidth: '280px',
      className: 'journey-map-popup',
      closeOnMove: false,
      focusAfterOpen: false,
    })
      .setLngLat(selectedPoi.coordinates)
      .setDOMContent(content)
      .addTo(map)
    map.easeTo({
      center: selectedPoi.coordinates,
      zoom: 10.8,
      pitch: 20,
      bearing: 0,
      duration: 550,
      essential: true,
    })
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - pageScrollTop) > 1) window.scrollTo(0, pageScrollTop)
    })
  }, [mapReady, overviewActive, selectedPoi])

  return (
    <div
      className="journey-map-shell"
      style={{ '--fallback-image': `url("${assetUrl('lofoten.jpg')}")` } as CSSProperties}
    >
      <div ref={containerRef} className="journey-map" />
      {mapError && (
        <div className="map-fallback">
          <strong>3D 地球暂不可用</strong>
          <span>已切换为静态路线背景，行程内容仍可继续浏览。</span>
        </div>
      )}
      {!overviewActive && (
        <>
          <div className="globe-hud">
            <span className={`mode-dot ${routeMode}`} />
            <div>
              <small>{routeMode === 'plane' ? 'IN FLIGHT' : routeMode === 'ship' ? 'AT SEA' : routeMode === 'car' ? 'ON THE ROAD' : 'EXPLORING'}</small>
              <strong>{routeLabel}</strong>
            </div>
          </div>
          {activeHotel && (
            <div className="globe-hotel">
              <span>住宿 · {activeHotel.dates}</span>
              <strong>{activeHotel.name}</strong>
            </div>
          )}
          <div className="globe-coordinate">59°N — 70°N · NORD 66°</div>
        </>
      )}
    </div>
  )
}

