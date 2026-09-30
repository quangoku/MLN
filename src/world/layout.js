// Dựng toàn bộ mặt bằng bảo tàng từ data/museum.js:
// vị trí phòng, hiện vật, tường, cột, đồ trang trí, vật cản và điểm tham quan cho NPC.
// Mọi thứ tính một lần lúc tải module — component chỉ việc render.
import { MUSEUM } from '../data/museum.js'
import { LAYOUT, PEDESTAL, PLAYER } from '../config/constants.js'
import { ROOM_THEMES } from '../config/theme.js'

const { depth: D, spacingX, rowZ, margin, doorWidth, wallThickness: T } = LAYOUT
const HZ = D / 2

const box = (x, z, hx, hz) => ({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz })

// Kích thước vật cản của từng loại đồ trang trí (nửa chiều X, nửa chiều Z khi rotation = 0)
const DECOR_SIZE = {
  bench: [0.82, 0.3],
  lamp: [0.18, 0.18],
  plant: [0.3, 0.3],
  kiosk: [0.36, 0.26],
  globe: [0.85, 0.85],
  painting: null, // treo tường, không cản
}

export const ROOMS = []
export const EXHIBITS = []
export const WALLS = []
export const PILLARS = []
export const DECOR = []
export const COLLIDERS = []
export const VISIT_POINTS = {}

function addDecor(kind, x, z, rotation = 0, extra = {}) {
  DECOR.push({ kind, position: [x, 0, z], rotation, ...extra })
  const size = DECOR_SIZE[kind]
  if (!size) return
  const swap = Math.abs(Math.sin(rotation)) > 0.5
  COLLIDERS.push(box(x, z, swap ? size[1] : size[0], swap ? size[0] : size[1]))
}

function addSign(room, data, x, z, rotation) {
  EXHIBITS.push({ ...data, type: 'sign', roomId: room.id, position: [x, 0, z], rotation, accent: room.theme.accent })
  const swap = Math.abs(Math.sin(rotation)) > 0.5
  COLLIDERS.push(box(x, z, swap ? 0.15 : 0.6, swap ? 0.6 : 0.15))
}

