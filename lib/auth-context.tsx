"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Linking } from "react-native"
import { authService, type User } from "./api"
import { useGoogleLogin } from "./hooks/useGoogleLogin"
import { logger } from "./utils/logger"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: (keepRememberMe?: boolean) => Promise<void>
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  isGoogleReady: boolean
  getRememberMeCredentials: () => Promise<{ email: string; password: string } | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)


  const {
    loginWithGoogle: googleLogin,
    isReady: isGoogleReady
  } = useGoogleLogin()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    }
    loadUser()

    const handleDeepLink = async (event: { url: string }) => {
      logger.log(" Deep link received:", event.url)

      if (event.url.includes("carapp://auth/callback")) {
        logger.log("Google OAuth callback detected")

        try {
          const url = new URL(event.url)
          const params = url.searchParams

          let jwtToken = params.get("jwtToken") || params.get("token")

          if (!jwtToken && url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1))
            jwtToken = hashParams.get("jwtToken") || hashParams.get("token")
          }

          if (jwtToken) {
            logger.log(" JWT token found in callback, auto-logging in...")

            const currentUser = await authService.getCurrentUser()
            if (currentUser) {
              logger.log("Auto-login successful:", currentUser.email)
              setUser(currentUser)
            } else {
              logger.log(" Token found but no user in AsyncStorage")
            }
          } else {
            logger.log(" No token found in callback URL")
          }
        } catch (error) {
          logger.error(" Error handling deep link:", error)
        }
      }
    }

    const subscription = Linking.addEventListener("url", handleDeepLink)

    Linking.getInitialURL().then((url) => {
      if (url) {
        logger.log(" App opened with URL:", url)
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      logger.log('auth-context: calling authService.login', { email, rememberMe })
      const { data, error } = await authService.login({ email, password }, rememberMe)

      logger.log('auth-context: authService.login result', { data: data ? 'user data received' : null, error: error?.message })

      if (data && !error) {
        logger.log('auth-context: setting user in state', {
          userId: data.id,
          userRole: data.role,
          roleId: data.roleId,
          isStaff: data.role === 'staff' || data.roleId === 1002
        })
        setUser(data)
        return true
      }

      logger.log('auth-context: login failed', { hasData: !!data, hasError: !!error })
      return false
    } catch (err) {
      logger.error('auth-context: login exception', err)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      logger.log('auth-context: Google login initiated')
      logger.log('auth-context: isGoogleReady:', isGoogleReady)

      const result = await googleLogin()

      if (result.success) {
        logger.log('auth-context: Google login successful')

        if (result.user) {
          logger.log('auth-context: setting user from result', { userId: result.user.id, userRole: result.user.role })
          setUser(result.user)
          return true
        }


        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          logger.log('auth-context: setting user from AsyncStorage', { userId: currentUser.id, userRole: currentUser.role })
          setUser(currentUser)
          return true
        }
      }

      logger.log('auth-context: Google login failed', result.error)
      return false
    } catch (err) {
      logger.error('auth-context: Google login exception', err)
      return false
    }
  }

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser()
    if (currentUser) {
      logger.log('auth-context: refreshing user', {
        userId: currentUser.id,
        avatar: currentUser.avatar,
        imageAvatar: (currentUser as any).imageAvatar
      })


      setUser({ ...currentUser })
    }
  }

  const logout = async (keepRememberMe: boolean = true) => {
    await authService.logout(keepRememberMe)
    setUser(null)
  }

  const getRememberMeCredentials = async () => {
    return await authService.getRememberMeCredentials()
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
      refreshUser,
      isGoogleReady,
      getRememberMeCredentials
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
