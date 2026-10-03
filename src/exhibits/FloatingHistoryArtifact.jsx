import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import { DoubleSide } from "three"
import SelectionHull from "./SelectionHull.jsx"
import useFloat from "../hooks/useFloat.js"

// --- BẢNG MÀU CHỦ ĐỀ LỊCH SỬ (đỏ-vàng-cam ấm áp, tông Mác-xít) ---
// Mỗi palette: main (thân), emissive (phát quang nhẹ), edge (cạnh sáng)
const P = {
  red:    { main: "#C0392B", emissive: "#E74C3C", edge: "#FFCDD2" },
  gold:   { main: "#C9A043", emissive: "#FFD700", edge: "#FFF9C4" },
  orange: { main: "#E67E22", emissive: "#F39C12", edge: "#FFE0B2" },
  teal:   { main: "#16A085", emissive: "#1ABC9C", edge: "#B2DFDB" },
  purple: { main: "#7D3C98", emissive: "#9B59B6", edge: "#E1BEE7" },
  blue:   { main: "#2980B9", emissive: "#3498DB", edge: "#BBDEFB" },
  green:  { main: "#27AE60", emissive: "#2ECC71", edge: "#C8E6C9" },
  crimson:{ main: "#8B0000", emissive: "#CC0000", edge: "#FFAB91" },
}

// ── 1. BÁNH RĂNG CƯA — Sản xuất vật chất ──────────────────────────────────
function GearArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.6 })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.18, 12]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.3} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position-y={0.01}>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 8]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1.2 : 0.4} />
      </mesh>
      {[0,1,2,3,4,5,6,7].map(i => (
        <mesh key={i} castShadow rotation-y={i * Math.PI / 4} position={[Math.cos(i * Math.PI / 4) * 0.38, 0, Math.sin(i * Math.PI / 4) * 0.38]}>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.2} flatShading />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.18}><cylinderGeometry args={[0.52, 0.52, 0.22, 12]} /></SelectionHull>}
    </group>
  )
}

// ── 2. BÚA (công cụ lao động) — Lực lượng & Quan hệ sản xuất ─────────────
function HammerArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.25
  })
  return (
    <group ref={ref}>
      <mesh castShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[0.09, 0.62, 0.09]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
      </mesh>
      <mesh castShadow position={[0.08, 0.22, 0]}>
        <boxGeometry args={[0.32, 0.14, 0.12]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1 : 0.35} flatShading />
        <Edges threshold={5} color={palette.main} />
      </mesh>
      {hovered && <SelectionHull args={[0.42, 0.78, 0.18]} grow={0.08} />}
    </group>
  )
}

// ── 3. MẮT XÍCH (chain link) — Quan hệ SX phù hợp với LL sản xuất ────────
function ChainLink({ hovered, palette }) {
  const r1 = useRef(), r2 = useRef()
  useFrame((_, delta) => {
    if (r1.current) r1.current.rotation.y += delta * 0.7
    if (r2.current) r2.current.rotation.y -= delta * 0.7
  })
  return (
    <group>
      <group ref={r1}>
        <mesh castShadow>
          <torusGeometry args={[0.27, 0.07, 5, 10]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading />
          <Edges threshold={10} color={palette.edge} />
        </mesh>
      </group>
      <group ref={r2} rotation-x={Math.PI / 2} position-y={0.01}>
        <mesh castShadow>
          <torusGeometry args={[0.27, 0.07, 5, 10]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading transparent opacity={0.8} />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.2}><torusGeometry args={[0.27, 0.07, 5, 10]} /></SelectionHull>}
    </group>
  )
}

// ── 4. THÁP TẦNG — Cơ sở hạ tầng & Kiến trúc thượng tầng ─────────────────
function TowerArtifact({ hovered, palette }) {
  return (
    <group>
      {[
        { y: -0.2, w: 0.52, h: 0.18 },
        { y: 0.02, w: 0.40, h: 0.18 },
        { y: 0.24, w: 0.28, h: 0.18 },
        { y: 0.46, w: 0.16, h: 0.18 },
      ].map((t, i) => (
        <mesh key={i} castShadow position-y={t.y}>
          <boxGeometry args={[t.w, t.h, t.w]} />
          <meshStandardMaterial
            color={i === 0 ? palette.main : palette.emissive}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? 0.8 - i * 0.1 : 0.25 + i * 0.05}
            flatShading
          />
          <Edges threshold={5} color={palette.edge} />
        </mesh>
      ))}
      {hovered && <SelectionHull args={[0.56, 0.82, 0.56]} grow={0.08} />}
    </group>
  )
}

// ── 5. ĐÔI TỨ DIỆN XUYÊN NHAU — Biện chứng cơ sở/thượng tầng ─────────────
function DoubleTetras({ hovered, palette }) {
  const r2 = useRef()
  useFrame((_, delta) => { if (r2.current) r2.current.rotation.y += delta * 0.9 })
  return (
    <group>
      <mesh castShadow>
        <tetrahedronGeometry args={[0.44, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.35} flatShading transparent opacity={0.8} />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <group ref={r2} rotation-x={Math.PI}>
        <mesh castShadow>
          <tetrahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 0.6 : 0.2} flatShading transparent opacity={0.55} />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.2}><tetrahedronGeometry args={[0.44, 0]} /></SelectionHull>}
    </group>
  )
}

