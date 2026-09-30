import { useEffect, useRef, useState } from 'react'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { ROOMS, COUNTABLE } from '../world/layout.js'
import { playComplete, playRoomEnter } from '../audio/sfx.js'

// Thông báo giữa màn hình khi vào phòng mới hoặc khi khám phá xong toàn bộ bảo tàng
export default function Toast() {
  const started = useMuseumStore((s) => s.started)
  const roomId = useMuseumStore((s) => s.roomId)
  const done = useMuseumStore((s) => s.discovered.size)
  const [toast, setToast] = useState(null)
  const prevDone = useRef(done)

  const show = (t, ms) => {
    setToast({ ...t, key: Date.now() })
    clearTimeout(show.timer)
    show.timer = setTimeout(() => setToast(null), ms)
  }

  useEffect(() => {
    if (!started) return
    const room = ROOMS.find((r) => r.id === roomId)
    show({ eyebrow: room.chapter ? `${room.name} · Chương ${room.chapter}` : 'PhiloVerse', title: room.title ?? room.name }, 3000)
    playRoomEnter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, started])

  useEffect(() => {
    if (prevDone.current < COUNTABLE.length && done === COUNTABLE.length) {
      show({ eyebrow: 'Hoàn thành', title: 'Bạn đã khám phá toàn bộ bảo tàng! 🏆', big: true }, 5000)
      playComplete()
    }
    prevDone.current = done
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  if (!toast) return null
  return (
    <div key={toast.key} className={`toast ${toast.big ? 'toast--big' : ''}`}>
      <p>{toast.eyebrow}</p>
      <h2>{toast.title}</h2>
    </div>
  )
}
