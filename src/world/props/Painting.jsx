import { useMemo } from 'react'
import { COLORS } from '../../config/theme.js'
import { paintingTexture } from '../textures.js'

// Tranh treo trên tường bắc, mặt tranh hướng +Z
export default function Painting({ position, rotation = 0, seed = 0 }) {
  const texture = useMemo(() => paintingTexture(seed), [seed])
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 0.78, 0.02]} castShadow>
        <boxGeometry args={[1.3, 0.78, 0.05]} />
        <meshStandardMaterial color={COLORS.gold} />
      </mesh>
      <mesh position={[0, 0.78, 0.05]}>
        <planeGeometry args={[1.16, 0.64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  )
}
