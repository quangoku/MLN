import { COLORS } from '../config/theme.js'
import { DOOR_FRAME, LAYOUT } from '../config/constants.js'

// Khung cửa gỗ nâu đậm (hai cột trụ đứng + xà ngang lintel trên đầu)
export default function DoorFrame({ x, z, axis = 'x', width = LAYOUT.doorWidth, height = 2.05 }) {
  const rotY = axis === 'z' ? Math.PI / 2 : 0
  const { postWidth, postDepth } = DOOR_FRAME
  const postOffset = (width + postWidth) / 2

  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      {/* Cột trái */}
      <mesh position={[-postOffset, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[postWidth, height, postDepth]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
      {/* Cột phải */}
      <mesh position={[postOffset, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[postWidth, height, postDepth]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
      {/* Xà ngang (lintel) trên cùng */}
      <mesh position={[0, height + 0.11, 0]} castShadow>
        <boxGeometry args={[width + 2 * postWidth, 0.22, postDepth + 0.04]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
    </group>
  )
}
