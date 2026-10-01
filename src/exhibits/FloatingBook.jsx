import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import SelectionHull from './SelectionHull.jsx'
import BookConfetti from './BookConfetti.jsx'
import useFloat from '../hooks/useFloat.js'
import { COLORS } from '../config/theme.js'

// Kích thước một nửa quyển sách (trang trái hoặc phải)
const HALF_W = 0.52
const DEPTH = 0.72
const COVER = [HALF_W, 0.04, DEPTH]
const PAGES = [HALF_W - 0.04, 0.06, DEPTH - 0.06]
const LEAF = [HALF_W - 0.05, 0.008, DEPTH - 0.08]
const OPEN_ANGLE = 0.42 // độ mở của mỗi nửa so với mặt phẳng (rad)

// Một nửa quyển sách, bản lề nằm ở gốc toạ độ (trục Z)
function BookHalf({ side, hovered }) {
  const x = (side * HALF_W) / 2
  return (
    <group rotation-z={side * OPEN_ANGLE}>
      <mesh position-x={x} castShadow>
        <boxGeometry args={COVER} />
        <meshStandardMaterial color={COLORS.book} flatShading />
        {hovered && <SelectionHull args={COVER} grow={0.07} />}
      </mesh>
      <mesh position={[x - side * 0.02, 0.05, 0]} castShadow>
        <boxGeometry args={PAGES} />
        <meshStandardMaterial color={COLORS.bookPages} emissive={COLORS.glow} emissiveIntensity={hovered ? 0.25 : 0.05} />
      </mesh>
    </group>
  )
}

// "Định nghĩa / Lý thuyết": quyển sách mở lơ lửng, kiểu bàn phù phép Minecraft.
// Một tờ giấy lật qua lật lại giữa hai nửa sách.
export default function FloatingBook({ hovered, checked, accent, ...pointerHandlers }) {
  const ref = useFloat(hovered)
  const leaf = useRef()
  const phase = useRef(0)
  const wasChecked = useRef(checked)
  const [celebrating, setCelebrating] = useState(false)

  useEffect(() => {
    if (checked && !wasChecked.current) setCelebrating(true)
    wasChecked.current = checked
  }, [checked])

  useFrame((_, delta) => {
    phase.current += delta * (hovered ? 4 : 1.2)
    const k = 0.5 - 0.5 * Math.cos(phase.current) // 0 → 1 → 0
    // Tờ giấy đi từ nửa phải (OPEN_ANGLE) sang nửa trái (π - OPEN_ANGLE)
    leaf.current.rotation.z = MathUtils.lerp(OPEN_ANGLE, Math.PI - OPEN_ANGLE, k)
  })

  return (
    <group ref={ref} {...pointerHandlers}>
      {/* Nghiêng về phía camera cho dễ nhìn thấy mặt trang */}
      <group rotation-x={0.5}>
        <BookHalf side={1} hovered={hovered} />
        <BookHalf side={-1} hovered={hovered} />
        <group ref={leaf}>
          <mesh position={[HALF_W / 2 - 0.02, 0.085, 0]}>
            <boxGeometry args={LEAF} />
            <meshStandardMaterial color={COLORS.bookPages} />
          </mesh>
        </group>
      </group>
      {celebrating && <BookConfetti onDone={() => setCelebrating(false)} />}
    </group>
  )
}
