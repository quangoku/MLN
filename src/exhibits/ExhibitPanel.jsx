import { Html } from '@react-three/drei'
import { ROOMS } from '../world/layout.js'

const KIND_LABEL = {
  book: 'Định nghĩa · Lý thuyết',
  gem: 'Kết luận · Ý nghĩa',
  sign: 'Bảng giới thiệu',
}

// Bảng thông tin DOM gắn vào vị trí 3D của hiện vật.
export default function ExhibitPanel({ data, y, pinned, checked, onCheck }) {
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
        <div className="exhibit-panel__actions">
          <button type="button" onClick={(event) => { event.stopPropagation(); onCheck() }} disabled={checked}>
            {checked ? 'Đã xem' : 'Check · Đánh dấu đã xem'}
          </button>
        </div>
        <footer>{pinned ? 'Đã ghim · Esc hoặc nhấp ra ngoài để đóng' : 'Đến gần để đọc · Nhấp hiện vật để ghim'}</footer>
      </div>
    </Html>
  )
}
