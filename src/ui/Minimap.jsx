import { useEffect, useRef } from 'react'
import { ROOMS, EXHIBITS, BOUNDS } from '../world/layout.js'
import { playerRef } from '../player/playerRef.js'
import { useMuseumStore } from '../store/useMuseumStore.js'

const WIDTH = 240
const PAD = 4
const scale = (WIDTH - PAD * 2) / (BOUNDS.maxX - BOUNDS.minX)
const HEIGHT = (BOUNDS.maxZ - BOUNDS.minZ) * scale + PAD * 2
const sx = (x) => PAD + (x - BOUNDS.minX) * scale
const sz = (z) => PAD + (z - BOUNDS.minZ) * scale

// Bản đồ nhìn từ trên xuống. Chấm player cập nhật bằng requestAnimationFrame,
// ghi thẳng vào DOM để không re-render React mỗi frame.
export default function Minimap() {
  const dot = useRef()
  const discovered = useMuseumStore((s) => s.discovered)
  const roomId = useMuseumStore((s) => s.roomId)

  useEffect(() => {
    let frame
    const tick = () => {
      const p = playerRef.current
      if (p && dot.current) {
        dot.current.setAttribute('cx', sx(p.position.x))
        dot.current.setAttribute('cy', sz(p.position.z))
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg className="minimap" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {ROOMS.map((r) => (
        <g key={r.id}>
          <rect
            x={sx(r.x0)}
            y={sz(-r.depth / 2)}
            width={r.width * scale}
            height={r.depth * scale}
            fill={r.theme.map}
            stroke={r.id === roomId ? '#FFE27A' : '#3A2A2A'}
            strokeWidth={r.id === roomId ? 2 : 1}
            rx="2"
          />
          <text x={sx(r.cx)} y={sz(0) + 3} className="minimap__label">
            {r.short}
          </text>
        </g>
      ))}
      {EXHIBITS.filter((e) => e.type !== 'sign').map((e) => (
        <circle
          key={e.id}
          cx={sx(e.position[0])}
          cy={sz(e.position[2])}
          r="2.4"
          fill={discovered.has(e.id) ? '#FFE27A' : 'rgba(0,0,0,0.35)'}
        />
      ))}
      <circle ref={dot} r="3.6" fill="#39FF14" stroke="#1F4A40" strokeWidth="1.2" />
    </svg>
  )
}
