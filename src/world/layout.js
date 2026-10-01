// Dựng toàn bộ mặt bằng bảo tàng kiến trúc 2D theo sơ đồ reference:
// - Sảnh chính ở giữa (rộng, thoáng, quả địa cầu + tượng V.I. Lênin và các danh nhân triết học)
// - C1 (Phòng 1) nằm ở PHÍA TRÊN (Bắc, trục -Z)
// - C2 (Phòng 2) nằm ở BÊN TRÁI (Tây, trục -X)
// - C3 (Phòng 3) nằm ở BÊN PHẢI (Đông, trục +X)
// - Cửa ra vào kết nối Sảnh chính tới C1, C2, C3 và cổng vào phía Nam.
// - Toàn bộ nội dung lý thuyết, exhibit của C1, C2, C3 được giữ nguyên 100%.

import { MUSEUM } from '../data/museum.js'
import { DOOR_FRAME, LAYOUT, PEDESTAL } from '../config/constants.js'
import { ROOM_THEMES } from '../config/theme.js'

const { doorWidth, wallThickness: T, backWallHeight, partitionHeight, frontWallHeight } = LAYOUT

const box = (x, z, hx, hz) => ({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz })

const DECOR_SIZE = {
  bench: [0.82, 0.3],
  lamp: [0.18, 0.18],
  plant: [0.3, 0.3],
  globe: [0.9, 0.9],
  statue: [0.75, 0.75],
  painting: null,
  floatingEarth: null,
}

export const ROOMS = []
export const EXHIBITS = []
export const WALLS = []
export const PILLARS = []
export const DECOR = []
export const COLLIDERS = []
export const VISIT_POINTS = {}
export const DOORWAYS = []

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

function addWall(axis, x, z, length, height, color) {
  WALLS.push({ axis, x, z, length, height, color })
  COLLIDERS.push(axis === 'x' ? box(x, z, length / 2, T / 2) : box(x, z, T / 2, length / 2))
}

// -------------------------------------------------------------
// 1. CẤU HÌNH CÁC PHÒNG (Sảnh chính ở giữa, C1 phía trên, C2 bên trái, C3 bên phải)
// -------------------------------------------------------------
const lobbyDef = MUSEUM.find((m) => m.id === 'lobby')
const c1Def = MUSEUM.find((m) => m.id === 'ch1')
const c2Def = MUSEUM.find((m) => m.id === 'ch2')
const c3Def = MUSEUM.find((m) => m.id === 'ch3')

// Sảnh chính: 16 x 16 ở tâm (0, 0)
const lobbyRoom = {
  id: 'lobby',
  kind: 'lobby',
  name: lobbyDef.name,
  short: lobbyDef.short,
  title: lobbyDef.welcome.title,
  visitors: lobbyDef.visitors ?? 3,
  index: 0,
  x0: -8,
  x1: 8,
  z0: -8,
  z1: 8,
  cx: 0,
  cz: 0,
  width: 16,
  depth: 16,
  theme: ROOM_THEMES.lobby,
}

// C1 (Phòng 1): 16 x 10 ở phía Bắc (z: -18 -> -8)
const c1Room = {
  id: 'ch1',
  kind: 'gallery',
  chapter: 1,
  name: c1Def.name,
  short: c1Def.short,
  title: c1Def.title,
  visitors: c1Def.visitors ?? 3,
  index: 1,
  x0: -8,
  x1: 8,
  z0: -18,
  z1: -8,
  cx: 0,
  cz: -13,
  width: 16,
  depth: 10,
  theme: ROOM_THEMES.ch1,
}

// C2 (Phòng 2): 9 x 16 ở phía Tây (x: -17 -> -8, z: -8 -> 8)
const c2Room = {
  id: 'ch2',
  kind: 'gallery',
  chapter: 2,
  name: c2Def.name,
  short: c2Def.short,
  title: c2Def.title,
  visitors: c2Def.visitors ?? 4,
  index: 2,
  x0: -17,
  x1: -8,
  z0: -8,
  z1: 8,
  cx: -12.5,
  cz: 0,
  width: 9,
  depth: 16,
  theme: ROOM_THEMES.ch2,
}

