import { BackSide } from 'three'
import { COLORS } from '../config/theme.js'

// Viền phát sáng khi hover: bản sao phóng to của khối, chỉ vẽ mặt sau (kỹ thuật "inverted hull").
// Đặt làm con của mesh cần viền.
//  - Khối hộp: truyền `args` giống boxGeometry → viền dày đều `grow` mọi phía.
//  - Hình khác: truyền geometry làm children + `scale` đồng đều.
export default function SelectionHull({ args, grow = 0.06, scale = 1.12, children }) {
  const hullScale = args ? args.map((v) => (v + grow) / v) : scale

  return (
    <mesh scale={hullScale} raycast={() => null}>
      {children ?? <boxGeometry args={args} />}
      <meshBasicMaterial color={COLORS.selection} side={BackSide} />
    </mesh>
  )
}
