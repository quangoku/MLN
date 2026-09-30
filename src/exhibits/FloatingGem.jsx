import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'
import SelectionHull from './SelectionHull.jsx'
import useFloat from '../hooks/useFloat.js'
import { COLORS } from '../config/theme.js'

// Mặt cắt của viên đá quý (xoay quanh trục Y để tạo khối): đáy nhọn, mặt trên phẳng
const PROFILE = [
  new Vector2(0, -0.5),
  new Vector2(0.38, 0.02),
  new Vector2(0.26, 0.2),
  new Vector2(0, 0.2),
]
const FACETS = 8

// "Kết luận / Ý nghĩa": viên đá quý rỗng — vỏ trong suốt, cạnh sáng, lõi phát sáng (Bloom).
export default function FloatingGem({ hovered, accent, ...pointerHandlers }) {
  const ref = useFloat(hovered)
  const core = useRef()
  const geometry = useMemo(() => new LatheGeometry(PROFILE, FACETS), [])

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.12
    core.current.scale.setScalar(pulse)
    core.current.material.emissiveIntensity = hovered ? 6 : 3
  })

  return (
    <group ref={ref} {...pointerHandlers}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={COLORS.gem}
          emissive={COLORS.gem}
          emissiveIntensity={0.4}
          transparent
          opacity={0.35}
          side={DoubleSide}
          depthWrite={false}
          flatShading
        />
        <Edges threshold={15} color={COLORS.gemEdge} />
        {hovered && (
          <SelectionHull scale={1.14}>
            <primitive object={geometry} attach="geometry" />
          </SelectionHull>
        )}
      </mesh>
      <mesh ref={core} position-y={-0.05}>
        <icosahedronGeometry args={[0.1, 0]} />
        {/* toneMapped={false} + emissive > 1 → vượt ngưỡng Bloom, chỉ lõi này phát sáng */}
        <meshStandardMaterial color={COLORS.glow} emissive={COLORS.glow} toneMapped={false} />
      </mesh>
    </group>
  )
}
