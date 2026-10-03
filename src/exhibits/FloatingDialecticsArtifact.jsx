import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import { DoubleSide } from "three"
import SelectionHull from "./SelectionHull.jsx"
import useFloat from "../hooks/useFloat.js"

// --- BẢNG MÀU CHỦ ĐỀ BIỆN CHỨNG (xanh – tím – lục – vàng, tông khoa học) ---
const P = {
  blue:   { main: "#1A6DB5", emissive: "#3498DB", edge: "#BBDEFB" },
  indigo: { main: "#3949AB", emissive: "#5C6BC0", edge: "#C5CAE9" },
  cyan:   { main: "#00838F", emissive: "#00ACC1", edge: "#B2EBF2" },
  teal:   { main: "#00695C", emissive: "#26A69A", edge: "#B2DFDB" },
  violet: { main: "#6A1B9A", emissive: "#AB47BC", edge: "#E1BEE7" },
  gold:   { main: "#C9A043", emissive: "#FFD700", edge: "#FFF9C4" },
  amber:  { main: "#E65100", emissive: "#FF9800", edge: "#FFE0B2" },
  green:  { main: "#2E7D32", emissive: "#66BB6A", edge: "#C8E6C9" },
  red:    { main: "#B71C1C", emissive: "#EF5350", edge: "#FFCDD2" },
}

// ── 1. KHỐI CẦU VẬT CHẤT — Định nghĩa vật chất ────────────────────────────
// Cầu đặc bao bởi lớp vỏ trong suốt → tồn tại khách quan độc lập với ý thức
function MatterSphere({ hovered, palette }) {
  const inner = useRef(), outer = useRef()
  useFrame((_, delta) => {
    if (inner.current) inner.current.rotation.y += delta * 0.5
    if (outer.current) outer.current.rotation.x += delta * 0.3
  })
  return (
    <group>
      <group ref={inner}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.35} flatShading />
          <Edges threshold={8} color={palette.edge} />
        </mesh>
      </group>
      <group ref={outer}>
        <mesh>
          <icosahedronGeometry args={[0.44, 1]} />
          <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 0.3 : 0.1} transparent opacity={0.18} side={DoubleSide} flatShading />
          <Edges threshold={8} color={palette.edge} />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.18}><icosahedronGeometry args={[0.44, 1]} /></SelectionHull>}
    </group>
  )
}

// ── 2. KIM CƯƠNG PHÁT SÁNG — Ý nghĩa định nghĩa vật chất ──────────────────
// Hình bát diện rỗng trong suốt + lõi sáng → giải quyết vấn đề cơ bản triết học
function DiamondGem({ hovered, palette }) {
  const core = useRef()
  useFrame(({ clock }) => {
    if (core.current) {
      core.current.material.emissiveIntensity =
        hovered ? 5 + Math.sin(clock.elapsedTime * 4) * 1.5 : 2.5
    }
  })
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.5 : 0.2} transparent opacity={0.35} side={DoubleSide} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={2.5} />
      </mesh>
      {hovered && <SelectionHull scale={1.18}><octahedronGeometry args={[0.42, 0]} /></SelectionHull>}
    </group>
  )
}

