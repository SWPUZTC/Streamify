import { create } from 'zustand'

type Store = {
    theme: string
    setTheme: (theme: string) => void
}

export const useThemeStore = create<Store>()((set) => ({
    theme: localStorage.getItem('theme') || 'forest',
    setTheme: (theme: string) => {
        localStorage.setItem('theme', theme)
        set({ theme })
    },
}))
