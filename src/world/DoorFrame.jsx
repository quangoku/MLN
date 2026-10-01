import { COLORS } from '../config/theme.js'

// Khung cửa gỗ nâu đậm (hai cột trụ đứng + xà ngang lintel trên đầu)
export default function DoorFrame({ x, z, axis = 'x', width = 2.4, height = 2.05 }) {
  const rotY = axis === 'z' ? Math.PI / 2 : 0
  const postOffset = width / 2 + 0.15

  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      {/* Cột trái */}
      <mesh position={[-postOffset, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, height, 0.35]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
      {/* Cột phải */}
      <mesh position={[postOffset, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, height, 0.35]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
      {/* Xà ngang (lintel) trên cùng */}
      <mesh position={[0, height + 0.1, 0]} castShadow>
        <boxGeometry args={[width + 0.6, 0.22, 0.4]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
    </group>
  )
}