// ---- Phòng, hiện vật, đồ trang trí ----
let cursor = 0
MUSEUM.forEach((def, index) => {
  const count = def.exhibits?.length ?? 0
  const cols = Math.ceil(count / 2)
  const width = def.width ?? 2 * margin + cols * spacingX
  const x0 = cursor
  const x1 = cursor + width
  cursor = x1

  const room = {
    id: def.id,
    kind: def.kind ?? 'gallery',
    chapter: def.chapter,
    name: def.name,
    short: def.short,
    title: def.title,
    visitors: def.visitors ?? 0,
    index,
    x0,
    x1,
    cx: (x0 + x1) / 2,
    width,
    depth: D,
    theme: ROOM_THEMES[def.theme],
  }
  ROOMS.push(room)
  const points = (VISIT_POINTS[room.id] = [])

  if (room.kind === 'lobby') {
    const cx = room.cx
    addSign(room, { id: 'lobby-welcome', ...def.welcome }, cx, -HZ + 1.4, 0)
    addDecor('globe', cx, -0.6)
    addDecor('kiosk', x0 + 2, -HZ + 0.8)
    addDecor('kiosk', x1 - 2, -HZ + 0.8)
    addDecor('bench', cx - 2.2, HZ - 1, Math.PI)
    addDecor('bench', cx + 2.2, HZ - 1, Math.PI)
    addDecor('lamp', x0 + 1.2, 1.8)
    addDecor('lamp', x0 + 1.2, -2.4)
    addDecor('plant', x0 + 0.8, HZ - 0.8)
    addDecor('plant', x1 - 0.8, HZ - 0.8)
    addDecor('plant', x0 + 0.8, -HZ + 0.8)
    addDecor('painting', x0 + 4, -HZ + T / 2 + 0.03, 0, { seed: 11 })
    addDecor('painting', x1 - 4, -HZ + T / 2 + 0.03, 0, { seed: 12 })
    points.push(
      { x: cx - 1.8, z: 1.2, faceX: cx, faceZ: -0.6 },
      { x: cx + 1.8, z: 1.2, faceX: cx, faceZ: -0.6 },
      { x: cx, z: -3, faceX: cx, faceZ: -HZ },
      { x: x0 + 2, z: -HZ + 1.8, faceX: x0 + 2, faceZ: -HZ },
      { x: x1 - 2, z: -HZ + 1.8, faceX: x1 - 2, faceZ: -HZ },
    )
    return
  }

  // Bảng giới thiệu chương, ngay cạnh cửa vào (phía tây)
  addSign(
    room,
    { id: `${room.id}-intro`, title: `Chương ${room.chapter} · ${room.title}`, body: def.intro },
    x0 + 1.1,
    -2.3,
    Math.PI / 2,
  )

  const colX = (c) => x0 + margin + spacingX / 2 + c * spacingX

  // Hiện vật xếp zíc-zắc: 1 hàng bắc, 2 hàng nam, 3 hàng bắc… để đọc theo thứ tự khi đi dọc lối giữa
  def.exhibits.forEach((ex, i) => {
    const x = colX(Math.floor(i / 2))
    const side = i % 2 === 0 ? -1 : 1
    const z = side * rowZ
    EXHIBITS.push({ ...ex, roomId: room.id, number: i + 1, position: [x, 0, z], rotation: 0 })
    COLLIDERS.push(box(x, z, PEDESTAL.size / 2 + 0.08, PEDESTAL.size / 2 + 0.08))
    points.push({ x, z: side * rowZ * 0.5, faceX: x, faceZ: z })
    addDecor('painting', x, -HZ + T / 2 + 0.03, 0, { seed: index * 31 + i })
  })

  // Ghế và đèn xen kẽ ở khoảng giữa các cột, sát tường bắc/nam
  for (let c = 0; c < cols - 1; c++) {
    const gx = colX(c) + spacingX / 2
    if (c % 2 === 0) {
      addDecor('bench', gx, -HZ + 1, 0)
      addDecor('lamp', gx, HZ - 1)
    } else {
      addDecor('lamp', gx, -HZ + 1)
      addDecor('bench', gx, HZ - 1, Math.PI)
    }
  }
  addDecor('plant', x1 - 0.8, HZ - 0.8)
  addDecor('plant', x0 + 0.8, HZ - 0.8)
  addDecor('plant', x1 - 0.8, -HZ + 0.8)
})

// ---- Tường ----
const first = ROOMS[0]
const last = ROOMS[ROOMS.length - 1]

function addWall(axis, x, z, length, height, color) {
  WALLS.push({ axis, x, z, length, height, color })
  COLLIDERS.push(axis === 'x' ? box(x, z, length / 2, T / 2) : box(x, z, T / 2, length / 2))
}

ROOMS.forEach((r) => {
  addWall('x', r.cx, -HZ, r.width + T, LAYOUT.backWallHeight, r.theme.wall)
  addWall('x', r.cx, HZ, r.width + T, LAYOUT.frontWallHeight, r.theme.wall)
})
addWall('z', first.x0, 0, D + T, LAYOUT.backWallHeight, first.theme.wall)
addWall('z', last.x1, 0, D + T, LAYOUT.frontWallHeight, last.theme.wall)

// Vách ngăn giữa hai phòng, chừa cửa ở giữa + cột hai bên cửa
const segLen = HZ - doorWidth / 2
ROOMS.slice(1).forEach((r) => {
  for (const s of [-1, 1]) {
    addWall('z', r.x0, s * (doorWidth / 2 + segLen / 2), segLen, LAYOUT.partitionHeight, r.theme.wall)
    PILLARS.push([r.x0, 0, s * (doorWidth / 2 + 0.15)])
    COLLIDERS.push(box(r.x0, s * (doorWidth / 2 + 0.15), 0.3, 0.3))
  }
})
PILLARS.push([first.x0 + 0.45, 0, -HZ + 0.45], [last.x1 - 0.45, 0, -HZ + 0.45])

// ---- Tiện ích ----
export const BOUNDS = { minX: first.x0, maxX: last.x1, minZ: -HZ, maxZ: HZ }

export const PLAYER_START = [first.x0 + PLAYER.startOffset[0], 0, PLAYER.startOffset[1]]

export const COUNTABLE = EXHIBITS.filter((e) => e.type !== 'sign')

export function roomAt(x) {
  return ROOMS.find((r) => x >= r.x0 && x < r.x1) ?? (x < first.x0 ? first : last)
}
