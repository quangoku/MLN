import { useEffect } from 'react'
import { KeyboardControls } from '@react-three/drei'
import GameCanvas from './scene/GameCanvas.jsx'
import HUD from './ui/HUD.jsx'
import StartScreen from './ui/StartScreen.jsx'
import Toast from './ui/Toast.jsx'
import SpaceHUD from './space/SpaceHUD.jsx'
import WarpTransition from './space/WarpTransition.jsx'
import PortalScreen from './ui/PortalScreen.jsx'
import EconomyMazeScreen from './ui/EconomyMazeScreen.jsx'
import { KEYMAP } from './config/constants.js'
import { useMuseumStore } from './store/useMuseumStore.js'
import { usePortalStore } from './store/usePortalStore.js'

// Phím tắt không liên quan tới di chuyển
function useShortcuts() {
  useEffect(() => {
    const onKey = (e) => {
      const store = useMuseumStore.getState()
      if (e.code === 'Escape') {
        if (store.inSpaceScene) {
          if (store.selectedPlanet) store.setSelectedPlanet(null)
          else store.exitSpaceScene()
        } else {
          store.clearPin()
        }
      }
      if (e.code === 'KeyM') store.toggleMute()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useShortcuts()
  const gameMode = usePortalStore((s) => s.gameMode)
  const started = useMuseumStore((s) => s.started)
  const inSpaceScene = useMuseumStore((s) => s.inSpaceScene)

  return (
    <>
      {/* ── PORTAL SELECT ── shown when no game chosen */}
      {gameMode === null && <PortalScreen />}

      {/* ── ECONOMY MAZE ── fullscreen iframe wrapper */}
      {gameMode === 'economy' && <EconomyMazeScreen />}

      {/* ── PHILOSOPHY GAME (game cũ) ── always mounted, hidden behind portal */}
      <KeyboardControls map={KEYMAP}>
        <GameCanvas />
      </KeyboardControls>

      {/* Giao diện bảo tàng khi ở mặt đất */}
      {started && !inSpaceScene && gameMode === 'philosophy' && <HUD />}
      {!inSpaceScene && gameMode === 'philosophy' && <Toast />}
      {gameMode === 'philosophy' && <StartScreen />}

      {/* Giao diện thám hiểm Hệ Mặt Trời khi ở trong Không gian */}
      {inSpaceScene && gameMode === 'philosophy' && <SpaceHUD />}

      {/* Hiệu ứng chuyển cảnh Warp du hành không gian */}
      {gameMode === 'philosophy' && <WarpTransition />}
    </>
  )
}