// C3 (Phòng 3): 9 x 16 ở phía Đông (x: 8 -> 17, z: -8 -> 8)
const c3Room = {
  id: 'ch3',
  kind: 'gallery',
  chapter: 3,
  name: c3Def.name,
  short: c3Def.short,
  title: c3Def.title,
  visitors: c3Def.visitors ?? 4,
  index: 3,
  x0: 8,
  x1: 17,
  z0: -8,
  z1: 8,
  cx: 12.5,
  cz: 0,
  width: 9,
  depth: 16,
  theme: ROOM_THEMES.ch3,
}

// Tiền sảnh / Lối vào phía Nam (x: -2.8 -> 2.8, z: 8 -> 10.5)
const vestibuleRoom = {
  id: 'vestibule',
  kind: 'vestibule',
  name: 'Cổng vào',
  short: 'Cổng',
  title: 'Cổng vào bảo tàng',
  visitors: 0,
  index: 4,
  x0: -2.8,
  x1: 2.8,
  z0: 8,
  z1: 10.5,
  cx: 0,
  cz: 9.25,
  width: 5.6,
  depth: 2.5,
  theme: ROOM_THEMES.lobby,
}

ROOMS.push(lobbyRoom, c1Room, c2Room, c3Room, vestibuleRoom)
ROOMS.forEach((r) => { VISIT_POINTS[r.id] = [] })

// -------------------------------------------------------------
// 2. HIỆN VẬT & NỘI THẤT SẢNH CHÍNH (LOBBY)
// -------------------------------------------------------------
const lobbyPts = VISIT_POINTS.lobby

// Bảng chào mừng sảnh chính
addSign(lobbyRoom, { id: 'lobby-welcome', ...lobbyDef.welcome }, -2.6, 6.2, 0)

// Quả địa cầu & FloatingEarth ở giữa trung tâm sảnh
addDecor('globe', 0, 0)
addDecor('floatingEarth', 0, 0, 0, { radiusX: 3.8, radiusZ: 3.2, height: 2.7, speed: 0.35 })

// 4 chậu cây ở 4 góc thảm đỏ trung tâm
addDecor('plant', -3.4, -3.4)
addDecor('plant', 3.4, -3.4)
addDecor('plant', -3.4, 3.4)
addDecor('plant', 3.4, 3.4)

// CÁC TƯỢNG DANH NHÂN VÀ HIỆN VẬT CHỦ ĐỀ MÁC - LÊNIN Ở SẢNH CHÍNH:
// 1. Tượng toàn thân V.I. Lênin chỉ tay về phía trước (đứng trang trọng ở phía nam địa cầu, hướng ra cổng)
addDecor('statue', 0, 4.2, Math.PI, { statueType: 'lenin', name: 'V.I. Lenin' })

// 2. Tượng bán thân Karl Marx (phía bắc địa cầu, bên trái lối lên C1)
addDecor('statue', -2.4, -4.6, 0, { statueType: 'marx_bust', name: 'Karl Marx' })

// 3. Tượng bán thân Friedrich Engels (phía bắc địa cầu, bên phải lối lên C1, song hành cùng Marx)
addDecor('statue', 2.4, -4.6, 0, { statueType: 'engels_bust', name: 'Friedrich Engels' })

// 4. Đài tưởng niệm Biểu tượng Cách mạng Tháng Mười (Búa Liềm vàng & Ngôi sao đỏ, góc Tây Nam)
addDecor('statue', -4.8, 3.6, Math.PI, { statueType: 'revolution_monument', name: 'Cách mạng Tháng Mười (1917)' })

// 5. Bia đá Tuyên ngôn của Đảng Cộng sản 1848 (góc Đông Nam)
addDecor('statue', 4.8, 3.6, Math.PI, { statueType: 'manifesto_stele', name: 'Tuyên ngôn ĐCS (1848)' })

// 6. Đài tưởng niệm Obelisk triết học (góc Tây Bắc)
addDecor('statue', -4.8, -3.2, 0, { statueType: 'obelisk', name: 'Đài tưởng niệm' })

