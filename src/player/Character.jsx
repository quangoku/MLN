import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

// Nhân vật low-poly dáng mảnh, không có chi tiết mặt (giống ảnh tham chiếu).
// Dùng chung cho player và NPC. motion.current.speed > 0 → vung tay chân.
export default function Character({ shirt, pants, skin, hair, motion }) {
  const root = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const phase = useRef(Math.random() * Math.PI * 2)
  const walk = useRef(0)

  useFrame((_, delta) => {
    const speed = motion.current.speed
    walk.current = MathUtils.damp(walk.current, speed > 0.01 ? 1 : 0, 10, delta)
    phase.current += delta * (3 + speed * 2)
    const swing = Math.sin(phase.current) * 0.6 * walk.current
    legL.current.rotation.x = swing
    legR.current.rotation.x = -swing
    armL.current.rotation.x = -swing * 0.8
    armR.current.rotation.x = swing * 0.8
    root.current.position.y = Math.abs(Math.cos(phase.current)) * 0.04 * walk.current
  })

  return (
    <group ref={root}>
      {[
        [legL, -0.09],
        [legR, 0.09],
      ].map(([ref, x]) => (
        <group key={x} ref={ref} position={[x, 0.46, 0]}>
          <mesh position-y={-0.23} castShadow>
            <cylinderGeometry args={[0.065, 0.055, 0.46, 6]} />
            <meshStandardMaterial color={pants} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position-y={0.78} castShadow>
        <capsuleGeometry args={[0.17, 0.3, 3, 8]} />
        <meshStandardMaterial color={shirt} flatShading />
      </mesh>
      {[
        [armL, -0.24],
        [armR, 0.24],
      ].map(([ref, x]) => (
        <group key={x} ref={ref} position={[x, 1.02, 0]}>
          <mesh position-y={-0.21} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.44, 6]} />
            <meshStandardMaterial color={shirt} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position-y={1.27} castShadow>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      <mesh position={[0, 1.33, -0.02]} scale={[1.05, 0.75, 1.05]}>
        <sphereGeometry args={[0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hair} flatShading />
      </mesh>
    </group>
  )
}
