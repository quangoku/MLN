import { useMuseumStore } from '../store/useMuseumStore.js'
import { ROOMS, COUNTABLE } from '../world/layout.js'
import { unlockAudio } from '../audio/sfx.js'

export default function StartScreen() {
  const started = useMuseumStore((s) => s.started)
  const start = useMuseumStore((s) => s.start)
  const resetProgress = useMuseumStore((s) => s.resetProgress)
  const done = useMuseumStore((s) => COUNTABLE.filter((exhibit) => s.discovered.has(exhibit.id)).length)
  const hasChecked = useMuseumStore((s) => s.discovered.size > 0)

  if (started) return null

  const enter = () => {
    unlockAudio()
    start()
  }

  return (
    <div className="start">
      <div className="start__card">
        <p className="start__eyebrow">MLN111 · Triết học Mác-Lênin</p>
        <h1>PhiloVerse</h1>
        <p className="start__lead">
          Bảo tàng triết học 2.5D. Dạo qua ba phòng trưng bày, đến gần hiện vật để đọc khái niệm, nguyên lý và kết luận của giáo trình.
        </p>

        <ol className="start__rooms">
          {ROOMS.filter((r) => r.chapter).map((r) => (
            <li key={r.id}>
              <span style={{ background: r.theme.accent }}>{r.chapter}</span>
              {r.title}
            </li>
          ))}
        </ol>

        <div className="start__legend">
          <div><i className="legend-book" /> Sách lơ lửng — định nghĩa, lý thuyết</div>
          <div><i className="legend-gem" /> Đá quý phát sáng — kết luận, ý nghĩa</div>
        </div>

        <p className="start__keys">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> di chuyển · <kbd>Shift</kbd> chạy · cuộn chuột để phóng to
        </p>

        <button className="start__button" onClick={enter} autoFocus>
          {done > 0 ? `Tiếp tục tham quan (${done}/${COUNTABLE.length})` : 'Vào bảo tàng'}
        </button>
        {hasChecked && (
          <button className="start__link" onClick={resetProgress}>
            Xoá tiến trình và bắt đầu lại
          </button>
        )}
      </div>
    </div>
  )
}
