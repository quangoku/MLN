import { COLORS } from '../config/theme.js'
import { LAYOUT } from '../config/constants.js'

const TRIM_HEIGHT = 0.08

// Tường thấp kiểu cutaway: thân tường + viền tối ở mép trên.
// axis 'x': tường chạy dọc trục X; axis 'z': chạy dọc trục Z.
export default function Wall({ axis, x, z, length, height, color }) {
  const t = LAYOUT.wallThickness
  return (
    <group position={[x, 0, z]} rotation-y={axis === 'z' ? Math.PI / 2 : 0}>
      <mesh position-y={height / 2} castShadow receiveShadow>
        <boxGeometry args={[length, height, t]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position-y={height + TRIM_HEIGHT / 2} castShadow>
        <boxGeometry args={[length + 0.02, TRIM_HEIGHT, t + 0.06]} />
        <meshStandardMaterial color={COLORS.wallTrim} />
      </mesh>
    </group>
  )
}