// ── 3. VÒNG XOAY VẬN ĐỘNG — Phương thức & hình thức tồn tại vật chất ──────
// 5 vòng lồng nhau xoay tốc độ khác nhau → 5 hình thức vận động cơ bản
function MotionRings({ hovered, palette }) {
  const r0 = useRef(), r1 = useRef(), r2 = useRef(), r3 = useRef(), r4 = useRef()
  const refs = [r0, r1, r2, r3, r4]
  const speeds  = [0.8, -0.6, 1.1, -0.9, 0.5]
  const axesXYZ = [[1,0,0],[0,1,0],[0,0,1],[0.7,0.7,0],[0,0.7,0.7]]
  useFrame((_, delta) => {
    refs.forEach((r, i) => {
      if (!r.current) return
      r.current.rotation.x += axesXYZ[i][0] * speeds[i] * delta
      r.current.rotation.y += axesXYZ[i][1] * speeds[i] * delta
      r.current.rotation.z += axesXYZ[i][2] * speeds[i] * delta
    })
  })
  return (
    <group>
      {refs.map((r, i) => (
        <group key={i} ref={r}>
          <mesh castShadow>
            <torusGeometry args={[0.28 + i * 0.03, 0.033 - i * 0.003, 4, 18]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? palette.main : palette.emissive}
              emissive={palette.emissive}
              emissiveIntensity={hovered ? 0.9 : 0.3}
              flatShading
            />
          </mesh>
        </group>
      ))}
      {hovered && <SelectionHull scale={1.22}><sphereGeometry args={[0.48, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 4. NÃO PHÁT TIA — Nguồn gốc của ý thức ────────────────────────────────
// Khối cầu trung tâm (não) + tia xung quanh → lao động & ngôn ngữ sinh ý thức
function BrainRays({ hovered, palette }) {
  const raysRef = useRef()
  useFrame(({ clock }) => {
    if (!raysRef.current) return
    raysRef.current.children.forEach((child, i) => {
      child.scale.y = 1 + Math.sin(clock.elapsedTime * 2 + i * 0.8) * 0.28
    })
  })
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return { x: Math.cos(a) * 0.38, z: Math.sin(a) * 0.38, angle: a }
  })
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 8, 7]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading />
        <Edges threshold={10} color={palette.edge} />
      </mesh>
      <group ref={raysRef}>
        {rays.map((r, i) => (
          <mesh key={i} castShadow
            position={[r.x, 0, r.z]}
            rotation-y={-r.angle}
            rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.024, 0.005, 0.22, 4]} />
            <meshStandardMaterial
              color={palette.edge} emissive={palette.edge}
              emissiveIntensity={hovered ? 2 : 0.8} toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {hovered && <SelectionHull scale={1.22}><sphereGeometry args={[0.52, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 5. LĂNG KÍNH TINH THỂ — Bản chất & kết cấu của ý thức ─────────────────
// Lăng kính xoay, ánh sáng phân kỳ → ý thức phản ánh, sáng tạo, mang bản chất xã hội
function PrismCrystal({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.6
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.3
  })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <cylinderGeometry args={[0, 0.36, 0.7, 6, 1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} transparent opacity={0.7} side={DoubleSide} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position-y={-0.35} rotation-x={Math.PI}>
        <cylinderGeometry args={[0, 0.22, 0.28, 6, 1]} />
        <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 1.2 : 0.5} transparent opacity={0.85} flatShading />
      </mesh>
      {hovered && <SelectionHull scale={1.18}><cylinderGeometry args={[0.4, 0.4, 0.82, 6]} /></SelectionHull>}
    </group>
  )
}

// ── 6. HAI CỰC TƯƠNG TÁC — Quan hệ vật chất – ý thức ─────────────────────
// Hai hình khác nhau kéo đẩy qua cầu nối → vật chất quyết định, ý thức tác động lại
function MatterConsciousness({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = Math.sin(clock.elapsedTime * 0.9)
    ref.current.children[0].position.x = -0.22 - t * 0.04
    ref.current.children[1].position.x =  0.22 + t * 0.04
  })
  return (
    <group ref={ref}>
      {/* Cực vật chất — đặc */}
      <mesh castShadow position={[-0.22, 0, 0]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.35} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      {/* Cực ý thức — trong suốt */}
      <mesh position={[0.22, 0, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1 : 0.4} transparent opacity={0.65} flatShading />
      </mesh>
      {/* Nối giữa — tương tác */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.016, 0.016, 0.26, 4]} />
        <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 1.5 : 0.6} toneMapped={false} />
      </mesh>
      {hovered && <SelectionHull args={[0.68, 0.48, 0.36]} grow={0.08} />}
    </group>
  )
}

// ── 7. XOẮN ỐC KÉP — Phép biện chứng duy vật ────────────────────────────
// Hai chuỗi hạt cuốn vào nhau → thống nhất thế giới quan duy vật & phương pháp biện chứng
function DoubleHelix({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.5 })
  const n = 12
  const strand = (offset) => Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * Math.PI * 2 + offset
    return { x: Math.cos(t) * 0.28, y: -0.38 + i * 0.064, z: Math.sin(t) * 0.28 }
  })
  const strandA = strand(0)
  const strandB = strand(Math.PI)
  return (
    <group ref={ref}>
      {strandA.map((b, i) => (
        <mesh key={`a${i}`} castShadow position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.065, 5, 4]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading />
        </mesh>
      ))}
      {strandB.map((b, i) => (
        <mesh key={`b${i}`} castShadow position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.065, 5, 4]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.2}><sphereGeometry args={[0.48, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 8. MẠNG LƯỚI — Nguyên lý mối liên hệ phổ biến ────────────────────────
// Các nút nối với nhau bằng cạnh → khách quan, phổ biến, đa dạng
function NetworkArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.4 })
  const nodes = [
    [0, 0, 0],
    [0.3, 0.2, 0], [-0.3, 0.2, 0],
    [0, -0.28, 0.22], [0, -0.28, -0.22],
    [0.28, -0.08, 0.2], [-0.28, -0.08, -0.2],
  ]
  const edgePairs = [[0,1],[0,2],[0,3],[0,4],[1,5],[2,6],[3,5],[4,6],[1,2],[3,4]]
  return (
    <group ref={ref}>
      {nodes.map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <sphereGeometry args={[i === 0 ? 0.1 : 0.065, 6, 5]} />
          <meshStandardMaterial
            color={i === 0 ? palette.edge : palette.main}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? (i === 0 ? 1.2 : 0.7) : (i === 0 ? 0.5 : 0.25)}
            flatShading
          />
        </mesh>
      ))}
      {edgePairs.map(([a, b], i) => {
        const [ax, ay, az] = nodes[a], [bx, by, bz] = nodes[b]
        const mx = (ax+bx)/2, my = (ay+by)/2, mz = (az+bz)/2
        const len = Math.sqrt((bx-ax)**2+(by-ay)**2+(bz-az)**2)
        return (
          <mesh key={i} position={[mx, my, mz]}>
            <cylinderGeometry args={[0.012, 0.012, len, 3]} />
            <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} />
          </mesh>
        )
      })}
      {hovered && <SelectionHull scale={1.22}><sphereGeometry args={[0.52, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 9. VÒNG XOÁY ĐI LÊN — Nguyên lý sự phát triển ────────────────────────
// Xoáy ốc từ thấp lên cao, vòng ngoài dần rộng → từ đơn giản đến phức tạp hơn
function SpiralAscend({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.6 })
  const n = 14
  const beads = Array.from({ length: n }, (_, i) => {
    const frac = i / (n - 1)
    const t = frac * Math.PI * 3
    const r = 0.12 + frac * 0.22
    return { x: Math.cos(t) * r, y: -0.4 + i * 0.058, z: Math.sin(t) * r, frac }
  })
  return (
    <group ref={ref}>
      {beads.map((b, i) => (
        <mesh key={i} castShadow position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.044 + b.frac * 0.04, 5, 4]} />
          <meshStandardMaterial
            color={b.frac > 0.6 ? palette.edge : palette.main}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? 0.9 + b.frac * 0.3 : 0.3 + b.frac * 0.2}
            flatShading
          />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.2}><sphereGeometry args={[0.48, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 10. TAM GIÁC QUAN ĐIỂM — Ý nghĩa phương pháp luận 2 nguyên lý ─────────
// 3 đỉnh nối nhau → Toàn diện · Lịch sử-cụ thể · Phát triển
function TriangleViewpoint({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.4 })
  const verts = [[0, 0.38, 0], [-0.33, -0.2, 0.18], [0.33, -0.2, -0.18]]
  const edgePairs = [[0,1],[1,2],[2,0]]
  return (
    <group ref={ref}>
      {verts.map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <tetrahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color={i === 0 ? palette.edge : palette.main}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? 1.2 : 0.4}
            flatShading
          />
        </mesh>
      ))}
      {edgePairs.map(([a, b], i) => {
        const va = verts[a], vb = verts[b]
        const mx = (va[0]+vb[0])/2, my = (va[1]+vb[1])/2, mz = (va[2]+vb[2])/2
        const len = Math.sqrt((vb[0]-va[0])**2+(vb[1]-va[1])**2+(vb[2]-va[2])**2)
        return (
          <mesh key={i} position={[mx, my, mz]}>
            <cylinderGeometry args={[0.016, 0.016, len, 4]} />
            <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} />
          </mesh>
        )
      })}
      {hovered && <SelectionHull scale={1.2}><tetrahedronGeometry args={[0.52, 0]} /></SelectionHull>}
    </group>
  )
}

