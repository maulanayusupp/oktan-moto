// =============================================================================
// The 3D hero: a procedurally-built superbike on a lit turntable (three.js).
//
// Why procedural instead of a downloaded model: no licence ambiguity, no 8 MB
// GLB on first paint, and the livery can be recoloured live. The machine is
// assembled from primitives plus extruded side-profile shapes (fairing, tank,
// tail), which is what gives it a readable silhouette rather than a box on
// wheels.
//
// All dimensions come from app/config/bike-model.config.ts (metres, ground at
// y = 0), which scripts/render-bike-profile.mjs can render as a side-view SVG —
// so the proportions are verifiable without opening a browser.
//
// three.js is imported dynamically so it never lands in the SSR bundle or the
// initial client chunk. The caller (HeroStage.vue) shows a static poster until
// `ready` flips, and keeps that poster if WebGL is unavailable or the visitor
// prefers reduced motion.
// =============================================================================
import { bikeModel } from '~/config/bike-model.config'

type Three = typeof import('three')
type Point = readonly [number, number] | number[]

export interface SceneLivery {
  paint: string
  accent: string
}

interface SceneHandle {
  ready: Ref<boolean>
  failed: Ref<boolean>
  mount: (canvas: HTMLCanvasElement, livery: SceneLivery) => Promise<void>
  setLivery: (livery: SceneLivery) => void
  dispose: () => void
}

