import * as THREE from 'three'

/**
 * Procedurally constructs an elegant, romantic tiered birthday cake.
 * The bulky ceramic pedestal is removed in favor of an ultra-slim,
 * delicate saucer and soft contact shadow disc so the cake sits naturally.
 */
export function buildCake(nickname = 'Anguuu') {
  const cakeGroup = new THREE.Group()

  // Materials with soft, warm lighting response
  const spongeTier1Mat = new THREE.MeshStandardMaterial({
    color: 0xfff2f5, // Soft blush cream sponge
    roughness: 0.45,
    metalness: 0.05,
  })

  const spongeTier2Mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Delicate mascarpone cream
    roughness: 0.4,
    metalness: 0.05,
  })

  const strawberryGlazeMat = new THREE.MeshStandardMaterial({
    color: 0xfcbcc8, // Strawberry rose glaze
    roughness: 0.18,
    metalness: 0.1,
  })

  const pearlTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffeef2,
    roughness: 0.2,
    metalness: 0.35,
  })

  const berryMat = new THREE.MeshStandardMaterial({
    color: 0xc42340, // Fresh ripe raspberry / strawberry
    roughness: 0.3,
    metalness: 0.08,
  })

  const goldDustMat = new THREE.MeshStandardMaterial({
    color: 0xdeb887,
    roughness: 0.3,
    metalness: 0.65,
  })

  const saucerMat = new THREE.MeshStandardMaterial({
    color: 0xfffcfd,
    roughness: 0.2,
    metalness: 0.15,
  })

  const saucerGoldRimMat = new THREE.MeshStandardMaterial({
    color: 0xe0b59b,
    roughness: 0.25,
    metalness: 0.7,
  })

  // 1. Subtle, ultra-slim saucer plate (replaces bulky pedestal)
  const plateRadius = 2.45
  const plateGeo = new THREE.CylinderGeometry(plateRadius, plateRadius * 0.96, 0.08, 64)
  const plate = new THREE.Mesh(plateGeo, saucerMat)
  plate.position.y = 0.04
  cakeGroup.add(plate)

  const plateRimGeo = new THREE.TorusGeometry(plateRadius * 0.98, 0.03, 16, 64)
  plateRimGeo.rotateX(Math.PI / 2)
  const plateRim = new THREE.Mesh(plateRimGeo, saucerGoldRimMat)
  plateRim.position.y = 0.075
  cakeGroup.add(plateRim)

  // Soft contact shadow disc right under saucer
  const shadowGeo = new THREE.RingGeometry(0.1, plateRadius * 1.08, 32)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x1a0a10,
    transparent: true,
    opacity: 0.22,
  })
  const shadow = new THREE.Mesh(shadowGeo, shadowMat)
  shadow.position.y = 0.005
  cakeGroup.add(shadow)

  // 2. Bottom Tier (Tier 1)
  const tier1Height = 1.1
  const tier1Radius = 2.05
  const tier1Geo = new THREE.CylinderGeometry(tier1Radius, tier1Radius, tier1Height, 64)
  const tier1 = new THREE.Mesh(tier1Geo, spongeTier1Mat)
  tier1.position.y = 0.08 + tier1Height / 2
  cakeGroup.add(tier1)

  // Bottom tier pearl piping trim at base
  const beadCount1 = 44
  for (let i = 0; i < beadCount1; i++) {
    const angle = (i / beadCount1) * Math.PI * 2
    const beadRadius = 0.065
    const beadGeo = new THREE.SphereGeometry(beadRadius, 12, 12)
    const bead = new THREE.Mesh(beadGeo, pearlTrimMat)
    bead.position.set(
      Math.cos(angle) * (tier1Radius + 0.015),
      0.12,
      Math.sin(angle) * (tier1Radius + 0.015)
    )
    cakeGroup.add(bead)
  }

  // Bottom tier glaze drip ring
  const tier1GlazeGeo = new THREE.TorusGeometry(tier1Radius * 0.99, 0.075, 16, 64)
  tier1GlazeGeo.rotateX(Math.PI / 2)
  const tier1Glaze = new THREE.Mesh(tier1GlazeGeo, strawberryGlazeMat)
  tier1Glaze.position.y = 0.08 + tier1Height
  cakeGroup.add(tier1Glaze)

  // 3. Top Tier (Tier 2)
  const tier2Height = 0.95
  const tier2Radius = 1.38
  const tier2Geo = new THREE.CylinderGeometry(tier2Radius, tier2Radius, tier2Height, 64)
  const tier2 = new THREE.Mesh(tier2Geo, spongeTier2Mat)
  tier2.position.y = 0.08 + tier1Height + tier2Height / 2
  cakeGroup.add(tier2)

  // Decorative Chocolate Plaque on Tier 2: "Happy Birthday [Nickname] ♡"
  const plaque = createBirthdayPlaque(tier2Radius, 0.08 + tier1Height + tier2Height / 2, nickname)
  cakeGroup.add(plaque.mesh)

  // Mid tier pearl trim
  const beadCount2 = 32
  for (let i = 0; i < beadCount2; i++) {
    const angle = (i / beadCount2) * Math.PI * 2
    const beadRadius = 0.055
    const beadGeo = new THREE.SphereGeometry(beadRadius, 12, 12)
    const bead = new THREE.Mesh(beadGeo, pearlTrimMat)
    bead.position.set(
      Math.cos(angle) * (tier2Radius + 0.02),
      0.08 + tier1Height + 0.04,
      Math.sin(angle) * (tier2Radius + 0.02)
    )
    cakeGroup.add(bead)
  }

  // Top tier glaze ring
  const tier2GlazeGeo = new THREE.TorusGeometry(tier2Radius * 0.985, 0.065, 16, 48)
  tier2GlazeGeo.rotateX(Math.PI / 2)
  const tier2Glaze = new THREE.Mesh(tier2GlazeGeo, strawberryGlazeMat)
  tier2Glaze.position.y = 0.08 + tier1Height + tier2Height
  cakeGroup.add(tier2Glaze)

  const topSurfaceY = 0.08 + tier1Height + tier2Height

  // 4. Romantic Toppings: Sculptural cream dollops, fresh berries, gold pearls
  const dollopCount = 10
  const rimRadius = tier2Radius * 0.88

  for (let i = 0; i < dollopCount; i++) {
    const angle = (i / dollopCount) * Math.PI * 2
    const cx = Math.cos(angle) * rimRadius
    const cz = Math.sin(angle) * rimRadius

    // Sculpted whipped cream rosette
    const creamGeo = new THREE.ConeGeometry(0.12, 0.22, 16)
    const cream = new THREE.Mesh(creamGeo, pearlTrimMat)
    cream.position.set(cx, topSurfaceY + 0.1, cz)
    cream.rotation.y = angle
    cakeGroup.add(cream)

    // Berry accents nestled between cream dollops
    const berryAngle = angle + Math.PI / dollopCount
    const bx = Math.cos(berryAngle) * (rimRadius * 0.96)
    const bz = Math.sin(berryAngle) * (rimRadius * 0.96)
    const berryGeo = new THREE.SphereGeometry(0.085, 12, 12)
    berryGeo.scale(1, 1.15, 1)
    const berry = new THREE.Mesh(berryGeo, berryMat)
    berry.position.set(bx, topSurfaceY + 0.08, bz)
    cakeGroup.add(berry)

    // Delicate tiny gold pearl
    const goldPearlGeo = new THREE.SphereGeometry(0.032, 8, 8)
    const goldPearl = new THREE.Mesh(goldPearlGeo, goldDustMat)
    goldPearl.position.set(bx * 0.78, topSurfaceY + 0.03, bz * 0.78)
    cakeGroup.add(goldPearl)
  }

  return {
    group: cakeGroup,
    topSurfaceY,
    plaqueTexture: plaque.texture,
  }
}

