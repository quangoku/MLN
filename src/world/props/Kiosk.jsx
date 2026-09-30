import { COLORS } from '../../config/theme.js'

// Máy bán vé ở sảnh
export default function Kiosk({ position, rotation = 0 }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position-y={0.65} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.3, 0.42]} />
        <meshStandardMaterial color="#DCDDE3" />
      </mesh>
      <mesh position={[0, 0.98, 0.215]}>
        <planeGeometry args={[0.44, 0.5]} />
        <meshStandardMaterial color="#6EC6F0" emissive="#6EC6F0" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.55, 0.22]}>
        <boxGeometry args={[0.3, 0.06, 0.04]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
    </group>
  )
}
