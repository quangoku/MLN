import SelectionHull from './SelectionHull.jsx'
import { COLORS } from '../config/theme.js'

const BOARD = [1.1, 0.8, 0.06]

// Bảng thông tin đứng (giới thiệu chương / lời chào ở sảnh). Mặt bảng hướng +Z.
export default function InfoBoard({ hovered, accent = COLORS.pedestalTrim, ...pointerHandlers }) {
  return (
    <group {...pointerHandlers}>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.55, -0.04]} castShadow>
          <boxGeometry args={[0.07, 1.1, 0.07]} />
          <meshStandardMaterial color={COLORS.wood} />
        </mesh>
      ))}
      <group position-y={1.25} rotation-x={-0.12}>
        <mesh castShadow>
          <boxGeometry args={BOARD} />
          <meshStandardMaterial color={COLORS.wood} />
          {hovered && <SelectionHull args={BOARD} grow={0.08} />}
        </mesh>
        <mesh position-z={0.035}>
          <planeGeometry args={[0.98, 0.68]} />
          <meshStandardMaterial color={COLORS.bookPages} emissive={COLORS.glow} emissiveIntensity={hovered ? 0.2 : 0} />
        </mesh>
        <mesh position={[0, 0.24, 0.04]}>
          <planeGeometry args={[0.98, 0.16]} />
          <meshStandardMaterial color={accent} />
        </mesh>
        {/* "Dòng chữ" giả */}
        {[0.06, -0.06, -0.18].map((y, i) => (
          <mesh key={y} position={[-0.08 * i, y, 0.04]}>
            <planeGeometry args={[0.7 - i * 0.15, 0.04]} />
            <meshStandardMaterial color="#B9AE98" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
