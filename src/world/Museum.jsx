import Floor from './Floor.jsx'
import Wall from './Wall.jsx'
import Pillar from './Pillar.jsx'
import DoorFrame from './DoorFrame.jsx'
import { PROPS } from './props/index.js'
import { ROOMS, WALLS, PILLARS, DECOR, DOORWAYS } from './layout.js'

// Phần kiến trúc tĩnh: sàn, tường, khung cửa, cột, thảm, đồ trang trí
export default function Museum() {
  return (
    <group>
      {/* Sàn các phòng */}
      {ROOMS.map((r) => (
        <Floor key={r.id} kind={r.theme.floor} x={r.cx} z={r.cz ?? 0} width={r.width} depth={r.depth} />
      ))}

      {/* Thảm trang trí trung tâm Sảnh chính (theo reference) */}
      <mesh position={[0, 0.003, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial color="#A8443B" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.6, 6.6]} />
        <meshStandardMaterial color="#EDE8DB" roughness={0.8} />
      </mesh>

      {/* Tường các phòng */}
      {WALLS.map((w, i) => (
        <Wall key={i} {...w} />
      ))}

      {/* Khung cửa gỗ nâu đậm */}
      {DOORWAYS.map((d) => (
        <DoorFrame key={d.id} {...d} />
      ))}

      {/* Cột gỗ ở góc phòng */}
      {PILLARS.map((p, i) => (
        <Pillar key={i} position={p} />
      ))}

      {/* Hiện vật trang trí, tượng, cây, ghế, đèn */}
      {DECOR.map(({ kind, ...props }, i) => {
        const Prop = PROPS[kind]
        if (!Prop) return null
        return <Prop key={i} {...props} />
      })}
    </group>
  )
}