// 7. Tượng Người suy tưởng The Thinker (góc Đông Bắc)
addDecor('statue', 4.8, -3.2, 0, { statueType: 'seated_thinker', name: 'Người suy tưởng' })

// Đèn & ghế sảnh chính
addDecor('lamp', -6.6, -3.6)
addDecor('lamp', 6.6, -3.6)
addDecor('lamp', -5.8, 5.5)
addDecor('lamp', 5.8, 5.5)
addDecor('bench', -6.6, -5.5, Math.PI / 2)
addDecor('bench', 6.6, -5.5, -Math.PI / 2)

// Điểm tham quan cho NPC trong Sảnh chính
lobbyPts.push(
  { x: 0, z: 2.4, faceX: 0, faceZ: 4.2 }, // ngắm tượng Lênin
  { x: 0, z: 5.6, faceX: 0, faceZ: 4.2 },
  { x: -1.8, z: 0.6, faceX: 0, faceZ: 0 }, // ngắm Địa cầu
  { x: 1.8, z: -0.6, faceX: 0, faceZ: 0 },
  { x: -2.4, z: -2.8, faceX: -2.4, faceZ: -4.6 }, // ngắm Marx
  { x: 2.4, z: -2.8, faceX: 2.4, faceZ: -4.6 }, // ngắm Engels
  { x: -3.8, z: 2.6, faceX: -4.8, faceZ: 3.6 }, // ngắm Biểu tượng Cách mạng
  { x: 3.8, z: 2.6, faceX: 4.8, faceZ: 3.6 }, // ngắm Tuyên ngôn ĐCS
  { x: -3.8, z: -3.2, faceX: -4.8, faceZ: -3.2 }, // ngắm Obelisk
  { x: 3.8, z: -3.2, faceX: 4.8, faceZ: -3.2 }, // ngắm Thinker
  { x: -2.6, z: 4.8, faceX: -2.6, faceZ: 6.2 }, // xem bảng chào mừng
)

// -------------------------------------------------------------
// 3. HIỆN VẬT PHÒNG 1 (C1 - PHÍA TRÊN / BẮC)
// Toàn bộ 9 hiện vật lý thuyết được giữ nguyên 100%
// -------------------------------------------------------------
const c1Pts = VISIT_POINTS.ch1
addSign(c1Room, { id: 'ch1-intro', title: `Chương 1 · ${c1Def.title}`, body: c1Def.intro }, -2.8, -9.4, 0)

// Bố trí 9 hiện vật thành 2 hàng đẹp mắt (4 ở hàng trên, 5 ở hàng dưới) khớp ảnh reference
const c1ExhibitsPos = [
  // Hàng 1 (phía Bắc, z = -15.5)
  [-4.8, -15.5],
  [-1.6, -15.5],
  [1.6, -15.5],
  [4.8, -15.5],
  // Hàng 2 (phía Nam, z = -12.2)
  [-5.4, -12.2],
  [-2.7, -12.2],
  [0.0, -13.6], // Thụt lùi nhẹ để lối vào từ cửa (0, -8) luôn thông thoáng
  [2.7, -12.2],
  [5.4, -12.2],
]

c1Def.exhibits.forEach((ex, i) => {
  const [x, z] = c1ExhibitsPos[i]
  EXHIBITS.push({ ...ex, roomId: 'ch1', number: i + 1, position: [x, 0, z], rotation: 0 })
  COLLIDERS.push(box(x, z, PEDESTAL.size / 2 + 0.08, PEDESTAL.size / 2 + 0.08))
  c1Pts.push({ x, z: z + 0.9, faceX: x, faceZ: z })
})

// Tranh tường, ghế, đèn, cây phòng C1
addDecor('painting', -5.0, -18 + T / 2 + 0.03, 0, { seed: 101 })
addDecor('painting', -2.0, -18 + T / 2 + 0.03, 0, { seed: 102 })
addDecor('painting', 2.0, -18 + T / 2 + 0.03, 0, { seed: 103 })
addDecor('painting', 5.0, -18 + T / 2 + 0.03, 0, { seed: 104 })
addDecor('bench', -6.5, -17.0, 0)
addDecor('bench', 6.5, -17.0, 0)
addDecor('bench', -6.8, -9.8, Math.PI)
addDecor('bench', 6.8, -9.8, Math.PI)
addDecor('lamp', -7.0, -14.0)
addDecor('lamp', 7.0, -14.0)
addDecor('plant', -7.2, -17.2)
addDecor('plant', 7.2, -17.2)

