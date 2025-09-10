"use client"

import { create } from "zustand"

type AuthUser = {
  id: string
  email: string
  name?: string
} | null

type AuthState = {
  user: AuthUser
  isLoading: boolean
  setUser: (user: AuthUser) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))


