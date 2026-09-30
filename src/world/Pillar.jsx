import { COLORS } from '../config/theme.js'

export default function Pillar({ position, height = 2.2 }) {
  return (
    <group position={position}>
      <mesh position-y={0.1} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color={COLORS.pillarTrim} />
      </mesh>
      <mesh position-y={height / 2} castShadow receiveShadow>
        <boxGeometry args={[0.45, height, 0.45]} />
        <meshStandardMaterial color={COLORS.pillar} />
      </mesh>
      <mesh position-y={height} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.6]} />
        <meshStandardMaterial color={COLORS.pillarTrim} />
      </mesh>
    </group>
  )
}