// -------------------------------------------------------------
// 4. HIỆN VẬT PHÒNG 2 (C2 - BÊN TRÁI / TÂY)
// Toàn bộ 17 hiện vật lý thuyết được giữ nguyên 100%
// -------------------------------------------------------------
const c2Pts = VISIT_POINTS.ch2
addSign(c2Room, { id: 'ch2-intro', title: `Chương 2 · ${c2Def.title}`, body: c2Def.intro }, -9.4, -2.4, Math.PI / 2)

// 17 hiện vật xếp thành 2 cột dọc trục Z (khớp sơ đồ minimap & view 3D):
// Cột ngoài (x = -14.6): 9 hiện vật
// Cột trong (x = -10.6): 8 hiện vật (chừa khoảng trống ở z = 0 cho cửa thông sang sảnh)
const c2ExhibitsPos = [
  // Cột ngoài
  [-14.6, -6.4],
  [-10.6, -6.0],
  [-14.6, -4.8],
  [-10.6, -4.4],
  [-14.6, -3.2],
  [-10.6, -2.8],
  [-14.6, -1.6],
  [-10.6, -1.4],
  [-14.6, 0.0],
  [-10.6, 1.4],
  [-14.6, 1.6],
  [-10.6, 2.8],
  [-14.6, 3.2],
  [-10.6, 4.4],
  [-14.6, 4.8],
  [-10.6, 6.0],
  [-14.6, 6.4],
]

c2Def.exhibits.forEach((ex, i) => {
  const [x, z] = c2ExhibitsPos[i]
  EXHIBITS.push({ ...ex, roomId: 'ch2', number: i + 1, position: [x, 0, z], rotation: 0 })
  COLLIDERS.push(box(x, z, PEDESTAL.size / 2 + 0.08, PEDESTAL.size / 2 + 0.08))
  c2Pts.push({ x: x + (x < -12 ? 1.0 : -1.0), z, faceX: x, faceZ: z })
})

// Tranh, ghế, đèn phòng C2
addDecor('painting', -14.0, -8 + T / 2 + 0.03, 0, { seed: 201 })
addDecor('painting', -11.0, -8 + T / 2 + 0.03, 0, { seed: 202 })
addDecor('painting', -17 + T / 2 + 0.03, -4.5, Math.PI / 2, { seed: 203 })
addDecor('painting', -17 + T / 2 + 0.03, -1.5, Math.PI / 2, { seed: 204 })
addDecor('painting', -17 + T / 2 + 0.03, 1.5, Math.PI / 2, { seed: 205 })
addDecor('painting', -17 + T / 2 + 0.03, 4.5, Math.PI / 2, { seed: 206 })
addDecor('bench', -15.8, 7.0, Math.PI)
addDecor('bench', -15.8, -7.0, 0)
addDecor('lamp', -12.5, -7.0)
addDecor('lamp', -12.5, 7.0)
addDecor('plant', -16.2, -7.2)
addDecor('plant', -16.2, 7.2)

// -------------------------------------------------------------
// 5. HIỆN VẬT PHÒNG 3 (C3 - BÊN PHẢI / ĐÔNG)
// Toàn bộ 14 hiện vật lý thuyết được giữ nguyên 100%
// -------------------------------------------------------------
const c3Pts = VISIT_POINTS.ch3
addSign(c3Room, { id: 'ch3-intro', title: `Chương 3 · ${c3Def.title}`, body: c3Def.intro }, 9.4, -2.4, -Math.PI / 2)

