import { useMemo } from 'react'
import { COLORS } from '../../config/theme.js'
import { mulberry32 } from '../../utils/random.js'

// Chậu cây low-poly: lá là các khối bát diện dẹt xoè ra xung quanh
export default function Plant({ position }) {
  const leaves = useMemo(() => {
    const rng = mulberry32(Math.round(position[0] * 100 + position[2] * 7))
    return Array.from({ length: 7 }, (_, i) => ({
      yaw: (i / 7) * Math.PI * 2 + rng() * 0.4,
      tilt: 0.5 + rng() * 0.4,
      color: rng() > 0.5 ? COLORS.leaf : COLORS.leafLight,
    }))
  }, [position])

  return (
    <group position={position}>
      <mesh position-y={0.2} castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.4, 8]} />
        <meshStandardMaterial color={COLORS.pot} flatShading />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position-y={0.42} rotation={[0, l.yaw, 0]}>
          <mesh rotation-x={l.tilt} position={[0, 0.22, 0.12]} scale={[0.14, 0.34, 0.05]} castShadow>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={l.color} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
