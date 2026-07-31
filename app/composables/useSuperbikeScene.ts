// =============================================================================
// The 3D hero: a procedurally-built superbike on a lit turntable (three.js).
//
// Why procedural instead of a downloaded model: no licence ambiguity, no 8 MB
// GLB on first paint, and the livery can be recoloured live. The machine is
// assembled from primitives plus extruded side-profile shapes (fairing, tank,
// tail), which is what gives it a readable silhouette rather than a box on
// wheels.
//
// three.js is imported dynamically so it never lands in the SSR bundle or the
// initial client chunk. The caller (HeroStage.vue) shows a static poster until
// `ready` flips, and keeps that poster if WebGL is unavailable or the visitor
// prefers reduced motion.
// =============================================================================
type Three = typeof import('three')

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
  function profile(
    t: Three,
    points: [number, number][],
    depth: number,
    bevel = 0.025,
  ): import('three').ExtrudeGeometry {
    const shape = new t.Shape()
    points.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
    shape.closePath()
    const geometry = new t.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 8,
    })
    geometry.translate(0, 0, -depth / 2)
    return track(geometry)
  }

  function wheel(t: Three, x: number, radius: number, rimColor: number) {
    const group = new t.Group()

    const tyre = new t.Mesh(
      track(new t.TorusGeometry(radius, radius * 0.3, 14, 44)),
      track(new t.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.95, metalness: 0.04 })),
    )
    group.add(tyre)

    const rim = new t.Mesh(
      track(new t.CylinderGeometry(radius * 0.72, radius * 0.72, radius * 0.34, 28)),
      track(new t.MeshStandardMaterial({ color: rimColor, metalness: 0.9, roughness: 0.3 })),
    )
    rim.rotation.x = Math.PI / 2
    group.add(rim)

    // Five-spoke star, the visual shorthand for a sportbike wheel.
    const spokeGeometry = track(new t.BoxGeometry(radius * 1.36, radius * 0.16, radius * 0.3))
    const spokeMaterial = track(
      new t.MeshStandardMaterial({ color: rimColor, metalness: 0.85, roughness: 0.34 }),
    )
    for (let i = 0; i < 5; i++) {
      const spoke = new t.Mesh(spokeGeometry, spokeMaterial)
      spoke.rotation.z = (i * Math.PI) / 5
      group.add(spoke)
    }

    const disc = new t.Mesh(
      track(new t.CylinderGeometry(radius * 0.6, radius * 0.6, 0.012, 26)),
      track(new t.MeshStandardMaterial({ color: 0x6f7684, metalness: 1, roughness: 0.42 })),
    )
    disc.rotation.x = Math.PI / 2
    disc.position.z = radius * 0.36
    group.add(disc)

    group.position.set(x, radius, 0)
    group.traverse((child) => {
      child.castShadow = true
    })
    return group
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

    // Wheels + running gear -----------------------------------------------------
    group.add(wheel(t, -0.62, 0.31, 0x2b313b))
    group.add(wheel(t, 0.7, 0.31, 0x2b313b))

    const swingarm = new t.Mesh(track(new t.BoxGeometry(0.56, 0.07, 0.055)), metal)
    swingarm.position.set(-0.35, 0.35, 0)
    swingarm.rotation.z = 0.06
    for (const z of [-0.11, 0.11]) {
      const arm = swingarm.clone()
      arm.position.z = z
      group.add(arm)
    }

    // Trellis-ish frame rails in the accent colour.
    const rail = track(new t.BoxGeometry(0.62, 0.05, 0.05))
    for (const z of [-0.13, 0.13]) {
      const upper = new t.Mesh(rail, accent)
      upper.position.set(0.12, 0.56, z)
      upper.rotation.z = -0.05
      group.add(upper)

      const lower = new t.Mesh(track(new t.BoxGeometry(0.42, 0.045, 0.045)), accent)
      lower.position.set(-0.12, 0.41, z)
      lower.rotation.z = 0.22
      group.add(lower)
    }

    // Engine block + head ------------------------------------------------------
    const block = new t.Mesh(track(new t.BoxGeometry(0.44, 0.3, 0.3)), carbon)
    block.position.set(0.2, 0.4, 0)
    group.add(block)

    const head = new t.Mesh(track(new t.BoxGeometry(0.26, 0.14, 0.28)), metal)
    head.position.set(0.28, 0.56, 0)
    head.rotation.z = -0.24
    group.add(head)

    const sump = new t.Mesh(track(new t.BoxGeometry(0.3, 0.1, 0.24)), metal)
    sump.position.set(0.18, 0.26, 0)
    group.add(sump)

    // Bodywork: extruded side profiles ----------------------------------------
    const fairing = new t.Mesh(
      profile(
        t,
        [
          [0.34, 0.52],
          [0.62, 0.62],
          [0.86, 0.56],
          [0.88, 0.42],
          [0.7, 0.3],
          [0.44, 0.34],
        ],
        0.3,
        0.03,
      ),
      paint,
    )
    group.add(fairing)

    const tank = new t.Mesh(
      profile(
        t,
        [
          [0.0, 0.62],
          [0.26, 0.7],
          [0.48, 0.66],
          [0.52, 0.56],
          [0.16, 0.5],
          [-0.02, 0.54],
        ],
        0.34,
        0.045,
      ),
      paint,
    )
    group.add(tank)

    const tailUnit = new t.Mesh(
      profile(
        t,
        [
          [-0.78, 0.7],
          [-0.36, 0.74],
          [-0.06, 0.66],
          [-0.1, 0.58],
          [-0.52, 0.54],
          [-0.74, 0.6],
        ],
        0.2,
        0.03,
      ),
      paint,
    )
    group.add(tailUnit)

    const seat = new t.Mesh(track(new t.BoxGeometry(0.3, 0.06, 0.22)), dark)
    seat.position.set(-0.2, 0.71, 0)
    seat.rotation.z = 0.05
    group.add(seat)

    const bellypan = new t.Mesh(
      profile(
        t,
        [
          [-0.12, 0.26],
          [0.44, 0.24],
          [0.6, 0.3],
          [0.42, 0.18],
          [-0.06, 0.18],
        ],
        0.26,
        0.02,
      ),
      paint,
    )
    group.add(bellypan)

    const mudguard = new t.Mesh(
      profile(
        t,
        [
          [0.5, 0.5],
          [0.78, 0.56],
          [0.92, 0.46],
          [0.84, 0.42],
          [0.66, 0.44],
          [0.52, 0.44],
        ],
        0.16,
        0.02,
      ),
      paint,
    )
    group.add(mudguard)

    // Front end ----------------------------------------------------------------
    const forkGeometry = track(new t.CylinderGeometry(0.035, 0.035, 0.52, 16))
    for (const z of [-0.11, 0.11]) {
      const fork = new t.Mesh(forkGeometry, metal)
      fork.position.set(0.72, 0.55, z)
      fork.rotation.z = 0.4
      group.add(fork)
    }

    const bar = new t.Mesh(track(new t.CylinderGeometry(0.022, 0.022, 0.44, 12)), dark)
    bar.rotation.x = Math.PI / 2
    bar.position.set(0.6, 0.8, 0)
    group.add(bar)

    const screen = new t.Mesh(
      profile(
        t,
        [
          [0.52, 0.72],
          [0.7, 0.78],
          [0.8, 0.66],
          [0.62, 0.64],
        ],
        0.22,
        0.012,
      ),
      glass,
    )
    group.add(screen)

    const headlight = new t.Mesh(track(new t.SphereGeometry(0.075, 18, 14)), lamp)
    headlight.position.set(0.87, 0.5, 0)
    headlight.scale.set(0.6, 0.9, 1)
    group.add(headlight)

    const taillight = new t.Mesh(track(new t.BoxGeometry(0.05, 0.05, 0.16)), tail)
    taillight.position.set(-0.79, 0.66, 0)
    group.add(taillight)

    // Exhaust ------------------------------------------------------------------
    const header = new t.Mesh(track(new t.CylinderGeometry(0.03, 0.03, 0.5, 12)), metal)
    header.rotation.z = Math.PI / 2 - 0.16
    header.position.set(0.18, 0.2, 0.08)
    group.add(header)

    const silencer = new t.Mesh(track(new t.CylinderGeometry(0.062, 0.05, 0.3, 18)), metal)
    silencer.rotation.z = Math.PI / 2 - 0.12
    silencer.position.set(-0.34, 0.29, 0.12)
    group.add(silencer)

    group.traverse((child) => {
      child.castShadow = true
      child.receiveShadow = false
    })

    // Sit the machine on the floor and give it a light lean into the turntable.
    group.rotation.z = -0.02
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
      scene.fog = new t.Fog(0x06070a, 4.2, 11)

      camera = new t.PerspectiveCamera(36, width / height, 0.1, 60)
      camera.position.set(2.9, 1.35, 3.5)
      camera.lookAt(0, 0.62, 0)

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
    camera.position.y = 1.35 + tilt
    camera.lookAt(0, 0.62, 0)

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