// ── 6. VÒNG XOẮN THỜI GIAN (helix) — Hình thái KT-XH ────────────────────
function HelixArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.5 })
  const beads = Array.from({ length: 10 }, (_, i) => {
    const t = (i / 9) * Math.PI * 2
    return { x: Math.cos(t) * 0.3, y: -0.35 + i * 0.08, z: Math.sin(t) * 0.3 }
  })
  return (
    <group ref={ref}>
      {beads.map((b, i) => (
        <mesh key={i} castShadow position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.075, 5, 4]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? palette.main : palette.emissive}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? 1 : 0.4}
            flatShading
          />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.22}><sphereGeometry args={[0.45, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 7. HAI KHỐI ĐỐI LẬP — Giai cấp & Đấu tranh giai cấp ─────────────────
function ClassConflict({ hovered, palette }) {
  const r = useRef()
  useFrame(({ clock }) => {
    if (r.current) {
      r.current.children[0].position.x = -0.2 - Math.abs(Math.sin(clock.elapsedTime * 0.8)) * 0.05
      r.current.children[1].position.x =  0.2 + Math.abs(Math.sin(clock.elapsedTime * 0.8)) * 0.05
    }
  })
  return (
    <group ref={r}>
      <mesh castShadow position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.3, 0.42, 0.3]} />
        <meshStandardMaterial color="#C0392B" emissive="#E74C3C" emissiveIntensity={hovered ? 0.9 : 0.35} flatShading />
        <Edges threshold={5} color="#FFCDD2" />
      </mesh>
      <mesh castShadow position={[0.2, 0, 0]}>
        <boxGeometry args={[0.3, 0.42, 0.3]} />
        <meshStandardMaterial color="#2C3E50" emissive="#95A5A6" emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
        <Edges threshold={5} color="#ECF0F1" />
      </mesh>
      {hovered && <SelectionHull args={[0.62, 0.5, 0.36]} grow={0.08} />}
    </group>
  )
}

// ── 8. ĐỊA CẦU HEXAGONAL — Dân tộc ──────────────────────────────────────────
function GlobeArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.4 })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.43, 1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading transparent opacity={0.85} />
        <Edges threshold={8} color={palette.edge} />
        {hovered && <SelectionHull scale={1.16}><icosahedronGeometry args={[0.43, 1]} /></SelectionHull>}
      </mesh>
      <mesh castShadow>
        <torusGeometry args={[0.43, 0.025, 4, 28]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1.2 : 0.5} />
      </mesh>
    </group>
  )
}

// ── 9. CỘT TRỤ — Nhà nước ────────────────────────────────────────────────────
function PillarArtifact({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow position-y={-0.28}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position-y={0.08}>
        <cylinderGeometry args={[0.1, 0.12, 0.62, 8]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.35} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position-y={0.46}>
        <boxGeometry args={[0.36, 0.08, 0.36]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1.2 : 0.4} flatShading />
      </mesh>
      {hovered && <SelectionHull args={[0.52, 0.82, 0.52]} grow={0.08} />}
    </group>
  )
}

// ── 10. NGỌN LỬA CÁCH MẠNG — Cách mạng xã hội ───────────────────────────────
function FlameArtifact({ hovered, palette }) {
  const r = useRef()
  useFrame(({ clock }) => {
    if (r.current) {
      r.current.scale.y = 1 + Math.sin(clock.elapsedTime * 4) * 0.12
      r.current.scale.x = 1 + Math.sin(clock.elapsedTime * 3.3 + 0.5) * 0.07
    }
  })
  return (
    <group>
      <mesh castShadow position-y={-0.12}>
        <cylinderGeometry args={[0.22, 0.28, 0.12, 8]} />
        <meshStandardMaterial color="#2C3E50" flatShading />
      </mesh>
      <group ref={r} position-y={0.1}>
        <mesh castShadow>
          <coneGeometry args={[0.22, 0.52, 6, 1]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1.5 : 0.7} flatShading transparent opacity={0.88} />
          <Edges threshold={10} color={palette.edge} />
        </mesh>
        <mesh position-y={0.1}>
          <coneGeometry args={[0.12, 0.32, 5, 1]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={hovered ? 3 : 1.8} transparent opacity={0.9} />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.2}><coneGeometry args={[0.28, 0.72, 6, 1]} /></SelectionHull>}
    </group>
  )
}