// 14 hiện vật xếp thành 2 cột dọc trục Z (khớp sơ đồ minimap):
// Cột trong (x = 10.6): 7 hiện vật
// Cột ngoài (x = 14.6): 7 hiện vật
const c3ExhibitsPos = [
  [10.6, -5.6],
  [14.6, -5.4],
  [10.6, -3.8],
  [14.6, -3.6],
  [10.6, -2.0],
  [14.6, -1.8],
  [14.6, 0.0],
  [10.6, 1.8],
  [14.6, 1.8],
  [10.6, 3.4],
  [14.6, 3.6],
  [10.6, 5.0],
  [14.6, 5.4],
  [10.6, 6.4],
]

c3Def.exhibits.forEach((ex, i) => {
  const [x, z] = c3ExhibitsPos[i]
  EXHIBITS.push({ ...ex, roomId: 'ch3', number: i + 1, position: [x, 0, z], rotation: 0 })
  COLLIDERS.push(box(x, z, PEDESTAL.size / 2 + 0.08, PEDESTAL.size / 2 + 0.08))
  c3Pts.push({ x: x + (x > 12 ? -1.0 : 1.0), z, faceX: x, faceZ: z })
})

// Tranh, ghế, đèn phòng C3
addDecor('painting', 11.0, -8 + T / 2 + 0.03, 0, { seed: 301 })
addDecor('painting', 14.0, -8 + T / 2 + 0.03, 0, { seed: 302 })
addDecor('bench', 12.5, 7.0, Math.PI)
addDecor('bench', 12.5, -7.0, 0)
addDecor('lamp', 9.6, -7.0)
addDecor('lamp', 9.6, 7.0)
addDecor('plant', 16.2, -7.2)
addDecor('plant', 16.2, 7.2)

// -------------------------------------------------------------
// 6. HỆ THỐNG CỬA & TƯỜNG KIẾN TRÚC
// -------------------------------------------------------------
// 4 Cổng kết nối từ Sảnh chính:
DOORWAYS.push(
  { id: 'door-c1', x: 0, z: -8, axis: 'x', width: doorWidth }, // lên C1
  { id: 'door-c2', x: -8, z: 0, axis: 'z', width: doorWidth }, // sang C2
  { id: 'door-c3', x: 8, z: 0, axis: 'z', width: doorWidth },  // sang C3
  { id: 'door-entrance', x: 0, z: 8, axis: 'x', width: doorWidth }, // ra cổng vào
)

// Walls end at the outside of each post; only the posts block the frame itself.
for (const door of DOORWAYS) {
  const { postWidth, postDepth } = DOOR_FRAME
  const offset = (door.width + postWidth) / 2
  for (const side of [-1, 1]) {
    COLLIDERS.push(door.axis === 'x'
      ? box(door.x + side * offset, door.z, postWidth / 2, postDepth / 2)
      : box(door.x, door.z + side * offset, postDepth / 2, postWidth / 2))
  }
}

// Tường ngăn giữa Sảnh chính và C1 (trục Z = -8, chừa cửa ở giữa)
const wallSegLobbyX = (16 - doorWidth - 2 * DOOR_FRAME.postWidth) / 2
addWall('x', -8 + wallSegLobbyX / 2, -8, wallSegLobbyX, partitionHeight, ROOM_THEMES.lobby.wall)
addWall('x', 8 - wallSegLobbyX / 2, -8, wallSegLobbyX, partitionHeight, ROOM_THEMES.lobby.wall)

// Tường ngăn giữa Sảnh chính và C2 (trục X = -8, chừa cửa ở giữa)
const wallSegLobbyZ = (16 - doorWidth - 2 * DOOR_FRAME.postWidth) / 2
addWall('z', -8, -8 + wallSegLobbyZ / 2, wallSegLobbyZ, partitionHeight, ROOM_THEMES.lobby.wall)
addWall('z', -8, 8 - wallSegLobbyZ / 2, wallSegLobbyZ, partitionHeight, ROOM_THEMES.lobby.wall)

// Tường ngăn giữa Sảnh chính và C3 (trục X = 8, chừa cửa ở giữa, thấp cutaway để nhìn thoáng)
addWall('z', 8, -8 + wallSegLobbyZ / 2, wallSegLobbyZ, frontWallHeight, ROOM_THEMES.lobby.wall)
addWall('z', 8, 8 - wallSegLobbyZ / 2, wallSegLobbyZ, frontWallHeight, ROOM_THEMES.lobby.wall)

