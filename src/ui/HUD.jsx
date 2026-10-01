import { useMuseumStore } from '../store/useMuseumStore.js'
import { ROOMS, COUNTABLE } from '../world/layout.js'
import Minimap from './Minimap.jsx'

function Progress({ done, total }) {
  return (
    <div className="progress">
      <div className="progress__bar" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  )
}

export default function HUD() {
  const roomId = useMuseumStore((s) => s.roomId)
  const discovered = useMuseumStore((s) => s.discovered)
  const muted = useMuseumStore((s) => s.muted)
  const toggleMute = useMuseumStore((s) => s.toggleMute)

  const room = ROOMS.find((r) => r.id === roomId)
  const inRoom = COUNTABLE.filter((e) => e.roomId === roomId)
  const doneInRoom = inRoom.filter((e) => discovered.has(e.id)).length
  const doneTotal = COUNTABLE.filter((e) => discovered.has(e.id)).length

  return (
    <>
      <div className="hud hud--left">
        <p className="hud__eyebrow">PhiloVerse · {room.name}</p>
        <h1>{room.title ?? 'Sảnh chính'}</h1>
        {inRoom.length > 0 && (
          <>
            <Progress done={doneInRoom} total={inRoom.length} />
            <p className="hud__small">Phòng này: {doneInRoom}/{inRoom.length} hiện vật</p>
          </>
        )}
        <p className="hud__small">
          Toàn bảo tàng: <strong>{doneTotal}/{COUNTABLE.length}</strong>
          {doneTotal === COUNTABLE.length && ' 🏆'}
        </p>
      </div>

      <div className="hud hud--right">
        <Minimap />
        <button className="hud__button" onClick={toggleMute} title="Phím M">
          {muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        </button>
      </div>

      <div className="hud hud--bottom">
        <span><kbd>WASD</kbd> đi</span>
        <span><kbd>Shift</kbd> chạy</span>
        <span><kbd>Cuộn chuột</kbd> phóng to</span>
        <span>Đến gần để đọc · bấm Check để đánh dấu đã xem</span>
        <span><kbd>Nhấp</kbd> ghim bảng</span>
        <span><kbd>M</kbd> âm thanh</span>
      </div>
    </>
  )
}
