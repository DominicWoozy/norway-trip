import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type {
  CustomLayerInterface,
  CustomRenderMethodInput,
  Map as MapLibreMap,
} from 'maplibre-gl'
import type { Coordinate } from '../geo/routeMath'
import type { TransportMode } from '../data/journey'

export type VehicleRenderState = {
  position: Coordinate
  bearing: number
  mode: TransportMode
  visible: boolean
}

type MovingMode = Exclude<TransportMode, 'stay'>

const modelUrls: Record<MovingMode, string> = {
  car: '/models/car.glb',
  plane: '/models/plane.glb',
  ship: '/models/ship.glb',
}

const orange = new THREE.MeshStandardMaterial({ color: 0xec5b36, roughness: 0.62 })
const cream = new THREE.MeshStandardMaterial({ color: 0xf6f1e4, roughness: 0.72 })
const blue = new THREE.MeshStandardMaterial({ color: 0x315e79, roughness: 0.55 })

const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) =>
  new THREE.Mesh(geometry, material)

const buildFallbackCar = () => {
  const group = new THREE.Group()
  const body = mesh(new THREE.BoxGeometry(4.4, 1.6, 8), orange)
  body.position.y = 1.3
  const cabin = mesh(new THREE.BoxGeometry(3.5, 1.8, 4), cream)
  cabin.position.set(0, 2.8, -0.2)
  group.add(body, cabin)
  return group
}

const buildFallbackPlane = () => {
  const group = new THREE.Group()
  const body = mesh(new THREE.BoxGeometry(2.2, 1.7, 10), cream)
  body.position.y = 1.4
  const wings = mesh(new THREE.BoxGeometry(12, 0.35, 2.2), orange)
  wings.position.y = 1.5
  group.add(body, wings)
  return group
}

const buildFallbackShip = () => {
  const group = new THREE.Group()
  const hull = mesh(new THREE.BoxGeometry(4.6, 1.8, 10), blue)
  hull.position.y = 1.1
  const deck = mesh(new THREE.BoxGeometry(3.6, 1.5, 6), cream)
  deck.position.y = 2.35
  group.add(hull, deck)
  return group
}

const normalizeImportedModel = (source: THREE.Group) => {
  const removable: THREE.Object3D[] = []
  source.traverse((object) => {
    if (object instanceof THREE.Camera || object instanceof THREE.Light) removable.push(object)
    if (object instanceof THREE.Mesh) {
      object.castShadow = false
      object.receiveShadow = false
    }
  })
  removable.forEach((object) => object.parent?.remove(object))

  const bounds = new THREE.Box3().setFromObject(source)
  const center = bounds.getCenter(new THREE.Vector3())
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  const radius = sphere.radius || 1
  source.position.set(-center.x, -bounds.min.y, -center.z)
  source.scale.multiplyScalar(5 / radius)

  const wrapper = new THREE.Group()
  wrapper.add(source)
  wrapper.visible = false
  return wrapper
}

export class Vehicle3DLayer implements CustomLayerInterface {
  id = 'journey-vehicle-3d'
  type = 'custom' as const
  renderingMode = '3d' as const

  private map?: MapLibreMap
  private renderer?: THREE.WebGLRenderer
  private camera = new THREE.Camera()
  private scene = new THREE.Scene()
  private disposed = false
  private models: Record<MovingMode, THREE.Group> = {
    car: normalizeImportedModel(buildFallbackCar()),
    plane: normalizeImportedModel(buildFallbackPlane()),
    ship: normalizeImportedModel(buildFallbackShip()),
  }
  private state: VehicleRenderState

  constructor(initialState: VehicleRenderState) {
    this.state = initialState
    Object.values(this.models).forEach((model) => {
      model.visible = false
      this.scene.add(model)
    })
  }

  setState(next: VehicleRenderState) {
    this.state = next
    this.map?.triggerRepaint()
  }

  private loadDetailedModels() {
    const loader = new GLTFLoader()
    ;(Object.keys(modelUrls) as MovingMode[]).forEach((mode) => {
      loader.load(
        modelUrls[mode],
        (gltf) => {
          if (this.disposed) return
          const detailedModel = normalizeImportedModel(gltf.scene)
          this.scene.remove(this.models[mode])
          this.models[mode] = detailedModel
          this.scene.add(detailedModel)
          this.map?.triggerRepaint()
        },
        undefined,
        () => {
          // The procedural model remains as a reliable offline fallback.
        },
      )
    })
  }

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.map = map
    this.scene.add(new THREE.HemisphereLight(0xf6f1e4, 0x183838, 2.8))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6)
    keyLight.position.set(-20, -30, 60)
    this.scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xec8a6d, 2)
    rimLight.position.set(35, 10, 20)
    this.scene.add(rimLight)

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    })
    this.renderer.autoClear = false
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.25
    this.loadDetailedModels()
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput) {
    if (!this.map || !this.renderer) return

    Object.values(this.models).forEach((model) => { model.visible = false })
    if (!this.state.visible || this.state.mode === 'stay') return

    const model = this.models[this.state.mode]
    model.visible = true
    // getMatrixForModel maps glTF +Y-up to the globe surface normal.
    // glTF +Z is forward, so heading rotates around local +Y.
    model.rotation.y = THREE.MathUtils.degToRad(180 - this.state.bearing)

    const altitude = this.state.mode === 'plane' ? 28000 : this.state.mode === 'ship' ? 20 : 40
    const baseScale = 20000
    const zoomScale = 1 / Math.max(1, Math.pow(2, this.map.getZoom() - 2.25))
    const scale = baseScale * zoomScale
    const modelMatrix = this.map.transform.getMatrixForModel(this.state.position, altitude)
    const projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix)
    const localMatrix = new THREE.Matrix4()
      .fromArray(modelMatrix)
      .scale(new THREE.Vector3(scale, scale, scale))

    this.camera.projectionMatrix = projectionMatrix.multiply(localMatrix)
    this.renderer.resetState()
    this.renderer.render(this.scene, this.camera)
  }

  onRemove() {
    this.disposed = true
    Object.values(this.models).forEach((model) => {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
      })
    })
    this.renderer?.dispose()
    this.renderer = undefined
    this.map = undefined
  }
}

