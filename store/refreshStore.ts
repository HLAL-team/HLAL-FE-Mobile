import { create } from 'zustand';

interface RefreshState {
  lastRefreshed: number;
  triggerRefresh: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  lastRefreshed: Date.now(),
  triggerRefresh: () => set({ lastRefreshed: Date.now() }),
}));