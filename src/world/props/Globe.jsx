import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float32BufferAttribute, IcosahedronGeometry, Color } from 'three'
import { COLORS } from '../../config/theme.js'
import { mulberry32 } from '../../utils/random.js'

// Quả địa cầu low-poly ở giữa sảnh (giống ảnh tham chiếu số 3):
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
  const geometry = useMemo(makeGlobeGeometry, [])

  useFrame((state, delta) => {
    globe.current.rotation.y += delta * 0.25
    globe.current.position.y = 1.85 + Math.sin(state.clock.elapsedTime * 1.2) * 0.06
  })

  return (
    <group position={position}>
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
      <group ref={globe} rotation-z={0.4}>
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial vertexColors flatShading />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[0.75, 20, 16]} />
          <meshBasicMaterial color="#BFE9FF" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
