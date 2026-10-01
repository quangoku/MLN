import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float32BufferAttribute, IcosahedronGeometry, Color } from 'three'
import { Billboard, Text } from '@react-three/drei'
import { COLORS } from '../../config/theme.js'
import { mulberry32 } from '../../utils/random.js'
import { playerRef } from '../../player/playerRef.js'
import { useMuseumStore } from '../../store/useMuseumStore.js'
import { playSpaceWarp } from '../../audio/sfx.js'

// Quả địa cầu low-poly ở giữa sảnh:
// mỗi mặt tô ngẫu nhiên màu đất hoặc biển, xoay chậm, có vầng sáng mờ.
function makeGlobeGeometry() {
  const geo = new IcosahedronGeometry(0.75, 2).toNonIndexed()
  const rng = mulberry32(42)
  const land = [new Color('#9DBF6B'), new Color('#C9B36A'), new Color('#7FA65A')]
  const sea = [new Color('#3F8FA8'), new Color('#2F7A94')]
  const colors = []
  const count = geo.attributes.position.count
  for (let i = 0; i < count; i += 3) {
    const y = geo.attributes.position.getY(i)
    const isLand = rng() < 0.38 + Math.abs(y) * 0.2
    const c = isLand ? land[Math.floor(rng() * land.length)] : sea[Math.floor(rng() * sea.length)]
    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geo
}

export default function Globe({ position }) {
  const globe = useRef()
  const auraRef = useRef()
  const portalRingRef = useRef()
  const geometry = useMemo(makeGlobeGeometry, [])

  const setNearEarth = useMuseumStore((s) => s.setNearEarth)
  const inSpaceScene = useMuseumStore((s) => s.inSpaceScene)
  const spaceWarping = useMuseumStore((s) => s.spaceWarping)
  const startSpaceWarp = useMuseumStore((s) => s.startSpaceWarp)

  const proximityRef = useRef({ near: false, factor: 0 })

  useFrame((state, delta) => {
    const player = playerRef.current
    let dist = 999
    if (player && !inSpaceScene) {
      dist = Math.hypot(player.position.x - position[0], player.position.z - position[2])
    }

    // Khoảng cách kích hoạt hiệu ứng gần Earth (< 4.2m)
    const isNear = dist < 4.2
    const factor = isNear ? Math.max(0, Math.min(1, (4.2 - dist) / 2.2)) : 0

    if (proximityRef.current.near !== isNear || Math.abs(proximityRef.current.factor - factor) > 0.05) {
      proximityRef.current = { near: isNear, factor }
      setNearEarth(isNear, factor)
    }

    // Tốc độ quay tăng dần khi người chơi tiến lại gần
    const spinMult = 1 + factor * 2.2
    globe.current.rotation.y += delta * 0.25 * spinMult
    globe.current.position.y = 1.85 + Math.sin(state.clock.elapsedTime * (1.2 + factor * 1.5)) * (0.06 + factor * 0.04)

    // Hiệu ứng phát sáng tăng mạnh khi người chơi đến gần
    if (auraRef.current) {
      const targetScale = 1.08 + factor * 0.45
      auraRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1)
    }

    // Vòng tròn cổng không gian dưới sàn nhà
    if (portalRingRef.current) {
      portalRingRef.current.rotation.z += delta * (0.4 + factor * 1.6)
    }

    // Khi người chơi TIẾN ĐỦ GẦN (dist < 2.05m) -> Kích hoạt transition mở không gian vũ trụ!
    if (dist < 2.05 && !inSpaceScene && !spaceWarping) {
      playSpaceWarp()
      startSpaceWarp()
    }
  })

  const { near, factor } = proximityRef.current

  return (
    <group position={position}>
      {/* Vòng năng lượng Cổng không gian trên sàn nhà (hiển thị khi người chơi lại gần) */}
      <group position-y={0.015} rotation-x={-Math.PI / 2}>
        {/* Vòng ngoài */}
        <mesh ref={portalRingRef}>
          <ringGeometry args={[1.5, 1.65, 36]} />
          <meshBasicMaterial
            color="#4FD1C5"
            transparent
            opacity={0.15 + factor * 0.75}
            side={2}
          />
        </mesh>
        {/* Vòng trong */}
        <mesh rotation-z={0.5}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial
            color="#FFE27A"
            transparent
            opacity={0.1 + factor * 0.65}
            side={2}
          />
        </mesh>
        {/* Đĩa hào quang mờ */}
        {near && (
          <mesh>
            <circleGeometry args={[1.8, 32]} />
            <meshBasicMaterial
              color="#38B2AC"
              transparent
              opacity={0.05 + factor * 0.2}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Bệ trưng bày nguyên bản */}
      <mesh position-y={0.35} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.7, 12]} />
        <meshStandardMaterial color={COLORS.pedestalBody} />
      </mesh>
      <mesh position-y={0.74}>
        <cylinderGeometry args={[0.86, 0.86, 0.08, 12]} />
        <meshStandardMaterial color={COLORS.pedestalTrim} />
      </mesh>
      <mesh position-y={0.82}>
        <cylinderGeometry args={[0.12, 0.2, 0.3, 8]} />
        <meshStandardMaterial color={COLORS.gold} />
      </mesh>

      {/* Quả địa cầu trung tâm */}
      <group ref={globe} rotation-z={0.4}>
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial vertexColors flatShading />
        </mesh>

        {/* Hào quang khí quyển / Cổng không gian phát sáng */}
        <mesh ref={auraRef} scale={1.08}>
          <sphereGeometry args={[0.75, 20, 16]} />
          <meshBasicMaterial
            color={near ? '#7CE2FE' : '#BFE9FF'}
            transparent
            opacity={0.12 + factor * 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Đốm sáng rực rỡ khi gần tới ngưỡng kích hoạt */}
        {factor > 0.4 && (
          <mesh scale={1.25}>
            <sphereGeometry args={[0.75, 16, 12]} />
            <meshBasicMaterial
              color="#FFE27A"
              transparent
              opacity={factor * 0.35}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Dòng hướng dẫn lơ lửng khi người chơi trong vùng tương tác */}
      {near && (
        <Billboard position={[0, 3.4, 0]}>
          <group>
            {/* Nền bảng hướng dẫn */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[3.2, 0.75]} />
              <meshBasicMaterial color="#0B1315" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[3.24, 0.79]} />
              <meshBasicMaterial color="#4FD1C5" transparent opacity={0.4} />
            </mesh>
            {/* Chữ hướng dẫn */}
            <Text
              position={[0, 0.12, 0]}
              fontSize={0.22}
              color="#FFE27A"
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              🌌 CỔNG KHÔNG GIAN VŨ TRỤ
            </Text>
            <Text
              position={[0, -0.16, 0]}
              fontSize={0.16}
              color="#E2F5F8"
              anchorX="center"
              anchorY="middle"
            >
              Tiến lại gần để du hành vũ trụ 3D
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  )
}
