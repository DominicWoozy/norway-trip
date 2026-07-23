import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type {
  CustomLayerInterface,
  CustomRenderMethodInput,
  Map as MapLibreMap,
} from 'maplibre-gl'
import type { JourneyHotel } from '../data/journey'
import { assetUrl } from '../assets'

const hotelColor = new THREE.Color(0x3f7475)
const hotelLight = new THREE.Color(0xf0e4cf)
const hotelDark = new THREE.Color(0x183f46)

const buildFallbackHouse = () => {
  const house = new THREE.Group()
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 4.4, 5.8),
    new THREE.MeshStandardMaterial({ color: hotelLight, roughness: 0.78 }),
  )
  walls.position.y = 2.2
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5.1, 3.1, 4),
    new THREE.MeshStandardMaterial({ color: hotelColor, roughness: 0.7 }),
  )
  roof.position.y = 5.9
  roof.rotation.y = Math.PI / 4
  house.add(walls, roof)
  return house
}

const normalizeModel = (source: THREE.Group) => {
  const removable: THREE.Object3D[] = []
  source.traverse((object) => {
    if (object instanceof THREE.Camera || object instanceof THREE.Light) removable.push(object)
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = false
    object.receiveShadow = false

    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
    const tintedMaterials = sourceMaterials.map((sourceMaterial) => {
      const material = sourceMaterial.clone()
      if (material instanceof THREE.MeshStandardMaterial) {
        const targetColor = material.color.getHSL({ h: 0, s: 0, l: 0 }).l > 0.48
          ? hotelLight
          : hotelColor
        material.color.lerp(targetColor, 0.62)
        material.emissive = hotelDark.clone().multiplyScalar(0.04)
        material.emissiveIntensity = 0.18
        material.roughness = Math.max(material.roughness, 0.55)
      }
      return material
    })
    object.material = Array.isArray(object.material) ? tintedMaterials : tintedMaterials[0]
  })
  removable.forEach((object) => object.parent?.remove(object))

  const bounds = new THREE.Box3().setFromObject(source)
  const center = bounds.getCenter(new THREE.Vector3())
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  source.position.set(-center.x, -bounds.min.y, -center.z)
  source.scale.multiplyScalar(5 / (sphere.radius || 1))

  const wrapper = new THREE.Group()
  wrapper.add(source)
  return wrapper
}

export class Hotel3DLayer implements CustomLayerInterface {
  id = 'journey-hotels-3d'
  type = 'custom' as const
  renderingMode = '3d' as const

  private map?: MapLibreMap
  private renderer?: THREE.WebGLRenderer
  private camera = new THREE.Camera()
  private scene = new THREE.Scene()
  private house = normalizeModel(buildFallbackHouse())
  private visibleIds = new Set<string>()
  private hotels: JourneyHotel[]
  private disposed = false

  constructor(hotels: JourneyHotel[]) {
    this.hotels = hotels
    this.scene.add(this.house)
  }

  setVisibleHotels(ids: string[]) {
    this.visibleIds = new Set(ids)
    this.map?.triggerRepaint()
  }

  private loadDetailedHouse() {
    const loader = new GLTFLoader()
    loader.load(
      assetUrl('models/hotel.glb'),
      (gltf) => {
        if (this.disposed) return
        const detailedHouse = normalizeModel(gltf.scene)
        this.scene.remove(this.house)
        this.house = detailedHouse
        this.scene.add(this.house)
        this.map?.triggerRepaint()
      },
      undefined,
      () => {
        // Keep the themed procedural house when the GLB cannot be loaded.
      },
    )
  }

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.map = map
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x183838, 3))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4)
    keyLight.position.set(-20, -25, 50)
    this.scene.add(keyLight)
    const themeLight = new THREE.DirectionalLight(0xf2c6a5, 1.1)
    themeLight.position.set(25, 12, 20)
    this.scene.add(themeLight)

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    })
    this.renderer.autoClear = false
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.loadDetailedHouse()
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput) {
    if (!this.map || !this.renderer || this.visibleIds.size === 0) return

    const projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix)
    const zoomDelta = Math.max(0, this.map.getZoom() - 2.25)
    const scale = 9000 / Math.pow(2, zoomDelta * 0.82)

    this.hotels.forEach((hotel) => {
      if (!this.visibleIds.has(hotel.id)) return
      const modelMatrix = this.map!.transform.getMatrixForModel(hotel.coordinates, 40)
      const localMatrix = new THREE.Matrix4()
        .fromArray(modelMatrix)
        .scale(new THREE.Vector3(scale, scale, scale))
      this.camera.projectionMatrix = projectionMatrix.clone().multiply(localMatrix)
      this.renderer!.resetState()
      this.renderer!.render(this.scene, this.camera)
    })
  }

  onRemove() {
    this.disposed = true
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
