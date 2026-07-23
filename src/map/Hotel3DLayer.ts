import * as THREE from 'three'
import type {
  CustomLayerInterface,
  CustomRenderMethodInput,
  Map as MapLibreMap,
} from 'maplibre-gl'
import type { JourneyHotel } from '../data/journey'

const buildHouse = () => {
  const house = new THREE.Group()
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf6f1e4, roughness: 0.78 })
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xec5b36, roughness: 0.7 })
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x102828, roughness: 0.65 })
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8e1ee,
    emissive: 0x4f8797,
    emissiveIntensity: 0.75,
  })

  const walls = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.4, 5.8), wallMaterial)
  walls.position.y = 2.2
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.1, 3.1, 4), roofMaterial)
  roof.position.y = 5.9
  roof.rotation.y = Math.PI / 4
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.65, 0.24), trimMaterial)
  door.position.set(0, 1.35, 3.02)

  const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 0.26), windowMaterial)
  leftWindow.position.set(-2, 2.55, 3.03)
  const rightWindow = leftWindow.clone()
  rightWindow.position.x = 2

  house.add(walls, roof, door, leftWindow, rightWindow)
  house.rotation.y = Math.PI / 4
  return house
}

export class Hotel3DLayer implements CustomLayerInterface {
  id = 'journey-hotels-3d'
  type = 'custom' as const
  renderingMode = '3d' as const

  private map?: MapLibreMap
  private renderer?: THREE.WebGLRenderer
  private camera = new THREE.Camera()
  private scene = new THREE.Scene()
  private house = buildHouse()
  private visibleIds = new Set<string>()
  private hotels: JourneyHotel[]

  constructor(hotels: JourneyHotel[]) {
    this.hotels = hotels
    this.scene.add(this.house)
  }

  setVisibleHotels(ids: string[]) {
    this.visibleIds = new Set(ids)
    this.map?.triggerRepaint()
  }

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.map = map
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x183838, 2.6))
    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(-20, -25, 50)
    this.scene.add(light)

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    })
    this.renderer.autoClear = false
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput) {
    if (!this.map || !this.renderer || this.visibleIds.size === 0) return

    const projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix)
    const scale = 9000 / Math.max(1, Math.pow(2, this.map.getZoom() - 2.25))

    this.hotels.forEach((hotel) => {
      if (!this.visibleIds.has(hotel.id)) return
      const modelMatrix = this.map!.transform.getMatrixForModel(hotel.coordinates, 12)
      const localMatrix = new THREE.Matrix4()
        .fromArray(modelMatrix)
        .scale(new THREE.Vector3(scale, scale, scale))
      this.camera.projectionMatrix = projectionMatrix.clone().multiply(localMatrix)
      this.renderer!.resetState()
      this.renderer!.render(this.scene, this.camera)
    })
  }

  onRemove() {
    this.house.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => material.dispose())
    })
    this.renderer?.dispose()
    this.renderer = undefined
    this.map = undefined
  }
}
