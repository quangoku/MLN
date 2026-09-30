import { COLORS } from '../../config/theme.js'

// Cột đèn bóng tròn. Bóng đèn có emissive > 1 và toneMapped={false} để Bloom làm nó phát sáng.
export default function LampPost({ position }) {
  return (
    <group position={position}>
      <mesh position-y={0.04} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.08, 10]} />
        <meshStandardMaterial color={COLORS.metal} />
      </mesh>
      <mesh position-y={1.2} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.3, 6]} />
        <meshStandardMaterial color={COLORS.metal} />
      </mesh>
      <mesh position-y={2.38}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
        <meshStandardMaterial color={COLORS.metal} />
      </mesh>
      <mesh position-y={2.58}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color={COLORS.glow} emissive={COLORS.glow} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  )
}
