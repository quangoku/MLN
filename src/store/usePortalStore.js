import { create } from 'zustand'

// gameMode: null = portal screen, 'philosophy' = game cũ, 'economy' = game mê cung
export const usePortalStore = create((set) => ({
  gameMode: null, // null | 'philosophy' | 'economy'
  setGameMode: (mode) => set({ gameMode: mode }),
  returnToPortal: () => set({ gameMode: null }),
}))