/**
 * Creates an exquisite ruby chocolate fondant plaque with gold borders
 * inscribed with "Happy Birthday [Nickname] ♡" curved across the front tier.
 */
function createBirthdayPlaque(tierRadius, centerY, nickname = 'Anguuu') {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const padX = 50, padY = 40
  const w = canvas.width - padX * 2
  const h = canvas.height - padY * 2
  const r = 50

  // Plaque fill: deep ruby chocolate with warm gradient
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(padX, padY, w, h, r)
  const bgGrad = ctx.createLinearGradient(padX, padY, padX, padY + h)
  bgGrad.addColorStop(0, 'rgba(48, 16, 28, 0.96)') // Velvet dark berry chocolate
  bgGrad.addColorStop(0.5, 'rgba(75, 24, 42, 0.94)')
  bgGrad.addColorStop(1, 'rgba(38, 12, 22, 0.98)')
  ctx.fillStyle = bgGrad
  ctx.fill()

  // Outer polished gold border
  ctx.lineWidth = 12
  ctx.strokeStyle = '#deb887'
  ctx.stroke()

  // Inner delicate gold trim
  ctx.beginPath()
  ctx.roundRect(padX + 16, padY + 16, w - 32, h - 32, r - 12)
  ctx.lineWidth = 3.5
  ctx.strokeStyle = 'rgba(255, 225, 235, 0.7)'
  ctx.stroke()

  // Side decorative star motifs
  ctx.fillStyle = '#ffd700'
  ctx.font = '28px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', padX + 44, canvas.height / 2)
  ctx.fillText('✦', canvas.width - padX - 44, canvas.height / 2)

  // Typography - Line 1: "Happy Birthday"
  ctx.font = 'italic 52px "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = '#ffe4ec'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3
  ctx.fillText('Happy Birthday', canvas.width / 2, padY + h * 0.38)

  // Typography - Line 2: `${nickname} ♡`
  const fontSize = nickname.length > 9 ? 64 : 74
  ctx.font = `italic ${fontSize}px "Cormorant Garamond", Georgia, serif`
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(230, 80, 120, 0.65)'
  ctx.shadowBlur = 16
  ctx.fillText(`${nickname} ♡`, canvas.width / 2, padY + h * 0.74)

  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  // Curved plane geometry hugging the cylinder face
  const plaqueWidth = 1.48
  const plaqueHeight = 0.54
  const plaqueGeo = new THREE.PlaneGeometry(plaqueWidth, plaqueHeight, 32, 1)
  const pos = plaqueGeo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    // Curve backward into cylinder of radius tierRadius
    const zCurve = -(tierRadius - Math.sqrt(Math.max(0, tierRadius * tierRadius - x * x)))
    pos.setZ(i, zCurve)
  }
  plaqueGeo.computeVertexNormals()

  const plaqueMat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.28,
    metalness: 0.2,
    side: THREE.FrontSide,
  })

  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat)
  // Positioned on the front face of tier 2 (+Z axis)
  plaqueMesh.position.set(0, centerY, tierRadius + 0.025)

  return { mesh: plaqueMesh, texture, geo: plaqueGeo, mat: plaqueMat }
}

