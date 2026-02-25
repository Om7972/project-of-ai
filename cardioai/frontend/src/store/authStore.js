import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('cardioai_token', token)
                set({ user, token, isAuthenticated: true })
            },

            logout: () => {
                localStorage.removeItem('cardioai_token')
                localStorage.removeItem('cardioai_user')
                set({ user: null, token: null, isAuthenticated: false })
            },

            updateUser: (user) => set({ user }),
        }),
        {
            name: 'cardioai_user',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
)

export default useAuthStore
