import { Canvas } from '@react-three/fiber'
import Lighting from './Lighting.jsx'
import CameraRig from './CameraRig.jsx'
import Effects from './Effects.jsx'
import Museum from '../world/Museum.jsx'
import Player from '../player/Player.jsx'
import Visitors from '../npc/Visitors.jsx'
import Exhibit from '../exhibits/Exhibit.jsx'
import { EXHIBITS } from '../world/layout.js'
import { COLORS } from '../config/theme.js'
import { useMuseumStore } from '../store/useMuseumStore.js'

export default function GameCanvas() {
  return (
    // `flat` tắt tone mapping để giữ màu phẳng, tươi đúng style low-poly
    <Canvas shadows flat dpr={[1, 2]} onPointerMissed={() => useMuseumStore.getState().clearPin()}>
      <color attach="background" args={[COLORS.background]} />
      <Lighting />
      <CameraRig />
      <Museum />
      <Player />
      <Visitors />
      {EXHIBITS.map((exhibit) => (
        <Exhibit key={exhibit.id} data={exhibit} />
      ))}
      <Effects />
    </Canvas>
  )
}
