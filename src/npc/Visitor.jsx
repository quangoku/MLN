import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Character from '../player/Character.jsx'
import { npcRegistry } from './npcRegistry.js'
import { VISITOR_LOOKS } from '../config/theme.js'
import { mulberry32, pick } from '../utils/random.js'
import { dampAngle } from '../utils/math.js'

// Khách tham quan: đi tới một hiện vật, đứng ngắm vài giây, rồi chọn hiện vật khác.
// Điểm đứng nằm ở lối đi giữa hai hàng bục, nên đi thẳng giữa các điểm không va vào bục.
export default function Visitor({ points, seed }) {
  const group = useRef()
  const body = useRef()
  const motion = useRef({ speed: 0 })

  const { rng, look, speed, start } = useMemo(() => {
    const rng = mulberry32(seed)
    return {
      rng,
      look: {
        shirt: pick(rng, VISITOR_LOOKS.shirts),
        pants: pick(rng, VISITOR_LOOKS.pants),
        skin: pick(rng, VISITOR_LOOKS.skins),
        hair: pick(rng, VISITOR_LOOKS.hairs),
      },
      speed: 0.9 + rng() * 0.5,
      start: pick(rng, points),
    }
  }, [seed, points])

  const state = useRef({ target: null, wait: 0 })

  const chooseTarget = (current) => {
    let next = pick(rng, points)
    if (points.length > 1) while (next === current) next = pick(rng, points)
    // lệch ngẫu nhiên để nhiều người cùng xem một hiện vật không chồng lên nhau
    return { ...next, x: next.x + (rng() - 0.5) * 0.9, z: next.z + (rng() - 0.5) * 0.3, source: next }
  }

  useEffect(() => {
    const g = group.current
    npcRegistry.add(g)
    state.current = { target: chooseTarget(start), wait: rng() * 3 }
    return () => npcRegistry.delete(g)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    const s = state.current
    const g = group.current
    if (!s.target) return

    if (s.wait > 0) {
      s.wait -= delta
      motion.current.speed = 0
      if (s.wait <= 0) s.target = chooseTarget(s.target.source)
      return
    }

    const dx = s.target.x - g.position.x
    const dz = s.target.z - g.position.z
    const dist = Math.hypot(dx, dz)

    if (dist < 0.05) {
      s.wait = 2.5 + rng() * 5
      motion.current.speed = 0
      const face = Math.atan2(s.target.faceX - g.position.x, s.target.faceZ - g.position.z)
      body.current.rotation.y = face
      return
    }

    const step = Math.min(speed * delta, dist)
    g.position.x += (dx / dist) * step
    g.position.z += (dz / dist) * step
    body.current.rotation.y = dampAngle(body.current.rotation.y, Math.atan2(dx, dz), 8, delta)
    motion.current.speed = speed
  })

  return (
    <group ref={group} position={[start.x, 0, start.z]}>
      <group ref={body}>
        <Character {...look} motion={motion} />
      </group>
    </group>
  )
}
