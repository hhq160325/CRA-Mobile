"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "./api"
import type { User } from "@/lib/mock-data/users"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log('auth-context: calling authService.login', { email })
    const { data, error } = await authService.login({ email, password })
    // eslint-disable-next-line no-console
    console.log('auth-context: authService.login result', { data, error })

    if (data && !error) {
      setUser(data)
      return true
    }
    return false
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