export function useSuperbikeScene(): SceneHandle {
  const ready = ref(false)
  const failed = ref(false)

  let THREE: Three | null = null
  let renderer: import('three').WebGLRenderer | null = null
  let scene: import('three').Scene | null = null
  let camera: import('three').PerspectiveCamera | null = null
  let bike: import('three').Group | null = null
  let streaks: import('three').Points | null = null
  let frame = 0
  let observer: ResizeObserver | null = null
  let visibility: IntersectionObserver | null = null
  let running = false
  let reducedMotion = false

  // Materials that change with the livery are kept for direct recolouring.
  const paintMaterials: import('three').MeshStandardMaterial[] = []
  const accentMaterials: import('three').MeshStandardMaterial[] = []
  const disposables: { dispose: () => void }[] = []

  // Pointer-driven turntable state (target vs current = inertia).
  let spin = 0.5
  let spinTarget = 0.5
  let tiltTarget = 0
  let tilt = 0
  let dragging = false
  let lastX = 0
  let lastY = 0

  function track<T extends { dispose: () => void }>(item: T): T {
    disposables.push(item)
    return item
  }

  // --- Geometry helpers --------------------------------------------------------

  /** Extrudes a side-profile outline along Z and centres it on the axis. */
  function profile(t: Three, spec: { points: readonly Point[]; depth: number; bevel: number }) {
    const shape = new t.Shape()
    spec.points.forEach((point, index) => {
      const [x, y] = point as [number, number]
      if (index === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
    shape.closePath()
    const geometry = new t.ExtrudeGeometry(shape, {
      depth: spec.depth,
      bevelEnabled: true,
      bevelThickness: spec.bevel,
      bevelSize: spec.bevel,
      bevelSegments: 3,
      curveSegments: 8,
    })
    geometry.translate(0, 0, -spec.depth / 2)
    return track(geometry)
  }

  function wheel(t: Three, x: number, rimColor: number) {
    const { tyre: tyreRadius, tube } = bikeModel.wheels
    const outer = tyreRadius + tube
    const group = new t.Group()

    const tyre = new t.Mesh(
      track(new t.TorusGeometry(tyreRadius, tube, 14, 44)),
      track(new t.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.95, metalness: 0.04 })),
    )
    group.add(tyre)

    const rim = new t.Mesh(
      track(new t.CylinderGeometry(tyreRadius * 0.72, tyreRadius * 0.72, tyreRadius * 0.36, 28)),
      track(new t.MeshStandardMaterial({ color: rimColor, metalness: 0.9, roughness: 0.3 })),
    )
    rim.rotation.x = Math.PI / 2
    group.add(rim)

    // Five-spoke star, the visual shorthand for a sportbike wheel.
    const spokeGeometry = track(
      new t.BoxGeometry(tyreRadius * 1.4, tyreRadius * 0.16, tyreRadius * 0.3),
    )
    const spokeMaterial = track(
      new t.MeshStandardMaterial({ color: rimColor, metalness: 0.85, roughness: 0.34 }),
    )
    for (let i = 0; i < 5; i++) {
      const spoke = new t.Mesh(spokeGeometry, spokeMaterial)
      spoke.rotation.z = (i * Math.PI) / 5
      group.add(spoke)
    }

    const disc = new t.Mesh(
      track(new t.CylinderGeometry(tyreRadius * 0.62, tyreRadius * 0.62, 0.012, 26)),
      track(new t.MeshStandardMaterial({ color: 0x6f7684, metalness: 1, roughness: 0.42 })),
    )
    disc.rotation.x = Math.PI / 2
    disc.position.z = tyreRadius * 0.36
    group.add(disc)

    // Sit on the tyre's OUTER radius so nothing sinks through the floor.
    group.position.set(x, outer, 0)
    group.traverse((child) => {
      child.castShadow = true
    })
    return group
  }

  /** Box part from config: `at` is the centre in the side plane. */
  function boxPart(
    t: Three,
    spec: { at: readonly number[]; size: readonly number[]; rotate?: number },
    material: import('three').Material,
    z = 0,
  ) {
    const [x, y] = spec.at
    const [w, h, d] = spec.size
    const mesh = new t.Mesh(track(new t.BoxGeometry(w, h ?? w, d ?? w)), material)
    mesh.position.set(x ?? 0, y ?? 0, z)
    if (spec.rotate) mesh.rotation.z = spec.rotate
    return mesh
  }

  /** Cylinder part from config: size is [radius, length], rotate is about z. */
  function tubePart(
    t: Three,
    spec: { at: readonly number[]; size: readonly number[]; rotate?: number },
    material: import('three').Material,
    z = 0,
  ) {
    const [x, y] = spec.at
    const [radius, length] = spec.size
    const mesh = new t.Mesh(
      track(new t.CylinderGeometry(radius, radius, length ?? radius, 16)),
      material,
    )
    mesh.position.set(x ?? 0, y ?? 0, z)
    if (spec.rotate) mesh.rotation.z = spec.rotate
    return mesh
  }

  function buildBike(t: Three, livery: SceneLivery) {
    const group = new t.Group()

    const paint = track(
      new t.MeshStandardMaterial({ color: livery.paint, metalness: 0.5, roughness: 0.26 }),
    )
    const accent = track(
      new t.MeshStandardMaterial({ color: livery.accent, metalness: 0.72, roughness: 0.34 }),
    )
    paintMaterials.push(paint)
    accentMaterials.push(accent)

    const carbon = track(new t.MeshStandardMaterial({ color: 0x14171d, metalness: 0.42, roughness: 0.6 }))
    const metal = track(new t.MeshStandardMaterial({ color: 0x9aa3b0, metalness: 0.96, roughness: 0.24 }))
    const dark = track(new t.MeshStandardMaterial({ color: 0x0c0e12, metalness: 0.3, roughness: 0.7 }))
    const glass = track(
      new t.MeshStandardMaterial({
        color: 0x9fdcff,
        metalness: 0.1,
        roughness: 0.08,
        transparent: true,
        opacity: 0.3,
      }),
    )
    const lamp = track(
      new t.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0dd, emissiveIntensity: 2.4 }),
    )
    const tail = track(
      new t.MeshStandardMaterial({ color: 0x2a0b06, emissive: 0xff2a10, emissiveIntensity: 2.2 }),
    )

    const { parts, profiles, offsets, wheels } = bikeModel

    // Wheels + running gear ----------------------------------------------------
    group.add(wheel(t, wheels.rearX, 0x2b313b))
    group.add(wheel(t, wheels.frontX, 0x2b313b))

    for (const z of offsets.swingarm) group.add(boxPart(t, parts.swingarm, metal, z))

    // Frame rails in the accent colour — the livery's second tone.
    for (const z of offsets.rails) {
      group.add(boxPart(t, parts.railUpper, accent, z))
      group.add(boxPart(t, parts.railLower, accent, z))
    }

    // Engine ------------------------------------------------------------------
    group.add(boxPart(t, parts.engineBlock, carbon))
    group.add(boxPart(t, parts.cylinderHead, metal))
    group.add(boxPart(t, parts.sump, metal))

    // Bodywork: extruded side profiles ----------------------------------------
    for (const spec of [profiles.fairing, profiles.tank, profiles.tail, profiles.bellypan, profiles.mudguard]) {
      group.add(new t.Mesh(profile(t, spec), paint))
    }
    group.add(new t.Mesh(profile(t, profiles.screen), glass))
    group.add(boxPart(t, parts.seat, dark))

    // Front end ---------------------------------------------------------------
    for (const z of offsets.forks) group.add(tubePart(t, parts.fork, metal, z))

    // The bar runs across the bike, so it is rotated about x, not z.
    const bar = tubePart(t, parts.handlebar, dark)
    bar.rotation.x = Math.PI / 2
    group.add(bar)

    // Lights ------------------------------------------------------------------
    const headlight = new t.Mesh(track(new t.SphereGeometry(parts.headlight.size[0], 18, 14)), lamp)
    headlight.position.set(parts.headlight.at[0]!, parts.headlight.at[1]!, 0)
    headlight.scale.set(0.55, 0.9, 1)
    group.add(headlight)
    group.add(boxPart(t, parts.taillight, tail))

    // Exhaust: header tucked under the engine, silencer offset to one side ----
    group.add(tubePart(t, parts.exhaustHeader, metal, 0.07))
    group.add(tubePart(t, parts.silencer, metal, 0.11))

    group.traverse((child) => {
      child.castShadow = true
      child.receiveShadow = false
    })

    // No cosmetic lean: the wheels are positioned to touch y = 0 exactly, and
    // rotating the group would push one contact patch through the floor.
    return group
  }

  /** Additive point cloud drifting past the machine — implied airflow. */
  function buildStreaks(t: Three) {
    const count = 420
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.2 + Math.random() * 3.2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * 2.6
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    const geometry = track(new t.BufferGeometry())
    geometry.setAttribute('position', new t.BufferAttribute(positions, 3))
    const material = track(
      new t.PointsMaterial({
        color: 0x8fb2c8,
        size: 0.016,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: t.AdditiveBlending,
        sizeAttenuation: true,
      }),
    )
    return new t.Points(geometry, material)
  }

  /** Radial floor gradient, drawn to a canvas so no image asset is needed. */
  function floorTexture(t: Three) {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2)
      gradient.addColorStop(0, '#1b1f27')
      gradient.addColorStop(0.45, '#0d0f14')
      gradient.addColorStop(1, '#06070a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Faint concentric telemetry rings.
      ctx.strokeStyle = 'rgba(160,176,196,0.10)'
      ctx.lineWidth = 1
      for (let r = 40; r < size / 2; r += 34) {
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    const texture = track(new t.CanvasTexture(canvas))
    texture.colorSpace = t.SRGBColorSpace
    return texture
  }

  async function mount(canvas: HTMLCanvasElement, livery: SceneLivery) {
    try {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Cheap capability probe before pulling in ~600 kB of three.js.
      const probe = document.createElement('canvas')
      if (!probe.getContext('webgl2') && !probe.getContext('webgl')) {
        failed.value = true
        return
      }

      THREE = await import('three')
      const t = THREE

      const parent = canvas.parentElement
      const width = parent?.clientWidth || canvas.clientWidth || 800
      const height = parent?.clientHeight || canvas.clientHeight || 520

      renderer = new t.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height, false)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = t.PCFSoftShadowMap
      renderer.toneMapping = t.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.06

      scene = new t.Scene()
      // Fog starts beyond the machine so only the floor edges fade out.
      scene.fog = new t.Fog(0x06070a, 6.5, 13)

      const view = bikeModel.camera
      camera = new t.PerspectiveCamera(view.fov, width / height, 0.1, 60)
      camera.position.set(view.position[0], view.position[1], view.position[2])
      camera.lookAt(view.target[0], view.target[1], view.target[2])

      // Lighting: soft fill, one key with shadow, two coloured rims.
      scene.add(new t.HemisphereLight(0x5d6b7f, 0x05060a, 0.5))

      const key = new t.DirectionalLight(0xffffff, 2.1)
      key.position.set(3.4, 4.6, 2.6)
      key.castShadow = true
      key.shadow.mapSize.set(1024, 1024)
      key.shadow.camera.near = 0.5
      key.shadow.camera.far = 14
      key.shadow.camera.left = -2.4
      key.shadow.camera.right = 2.4
      key.shadow.camera.top = 2.4
      key.shadow.camera.bottom = -2.4
      key.shadow.bias = -0.0008
      scene.add(key)

      const rimWarm = new t.SpotLight(0xff5a22, 42, 9, 0.9, 0.9, 1.4)
      rimWarm.position.set(-2.6, 1.9, -2.4)
      scene.add(rimWarm)

      const rimCool = new t.PointLight(0x3fd8e8, 16, 8)
      rimCool.position.set(2.4, 0.9, -2.6)
      scene.add(rimCool)

      const underglow = new t.PointLight(livery.paint, 6, 3.4)
      underglow.position.set(0, 0.12, 0)
      scene.add(underglow)

      const floor = new t.Mesh(
        track(new t.CircleGeometry(5.2, 64)),
        track(
          new t.MeshStandardMaterial({
            map: floorTexture(t),
            metalness: 0.62,
            roughness: 0.44,
          }),
        ),
      )
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      bike = buildBike(t, livery)
      scene.add(bike)

      streaks = buildStreaks(t)
      scene.add(streaks)

      // Resize with the container (hero is fluid across breakpoints).
      if (parent && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          if (!renderer || !camera || !parent) return
          const w = parent.clientWidth
          const h = parent.clientHeight
          if (!w || !h) return
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        })
        observer.observe(parent)
      }

      // Only animate while the hero is actually on screen.
      if (typeof IntersectionObserver !== 'undefined') {
        visibility = new IntersectionObserver(
          ([entry]) => {
            running = Boolean(entry?.isIntersecting)
            if (running) loop()
          },
          { threshold: 0.05 },
        )
        visibility.observe(canvas)
      } else {
        running = true
      }

      attachPointer(canvas)
      ready.value = true
      running = true
      loop()
    } catch (error) {
      // A failed hero must never take the page down — fall back to the poster.
      console.error('[oktan] 3D hero unavailable:', error)
      failed.value = true
      dispose()
    }
  }

  function attachPointer(canvas: HTMLCanvasElement) {
    const onDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture?.(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      spinTarget += (event.clientX - lastX) * 0.006
      tiltTarget = Math.max(-0.18, Math.min(0.3, tiltTarget + (event.clientY - lastY) * 0.0025))
      lastX = event.clientX
      lastY = event.clientY
    }
    const onUp = (event: PointerEvent) => {
      dragging = false
      canvas.releasePointerCapture?.(event.pointerId)
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)
    canvas.addEventListener('pointercancel', onUp)

    disposables.push({
      dispose: () => {
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointerleave', onUp)
        canvas.removeEventListener('pointercancel', onUp)
      },
    })
  }

  function loop() {
    if (!renderer || !scene || !camera || !bike) return
    if (!running) {
      cancelAnimationFrame(frame)
      return
    }

    if (!reducedMotion && !dragging) spinTarget += 0.0022

    // Inertia towards the pointer/auto target keeps the motion premium-slow.
    spin += (spinTarget - spin) * 0.06
    tilt += (tiltTarget - tilt) * 0.06
    bike.rotation.y = spin
    bike.position.y = Math.sin(spin * 1.6) * 0.004
    camera.position.y = bikeModel.camera.position[1] + tilt
    camera.lookAt(bikeModel.camera.target[0], bikeModel.camera.target[1], bikeModel.camera.target[2])

    if (streaks && !reducedMotion) {
      streaks.rotation.y -= 0.0016
      streaks.position.y = Math.sin(spin * 0.6) * 0.05
    }

    renderer.render(scene, camera)
    frame = requestAnimationFrame(loop)
  }

  function setLivery(livery: SceneLivery) {
    if (!THREE) return
    for (const material of paintMaterials) material.color.set(livery.paint)
    for (const material of accentMaterials) material.color.set(livery.accent)
    // Re-render immediately so the swatch feels instant even when paused.
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  function dispose() {
    running = false
    cancelAnimationFrame(frame)
    observer?.disconnect()
    observer = null
    visibility?.disconnect()
    visibility = null
    for (const item of disposables.splice(0)) item.dispose()
    paintMaterials.length = 0
    accentMaterials.length = 0
    renderer?.dispose()
    renderer = null
    scene = null
    camera = null
    bike = null
    streaks = null
    THREE = null
    ready.value = false
  }

  onBeforeUnmount(dispose)

  return { ready, failed, mount, setLivery, dispose }
}
