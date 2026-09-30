import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Vector3 } from 'three'
import Character from './Character.jsx'
import { playerRef } from './playerRef.js'
import { PLAYER, NPC } from '../config/constants.js'
import { COLORS } from '../config/theme.js'
import { PLAYER_START, roomAt } from '../world/layout.js'
import { resolveBoxes, resolveCircles } from '../world/collision.js'
import { npcRegistry } from '../npc/npcRegistry.js'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { playStep } from '../audio/sfx.js'
import { dampAngle } from '../utils/math.js'

const direction = new Vector3()
const before = new Vector3()
const SUBSTEP = 0.1 // chia nhỏ bước đi để không "xuyên" qua tường mỏng khi FPS thấp
const STEP_SOUND_EVERY = 0.75

export default function Player() {
  const body = useRef()
  const motion = useRef({ speed: 0 })
  const walked = useRef(0)
  const [, getKeys] = useKeyboardControls()

  useFrame((_, delta) => {
    const player = playerRef.current
    if (!player) return
    const store = useMuseumStore.getState()

    const { forward, backward, left, right, sprint } = getKeys()

    // Camera nhìn chéo từ góc (+X, +Z) nên "lên màn hình" là hướng (-1, 0, -1)
    direction.set(0, 0, 0)
    if (forward) { direction.x -= 1; direction.z -= 1 }
    if (backward) { direction.x += 1; direction.z += 1 }
    if (left) { direction.x -= 1; direction.z += 1 }
    if (right) { direction.x += 1; direction.z -= 1 }

    if (!store.started || direction.lengthSq() === 0) {
      motion.current.speed = 0
      return
    }

    direction.normalize()
    const speed = sprint ? PLAYER.sprintSpeed : PLAYER.speed
    motion.current.speed = speed
    body.current.rotation.y = dampAngle(body.current.rotation.y, Math.atan2(direction.x, direction.z), 14, delta)

    const pos = player.position
    before.copy(pos)
    let remaining = speed * Math.min(delta, 0.1)
    while (remaining > 0) {
      const step = Math.min(SUBSTEP, remaining)
      remaining -= step
      pos.addScaledVector(direction, step)
      resolveBoxes(pos, PLAYER.radius)
      resolveCircles(pos, PLAYER.radius, npcRegistry, NPC.radius)
    }

    walked.current += pos.distanceTo(before)
    if (walked.current > STEP_SOUND_EVERY) {
      walked.current = 0
      playStep()
    }

    const room = roomAt(pos.x)
    if (room.id !== store.roomId) store.setRoom(room.id)
  })

  return (
    <group ref={playerRef} position={PLAYER_START}>
      {/* Vòng sáng dưới chân để phân biệt player với khách tham quan */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[0.3, 0.4, 24]} />
        <meshBasicMaterial color={COLORS.playerRing} transparent opacity={0.85} />
      </mesh>
      <group ref={body}>
        <Character shirt={COLORS.player} pants="#2B2D42" skin="#F1C27D" hair="#2B1B17" motion={motion} />
      </group>
    </group>
  )
}
