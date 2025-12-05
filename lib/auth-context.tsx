"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Linking } from "react-native"
import { authService, type User } from "./api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }


    const handleDeepLink = async (event: { url: string }) => {
      console.log("🔗 Deep link received:", event.url)

      if (event.url.includes("carapp://auth/callback")) {
        console.log("✅ Google OAuth callback detected")

        try {
          const url = new URL(event.url)
          const params = url.searchParams


          let jwtToken = params.get("jwtToken") || params.get("token")


          if (!jwtToken && url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1))
            jwtToken = hashParams.get("jwtToken") || hashParams.get("token")
          }

          if (jwtToken) {
            console.log("✅ JWT token found in callback, auto-logging in...")


            const currentUser = authService.getCurrentUser()
            if (currentUser) {
              console.log("✅ Auto-login successful:", currentUser.email)
              setUser(currentUser)
            } else {
              console.log("⚠️ Token found but no user in localStorage")
            }
          } else {
            console.log("❌ No token found in callback URL")
          }
        } catch (error) {
          console.error("❌ Error handling deep link:", error)
        }
      }
    }


    const subscription = Linking.addEventListener("url", handleDeepLink)


    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🔗 App opened with URL:", url)
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {

      console.log('auth-context: calling authService.login', { email })
      const { data, error } = await authService.login({ email, password })

      console.log('auth-context: authService.login result', { data: data ? 'user data received' : null, error: error?.message })

      if (data && !error) {

        console.log('auth-context: setting user in state', { userId: data.id, userRole: data.role })
        setUser(data)
        return true
      }


      console.log('auth-context: login failed', { hasData: !!data, hasError: !!error })
      return false
    } catch (err) {

      console.error('auth-context: login exception', err)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      console.log('auth-context: Google login initiated')


      const { performGoogleLogin } = require("./utils/googleLogin")

      const result = await performGoogleLogin()

      if (result.success) {
        console.log('auth-context: Google login successful')


        if (result.user) {
          console.log('auth-context: setting user from result', { userId: result.user.id, userRole: result.user.role })
          setUser(result.user)
          return true
        }


        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          console.log('auth-context: setting user from localStorage', { userId: currentUser.id, userRole: currentUser.role })
          setUser(currentUser)
          return true
        }
      }

      console.log('auth-context: Google login failed', result.error)
      return false
    } catch (err) {
      console.error('auth-context: Google login exception', err)
      return false
    }
  }

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      console.log('auth-context: refreshing user', {
        userId: currentUser.id,
        avatar: currentUser.avatar,
        imageAvatar: (currentUser as any).imageAvatar
      })
      // Create a completely new object to force React to detect the change
      setUser(null)
      setTimeout(() => {
        setUser({ ...currentUser })
      }, 0)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthenticated: !!user, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
