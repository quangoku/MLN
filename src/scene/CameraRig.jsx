import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { playerRef } from '../player/playerRef.js'
import { CAMERA } from '../config/constants.js'
import { PLAYER_START } from '../world/layout.js'

const offset = new Vector3(...CAMERA.offset)

export default function CameraRig() {
  const camera = useRef()
  const gl = useThree((s) => s.gl)
  // Điểm camera nhìn vào. Lerp điểm này (thay vì lerp vị trí camera) để góc nhìn
  // isometric luôn cố định, không bị xoay lệch khi camera đang đuổi theo.
  const focus = useRef(new Vector3(...PLAYER_START))
  const zoomTarget = useRef(CAMERA.zoom)

  // Cuộn chuột để phóng to / thu nhỏ
  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      e.preventDefault()
      zoomTarget.current = MathUtils.clamp(zoomTarget.current * Math.exp(-e.deltaY * 0.0015), CAMERA.minZoom, CAMERA.maxZoom)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [gl])

  useFrame((state, delta) => {
    const player = playerRef.current
    const cam = camera.current
    if (!player || !cam) return

    const t = 1 - Math.exp(-CAMERA.followSmoothing * delta)
    const moved = focus.current.distanceToSquared(player.position) > 1e-6
    focus.current.lerp(player.position, t)

    cam.position.copy(focus.current).add(offset)
    cam.lookAt(focus.current)

    const zoomChanged = Math.abs(cam.zoom - zoomTarget.current) > 0.01
    if (zoomChanged) {
      cam.zoom = MathUtils.damp(cam.zoom, zoomTarget.current, 10, delta)
      cam.updateProjectionMatrix()
    }

    // R3F chỉ raycast khi chuột di chuyển. Camera trôi mà chuột đứng yên thì
    // phải raycast lại, nếu không trạng thái hover sẽ bị "kẹt".
    if (moved || zoomChanged) state.events.update?.()
  })

  return (
    <OrthographicCamera
      ref={camera}
      makeDefault
      zoom={CAMERA.zoom}
      position={offset.clone().add(focus.current)}
      near={0.1}
      far={100}
    />
  )
}