// ── 11. KIM TỰ THÁP 2 TẦNG — Tồn tại XH & Ý thức XH ──────────────────────
function PyramidLayers({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow position-y={-0.2}>
        <coneGeometry args={[0.4, 0.3, 4, 1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position-y={0.12}>
        <coneGeometry args={[0.25, 0.28, 4, 1]} />
        <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 1.1 : 0.5} flatShading transparent opacity={0.85} />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh position-y={0.3}>
        <sphereGeometry args={[0.07, 5, 4]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={hovered ? 3 : 1.5} />
      </mesh>
      {hovered && <SelectionHull scale={1.18}><coneGeometry args={[0.44, 0.72, 4, 1]} /></SelectionHull>}
    </group>
  )
}

// ── 12. CẦU GƯƠNG XOAY — Ý thức XH có tính độc lập tương đối ─────────────
function MirrorBall({ hovered, palette }) {
  const outer = useRef(), inner = useRef()
  useFrame((_, delta) => {
    if (outer.current) outer.current.rotation.y += delta * 0.5
    if (inner.current) inner.current.rotation.y -= delta * 1.0
  })
  return (
    <group>
      <group ref={outer}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} transparent opacity={0.45} side={DoubleSide} flatShading />
          <Edges threshold={8} color={palette.edge} />
        </mesh>
      </group>
      <group ref={inner}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1.5 : 0.6} flatShading />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.18}><icosahedronGeometry args={[0.44, 0]} /></SelectionHull>}
    </group>
  )
}

// ── 13. HÌNH NHÂN — Bản chất con người ─────────────────────────────────────
function HumanFigure({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.4
  })
  return (
    <group ref={ref}>
      <mesh castShadow position-y={0.38}>
        <sphereGeometry args={[0.1, 7, 6]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading />
      </mesh>
      <mesh castShadow position-y={0.16}>
        <cylinderGeometry args={[0.09, 0.12, 0.28, 6]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position={[-0.16, 0.17, 0]} rotation-z={0.6}>
        <boxGeometry args={[0.08, 0.24, 0.07]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
      </mesh>
      <mesh castShadow position={[0.16, 0.17, 0]} rotation-z={-0.6}>
        <boxGeometry args={[0.08, 0.24, 0.07]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
      </mesh>
      <mesh castShadow position={[-0.07, -0.12, 0]}>
        <boxGeometry args={[0.09, 0.28, 0.08]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.6 : 0.2} flatShading />
      </mesh>
      <mesh castShadow position={[0.07, -0.12, 0]}>
        <boxGeometry args={[0.09, 0.28, 0.08]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.6 : 0.2} flatShading />
      </mesh>
      {hovered && <SelectionHull args={[0.44, 0.78, 0.28]} grow={0.08} />}
    </group>
  )
}

// ── 14. CỤM CẦU (quần chúng) — Quần chúng nhân dân sáng tạo lịch sử ─────
function MassesBalls({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.3 })
  const positions = [
    [0, 0, 0],
    [0.26, 0.08, 0], [-0.26, 0.08, 0],
    [0, 0.08, 0.26], [0, 0.08, -0.26],
    [0.18, 0.3, 0.18], [-0.18, 0.3, 0.18],
    [0.18, 0.3, -0.18],
  ]
  return (
    <group ref={ref}>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <sphereGeometry args={[i === 0 ? 0.14 : 0.095, 6, 5]} />
          <meshStandardMaterial
            color={i === 0 ? palette.edge : palette.main}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? (i === 0 ? 1.2 : 0.8) : (i === 0 ? 0.5 : 0.25)}
            flatShading
          />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.22}><sphereGeometry args={[0.52, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// Ánh xạ id hiện vật → vật phẩm & màu chủ đề lịch sử
const C3_ARTIFACT_MAP = {
  "c3-production":                { Shape: GearArtifact,   palette: P.orange },
  "c3-forces-relations":          { Shape: HammerArtifact, palette: P.red    },
  "c3-law-conformity":            { Shape: ChainLink,      palette: P.gold   },
  "c3-base-superstructure":       { Shape: TowerArtifact,  palette: P.teal   },
  "c3-base-superstructure-meaning":{ Shape: DoubleTetras,  palette: P.purple },
  "c3-socioeconomic-formation":   { Shape: HelixArtifact,  palette: P.blue   },
  "c3-class":                     { Shape: ClassConflict,  palette: P.crimson},
  "c3-nation":                    { Shape: GlobeArtifact,  palette: P.green  },
  "c3-state":                     { Shape: PillarArtifact, palette: P.gold   },
  "c3-revolution":                { Shape: FlameArtifact,  palette: P.red    },
  "c3-social-being-consciousness":{ Shape: PyramidLayers,  palette: P.teal   },
  "c3-social-consciousness-meaning":{ Shape: MirrorBall,   palette: P.purple },
  "c3-human-essence":             { Shape: HumanFigure,    palette: P.orange },
  "c3-masses":                    { Shape: MassesBalls,    palette: P.gold   },
}

// Fallback nếu id không khớp
const FALLBACK = { Shape: GlobeArtifact, palette: P.teal }

// Vật phẩm lơ lửng chuyên biệt cho phòng C3 — Chủ nghĩa duy vật lịch sử
export default function FloatingHistoryArtifact({ hovered, accent, exhibitId, ...pointerHandlers }) {
  const ref = useFloat(hovered)
  const { Shape, palette } = C3_ARTIFACT_MAP[exhibitId] ?? FALLBACK

  return (
    <group ref={ref} {...pointerHandlers}>
      <Shape hovered={hovered} palette={palette} />
    </group>
  )
}
