import { useEffect } from 'react'
import { KeyboardControls } from '@react-three/drei'
import GameCanvas from './scene/GameCanvas.jsx'
import HUD from './ui/HUD.jsx'
import StartScreen from './ui/StartScreen.jsx'
import Toast from './ui/Toast.jsx'
import { KEYMAP } from './config/constants.js'
import { useMuseumStore } from './store/useMuseumStore.js'

// Phím tắt không liên quan tới di chuyển
function useShortcuts() {
  useEffect(() => {
    const onKey = (e) => {
      const store = useMuseumStore.getState()
      if (e.code === 'Escape') store.clearPin()
      if (e.code === 'KeyM') store.toggleMute()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useShortcuts()
  const started = useMuseumStore((s) => s.started)

  return (
    <>
      <KeyboardControls map={KEYMAP}>
        <GameCanvas />
      </KeyboardControls>
      {started && <HUD />}
      <Toast />
      <StartScreen />
    </>
  )
}
