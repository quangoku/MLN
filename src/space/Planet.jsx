import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Billboard, Text } from '@react-three/drei'
import { Vector3, DoubleSide } from 'three'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { playPlanetSelect, playHover } from '../audio/sfx.js'

export default function Planet({ data }) {
  const orbitGroup = useRef()
  const planetBody = useRef()
  const moonRef = useRef()
  const [hovered, setHovered] = useState(false)

  const setSelectedPlanet = useMuseumStore((s) => s.setSelectedPlanet)
  const isSelected = useMuseumStore((s) => s.selectedPlanet?.id === data.id)

  // Tạo đường quỹ đạo tròn
  const orbitPoints = useMemo(() => {
    const pts = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      pts.push(new Vector3(Math.cos(theta) * data.orbitRadius, 0, Math.sin(theta) * data.orbitRadius))
    }
    return pts
  }, [data.orbitRadius])

  // Chuyển động quỹ đạo & tự quay quanh trục
  useFrame((state, delta) => {
    // Quỹ đạo quanh Mặt Trời
    if (orbitGroup.current && data.orbitSpeed !== 0) {
      orbitGroup.current.rotation.y += delta * data.orbitSpeed * 0.25
    }

    // Tự quay quanh trục của hành tinh
    if (planetBody.current) {
      planetBody.current.rotation.y += delta * data.rotationSpeed
    }

    // Mặt Trăng quay quanh Trái Đất
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 1.2
    }
  })

  return (
    <>
      {/* Đường vẽ quỹ đạo mờ trang nhã */}
      <Line
        points={orbitPoints}
        color={hovered || isSelected ? '#FFE27A' : '#4E7285'}
        lineWidth={hovered || isSelected ? 1.5 : 0.8}
        transparent
        opacity={hovered || isSelected ? 0.75 : 0.25}
      />

      {/* Nhóm quay quanh Mặt Trời */}
      <group ref={orbitGroup}>
        {/* Vị trí hành tinh trên quỹ đạo */}
        <group position={[data.orbitRadius, 0, 0]}>
          {/* Nhóm nghiêng trục (Axial Tilt) */}
          <group rotation-z={data.tilt ?? 0}>
            {/* Khối cầu hành tinh tự quay */}
            <group
              ref={planetBody}
              onClick={(e) => {
                e.stopPropagation()
                playPlanetSelect()
                setSelectedPlanet(data)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(true)
                document.body.style.cursor = 'pointer'
                playHover()
              }}
              onPointerOut={() => {
                setHovered(false)
                document.body.style.cursor = 'default'
              }}
            >
              {/* Thân chính hành tinh */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[data.size, 32, 24]} />
                <meshStandardMaterial
                  color={data.color}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Chi tiết riêng cho từng hành tinh */}
              {/* TRÁI ĐẤT: Lớp lục địa & khí quyển */}
              {data.id === 'earth' && (
                <>
                  {/* Lục địa xanh */}
                  <mesh scale={1.005}>
                    <sphereGeometry args={[data.size, 20, 16]} />
                    <meshStandardMaterial
                      color="#3FA34D"
                      roughness={0.8}
                      wireframe={false}
                      transparent
                      opacity={0.35}
                    />
                  </mesh>
                  {/* Khí quyển mờ */}
                  <mesh scale={1.12}>
                    <sphereGeometry args={[data.size, 20, 16]} />
                    <meshBasicMaterial
                      color="#8EE2FE"
                      transparent
                      opacity={0.2}
                      depthWrite={false}
                    />
                  </mesh>
                </>
              )}

              {/* SAO KIM: Bầu khí quyển vàng dày đặc */}
              {data.id === 'venus' && (
                <mesh scale={1.06}>
                  <sphereGeometry args={[data.size, 20, 16]} />
                  <meshBasicMaterial color="#F7E2A9" transparent opacity={0.25} depthWrite={false} />
                </mesh>
              )}

              {/* SAO MỘC: Các dải khí quyển và Vết Đỏ Lớn */}
              {data.id === 'jupiter' && (
                <>
                  <mesh scale={[1.002, 0.98, 1.002]}>
                    <sphereGeometry args={[data.size, 32, 16]} />
                    <meshStandardMaterial color="#B07C50" wireframe wireframeLinewidth={2} transparent opacity={0.3} />
                  </mesh>
                  {/* Vết Đỏ Lớn */}
                  <mesh position={[data.size * 0.85, -data.size * 0.2, data.size * 0.45]}>
                    <sphereGeometry args={[0.26, 12, 10]} />
                    <meshStandardMaterial color="#A33222" />
                  </mesh>
                </>
              )}

              {/* SAO THỔ: Hệ thống vành đai ngoạn mục */}
              {data.hasRings && (
                <mesh rotation-x={Math.PI / 2}>
                  <ringGeometry args={[data.ringInner, data.ringOuter, 48]} />
                  <meshStandardMaterial
                    color={data.id === 'saturn' ? '#E4CCA1' : '#9FE0EB'}
                    side={DoubleSide}
                    transparent
                    opacity={0.85}
                    roughness={0.5}
                  />
                </mesh>
              )}

              {/* Vòng sáng khi hover hoặc đang được chọn */}
              {(hovered || isSelected) && (
                <mesh scale={1.3}>
                  <sphereGeometry args={[data.size, 16, 12]} />
                  <meshBasicMaterial
                    color={isSelected ? '#FFE27A' : '#7FE3FF'}
                    wireframe
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              )}
            </group>

            {/* MẶT TRĂNG quay quanh TRÁI ĐẤT */}
            {data.hasMoon && (
              <group ref={moonRef}>
                <group position={[data.size + 1.2, 0, 0]}>
                  <mesh castShadow>
                    <sphereGeometry args={[0.22, 16, 12]} />
                    <meshStandardMaterial color="#C5C7CC" roughness={0.9} />
                  </mesh>
                </group>
              </group>
            )}
          </group>

          {/* Nhãn tên hành tinh bay phía trên (luôn xoay theo camera) */}
          <Billboard position={[0, data.size + 0.9, 0]}>
            <Text
              fontSize={0.65}
              color={isSelected ? '#FFE27A' : '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.06}
              outlineColor="#04060B"
            >
              {data.name}
            </Text>
          </Billboard>
        </group>
      </group>
    </>
  )
}
