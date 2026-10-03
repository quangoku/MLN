import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { mulberry32 } from "../utils/random.js"

// ── Con ma đơn lẻ ────────────────────────────────────────────────────────────
function Ghost({ seed, baseX, baseZ, baseY, speed, amplitude, phase, wanderR }) {
  const ref = useRef()
  const rng = useMemo(() => mulberry32(seed), [seed])
  // Màu ma: trắng xanh / lục / lam mờ ảo
  const color = useMemo(() => {
    const r = mulberry32(seed + 7)
    const palette = ["#A8F5D0","#C7FFF0","#B6EEFF","#D4F1FF","#E0FFE8","#8EFFF0","#CCE5FF"]
    return palette[Math.floor(r() * palette.length)]
  }, [seed])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase
    if (!ref.current) return
    ref.current.position.x = baseX + Math.cos(t * 0.7) * wanderR
    ref.current.position.z = baseZ + Math.sin(t * 0.5) * wanderR
    ref.current.position.y = baseY + Math.sin(t * 1.3) * amplitude
    // Nghiêng nhẹ khi bay
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.18
    ref.current.rotation.x = Math.cos(t * 0.6) * 0.12
  })

  return (
    <group ref={ref}>
      {/* Thân ma – hình giọt nước flatten-sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.18, 7, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          transparent
          opacity={0.62}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>
      {/* Đuôi ma – oval dẹt phía dưới */}
      <mesh position-y={-0.14} scale={[0.75, 0.5, 0.75]}>
        <sphereGeometry args={[0.18, 6, 5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.38}
        />
      </mesh>
      {/* Lõi phát sáng nhỏ */}
      <mesh position-y={0.04}>
        <sphereGeometry args={[0.065, 5, 4]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          toneMapped={false}
          emissiveIntensity={2.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Mắt trái */}
      <mesh position={[-0.065, 0.04, 0.14]}>
        <sphereGeometry args={[0.028, 5, 4]} />
        <meshStandardMaterial color="#1A1A2E" emissive="#000000" />
      </mesh>
      {/* Mắt phải */}
      <mesh position={[0.065, 0.04, 0.14]}>
        <sphereGeometry args={[0.028, 5, 4]} />
        <meshStandardMaterial color="#1A1A2E" emissive="#000000" />
      </mesh>
    </group>
  )
}

// ── Bầy ma bay ngoài bảo tàng ────────────────────────────────────────────────
// Museum bounds: minX=-17.5, maxX=17.5, minZ=-18.5, maxZ=13.8
// Ma sẽ xuất hiện NGOÀI vùng này, ở khoảng cách 5–22 đơn vị tính từ tường.
const GHOST_CONFIGS = [
  // Phía Bắc (z < -20) — phía sau C1
  { baseX: -10, baseZ: -26, baseY: 2.2, speed: 0.55, amplitude: 0.7, phase: 0.0,  wanderR: 4.5 },
  { baseX:   0, baseZ: -28, baseY: 3.4, speed: 0.40, amplitude: 1.0, phase: 1.8,  wanderR: 6.0 },
  { baseX:  10, baseZ: -25, baseY: 2.8, speed: 0.65, amplitude: 0.5, phase: 3.2,  wanderR: 4.0 },
  { baseX:  -5, baseZ: -30, baseY: 4.0, speed: 0.30, amplitude: 1.3, phase: 5.0,  wanderR: 7.0 },
  { baseX:  15, baseZ: -23, baseY: 2.0, speed: 0.70, amplitude: 0.6, phase: 2.4,  wanderR: 3.5 },
  // Phía Tây (x < -20) — bên trái C2
  { baseX: -25, baseZ:  -8, baseY: 2.6, speed: 0.45, amplitude: 0.8, phase: 0.7,  wanderR: 5.0 },
  { baseX: -28, baseZ:   3, baseY: 3.2, speed: 0.60, amplitude: 1.2, phase: 2.1,  wanderR: 4.5 },
  { baseX: -24, baseZ: -14, baseY: 2.0, speed: 0.35, amplitude: 0.6, phase: 4.0,  wanderR: 5.5 },
  { baseX: -30, baseZ:   8, baseY: 4.5, speed: 0.25, amplitude: 1.5, phase: 1.3,  wanderR: 7.5 },
  // Phía Đông (x > 20) — bên phải C3
  { baseX:  25, baseZ:  -5, baseY: 2.4, speed: 0.50, amplitude: 0.9, phase: 3.5,  wanderR: 5.0 },
  { baseX:  28, baseZ:   6, baseY: 3.0, speed: 0.42, amplitude: 1.1, phase: 0.9,  wanderR: 4.8 },
  { baseX:  26, baseZ: -15, baseY: 2.8, speed: 0.68, amplitude: 0.7, phase: 2.8,  wanderR: 4.0 },
  { baseX:  32, baseZ:   2, baseY: 5.0, speed: 0.28, amplitude: 1.6, phase: 4.5,  wanderR: 8.0 },
  // Phía Nam (z > 16) — phía trước cổng vào
  { baseX:  -9, baseZ:  22, baseY: 2.5, speed: 0.58, amplitude: 0.8, phase: 1.1,  wanderR: 4.5 },
  { baseX:   7, baseZ:  24, baseY: 3.6, speed: 0.38, amplitude: 1.2, phase: 3.7,  wanderR: 6.0 },
  { baseX: -18, baseZ:  18, baseY: 2.0, speed: 0.72, amplitude: 0.5, phase: 0.4,  wanderR: 3.0 },
  { baseX:  18, baseZ:  20, baseY: 3.2, speed: 0.45, amplitude: 1.0, phase: 2.6,  wanderR: 5.0 },
  // Góc tây bắc & đông bắc — bay cao hơn
  { baseX: -26, baseZ: -22, baseY: 5.5, speed: 0.32, amplitude: 1.8, phase: 0.6,  wanderR: 6.5 },
  { baseX:  26, baseZ: -22, baseY: 4.8, speed: 0.36, amplitude: 1.4, phase: 3.1,  wanderR: 5.5 },
  // Vài con ma "xa lắc" – rất cao và rất lớn để tạo chiều sâu
  { baseX: -38, baseZ:  -5, baseY: 7.0, speed: 0.20, amplitude: 2.2, phase: 1.9,  wanderR: 9.0 },
  { baseX:  40, baseZ:  -8, baseY: 8.0, speed: 0.18, amplitude: 2.5, phase: 4.2,  wanderR: 10.0 },
  { baseX:   2, baseZ: -40, baseY: 9.0, speed: 0.15, amplitude: 3.0, phase: 2.7,  wanderR: 12.0 },
]

export default function GhostSwarm() {
  return (
    <group>
      {GHOST_CONFIGS.map((cfg, i) => (
        <Ghost key={i} seed={i * 137 + 42} {...cfg} />
      ))}
    </group>
  )
}
