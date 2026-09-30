import { COLLIDERS } from './layout.js'

// Đẩy hình tròn (player/NPC) ra khỏi mọi hộp vật cản (AABB trên mặt phẳng XZ)
export function resolveBoxes(pos, radius) {
  for (const c of COLLIDERS) {
    if (pos.x < c.minX - radius || pos.x > c.maxX + radius || pos.z < c.minZ - radius || pos.z > c.maxZ + radius) continue

    const cx = Math.max(c.minX, Math.min(pos.x, c.maxX))
    const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ))
    const dx = pos.x - cx
    const dz = pos.z - cz
    const dist = Math.hypot(dx, dz)

    if (dist > 1e-6) {
      if (dist < radius) {
        const push = (radius - dist) / dist
        pos.x += dx * push
        pos.z += dz * push
      }
    } else {
      // Tâm nằm trong hộp: đẩy ra theo hướng xuyên ít nhất
      const exits = [
        [c.minX - radius - pos.x, 0],
        [c.maxX + radius - pos.x, 0],
        [0, c.minZ - radius - pos.z],
        [0, c.maxZ + radius - pos.z],
      ]
      exits.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))
      pos.x += exits[0][0]
      pos.z += exits[0][1]
    }
  }
}

// Đẩy hình tròn ra khỏi các hình tròn khác (player ↔ NPC)
export function resolveCircles(pos, radius, others, otherRadius) {
  const min = radius + otherRadius
  for (const o of others) {
    const dx = pos.x - o.position.x
    const dz = pos.z - o.position.z
    const d2 = dx * dx + dz * dz
    if (d2 < min * min && d2 > 1e-8) {
      const d = Math.sqrt(d2)
      const push = (min - d) / d
      pos.x += dx * push
      pos.z += dz * push
    }
  }
}
