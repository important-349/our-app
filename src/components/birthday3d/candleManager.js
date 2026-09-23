import * as THREE from 'three'

/**
 * Manages 7 delicate, whimsical birthday candles, organic multi-layered flames,
 * discrete wind simulation, staged extinction, wick afterglow, and curling smoke wisps.
 *
 * Each phase is controlled strictly by external calls from the authoritative state machine:
 * - Idle flicker (default)
 * - startWind()
 * - startExtinguish()
 * - startSmoke()
 * - stopSmoke()
 */
export function createCandleManager(parentGroup, topSurfaceY) {
  const candleGroup = new THREE.Group()
  parentGroup.add(candleGroup)

  // 7 naturally distributed candle positions
  const candleConfigs = [
    { x: 0.12, z: 0.18, height: 0.58, bendX: 0.03, bendZ: -0.02, color: 0xffd9e2, phase: 0.2 },
    { x: -0.28, z: 0.32, height: 0.52, bendX: -0.04, bendZ: 0.03, color: 0xfff0f5, phase: 1.4 },
    { x: 0.44, z: -0.12, height: 0.56, bendX: 0.02, bendZ: -0.04, color: 0xffe2ea, phase: 2.7 },
    { x: -0.38, z: -0.24, height: 0.62, bendX: -0.03, bendZ: -0.03, color: 0xffd9e2, phase: 3.9 },
    { x: 0.04, z: -0.44, height: 0.50, bendX: 0.04, bendZ: 0.02, color: 0xfff5f8, phase: 4.8 },
    { x: -0.08, z: -0.04, height: 0.66, bendX: 0.01, bendZ: 0.03, color: 0xffe8ed, phase: 5.5 },
    { x: 0.36, z: 0.34, height: 0.54, bendX: -0.02, bendZ: 0.04, color: 0xffe2ea, phase: 6.2 },
  ]

  const candles = []
  const pointLights = []
  const smokeParticles = []
  const windStreaks = []

  // Shared Materials
  const flameCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const flameMidMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.9,
  })
  const flameHaloMat = new THREE.MeshBasicMaterial({
    color: 0xff5522,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
  })
  const wickMat = new THREE.MeshStandardMaterial({ color: 0x241818, roughness: 0.9 })

  // Build each whimsical candle
  candleConfigs.forEach((cfg, idx) => {
    // 1. Curved candle body using 3D Spline & Tube
    const p0 = new THREE.Vector3(cfg.x, topSurfaceY, cfg.z)
    const p1 = new THREE.Vector3(
      cfg.x + cfg.bendX * 0.5,
      topSurfaceY + cfg.height * 0.5,
      cfg.z + cfg.bendZ * 0.5
    )
    const p2 = new THREE.Vector3(
      cfg.x + cfg.bendX,
      topSurfaceY + cfg.height,
      cfg.z + cfg.bendZ
    )
    const curve = new THREE.CatmullRomCurve3([p0, p1, p2])
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.034, 12, false)
    const waxMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: 0.35,
      metalness: 0.08,
    })
    const waxMesh = new THREE.Mesh(tubeGeo, waxMat)
    candleGroup.add(waxMesh)

    // Gold band accent
    const bandGeo = new THREE.TorusGeometry(0.037, 0.005, 8, 20)
    bandGeo.rotateX(Math.PI / 2)
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      metalness: 0.65,
      roughness: 0.3,
    })
    const band = new THREE.Mesh(bandGeo, bandMat)
    band.position.set(cfg.x + cfg.bendX * 0.75, topSurfaceY + cfg.height * 0.75, cfg.z + cfg.bendZ * 0.75)
    candleGroup.add(band)

    // 2. Cotton wick
    const tipPos = p2.clone()
    const wickHeight = 0.06
    const wickGeo = new THREE.CylinderGeometry(0.006, 0.007, wickHeight, 8)
    const wick = new THREE.Mesh(wickGeo, wickMat)
    wick.position.set(tipPos.x, tipPos.y + wickHeight / 2, tipPos.z)
    candleGroup.add(wick)

    // 3. Glowing Ember at wick tip (active during afterglow)
    const emberGeo = new THREE.SphereGeometry(0.013, 8, 8)
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xff3b14,
      transparent: true,
      opacity: 0,
    })
    const ember = new THREE.Mesh(emberGeo, emberMat)
    ember.position.set(tipPos.x, tipPos.y + wickHeight, tipPos.z)
    candleGroup.add(ember)

    // 4. Multi-layered Flame Root Group
    const flameRoot = new THREE.Group()
    flameRoot.position.set(tipPos.x, tipPos.y + wickHeight, tipPos.z)

    // Inner bright core
    const coreGeo = new THREE.ConeGeometry(0.02, 0.09, 14)
    coreGeo.translate(0, 0.045, 0)
    const coreMesh = new THREE.Mesh(coreGeo, flameCoreMat)
    flameRoot.add(coreMesh)

    // Mid warm amber flame
    const midGeo = new THREE.ConeGeometry(0.042, 0.16, 16)
    midGeo.translate(0, 0.08, 0)
    const midMesh = new THREE.Mesh(midGeo, flameMidMat)
    flameRoot.add(midMesh)

    // Outer soft halo glow
    const haloGeo = new THREE.SphereGeometry(0.075, 16, 16)
    haloGeo.scale(0.9, 1.6, 0.9)
    haloGeo.translate(0, 0.08, 0)
    const haloMesh = new THREE.Mesh(haloGeo, flameHaloMat)
    flameRoot.add(haloMesh)

    candleGroup.add(flameRoot)

    // 5. Dynamic Warm PointLight
    const pLight = new THREE.PointLight(0xff9933, 0.9, 2.8, 1.8)
    pLight.position.set(tipPos.x, tipPos.y + wickHeight + 0.1, tipPos.z)
    candleGroup.add(pLight)
    pointLights.push(pLight)

    candles.push({
      idx,
      config: cfg,
      tipPos,
      flameRoot,
      ember,
      pointLight: pLight,
      waxMesh,
      // Staggered collapse delay in seconds during extinguishing stage (between 0.1s and 1.1s)
      extinguishDelay: 0.12 + (idx * 0.14) + (Math.sin(idx * 2.5) * 0.05),
      extinguished: false,
      emberLife: 0,
    })
  })

  // 6. Front-Top Wind Flow Streaks & Breath Motes ("Breath flowing from face")
  const streakCount = 24
  for (let i = 0; i < streakCount; i++) {
    const streakGeo = new THREE.BufferGeometry()
    // Stream line pointing downward-backward along breath vector into screen
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3((Math.random() - 0.5) * 0.1, -0.25, -0.7),
    ]
    streakGeo.setFromPoints(pts)
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xffeef6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
    const streakLine = new THREE.Line(streakGeo, streakMat)
    // Starting front-top (towards user's face at +Z, +Y)
    const startX = (Math.random() - 0.5) * 1.5
    const startY = topSurfaceY + 1.2 + Math.random() * 0.9
    const startZ = 2.4 + Math.random() * 1.5
    streakLine.position.set(startX, startY, startZ)
    candleGroup.add(streakLine)
    windStreaks.push({
      line: streakLine,
      speedZ: 6.5 + Math.random() * 3.5,
      speedY: 2.5 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.8,
    })
  }

  const breathMoteCount = 24
  const breathMotes = []
  const moteGeo = new THREE.SphereGeometry(0.024, 8, 8)
  for (let i = 0; i < breathMoteCount; i++) {
    const moteMat = new THREE.MeshBasicMaterial({
      color: 0xffe8f2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
    const mote = new THREE.Mesh(moteGeo, moteMat)
    const startX = (Math.random() - 0.5) * 1.4
    const startY = topSurfaceY + 1.1 + Math.random() * 0.9
    const startZ = 2.2 + Math.random() * 1.5
    mote.position.set(startX, startY, startZ)
    candleGroup.add(mote)
    breathMotes.push({
      mesh: mote,
      mat: moteMat,
      speedZ: 5.8 + Math.random() * 3.2,
      speedY: 2.2 + Math.random() * 1.0,
      speedX: (Math.random() - 0.5) * 0.6,
    })
  }

  // ── Explicit Discrete States Controlled by runBlowSequence ──
  // 'idle' | 'wind' | 'extinguishing' | 'smoke' | 'done'
  let currentStage = 'idle'
  let stageTimer = 0

  function startWind() {
    currentStage = 'wind'
    stageTimer = 0
  }

  function startExtinguish() {
    currentStage = 'extinguishing'
    stageTimer = 0
  }

  function startSmoke() {
    currentStage = 'smoke'
    stageTimer = 0
    // Ensure all flames are definitively extinguished and emit curling smoke
    candles.forEach((c) => {
      c.flameRoot.visible = false
      c.pointLight.intensity = 0
      c.extinguished = true
      c.emberLife = 1.0
      c.ember.material.opacity = 0.95
      spawnSmokeForCandle(c)
    })
  }

  function stopSmoke() {
    currentStage = 'done'
    stageTimer = 0
  }

  function update(time, delta) {
    stageTimer += delta

    // ── Front-Top Wind Streaks & Breath Motes ──
    const showStreaks = currentStage === 'wind' || currentStage === 'extinguishing'
    if (showStreaks) {
      const streakOpacity = currentStage === 'wind' ? 0.48 : 0.28
      const moteOpacity = currentStage === 'wind' ? 0.42 : 0.22

      windStreaks.forEach((ws) => {
        ws.line.position.z -= ws.speedZ * delta
        ws.line.position.y -= ws.speedY * delta
        ws.line.position.x += ws.speedX * delta
        ws.line.material.opacity = streakOpacity

        // Reset if passed behind candles
        if (ws.line.position.z < -1.8 || ws.line.position.y < topSurfaceY - 0.3) {
          ws.line.position.set(
            (Math.random() - 0.5) * 1.5,
            topSurfaceY + 1.2 + Math.random() * 0.9,
            2.4 + Math.random() * 1.5
          )
        }
      })

      breathMotes.forEach((bm) => {
        bm.mesh.position.z -= bm.speedZ * delta
        bm.mesh.position.y -= bm.speedY * delta
        bm.mesh.position.x += bm.speedX * delta
        bm.mat.opacity = moteOpacity

        if (bm.mesh.position.z < -1.8 || bm.mesh.position.y < topSurfaceY - 0.3) {
          bm.mesh.position.set(
            (Math.random() - 0.5) * 1.4,
            topSurfaceY + 1.1 + Math.random() * 0.9,
            2.2 + Math.random() * 1.5
          )
        }
      })
    } else {
      windStreaks.forEach((ws) => {
        ws.line.material.opacity = 0
      })
      breathMotes.forEach((bm) => {
        bm.mat.opacity = 0
      })
    }

    // ── Candle & Flame Update ──
    candles.forEach((c) => {
      const p = c.config.phase

      if (currentStage === 'idle') {
        // IDLE: Natural gentle flicker, micro-sway, warm glow
        const flicker1 = Math.sin(time * 11 + p) * 0.07
        const flicker2 = Math.cos(time * 17 + p * 2) * 0.04
        const swayX = Math.sin(time * 4.5 + p) * 0.05
        const swayZ = Math.cos(time * 5.2 + p) * 0.04

        c.flameRoot.scale.set(1 + flicker1 * 0.5, 1.0 + flicker1 + flicker2, 1 + flicker1 * 0.5)
        c.flameRoot.rotation.set(swayX, 0, swayZ)
        c.pointLight.intensity = 0.9 + Math.sin(time * 13 + p) * 0.18
        return
      }

      if (currentStage === 'wind') {
        // WIND STAGE: Flames bend BACKWARDS away from the user's face (blowing from front-top)
        const windIntensity = Math.min(1.0, stageTimer * 1.5)
        const maxLean = (0.85 + windIntensity * 0.45) + Math.sin(time * 24 + p) * 0.12
        const rapidFlutter = Math.sin(time * 38 + p) * 0.22

        c.flameRoot.rotation.x = -maxLean
        c.flameRoot.rotation.z = Math.sin(time * 28 + p) * 0.14 + (cfg.bendX * 0.5)
        c.flameRoot.scale.set(
          1.1 + rapidFlutter * 0.25,
          0.6 + Math.cos(time * 30 + p) * 0.12,
          1.6 + rapidFlutter * 0.4
        )
        c.pointLight.intensity = 0.75 + rapidFlutter * 0.5
        return
      }

      if (currentStage === 'extinguishing') {
        // EXTINGUISHING STAGE: Flames shrink and collapse while bending backwards
        if (!c.extinguished) {
          if (stageTimer < c.extinguishDelay) {
            const shrink = Math.max(0.05, 1.0 - (stageTimer / c.extinguishDelay))
            c.flameRoot.scale.set(shrink * 0.9, shrink * 0.5, shrink * 1.4)
            c.flameRoot.rotation.x = -1.25
            c.flameRoot.rotation.z = Math.sin(time * 20 + p) * 0.1
            c.pointLight.intensity = shrink * 0.7
          } else {
            c.extinguished = true
            c.flameRoot.visible = false
            c.pointLight.intensity = 0
            c.emberLife = 1.0
            c.ember.material.opacity = 0.95
          }
        }
      }

      // ── Ember Glow Update (runs in extinguishing, smoke, pause, done) ──
      if (c.extinguished && c.emberLife > 0) {
        c.emberLife -= delta * 0.55
        if (c.emberLife <= 0) {
          c.ember.material.opacity = 0
        } else {
          c.ember.material.opacity = c.emberLife * 0.95
          const pulse = 1.0 + Math.sin(time * 12) * 0.15
          c.ember.scale.setScalar(pulse)
        }
      }
    })

    // ── Smoke Particles Update ──
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const sp = smokeParticles[i]
      sp.age += delta

      sp.mesh.position.y += sp.vy * delta
      sp.mesh.position.x += sp.vx * delta + Math.sin(sp.age * 3.0 + sp.curlOffset) * 0.018
      sp.mesh.position.z += sp.vz * delta + Math.cos(sp.age * 3.5 + sp.curlOffset) * 0.015

      sp.mesh.scale.addScalar(delta * 0.28)
      sp.mesh.rotation.z += delta * 0.35
      sp.material.opacity = Math.max(0, (1 - sp.age / sp.maxAge) * 0.45)

      if (sp.age >= sp.maxAge) {
        candleGroup.remove(sp.mesh)
        sp.mesh.geometry.dispose()
        sp.material.dispose()
        smokeParticles.splice(i, 1)
      }
    }
  }

  function spawnSmokeForCandle(candle) {
    const smokeCount = 6
    for (let s = 0; s < smokeCount; s++) {
      const smokeGeo = new THREE.SphereGeometry(0.028 + Math.random() * 0.015, 8, 8)
      smokeGeo.scale(1, 1.25, 0.8)
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xd8c8cc,
        transparent: true,
        opacity: 0.45,
      })
      const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat)
      smokeMesh.position.copy(candle.ember.position)
      smokeMesh.position.x += (Math.random() - 0.5) * 0.02
      smokeMesh.position.z += (Math.random() - 0.5) * 0.02

      candleGroup.add(smokeMesh)

      smokeParticles.push({
        mesh: smokeMesh,
        material: smokeMat,
        age: -s * 0.09,
        maxAge: 2.0 + Math.random() * 0.8,
        vx: 0.12 + Math.random() * 0.15,
        vy: 0.32 + Math.random() * 0.22,
        vz: (Math.random() - 0.5) * 0.06,
        curlOffset: Math.random() * Math.PI * 2,
      })
    }
  }

  function dispose() {
    windStreaks.forEach((ws) => {
      candleGroup.remove(ws.line)
      ws.line.geometry.dispose()
      ws.line.material.dispose()
    })
    windStreaks.length = 0

    breathMotes.forEach((bm) => {
      candleGroup.remove(bm.mesh)
      bm.mesh.geometry.dispose()
      bm.mat.dispose()
    })
    breathMotes.length = 0

    smokeParticles.forEach((sp) => {
      candleGroup.remove(sp.mesh)
      sp.mesh.geometry.dispose()
      sp.material.dispose()
    })
    smokeParticles.length = 0

    flameCoreMat.dispose()
    flameMidMat.dispose()
    flameHaloMat.dispose()
    wickMat.dispose()
  }

  return {
    group: candleGroup,
    startWind,
    startExtinguish,
    startSmoke,
    stopSmoke,
    update,
    dispose,
  }
}