// ── 11. LẬP PHƯƠNG 6 MẶT — Sáu cặp phạm trù cơ bản ──────────────────────
// Khối lập phương xoay, mỗi mặt có chấm sáng riêng → 6 cặp phạm trù biện chứng
function SixFacesCube({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.4
    ref.current.rotation.y = clock.elapsedTime * 0.6
  })
  const dotPositions = [
    [0, 0.32, 0], [0, -0.32, 0],
    [0.32, 0, 0], [-0.32, 0, 0],
    [0, 0, 0.32], [0, 0, -0.32],
  ]
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.62, 0.62]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      {dotPositions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.055, 5, 4]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? palette.edge : palette.emissive}
            emissive={i % 2 === 0 ? palette.edge : palette.emissive}
            toneMapped={false}
            emissiveIntensity={hovered ? 3 : 1.5}
          />
        </mesh>
      ))}
      {hovered && <SelectionHull args={[0.68, 0.68, 0.68]} grow={0.08} />}
    </group>
  )
}

// ── 12. THANH TÍCH LŨY LƯỢNG–CHẤT — Quy luật lượng–chất ──────────────────
// Thanh tăng dần, tới điểm nút thì nhảy vọt → lượng đổi dẫn đến chất đổi
function QuantityQuality({ hovered, palette }) {
  const barRef = useRef()
  const dotRef = useRef()
  useFrame(({ clock }) => {
    const t = (Math.sin(clock.elapsedTime * 0.8) + 1) / 2
    if (barRef.current) barRef.current.scale.y = 0.08 + t * 0.92
    if (dotRef.current) {
      dotRef.current.position.y = -0.28 + t * 0.56
      dotRef.current.material.emissiveIntensity =
        hovered ? (t > 0.85 ? 5 : 1.5) : (t > 0.85 ? 3 : 0.8)
    }
  })
  return (
    <group>
      {/* Trục đo */}
      <mesh>
        <boxGeometry args={[0.08, 0.72, 0.08]} />
        <meshStandardMaterial color={palette.main} emissive={palette.main} emissiveIntensity={hovered ? 0.4 : 0.15} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      {/* Thanh lượng */}
      <mesh ref={barRef} position-y={-0.28} scale-y={0.5}>
        <boxGeometry args={[0.22, 0.72, 0.22]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} transparent opacity={0.75} flatShading />
      </mesh>
      {/* Điểm nút nhảy vọt */}
      <mesh ref={dotRef} position={[0.18, 0, 0]}>
        <sphereGeometry args={[0.07, 6, 5]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={1.5} />
      </mesh>
      {/* Dấu điểm nút (nét ngang) */}
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.32, 0.014, 0.06]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1 : 0.4} />
      </mesh>
      {hovered && <SelectionHull args={[0.38, 0.8, 0.32]} grow={0.08} />}
    </group>
  )
}

