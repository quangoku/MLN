import { create } from 'zustand'
import { ROOMS } from '../world/layout.js'

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

  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}))