// Tường phía Nam Sảnh chính (trục Z = 8, chừa cửa ra cổng vào)
addWall('x', -8 + wallSegLobbyX / 2, 8, wallSegLobbyX, frontWallHeight, ROOM_THEMES.lobby.wall)
addWall('x', 8 - wallSegLobbyX / 2, 8, wallSegLobbyX, frontWallHeight, ROOM_THEMES.lobby.wall)

// TƯỜNG NGOÀI PHÒNG C1:
// Tường Bắc C1 (xa camera, cao để treo tranh)
addWall('x', 0, -18, 16 + T, backWallHeight, ROOM_THEMES.ch1.wall)
// Tường Tây C1 (cao)
addWall('z', -8, -13, 10 + T, backWallHeight, ROOM_THEMES.ch1.wall)
// Tường Đông C1 (thấp cutaway)
addWall('z', 8, -13, 10 + T, frontWallHeight, ROOM_THEMES.ch1.wall)

// TƯỜNG NGOÀI PHÒNG C2:
// Tường Tây C2 (xa camera, cao treo tranh)
addWall('z', -17, 0, 16 + T, backWallHeight, ROOM_THEMES.ch2.wall)
// Tường Bắc C2 (cao)
addWall('x', -12.5, -8, 9 + T, backWallHeight, ROOM_THEMES.ch2.wall)
// Tường Nam C2 (thấp cutaway)
addWall('x', -12.5, 8, 9 + T, frontWallHeight, ROOM_THEMES.ch2.wall)

// TƯỜNG NGOÀI PHÒNG C3:
// Tường Đông C3 (thấp cutaway)
addWall('z', 17, 0, 16 + T, frontWallHeight, ROOM_THEMES.ch3.wall)
// Tường Bắc C3 (cao)
addWall('x', 12.5, -8, 9 + T, backWallHeight, ROOM_THEMES.ch3.wall)
// Tường Nam C3 (thấp cutaway)
addWall('x', 12.5, 8, 9 + T, frontWallHeight, ROOM_THEMES.ch3.wall)

// TƯỜNG TIỀN SẢNH / CỔNG VÀO (VESTIBULE):
addWall('z', -2.8, 9.25, 2.5, frontWallHeight, ROOM_THEMES.lobby.wall)
addWall('z', 2.8, 9.25, 2.5, frontWallHeight, ROOM_THEMES.lobby.wall)

// CỘT GỖ GÓC BẢO TÀNG & KHUNG CỬA
PILLARS.push(
  // Góc ngoài C1
  [-8, 0, -18],
  [8, 0, -18],
  // Góc ngoài C2
  [-17, 0, -8],
  [-17, 0, 8],
  // Góc ngoài C3
  [17, 0, -8],
  [17, 0, 8],
  // Điểm giao T-junction
  [-8, 0, 8],
  [8, 0, 8],
  // Tiền sảnh cổng vào
  [-2.8, 0, 10.5],
  [2.8, 0, 10.5],
)

// -------------------------------------------------------------
// 7. TIỆN ÍCH, BOUNDS, VỊ TRÍ XUẤT PHÁT CỦA NGƯỜI CHƠI
// -------------------------------------------------------------
export const BOUNDS = { minX: -17.5, maxX: 17.5, minZ: -18.5, maxZ: 10.8 }

// Xuất phát ở Sảnh chính phía Nam, hướng nhìn về tượng Lênin & Địa cầu
export const PLAYER_START = [0, 0, 5.8]

export const COUNTABLE = EXHIBITS.filter((e) => e.type !== 'sign')

export function roomAt(x, z = 0) {
  const pz = z ?? 0
  const found = ROOMS.find((r) => x >= r.x0 && x <= r.x1 && pz >= r.z0 && pz <= r.z1)
  if (found) return found
  let closest = ROOMS[0]
  let minDist = Infinity
  for (const r of ROOMS) {
    const d = Math.hypot(x - r.cx, pz - r.cz)
    if (d < minDist) {
      minDist = d
      closest = r
    }
  }
  return closest
}
