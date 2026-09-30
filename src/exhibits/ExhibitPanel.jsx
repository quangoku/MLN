import { Html } from '@react-three/drei'
import { ROOMS } from '../world/layout.js'

const KIND_LABEL = {
  book: 'Định nghĩa · Lý thuyết',
  gem: 'Kết luận · Ý nghĩa',
  sign: 'Bảng giới thiệu',
}

// Bảng thông tin DOM gắn vào vị trí 3D của hiện vật.
// pointer-events: none (trong CSS) để bảng không "cướp" hover khỏi vật thể.
export default function ExhibitPanel({ data, y, pinned }) {
  const body = Array.isArray(data.body) ? data.body : [data.body]
  const room = ROOMS.find((r) => r.id === data.roomId)

  return (
    <Html position={[0, y, 0]} zIndexRange={[pinned ? 11 : 10, 0]}>
      <div className={`exhibit-panel exhibit-panel--${data.type}`}>
        <div className="exhibit-panel__meta">
          <span className="exhibit-panel__kind">{KIND_LABEL[data.type]}</span>
          {data.number && (
            <span className="exhibit-panel__num">
              Chương {room.chapter} · #{data.number}
            </span>
          )}
        </div>
        <h2>{data.title}</h2>
        {data.quote && (
          <blockquote>
            “{data.quote.text}”<cite>— {data.quote.author}</cite>
          </blockquote>
        )}
        {body.length > 1 ? (
          <ul>
            {body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>{body[0]}</p>
        )}
        <footer>{pinned ? 'Đã ghim · Esc hoặc nhấp ra ngoài để đóng' : 'Nhấp để ghim bảng này'}</footer>
      </div>
    </Html>
  )
}
