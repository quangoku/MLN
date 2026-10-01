import { Suspense } from 'react'
import { PerspectiveCamera, OrbitControls, Stars } from '@react-three/drei'
import { PLANETS } from './PlanetsData.js'
import Sun from './Sun.jsx'
import Planet from './Planet.jsx'
import { useMuseumStore } from '../store/useMuseumStore.js'

export default function SpaceScene() {
  const setSelectedPlanet = useMuseumStore((s) => s.setSelectedPlanet)
  const sunData = PLANETS[0]
  const planetsList = PLANETS.slice(1)

  return (
    <group onPointerMissed={() => setSelectedPlanet(null)}>
      {/* Camera phối cảnh 3D góc nhìn vũ trụ bao la */}
      <PerspectiveCamera makeDefault position={[0, 22, 44]} fov={46} near={0.1} far={1200} />

      {/* Điều khiển xoay 360 độ và thu phóng bằng chuột */}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={6}
        maxDistance={110}
        maxPolarAngle={Math.PI / 2 + 0.25}
      />

      {/* Trường sao vũ trụ lấp lánh (Starfield) */}
      <Stars radius={160} depth={80} count={4500} factor={4} saturation={0} fade speed={1.2} />

      {/* Ánh sáng nền không gian sâu (Deep space ambient) */}
      <ambientLight intensity={0.35} color="#1E2A3C" />

      <Suspense fallback={null}>
        {/* Mặt Trời trung tâm phát sáng */}
        <Sun data={sunData} />

        {/* Các hành tinh trong Hệ Mặt Trời */}
        {planetsList.map((planet) => (
          <Planet key={planet.id} data={planet} />
        ))}
      </Suspense>
    </group>
  )
}
