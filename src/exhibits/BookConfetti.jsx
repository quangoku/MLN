import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D } from 'three'
import { COLORS } from '../config/theme.js'

const DURATION = 1.2
const PALETTE = [COLORS.glow, COLORS.gem, COLORS.pillar, COLORS.bookPages]
const PARTICLES = Array.from({ length: 24 }, (_, index) => {
  const angle = index * 2.39996
  const speed = 1.1 + (index % 4) * 0.18
  return {
    x: Math.cos(angle) * speed,
    z: Math.sin(angle) * speed,
    y: 1.3 + (index % 5) * 0.12,
    color: PALETTE[index % PALETTE.length],
    spin: index % 2 ? -1 : 1,
  }
})

// Một burst 3D ngắn, gắn trực tiếp vào quyển sách thay vì bảng HTML.
export default function BookConfetti({ onDone }) {
  const mesh = useRef()
  const elapsed = useRef(0)
  const finished = useRef(false)
  const dummy = useMemo(() => new Object3D(), [])

  useEffect(() => {
    PARTICLES.forEach((particle, index) => mesh.current.setColorAt(index, new Color(particle.color)))
    mesh.current.instanceColor.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    if (finished.current) return
    elapsed.current = Math.min(elapsed.current + delta, DURATION)
    const t = elapsed.current

    PARTICLES.forEach((particle, index) => {
      dummy.position.set(particle.x * t, 0.1 + particle.y * t - 1.5 * t * t, particle.z * t)
      dummy.rotation.set(t * 4 * particle.spin, t * 3, t * 5 * particle.spin)
      dummy.scale.setScalar(Math.max(0, 1 - t / DURATION))
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true

    if (t === DURATION) {
      finished.current = true
      onDone()
    }
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, PARTICLES.length]} frustumCulled={false} raycast={() => {}}>
      <boxGeometry args={[0.08, 0.11, 0.015]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
