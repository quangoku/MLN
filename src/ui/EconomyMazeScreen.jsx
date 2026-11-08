import { useEffect, useRef } from 'react'
import { usePortalStore } from '../store/usePortalStore.js'

// The maze game is an iframe pointing to the standalone /game-maze/index.html
// This keeps the existing React app completely untouched.

export default function EconomyMazeScreen() {
  const returnToPortal = usePortalStore((s) => s.returnToPortal)
  const iframeRef = useRef(null)

  // Listen for messages from the iframe (e.g., "back to portal")
  useEffect(() => {
    const handler = (event) => {
      if (event.data === 'ECONOMY_MAZE_BACK_TO_PORTAL') {
        returnToPortal()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [returnToPortal])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#000',
      }}
    >
      {/* Back button overlay */}
      <button
        onClick={returnToPortal}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 60,
          padding: '7px 16px',
          background: 'rgba(0,20,20,0.85)',
          border: '1px solid rgba(0,220,180,0.4)',
          borderRadius: 20,
          color: '#7ee8c8',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,40,40,0.95)'
          e.currentTarget.style.color = '#a0f0d8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,20,20,0.85)'
          e.currentTarget.style.color = '#7ee8c8'
        }}
      >
        ← Về trang chính
      </button>
      <iframe
        ref={iframeRef}
        src="./game-maze/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Mê Cung Kinh Tế"
        allow="autoplay; pointer-lock; fullscreen"
      />
    </div>
  )
}