// ── 13. HAI MẶT ĐỐI LẬP — Quy luật thống nhất và đấu tranh các mặt đối lập
// Hai tứ diện xuyên nhau, pulsate va chạm → thống nhất tương đối, đấu tranh tuyệt đối
function ContradictionArtifact({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = Math.sin(clock.elapsedTime * 1.2)
    ref.current.children[0].position.x = -0.18 - t * 0.045
    ref.current.children[1].position.x =  0.18 + t * 0.045
  })
  return (
    <group ref={ref}>
      <mesh castShadow position={[-0.18, 0, 0]}>
        <tetrahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} transparent opacity={0.85} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <mesh castShadow position={[0.18, 0, 0]} rotation-y={Math.PI}>
        <tetrahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 0.8 : 0.3} transparent opacity={0.85} flatShading />
        <Edges threshold={5} color={palette.main} />
      </mesh>
      {hovered && <SelectionHull args={[0.72, 0.52, 0.44]} grow={0.08} />}
    </group>
  )
}

// ── 14. BA VÒNG PHỦ ĐỊNH — Quy luật phủ định của phủ định ────────────────
// 3 vòng xoay (luận đề → phản đề → hợp đề) + mũi tên đi lên theo đường xoáy ốc
function NegationSpiral({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.5 })
  const rings = [
    { y: -0.3, r: 0.32, col: "main"     },
    { y:  0.0, r: 0.26, col: "edge"     },
    { y:  0.3, r: 0.2,  col: "emissive" },
  ]
  return (
    <group ref={ref}>
      {rings.map((ring, i) => (
        <mesh key={i} castShadow position-y={ring.y}>
          <torusGeometry args={[ring.r, 0.04, 4, 20]} />
          <meshStandardMaterial
            color={palette[ring.col]}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? 0.9 + i * 0.2 : 0.3 + i * 0.1}
            flatShading
          />
          <Edges threshold={8} color={palette.edge} />
        </mesh>
      ))}
      {/* Mũi tên lên */}
      <mesh position-y={0.46} rotation-x={Math.PI}>
        <coneGeometry args={[0.07, 0.16, 4, 1]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={hovered ? 3 : 1.5} />
      </mesh>
      {hovered && <SelectionHull scale={1.2}><cylinderGeometry args={[0.4, 0.4, 0.86, 6]} /></SelectionHull>}
    </group>
  )
}

