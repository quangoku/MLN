import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { playPlanetSelect, playHover } from '../audio/sfx.js'

export default function Sun({ data }) {
  const coronaRef = useRef()
  const flareRef = useRef()
  const setSelectedPlanet = useMuseumStore((s) => s.setSelectedPlanet)
  const isSelected = useMuseumStore((s) => s.selectedPlanet?.id === data.id)

  useFrame((state, delta) => {
    if (coronaRef.current) {
      coronaRef.current.rotation.y += delta * 0.1
      coronaRef.current.rotation.z += delta * 0.05
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
      coronaRef.current.scale.set(pulse, pulse, pulse)
    }
    if (flareRef.current) {
      flareRef.current.rotation.y -= delta * 0.06
    }
  })

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        playPlanetSelect()
        setSelectedPlanet(data)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        playHover()
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Lõi Mặt Trời phát sáng mãnh liệt (Bloom) */}
      <mesh>
        <sphereGeometry args={[data.size, 32, 24]} />
        <meshStandardMaterial
          color="#FFF2A3"
          emissive="#FFA500"
          emissiveIntensity={2.5}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Lớp nhật hoa (Corona) thứ nhất */}
      <mesh ref={coronaRef} scale={1.15}>
        <sphereGeometry args={[data.size, 24, 20]} />
        <meshBasicMaterial
          color="#FF7700"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Lớp hào quang rộng bên ngoài */}
      <mesh ref={flareRef} scale={1.35}>
        <sphereGeometry args={[data.size, 20, 16]} />
        <meshBasicMaterial
          color="#FF3C00"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Nguồn sáng Mặt trời tỏa đi toàn Hệ Mặt Trời */}
      <pointLight position={[0, 0, 0]} intensity={4.5} distance={150} decay={1.2} color="#FFF8E7" />
      <pointLight position={[0, 0, 0]} intensity={1.8} distance={80} decay={0.8} color="#FFD180" />

      {/* Vòng viền khi được chọn */}
      {isSelected && (
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[data.size * 1.45, data.size * 1.55, 36]} />
          <meshBasicMaterial color="#FFE27A" side={2} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}
