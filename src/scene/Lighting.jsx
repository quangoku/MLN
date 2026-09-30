import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { playerRef } from '../player/playerRef.js'

const LIGHT_OFFSET = [6, 12, 4]

// Đèn mặt trời đi theo player để vùng đổ bóng (±14 ô) luôn bao quanh người chơi,
// thay vì phải trải bóng ra toàn bộ bảo tàng dài ~100 ô (bóng sẽ rất vỡ).
export default function Lighting() {
  const sun = useRef()

  useFrame(() => {
    const p = playerRef.current
    const light = sun.current
    if (!p || !light) return
    const { x, z } = p.position
    light.position.set(x + LIGHT_OFFSET[0], LIGHT_OFFSET[1], z + LIGHT_OFFSET[2])
    light.target.position.set(x, 0, z)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={['#FFF6E5', '#6E6A8A', 1.3]} />
      <directionalLight
        ref={sun}
        castShadow
        position={LIGHT_OFFSET}
        intensity={2.4}
        color="#FFF1D6"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-far={40}
      />
    </>
  )
}
