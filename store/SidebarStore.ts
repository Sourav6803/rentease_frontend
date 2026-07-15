import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SidebarState {
  // State
  isCollapsed: boolean
  isMobileOpen: boolean
  activeSection: string | null
  expandedSections: string[]
  pinnedItems: string[]
  recentlyUsed: string[]
  searchQuery: string
  
  // Actions
  toggleCollapse: () => void
  setCollapsed: (collapsed: boolean) => void
  setMobileOpen: (open: boolean) => void
  setActiveSection: (section: string | null) => void
  toggleSection: (section: string) => void
  expandSection: (section: string) => void
  collapseSection: (section: string) => void
  expandAll: () => void
  collapseAll: () => void
  pinItem: (itemId: string) => void
  unpinItem: (itemId: string) => void
  isPinned: (itemId: string) => boolean
  addRecent: (itemId: string) => void
  clearRecent: () => void
  setSearchQuery: (query: string) => void
  reset: () => void
}

// Default expanded sections (based on user role)
const defaultExpandedSections = ['Dashboard', 'Analytics', 'Products']

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Initial state
      isCollapsed: false,
      isMobileOpen: false,
      activeSection: null,
      expandedSections: defaultExpandedSections,
      pinnedItems: [],
      recentlyUsed: [],
      searchQuery: '',

      // Actions
      toggleCollapse: () => {
        set((state) => ({ isCollapsed: !state.isCollapsed }))
      },

      setCollapsed: (collapsed) => {
        set({ isCollapsed: collapsed })
      },

      setMobileOpen: (open) => {
        set({ isMobileOpen: open })
      },

      setActiveSection: (section) => {
        set({ activeSection: section })
      },

      toggleSection: (section) => {
        set((state) => ({
          expandedSections: state.expandedSections.includes(section)
            ? state.expandedSections.filter((s) => s !== section)
            : [...state.expandedSections, section]
        }))
      },

      expandSection: (section) => {
        set((state) => ({
          expandedSections: state.expandedSections.includes(section)
            ? state.expandedSections
            : [...state.expandedSections, section]
        }))
      },

      collapseSection: (section) => {
        set((state) => ({
          expandedSections: state.expandedSections.filter((s) => s !== section)
        }))
      },

      expandAll: () => {
        // This would need to know all available sections
        // For now, just log or implement based on your navigation config
        console.log('Expand all sections')
      },

      collapseAll: () => {
        set({ expandedSections: [] })
      },

      pinItem: (itemId) => {
        set((state) => ({
          pinnedItems: state.pinnedItems.includes(itemId)
            ? state.pinnedItems
            : [...state.pinnedItems, itemId]
        }))
      },

      unpinItem: (itemId) => {
        set((state) => ({
          pinnedItems: state.pinnedItems.filter((id) => id !== itemId)
        }))
      },

      isPinned: (itemId) => {
        return get().pinnedItems.includes(itemId)
      },

      addRecent: (itemId) => {
        set((state) => {
          const recent = [itemId, ...state.recentlyUsed.filter((id) => id !== itemId)]
          return { recentlyUsed: recent.slice(0, 5) } // Keep only last 5
        })
      },

      clearRecent: () => {
        set({ recentlyUsed: [] })
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      reset: () => {
        set({
          isCollapsed: false,
          isMobileOpen: false,
          activeSection: null,
          expandedSections: defaultExpandedSections,
          pinnedItems: [],
          recentlyUsed: [],
          searchQuery: ''
        })
      }
    }),
    {
      name: 'sidebar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedSections: state.expandedSections,
        pinnedItems: state.pinnedItems,
        recentlyUsed: state.recentlyUsed
      })
    }
  )
)