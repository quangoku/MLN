import { create } from 'zustand'
import { ROOMS } from '../world/layout.js'
import { playerRef } from '../player/playerRef.js'

const STORAGE_KEY = 'philoverse-progress-v1'

// localStorage có thể bị chặn (chế độ ẩn danh, iframe…) → luôn bọc try/catch
function loadProgress() {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

function saveProgress(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // bỏ qua: tiến trình chỉ không được lưu lại
  }
}

// State dùng chung giữa thế giới 3D và UI DOM.
// Trong useFrame nên đọc bằng useMuseumStore.getState() để tránh re-render.
export const useMuseumStore = create((set, get) => ({
  started: false,
  start: () => set({ started: true }),

  roomId: ROOMS[0].id,
  setRoom: (roomId) => set({ roomId }),

  discovered: loadProgress(),
  // Trả về true nếu đây là lần đầu khám phá hiện vật này
  discover: (id) => {
    const current = get().discovered
    if (current.has(id)) return false
    const next = new Set(current)
    next.add(id)
    saveProgress(next)
    set({ discovered: next })
    return true
  },
  resetProgress: () => {
    saveProgress(new Set())
    set({ discovered: new Set() })
  },

  pinnedId: null,
  togglePin: (id) => set((s) => ({ pinnedId: s.pinnedId === id ? null : id })),
  clearPin: () => set({ pinnedId: null }),

  nearbyId: null,
  setNearby: (id) => set({ nearbyId: id }),

  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),

  // --- FEATURE 2: KHÔNG GIAN VŨ TRỤ (SPACE SCENE) ---
  inSpaceScene: false,
  spaceWarping: null, // 'entering' | 'exiting' | null
  nearSun: false,
  sunNearness: 0,
  selectedPlanet: null,

  setNearSun: (near, factor = 0) => set({ nearSun: near, sunNearness: factor }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),

  startSpaceWarp: () => {
    const s = get()
    if (s.inSpaceScene || s.spaceWarping) return
    set({ spaceWarping: 'entering' })
    setTimeout(() => {
      set({ inSpaceScene: true, spaceWarping: null, selectedPlanet: null })
    }, 1100)
  },

  exitSpaceScene: () => {
    const s = get()
    if (!s.inSpaceScene || s.spaceWarping) return
    set({ spaceWarping: 'exiting', selectedPlanet: null })
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.position.set(0, 0, 3.2)
      }
      set({ inSpaceScene: false, spaceWarping: null, nearSun: false, sunNearness: 0 })
    }, 900)
  },
}))
