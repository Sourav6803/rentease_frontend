// store/DeliverySidebarStore.ts
import { create } from 'zustand';

interface DeliverySidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setMobileOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const useDeliverySidebarStore = create<DeliverySidebarStore>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));