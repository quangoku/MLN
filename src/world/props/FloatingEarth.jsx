import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Float32BufferAttribute,
  IcosahedronGeometry,
  Color,
  BufferGeometry,
  Vector3,
} from 'three'
import { mulberry32 } from '../../utils/random.js'

// Hàm tạo hình cầu Trái Đất low-poly đặc sắc:
// có 2 cực băng tuyết trắng, lục địa xanh/vàng cát, đại dương xanh thẳm
function makeEarthGeometry() {
  const geo = new IcosahedronGeometry(0.65, 2).toNonIndexed()
  const rng = mulberry32(101)
  const ice = [new Color('#F1F8FB'), new Color('#E0F0F7')]
  const land = [
    new Color('#4CA75B'),
    new Color('#62B96D'),
    new Color('#7FCA80'),
    new Color('#CBB76C'),
  ]
  const ocean = [
    new Color('#1C6E96'),
    new Color('#2582B0'),
    new Color('#185C7E'),
  ]

  const colors = []
  const count = geo.attributes.position.count
  for (let i = 0; i < count; i += 3) {
    const y = geo.attributes.position.getY(i)
    const absY = Math.abs(y)

    let c
    if (absY > 0.42) {
      // 2 cực băng tuyết Bắc Cực & Nam Cực
      c = ice[Math.floor(rng() * ice.length)]
    } else {
      // Lục địa hoặc đại dương
      const isLand = rng() < 0.42 + absY * 0.15
      c = isLand
        ? land[Math.floor(rng() * land.length)]
        : ocean[Math.floor(rng() * ocean.length)]
    }

    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geo
}

// Mặt trăng mini low-poly xám đồng hành
function makeMoonGeometry() {
  const geo = new IcosahedronGeometry(0.16, 1).toNonIndexed()
  const rng = mulberry32(202)
  const moonColors = [new Color('#B8BEC5'), new Color('#9FA5AC'), new Color('#D2D8DF')]
  const colors = []
  const count = geo.attributes.position.count
  for (let i = 0; i < count; i += 3) {
    const c = moonColors[Math.floor(rng() * moonColors.length)]
    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geo
}

export default function FloatingEarth({
  position = [6, 0, -0.6],
  radiusX = 3.8,
  radiusZ = 3.2,
  height = 2.65,
  speed = 0.32,
}) {
  const earthOrbitGroup = useRef()
  const earthGlobe = useRef()
  const moonRef = useRef()

  const earthGeo = useMemo(makeEarthGeometry, [])
  const moonGeo = useMemo(makeMoonGeometry, [])

  // Tạo đường quỹ đạo elip lơ lửng song song với sàn sảnh
  const orbitLineGeo = useMemo(() => {
    const points = []
    const segments = 80
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      points.push(new Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ))
    }
    const geo = new BufferGeometry().setFromPoints(points)
    return geo
  }, [radiusX, radiusZ])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * speed

    // Quỹ đạo quay song song với sàn sảnh (mặt phẳng X-Z ở độ cao height)
    const x = Math.cos(t) * radiusX
    const z = Math.sin(t) * radiusZ
    const yBob = Math.sin(state.clock.elapsedTime * 1.6) * 0.08

    if (earthOrbitGroup.current) {
      earthOrbitGroup.current.position.set(x, height + yBob, z)
    }

    if (earthGlobe.current) {
      // Tự quay quanh trục Y
      earthGlobe.current.rotation.y += delta * 0.55
    }

    if (moonRef.current) {
      // Mặt trăng mini quay quanh Trái Đất
      const mt = state.clock.elapsedTime * 1.4
      moonRef.current.position.set(
        Math.cos(mt) * 1.15,
        Math.sin(mt * 0.7) * 0.18,
        Math.sin(mt) * 1.15
      )
      moonRef.current.rotation.y += delta * 0.8
    }
  })

  const [cx, , cz] = position

  return (
    <group position={[cx, 0, cz]}>
      {/* Vòng quỹ đạo mờ phát sáng song song với sàn nhà tại độ cao bay */}
      <line position-y={height} geometry={orbitLineGeo}>
        <lineBasicMaterial color="#7CE2FE" transparent opacity={0.25} />
      </line>

      {/* Nhóm thiên thể bay theo quỹ đạo */}
      <group ref={earthOrbitGroup} position={[radiusX, height, 0]}>
        {/* Quả Trái Đất với góc nghiêng trục 23.5 độ (~0.41 rad) */}
        <group ref={earthGlobe} rotation-z={0.41}>
          <mesh geometry={earthGeo} castShadow receiveShadow>
            <meshStandardMaterial vertexColors flatShading roughness={0.7} />
          </mesh>

          {/* Lớp khí quyển phát sáng dịu mờ */}
          <mesh scale={1.12}>
            <sphereGeometry args={[0.65, 20, 16]} />
            <meshBasicMaterial
              color="#A0E8FF"
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </mesh>

          {/* Vầng hào quang khí quyển (Bloom nhẹ) */}
          <mesh scale={1.2}>
            <sphereGeometry args={[0.65, 16, 12]} />
            <meshBasicMaterial
              color="#4FB0C6"
              transparent
              opacity={0.06}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Mặt trăng mini đồng hành */}
        <group ref={moonRef} position={[1.15, 0, 0]}>
          <mesh geometry={moonGeo} castShadow>
            <meshStandardMaterial vertexColors flatShading roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
