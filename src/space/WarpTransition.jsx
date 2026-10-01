import { useMuseumStore } from '../store/useMuseumStore.js'

export default function WarpTransition() {
  const spaceWarping = useMuseumStore((s) => s.spaceWarping)

  if (!spaceWarping) return null

  return (
    <div className={`warp-overlay ${spaceWarping === 'entering' ? 'warp-overlay--enter' : 'warp-overlay--exit'}`}>
      <div className="warp-tunnel">
        <div className="warp-ring warp-ring-1" />
        <div className="warp-ring warp-ring-2" />
        <div className="warp-ring warp-ring-3" />
        <div className="warp-core" />
      </div>
      <div className="warp-text">
        {spaceWarping === 'entering' ? 'ĐANG KẾT NỐI VÀO KHÔNG GIAN VŨ TRỤ...' : 'ĐANG TRỞ VỀ SẢNH BẢO TÀNG...'}
      </div>
    </div>
  )
}
