import { Canvas } from '@react-three/fiber'
import Lighting from './Lighting.jsx'
import CameraRig from './CameraRig.jsx'
import Effects from './Effects.jsx'
import Museum from '../world/Museum.jsx'
import Player from '../player/Player.jsx'
import Visitors from '../npc/Visitors.jsx'
import Exhibit from '../exhibits/Exhibit.jsx'
import SpaceScene from '../space/SpaceScene.jsx'
import GhostSwarm from '../world/GhostSwarm.jsx'
import { EXHIBITS } from '../world/layout.js'
import { COLORS } from '../config/theme.js'
import { useMuseumStore } from '../store/useMuseumStore.js'

export default function GameCanvas() {
  const inSpaceScene = useMuseumStore((s) => s.inSpaceScene)

  return (
    // `flat` tắt tone mapping để giữ màu phẳng, tươi đúng style low-poly
    <Canvas
      shadows
      flat
      dpr={[1, 2]}
      onPointerMissed={() => {
        const store = useMuseumStore.getState()
        if (inSpaceScene) {
          store.setSelectedPlanet(null)
        } else {
          store.clearPin()
        }
      }}
    >
      {inSpaceScene ? (
        <>
          {/* Nền vũ trụ sâu thẳm */}
          <color attach="background" args={['#030509']} />
          <SpaceScene />
          <Effects />
        </>
      ) : (
        <>
          {/* Nền bảo tàng isometric */}
          <color attach="background" args={[COLORS.background]} />
          <Lighting />
          <CameraRig />
          <Museum />
          <Player />
          <Visitors />
          {/* Bầy ma bay ngoài vùng bảo tàng (vùng xanh) */}
          <GhostSwarm />
          {EXHIBITS.map((exhibit) => (
            <Exhibit key={exhibit.id} data={exhibit} />
          ))}
          <Effects />
        </>
      )}
    </Canvas>
  )
}

