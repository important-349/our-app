import * as THREE from 'three'

/**
 * Choreographed Romantic 3D Celebration Manager.
 * Discrete trigger: `firePoppers(originY)` launches dual-popper confetti,
 * floating 3D hearts, golden stars, and ribbons that arc and orbit strictly
 * AROUND the cake without intersecting or clipping through cake geometry.
 */
export function createCelebrationManager(scene) {
  const rootGroup = new THREE.Group()
  scene.add(rootGroup)

  // Cake safety cylinder: radius 1.95, Y from -1.2 to 1.8
  const CAKE_RADIUS = 1.95
  const CAKE_RADIUS_SQ = CAKE_RADIUS * CAKE_RADIUS
  const CAKE_Y_MIN = -1.2
  const CAKE_Y_MAX = 1.85

  // ── 1. Ambient Shimmering Particles (Active continuously) ──
  const ambientCount = 40
  const ambientGeo = new THREE.BufferGeometry()
  const ambientPos = new Float32Array(ambientCount * 3)
  const ambientVelocities = []

  for (let i = 0; i < ambientCount; i++) {
    const ang = Math.random() * Math.PI * 2
    const dist = CAKE_RADIUS + 0.3 + Math.random() * 4.0
    ambientPos[i * 3] = Math.cos(ang) * dist
    ambientPos[i * 3 + 1] = Math.random() * 6 + 0.2
    ambientPos[i * 3 + 2] = Math.sin(ang) * dist
    ambientVelocities.push({
      vy: 0.12 + Math.random() * 0.16,
      phase: Math.random() * Math.PI * 2,
    })
  }
  ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3))
  const ambientMat = new THREE.PointsMaterial({
    color: 0xffd9e5,
    size: 0.07,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  })
  const ambientPoints = new THREE.Points(ambientGeo, ambientMat)
  rootGroup.add(ambientPoints)

  // ── Palette of Romantic Celebration Materials ──
  const roseGoldMat = new THREE.MeshStandardMaterial({
    color: 0xe8a2b5,
    roughness: 0.35,
    metalness: 0.5,
  })

  const champagneGoldMat = new THREE.MeshStandardMaterial({
    color: 0xdeb887,
    roughness: 0.25,
    metalness: 0.7,
  })

  const blushPinkMat = new THREE.MeshStandardMaterial({
    color: 0xffe2ea,
    roughness: 0.4,
    metalness: 0.2,
  })

  const pearlCreamMat = new THREE.MeshStandardMaterial({
    color: 0xfff5f8,
    roughness: 0.2,
    metalness: 0.3,
  })

  // ── Dynamic Celebration Objects ──
  const popperParticles = []
  const floatingHearts = []
  const floatingStars = []
  const confettiRibbons = []
  const floatingBalloons = []

  let poppersFired = false

  // ── Helper: 3D Heart Geometry ──
  function createHeartGeometry(size = 0.12) {
    const x = 0, y = 0
    const heartShape = new THREE.Shape()
    heartShape.moveTo(x + 0.25 * size, y + 0.25 * size)
    heartShape.bezierCurveTo(x + 0.25 * size, y + 0.25 * size, x + 0.2 * size, y, x, y)
    heartShape.bezierCurveTo(x - 0.3 * size, y, x - 0.3 * size, y + 0.35 * size, x - 0.3 * size, y + 0.35 * size)
    heartShape.bezierCurveTo(x - 0.3 * size, y + 0.55 * size, x - 0.1 * size, y + 0.77 * size, x + 0.25 * size, y + 0.95 * size)
    heartShape.bezierCurveTo(x + 0.6 * size, y + 0.77 * size, x + 0.8 * size, y + 0.55 * size, x + 0.8 * size, y + 0.35 * size)
    heartShape.bezierCurveTo(x + 0.8 * size, y + 0.35 * size, x + 0.8 * size, y, x + 0.5 * size, y)
    heartShape.bezierCurveTo(x + 0.35 * size, y, x + 0.25 * size, y + 0.25 * size, x + 0.25 * size, y + 0.25 * size)

    const extrudeSettings = {
      depth: 0.04 * size,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02 * size,
      bevelThickness: 0.02 * size,
    }
    const geo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    geo.center()
    return geo
  }

  // ── Helper: 3D Star Geometry ──
  function createStarGeometry(radius = 0.09) {
    const starShape = new THREE.Shape()
    const points = 5
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const sx = Math.cos(angle) * r
      const sy = Math.sin(angle) * r
      if (i === 0) starShape.moveTo(sx, sy)
      else starShape.lineTo(sx, sy)
    }
    starShape.closePath()
    const geo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    })
    geo.center()
    return geo
  }

  // ── Popper Fire Effect (Cannons shoot outward and around cake) ──
  function firePoppers(originY = 2.2) {
    if (poppersFired) return
    poppersFired = true

    const burstColors = [0xffd700, 0xffa0b8, 0xffffff, 0xff7b9c, 0xfce4ec]
    const countPerSide = 40

    // Cannons stationed safely outside the cake radius on the sides
    // Left cannon at x = -2.4, shooting up and to the left/front
    // Right cannon at x = +2.4, shooting up and to the right/front
    const cannons = [
      {
        origin: new THREE.Vector3(-2.35, originY - 0.5, 0.4),
        dirX: -1.0,
      },
      {
        origin: new THREE.Vector3(2.35, originY - 0.5, 0.4),
        dirX: 1.0,
      },
    ]

    cannons.forEach((c) => {
      for (let i = 0; i < countPerSide; i++) {
        const pGeo = new THREE.SphereGeometry(0.035 + Math.random() * 0.03, 6, 6)
        const pMat = new THREE.MeshBasicMaterial({
          color: burstColors[Math.floor(Math.random() * burstColors.length)],
          transparent: true,
          opacity: 0.95,
        })
        const pMesh = new THREE.Mesh(pGeo, pMat)
        pMesh.position.copy(c.origin)

        // Arc upward and slightly outward away from the center
        const outwardSpread = 0.6 + Math.random() * 1.4
        const upwardSpeed = 3.2 + Math.random() * 2.5
        const depthSpeed = (Math.random() - 0.5) * 1.6

        pMesh.velocity = new THREE.Vector3(
          c.dirX * outwardSpread,
          upwardSpeed,
          depthSpeed
        )
        pMesh.gravity = -2.6
        pMesh.life = 1.0
        pMesh.decay = 0.26 + Math.random() * 0.18

        rootGroup.add(pMesh)
        popperParticles.push(pMesh)
      }
    })

    // Spawn 3D Hearts in a circular halo AROUND the cake (dist: 2.7 to 4.2)
    const heartMats = [roseGoldMat, blushPinkMat, champagneGoldMat]
    const heartCount = 16
    for (let i = 0; i < heartCount; i++) {
      const geo = createHeartGeometry(0.36 + Math.random() * 0.16)
      const mesh = new THREE.Mesh(geo, heartMats[i % heartMats.length])
      const angle = (i / heartCount) * Math.PI * 2
      const dist = 2.75 + Math.random() * 1.4

      mesh.position.set(
        Math.cos(angle) * dist,
        -0.2 - Math.random() * 0.4,
        Math.sin(angle) * dist
      )
      mesh.scale.setScalar(0.001)
      rootGroup.add(mesh)

      floatingHearts.push({
        mesh,
        geometry: geo,
        targetScale: 1.0,
        currentScale: 0.001,
        angle,
        dist,
        orbitSpeed: 0.2 + Math.random() * 0.15,
        vy: 0.2 + Math.random() * 0.16,
        rotSpeedX: (Math.random() - 0.5) * 0.8,
        rotSpeedY: 0.7 + Math.random() * 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.12,
      })
    }

    // Spawn 3D Golden Stars orbiting AROUND the cake (dist: 2.6 to 4.0)
    const starCount = 14
    for (let i = 0; i < starCount; i++) {
      const geo = createStarGeometry(0.065 + Math.random() * 0.03)
      const mesh = new THREE.Mesh(geo, champagneGoldMat)
      const angle = (i / starCount) * Math.PI * 2 + Math.random() * 0.3
      const dist = 2.65 + Math.random() * 1.4

      mesh.position.set(
        Math.cos(angle) * dist,
        Math.random() * 2.8 + 0.8,
        Math.sin(angle) * dist
      )
      mesh.scale.setScalar(0.001)
      rootGroup.add(mesh)

      floatingStars.push({
        mesh,
        geometry: geo,
        targetScale: 1.0,
        currentScale: 0.001,
        angle,
        dist,
        orbitSpeed: 0.15 + Math.random() * 0.12,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.5,
        bobPhase: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
      })
    }

    // Spawn Confetti Ribbons in a ring AROUND the cake
    const ribbonCount = 32
    const ribbonMats = [roseGoldMat, champagneGoldMat, blushPinkMat, pearlCreamMat]
    for (let i = 0; i < ribbonCount; i++) {
      const rGeo = new THREE.PlaneGeometry(0.06, 0.18, 1, 1)
      const rMesh = new THREE.Mesh(rGeo, ribbonMats[i % ribbonMats.length])
      const angle = (i / ribbonCount) * Math.PI * 2 + Math.random() * 0.4
      const dist = 2.2 + Math.random() * 1.8

      rMesh.position.set(
        Math.cos(angle) * dist,
        4.5 + Math.random() * 2.5,
        Math.sin(angle) * dist
      )
      rootGroup.add(rMesh)

      confettiRibbons.push({
        mesh: rMesh,
        geometry: rGeo,
        angle,
        dist,
        vy: -0.36 - Math.random() * 0.32,
        rotX: (Math.random() - 0.5) * 3.0,
        rotY: (Math.random() - 0.5) * 3.0,
        rotZ: (Math.random() - 0.5) * 2.0,
        driftPhase: Math.random() * Math.PI * 2,
      })
    }

    // Spawn Floating Pearl Balloons in Depth
    const balloonCount = 6
    const balloonColors = [0xffd1dc, 0xfff0f5, 0xffe2e8, 0xffe4b5]
    for (let i = 0; i < balloonCount; i++) {
      const bGroup = new THREE.Group()
      const bGeo = new THREE.SphereGeometry(0.24, 20, 20)
      bGeo.scale(1, 1.22, 1)
      const bMat = new THREE.MeshStandardMaterial({
        color: balloonColors[i % balloonColors.length],
        roughness: 0.25,
        metalness: 0.25,
      })
      const bMesh = new THREE.Mesh(bGeo, bMat)
      bGroup.add(bMesh)

      const strPts = [new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(0.02, -0.65, 0)]
      const strGeo = new THREE.BufferGeometry().setFromPoints(strPts)
      const strMat = new THREE.LineBasicMaterial({ color: 0xe0c0c8, transparent: true, opacity: 0.5 })
      const strLine = new THREE.Line(strGeo, strMat)
      bGroup.add(strLine)

      const angle = (i / balloonCount) * Math.PI * 2 + (Math.PI / 4)
      const dist = 3.0 + Math.random() * 1.2
      bGroup.position.set(
        Math.cos(angle) * dist,
        -1.4 - Math.random() * 0.8,
        Math.sin(angle) * dist - 1.0
      )
      rootGroup.add(bGroup)

      floatingBalloons.push({
        group: bGroup,
        sphereGeo: bGeo,
        sphereMat: bMat,
        strGeo,
        strMat,
        angle,
        dist,
        vy: 0.26 + Math.random() * 0.15,
        swayPhase: Math.random() * Math.PI * 2,
      })
    }
  }

  // ── Update Loop ──
  function update(time, delta) {
    // 1. Ambient Background Shimmer
    const pos = ambientGeo.attributes.position.array
    for (let i = 0; i < ambientCount; i++) {
      pos[i * 3 + 1] += ambientVelocities[i].vy * delta
      pos[i * 3] += Math.sin(time * 1.2 + ambientVelocities[i].phase) * 0.003
      if (pos[i * 3 + 1] > 6.5) {
        pos[i * 3 + 1] = 0.2
        const ang = Math.random() * Math.PI * 2
        const dist = CAKE_RADIUS + 0.3 + Math.random() * 4.0
        pos[i * 3] = Math.cos(ang) * dist
        pos[i * 3 + 2] = Math.sin(ang) * dist
      }
    }
    ambientGeo.attributes.position.needsUpdate = true

    if (!poppersFired) return

    // Update Popper Sparkle Particles with Cake Collision Repulsion
    for (let i = popperParticles.length - 1; i >= 0; i--) {
      const p = popperParticles[i]
      p.velocity.y += p.gravity * delta
      p.position.addScaledVector(p.velocity, delta)
      p.life -= p.decay * delta
      p.material.opacity = Math.max(0, p.life)

      // Repulsion: Keep particles outside the cake cylinder
      const radSq = p.position.x * p.position.x + p.position.z * p.position.z
      if (radSq < CAKE_RADIUS_SQ && p.position.y > CAKE_Y_MIN && p.position.y < CAKE_Y_MAX) {
        const rad = Math.sqrt(radSq) || 0.1
        const nx = p.position.x / rad
        const nz = p.position.z / rad
        p.position.x = nx * (CAKE_RADIUS + 0.08)
        p.position.z = nz * (CAKE_RADIUS + 0.08)
        // Deflect velocity outward
        p.velocity.x = nx * Math.abs(p.velocity.x) * 0.6
        p.velocity.z = nz * Math.abs(p.velocity.z) * 0.6
      }

      if (p.life <= 0) {
        rootGroup.remove(p)
        p.geometry.dispose()
        p.material.dispose()
        popperParticles.splice(i, 1)
      }
    }

    // Update Floating Hearts (Orbiting smoothly outside cake)
    floatingHearts.forEach((h) => {
      if (h.currentScale < h.targetScale) {
        h.currentScale = THREE.MathUtils.lerp(h.currentScale, h.targetScale, delta * 4)
        h.mesh.scale.setScalar(h.currentScale)
      }
      h.angle += h.orbitSpeed * delta
      const effectiveDist = Math.max(CAKE_RADIUS + 0.25, h.dist + Math.sin(time * 2.0 + h.swayPhase) * h.swayAmp)
      h.mesh.position.x = Math.cos(h.angle) * effectiveDist
      h.mesh.position.z = Math.sin(h.angle) * effectiveDist
      h.mesh.position.y += h.vy * delta
      h.mesh.rotation.y += h.rotSpeedY * delta
      h.mesh.rotation.x = Math.sin(time * 1.5 + h.swayPhase) * 0.25

      // Reset when floating too high
      if (h.mesh.position.y > 6.0) {
        h.mesh.position.y = -0.5 - Math.random() * 0.3
      }
    })

    // Update Floating Stars (Orbiting peacefully outside cake)
    floatingStars.forEach((s) => {
      if (s.currentScale < s.targetScale) {
        s.currentScale = THREE.MathUtils.lerp(s.currentScale, s.targetScale, delta * 3.5)
        s.mesh.scale.setScalar(s.currentScale)
      }
      s.angle += s.orbitSpeed * delta
      const starDist = Math.max(CAKE_RADIUS + 0.3, s.dist)
      s.mesh.position.x = Math.cos(s.angle) * starDist
      s.mesh.position.z = Math.sin(s.angle) * starDist
      s.mesh.rotation.x += s.rotSpeedX * delta
      s.mesh.rotation.y += s.rotSpeedY * delta
      s.mesh.position.y = s.baseY + Math.sin(time * 1.8 + s.bobPhase) * 0.12
    })

    // Update Confetti Ribbons (Falling smoothly around cake)
    confettiRibbons.forEach((r) => {
      r.mesh.position.y += r.vy * delta
      r.angle += 0.15 * delta
      const ribbonDist = Math.max(CAKE_RADIUS + 0.2, r.dist + Math.sin(time * 2.5 + r.driftPhase) * 0.15)
      r.mesh.position.x = Math.cos(r.angle) * ribbonDist
      r.mesh.position.z = Math.sin(r.angle) * ribbonDist

      r.mesh.rotation.x += r.rotX * delta
      r.mesh.rotation.y += r.rotY * delta
      r.mesh.rotation.z += r.rotZ * delta

      if (r.mesh.position.y < -0.4) {
        r.mesh.position.y = 5.2 + Math.random() * 1.8
      }
    })

    // Update Balloons (Floating gracefully in background depth)
    floatingBalloons.forEach((b) => {
      b.angle += 0.08 * delta
      const balloonDist = Math.max(CAKE_RADIUS + 0.8, b.dist)
      b.group.position.x = Math.cos(b.angle) * balloonDist
      b.group.position.z = Math.sin(b.angle) * balloonDist - 0.8
      b.group.position.y += b.vy * delta
      b.group.rotation.z = Math.sin(time * 1.0 + b.swayPhase) * 0.08

      if (b.group.position.y > 6.5) {
        b.group.position.y = -1.6 - Math.random() * 0.5
      }
    })
  }

  // ── Disposal ──
  function dispose() {
    ambientGeo.dispose()
    ambientMat.dispose()

    popperParticles.forEach((p) => {
      rootGroup.remove(p)
      p.geometry.dispose()
      p.material.dispose()
    })
    popperParticles.length = 0

    floatingHearts.forEach((h) => {
      rootGroup.remove(h.mesh)
      h.geometry.dispose()
    })
    floatingHearts.length = 0

    floatingStars.forEach((s) => {
      rootGroup.remove(s.mesh)
      s.geometry.dispose()
    })
    floatingStars.length = 0

    confettiRibbons.forEach((r) => {
      rootGroup.remove(r.mesh)
      r.geometry.dispose()
    })
    confettiRibbons.length = 0

    floatingBalloons.forEach((b) => {
      rootGroup.remove(b.group)
      b.sphereGeo.dispose()
      b.sphereMat.dispose()
      b.strGeo.dispose()
      b.strMat.dispose()
    })
    floatingBalloons.length = 0

    roseGoldMat.dispose()
    champagneGoldMat.dispose()
    blushPinkMat.dispose()
    pearlCreamMat.dispose()

    scene.remove(rootGroup)
  }

  return {
    group: rootGroup,
    firePoppers,
    update,
    dispose,
  }
}