// ── 15. BÀN TAY TÁC ĐỘNG — Thực tiễn và vai trò của thực tiễn ────────────
// Bàn tay (lòng + ngón) tác động quả cầu → thực tiễn là cơ sở, mục đích nhận thức
function PracticeHand({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.15
  })
  const fingers = [
    { x: -0.15, h: 0.28 }, { x: -0.05, h: 0.32 },
    { x:  0.05, h: 0.30 }, { x:  0.15, h: 0.26 },
  ]
  return (
    <group ref={ref}>
      <mesh castShadow position-y={-0.06}>
        <boxGeometry args={[0.38, 0.22, 0.1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} flatShading />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      {fingers.map((f, i) => (
        <mesh key={i} castShadow position={[f.x, 0.1 + f.h / 2, 0]}>
          <boxGeometry args={[0.065, f.h, 0.08]} />
          <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading />
        </mesh>
      ))}
      <mesh position-y={-0.3}>
        <sphereGeometry args={[0.12, 7, 6]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 1.2 : 0.5} flatShading />
      </mesh>
      {hovered && <SelectionHull args={[0.46, 0.82, 0.24]} grow={0.08} />}
    </group>
  )
}

// ── 16. ĐỘ CONG NHẬN THỨC — Con đường biện chứng của nhận thức ────────────
// 3 nút (cảm tính → lý tính → thực tiễn) nối đường cong → biện chứng nhận thức
function CognitionPath({ hovered, palette }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.35 })
  const stations = [
    { pos: [-0.28, -0.3,  0.1] },
    { pos: [ 0.0,   0.22, 0.0] },
    { pos: [ 0.28, -0.3, -0.1] },
  ]
  const connectors = [[0,1],[1,2]]
  return (
    <group ref={ref}>
      {stations.map((s, i) => (
        <mesh key={i} castShadow position={s.pos}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color={i === 1 ? palette.edge : palette.main}
            emissive={palette.emissive}
            emissiveIntensity={hovered ? (i === 1 ? 1.2 : 0.8) : (i === 1 ? 0.5 : 0.3)}
            flatShading
          />
          <Edges threshold={5} color={palette.edge} />
        </mesh>
      ))}
      {connectors.map(([a, b], i) => {
        const pa = stations[a].pos, pb = stations[b].pos
        const mx = (pa[0]+pb[0])/2, my = (pa[1]+pb[1])/2, mz = (pa[2]+pb[2])/2
        const dx = pb[0]-pa[0], dy = pb[1]-pa[1], dz = pb[2]-pa[2]
        const len = Math.sqrt(dx*dx+dy*dy+dz*dz)
        const angle = Math.atan2(Math.sqrt(dx*dx+dz*dz), dy)
        return (
          <mesh key={i} position={[mx, my, mz]} rotation-z={Math.atan2(dx, dy)}>
            <cylinderGeometry args={[0.016, 0.016, len, 3]} />
            <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} />
          </mesh>
        )
      })}
      {hovered && <SelectionHull scale={1.2}><sphereGeometry args={[0.52, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// ── 17. NGỌN ĐÈN CHÂN LÝ — Chân lý ──────────────────────────────────────
// Bóng đèn phát sáng + tia → tri thức phù hợp khách quan & được thực tiễn kiểm nghiệm
function TruthLantern({ hovered, palette }) {
  const core = useRef()
  useFrame(({ clock }) => {
    if (!core.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 3.5) * 0.1
    core.current.scale.setScalar(pulse)
    core.current.material.emissiveIntensity =
      hovered ? 5 + Math.sin(clock.elapsedTime * 4) * 1.5 : 2.5
  })
  const rayAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  return (
    <group>
      <mesh castShadow position-y={-0.3}>
        <cylinderGeometry args={[0.08, 0.12, 0.12, 6]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.5 : 0.2} flatShading />
      </mesh>
      <mesh castShadow position-y={-0.1}>
        <cylinderGeometry args={[0.04, 0.04, 0.28, 5]} />
        <meshStandardMaterial color={palette.main} flatShading />
      </mesh>
      <mesh castShadow position-y={0.12}>
        <sphereGeometry args={[0.18, 8, 7]} />
        <meshStandardMaterial color={palette.emissive} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.35} transparent opacity={0.6} flatShading />
        <Edges threshold={10} color={palette.edge} />
      </mesh>
      <mesh ref={core} position-y={0.12}>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={2.5} />
      </mesh>
      {rayAngles.map((a, i) => (
        <mesh key={i}
          position={[Math.cos(a) * 0.36, 0.12, Math.sin(a) * 0.36]}
          rotation-z={Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI / 2}>
          <cylinderGeometry args={[0.008, 0.002, 0.14, 3]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={hovered ? 2.5 : 1.2} />
        </mesh>
      ))}
      {hovered && <SelectionHull scale={1.2}><sphereGeometry args={[0.46, 6, 5]} /></SelectionHull>}
    </group>
  )
}

// Ánh xạ id hiện vật → vật phẩm & màu chủ đề biện chứng
const C2_ARTIFACT_MAP = {
  "c2-matter":               { Shape: MatterSphere,          palette: P.blue   },
  "c2-matter-meaning":       { Shape: DiamondGem,            palette: P.indigo },
  "c2-motion":               { Shape: MotionRings,           palette: P.cyan   },
  "c2-consciousness-origin": { Shape: BrainRays,             palette: P.violet },
  "c2-consciousness-essence":{ Shape: PrismCrystal,          palette: P.violet },
  "c2-matter-consciousness": { Shape: MatterConsciousness,   palette: P.teal   },
  "c2-dialectics":           { Shape: DoubleHelix,           palette: P.blue   },
  "c2-universal-connection": { Shape: NetworkArtifact,       palette: P.green  },
  "c2-development":          { Shape: SpiralAscend,          palette: P.cyan   },
  "c2-principles-meaning":   { Shape: TriangleViewpoint,     palette: P.indigo },
  "c2-categories":           { Shape: SixFacesCube,          palette: P.gold   },
  "c2-law-quantity-quality": { Shape: QuantityQuality,       palette: P.amber  },
  "c2-law-contradiction":    { Shape: ContradictionArtifact, palette: P.red    },
  "c2-law-negation":         { Shape: NegationSpiral,        palette: P.indigo },
  "c2-practice":             { Shape: PracticeHand,          palette: P.green  },
  "c2-cognition-path":       { Shape: CognitionPath,         palette: P.blue   },
  "c2-truth":                { Shape: TruthLantern,          palette: P.gold   },
}

const FALLBACK = { Shape: MatterSphere, palette: P.blue }

// Vật phẩm lơ lửng chuyên biệt cho phòng C2 — Chủ nghĩa duy vật biện chứng
export default function FloatingDialecticsArtifact({ hovered, accent, exhibitId, ...pointerHandlers }) {
  const ref = useFloat(hovered)
  const { Shape, palette } = C2_ARTIFACT_MAP[exhibitId] ?? FALLBACK

  return (
    <group ref={ref} {...pointerHandlers}>
      <Shape hovered={hovered} palette={palette} />
    </group>
  )
}
