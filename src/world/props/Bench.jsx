import { COLORS } from '../../config/theme.js'

// Ghế băng gỗ, 3 đệm trắng (giống ảnh tham chiếu)
export default function Bench({ position, rotation = 0 }) {
  return (
    <group position={position} rotation-y={rotation}>
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0.16, 0]} castShadow>
          <boxGeometry args={[0.12, 0.32, 0.5]} />
          <meshStandardMaterial color={COLORS.wood} />
        </mesh>
      ))}
      <mesh position-y={0.34} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.55]} />
        <meshStandardMaterial color={COLORS.wood} />
      </mesh>
      {[-0.51, 0, 0.51].map((x) => (
        <mesh key={x} position={[x, 0.44, 0]} castShadow>
          <boxGeometry args={[0.48, 0.12, 0.46]} />
          <meshStandardMaterial color={COLORS.cushion} />
        </mesh>
      ))}
    </group>
  )
}
