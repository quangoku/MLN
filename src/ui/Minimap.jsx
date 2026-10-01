import { useEffect, useRef } from 'react'
import { ROOMS, EXHIBITS, BOUNDS } from '../world/layout.js'
import { playerRef } from '../player/playerRef.js'
import { useMuseumStore } from '../store/useMuseumStore.js'

const WIDTH = 224
const PAD = 8
const scale = (WIDTH - PAD * 2) / (BOUNDS.maxX - BOUNDS.minX)
const HEIGHT = Math.round((BOUNDS.maxZ - BOUNDS.minZ) * scale + PAD * 2)
const sx = (x) => PAD + (x - BOUNDS.minX) * scale
const sz = (z) => PAD + (z - BOUNDS.minZ) * scale

// Bản đồ kiến trúc 2D nhìn từ trên xuống (khớp sơ đồ trong reference)
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
      {/* Vẽ các phòng bảo tàng */}
      {ROOMS.map((r) => (
        <g key={r.id}>
          <rect
            x={sx(r.x0)}
            y={sz(r.z0)}
            width={r.width * scale}
            height={r.depth * scale}
            fill={r.theme.map}
            stroke={r.id === roomId ? '#FFE27A' : '#2A3036'}
            strokeWidth={r.id === roomId ? 2 : 1}
            rx="2"
          />

          {/* Chi tiết thảm đỏ sảnh chính */}
          {r.id === 'lobby' && (
            <>
              <rect
                x={sx(-3.6)}
                y={sz(-3.6)}
                width={7.2 * scale}
                height={7.2 * scale}
                fill="#A8443B"
                rx="1"
              />
              <circle cx={sx(-3.4)} cy={sz(-3.4)} r="2.2" fill="#3F8F5A" />
              <circle cx={sx(3.4)} cy={sz(-3.4)} r="2.2" fill="#3F8F5A" />
              <circle cx={sx(-3.4)} cy={sz(3.4)} r="2.2" fill="#3F8F5A" />
              <circle cx={sx(3.4)} cy={sz(3.4)} r="2.2" fill="#3F8F5A" />
            </>
          )}

          {/* Tên phòng trên minimap */}
          {r.id !== 'vestibule' && (
            <text
              x={sx(r.cx)}
              y={sz(r.cz) + 3.5}
              className="minimap__label"
              fill={r.id === 'lobby' ? '#FFFFFF' : '#FFFFFF'}
              fontWeight="bold"
            >
              {r.id === 'lobby' ? 'Sảnh chính' : r.short}
            </text>
          )}
        </g>
      ))}

      {/* Các chấm hiện vật trên bản đồ */}
      {EXHIBITS.filter((e) => e.type !== 'sign').map((e) => (
        <circle
          key={e.id}
          cx={sx(e.position[0])}
          cy={sz(e.position[2])}
          r="2.2"
          fill={discovered.has(e.id) ? '#FFE27A' : '#E8B84A'}
          stroke="#4A3414"
          strokeWidth="0.5"
        />
      ))}

      {/* Cửa kết nối giữa các phòng (đường kẻ nhỏ màu kem mở lối) */}
      <line x1={sx(-1.2)} y1={sz(-8)} x2={sx(1.2)} y2={sz(-8)} stroke="#EAE3D2" strokeWidth="2.5" />
      <line x1={sx(-8)} y1={sz(-1.2)} x2={sx(-8)} y2={sz(1.2)} stroke="#EAE3D2" strokeWidth="2.5" />
      <line x1={sx(8)} y1={sz(-1.2)} x2={sx(8)} y2={sz(1.2)} stroke="#EAE3D2" strokeWidth="2.5" />
      <line x1={sx(-1.2)} y1={sz(8)} x2={sx(1.2)} y2={sz(8)} stroke="#EAE3D2" strokeWidth="2.5" />

      {/* Vị trí người chơi (chấm xanh lá phát sáng) */}
      <circle ref={dot} r="3.8" fill="#39FF14" stroke="#1F4A40" strokeWidth="1.5" />

      {/* La bàn chỉ hướng Bắc ở góc trên bên phải */}
      <g transform={`translate(${WIDTH - 18}, 18)`}>
        <circle r="9" fill="rgba(15, 22, 20, 0.85)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        <polygon points="0,-6.5 2,0 -2,0" fill="#E85D54" />
        <polygon points="0,5.5 2,0 -2,0" fill="#CBD5E1" />
        <text x="0" y="-8.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#F8FAFC">N</text>
      </g>
    </svg>
  )
}
