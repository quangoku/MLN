import Floor from './Floor.jsx'
import Wall from './Wall.jsx'
import Pillar from './Pillar.jsx'
import { PROPS } from './props/index.js'
import { ROOMS, WALLS, PILLARS, DECOR } from './layout.js'
import { LAYOUT } from '../config/constants.js'

// Phần kiến trúc tĩnh: sàn, tường, cột, đồ trang trí — tất cả lấy từ layout.js
export default function Museum() {
  return (
    <group>
      {ROOMS.map((r) => (
        <Floor key={r.id} kind={r.theme.floor} x={r.cx} width={r.width} depth={LAYOUT.depth} />
      ))}
      {WALLS.map((w, i) => (
        <Wall key={i} {...w} />
      ))}
      {PILLARS.map((p, i) => (
        <Pillar key={i} position={p} />
      ))}
      {DECOR.map(({ kind, ...props }, i) => {
        const Prop = PROPS[kind]
        return <Prop key={i} {...props} />
      })}
    </group>
  )
}
