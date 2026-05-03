import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const BADGES = [
  { id: 'task_slayer', name: 'Task Slayer', emoji: '⚔️', requirement: 10 },
  { id: 'deadline_master', name: 'Deadline Master', emoji: '⏰', requirement: 25 },
  { id: 'xp_legend', name: 'XP Legend', emoji: '🏆', requirement: 50 },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      xp: 0,
      tasksCompleted: 0,
      badges: [],

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
      logout: () => set({ user: null, token: null, isAuthenticated: false, xp: 0, tasksCompleted: 0, badges: [] }),

      addXP: (amount = 10) => {
        const { xp, tasksCompleted, badges } = get()
        const newXP = xp + amount
        const newTasksCompleted = tasksCompleted + 1
        const newBadges = [...badges]

        BADGES.forEach(badge => {
          if (!newBadges.find(b => b.id === badge.id) && newTasksCompleted >= badge.requirement) {
            newBadges.push(badge)
            window.dispatchEvent(new CustomEvent('badge-earned', { detail: badge }))
          }
        })

        set({ xp: newXP, tasksCompleted: newTasksCompleted, badges: newBadges })
      },
    }),
    { name: 'taskflow-auth' }
  )
)
