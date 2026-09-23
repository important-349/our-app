import * as THREE from 'three'
import { buildCake } from './cakeBuilder'
import { createCandleManager } from './candleManager'
import { createCelebrationManager } from './celebrationManager'

/**
 * Initializes and manages the full Three.js scene, rendering loop,
 * interaction controls, deterministic sequential blowing timeline,
 * and complete resource cleanup on unmount.
 */
export function initBirthdayCakeScene(container, options = {}) {
  if (!container) return null

  const nickname = options.nickname || (Math.random() < 0.5 ? 'Entte Anguu' : 'Anguuu')

  // 1. Scene setup
  const scene = new THREE.Scene()

  // 2. Camera setup
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50)

  let baseCameraZ = 7.0
  let baseCameraY = 3.0

  function updateCameraForViewport(w, h) {
    const aspect = w / h
    camera.aspect = aspect

    // Target cake bounds: width ~ 5.2 (includes 4.6 cake stand + margin), height ~ 3.8
    const targetWidth = 5.2
    const targetHeight = 3.8

    if (aspect >= 1.0) {
      camera.fov = 40
      baseCameraZ = 7.0
      baseCameraY = 3.0
    } else {
      // Mobile / Portrait view: widen FOV slightly and adjust distance so the whole cake fits
      camera.fov = 44
      const tanHalfFovV = Math.tan((camera.fov * Math.PI) / 360)
      const requiredZForWidth = targetWidth / (2 * tanHalfFovV * aspect)
      const requiredZForHeight = targetHeight / (2 * tanHalfFovV)
      baseCameraZ = Math.max(7.0, Math.max(requiredZForWidth, requiredZForHeight))
      // Angle camera slightly above cake center (y ~ 1.15)
      baseCameraY = 1.15 + (baseCameraZ * 0.25)
    }

    camera.position.set(0, baseCameraY, baseCameraZ)
    camera.updateProjectionMatrix()
    camera.lookAt(new THREE.Vector3(0, 1.15, 0))
  }

  updateCameraForViewport(width, height)

  // 3. Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  container.appendChild(renderer.domElement)

  // 4. Lighting setup (warm, romantic studio illumination)
  const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.4)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8)
  keyLight.position.set(4, 7, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xffd8e2, 1.2)
  rimLight.position.set(-5, 4, -4)
  scene.add(rimLight)

  const softFillLight = new THREE.DirectionalLight(0xffe6f0, 0.7)
  softFillLight.position.set(0, -2, 4)
  scene.add(softFillLight)

  // 5. Cake & Interactive Root Group
  const cakeRoot = new THREE.Group()
  cakeRoot.position.y = -0.55
  scene.add(cakeRoot)

  const { group: cakeMeshGroup, topSurfaceY, plaqueTexture } = buildCake(nickname)
  cakeRoot.add(cakeMeshGroup)

  const candleManager = createCandleManager(cakeRoot, topSurfaceY)
  const celebrationManager = createCelebrationManager(scene)

  camera.lookAt(new THREE.Vector3(0, 1.15, 0))

  // 6. Interactive Drag / Manual Orbit rotation (auto-rotation disabled)
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  let targetRotationY = 0
  let rotationVelocityY = 0 // No automatic rotation; starts showing 'Happy Birthday [Nickname]'

  const onPointerDown = (e) => {
    isDragging = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    previousMousePosition = { x: clientX, y: clientY }
    rotationVelocityY = 0
  }

  const onPointerMove = (e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const deltaX = clientX - previousMousePosition.x
    targetRotationY += deltaX * 0.008
    previousMousePosition = { x: clientX, y: clientY }
  }

  const onPointerUp = () => {
    isDragging = false
    rotationVelocityY = 0 // Remains stationary at user's dragged angle
  }

  container.addEventListener('mousedown', onPointerDown)
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)

  container.addEventListener('touchstart', onPointerDown, { passive: true })
  window.addEventListener('touchmove', onPointerMove, { passive: true })
  window.addEventListener('touchend', onPointerUp)

  // 7. Window Resize handling
  const handleResize = () => {
    if (!container || !renderer || !camera) return
    const newWidth = container.clientWidth || window.innerWidth
    const newHeight = container.clientHeight || window.innerHeight
    updateCameraForViewport(newWidth, newHeight)
    renderer.setSize(newWidth, newHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  window.addEventListener('resize', handleResize)

  // 8. Animation Render Loop
  let animationFrameId = null
  const clock = new THREE.Clock()

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    const delta = Math.min(clock.getDelta(), 0.1)
    const time = clock.getElapsedTime()

    if (!isDragging) {
      targetRotationY += rotationVelocityY
    }
    cakeRoot.rotation.y = THREE.MathUtils.lerp(cakeRoot.rotation.y, targetRotationY, 0.08)

    camera.position.y = baseCameraY + Math.sin(time * 0.8) * 0.05
    camera.lookAt(new THREE.Vector3(0, 1.15, 0))

    candleManager.update(time, delta)
    celebrationManager.update(time, delta)

    renderer.render(scene, camera)
  }

  animationFrameId = requestAnimationFrame(animate)

  // 9. Deterministic Single-Authoritative Async Sequence with Diagnostics
  const abortController = new AbortController()
  const activeTimers = new Set()
  let sequenceRunning = false

  function wait(ms) {
    return new Promise((resolve, reject) => {
      if (abortController.signal.aborted) {
        const error = new Error('Sequence aborted before wait')
        error.name = 'AbortError'
        return reject(error)
      }

      const timer = setTimeout(() => {
        activeTimers.delete(timer)
        resolve()
      }, ms)

      activeTimers.add(timer)

      const onAbort = () => {
        clearTimeout(timer)
        activeTimers.delete(timer)
        const error = new Error('Sequence aborted during wait')
        error.name = 'AbortError'
        reject(error)
      }

      abortController.signal.addEventListener('abort', onAbort, { once: true })
    })
  }

  function throwIfAborted() {
    if (abortController.signal.aborted) {
      const error = new Error('Sequence aborted')
      error.name = 'AbortError'
      throw error
    }
  }

  async function runBlowSequence(onStageChange) {
    if (sequenceRunning) return
    sequenceRunning = true

    try {
      // 1. WIND
      onStageChange('wind')
      candleManager.startWind()
      await wait(2000)

      throwIfAborted()

      // 2. EXTINGUISHING
      onStageChange('extinguishing')
      candleManager.startExtinguish()
      await wait(1500)

      throwIfAborted()

      // 3. SMOKE
      onStageChange('smoke')
      candleManager.startSmoke()
      await wait(2200)

      throwIfAborted()

      // 4. PAUSE
      onStageChange('pause')
      candleManager.stopSmoke()
      await wait(1200)

      throwIfAborted()

      // 5. POPPERS
      onStageChange('poppers')
      celebrationManager.firePoppers(topSurfaceY + 0.4)
      await wait(2500)

      throwIfAborted()

      // 6. CELEBRATION SETTLING (extended with 5 extra seconds so user can enjoy the 3D celebration)
      onStageChange('celebration_settling')
      await wait(6800)

      throwIfAborted()

      // 7. MESSAGE
      onStageChange('message')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('[Birthday3D] Sequence error:', error)
      }
    } finally {
      sequenceRunning = false
    }
  }

  // 10. Complete Resource Disposal
  function destroy() {
    abortController.abort()
    activeTimers.forEach((timer) => clearTimeout(timer))
    activeTimers.clear()

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    container.removeEventListener('mousedown', onPointerDown)
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)

    container.removeEventListener('touchstart', onPointerDown)
    window.removeEventListener('touchmove', onPointerMove)
    window.removeEventListener('touchend', onPointerUp)

    window.removeEventListener('resize', handleResize)

    candleManager.dispose()
    celebrationManager.dispose()
    plaqueTexture?.dispose()

    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose())
        } else {
          object.material.dispose()
        }
      }
    })

    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }

    scene.clear()
  }

  return {
    runBlowSequence,
    destroy,
  }
}
