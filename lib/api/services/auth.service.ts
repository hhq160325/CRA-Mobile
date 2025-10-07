// Auth API Service
import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { mockUsers, type User } from "@/lib/mock-data/users"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<{ data: User | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

      if (!user) {
        return { data: null, error: new Error("Invalid email or password") }
      }

      // Store user if localStorage is available (web). On native, localStorage is undefined.
      try {
        if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
          localStorage.setItem("user", JSON.stringify(user))
        }
      } catch (e) {
        // ignore storage errors on native
      }
      return { data: user, error: null }
    }

    const result = await apiClient<{ user: User; token: string }>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Store token and user if localStorage is available
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
      }
    } catch (e) {
      // ignore storage errors on native
    }

    return { data: result.data.user, error: null }
  },

  // Register
  async register(data: RegisterData): Promise<{ data: User | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Check if email already exists
      if (mockUsers.some((u) => u.email === data.email)) {
        return { data: null, error: new Error("Email already exists") }
      }

      const newUser: User = {
        id: String(mockUsers.length + 1),
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
        avatar: "/male-avatar.png",
        createdAt: new Date(),
      }

      mockUsers.push(newUser)
      try {
        if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
          localStorage.setItem("user", JSON.stringify(newUser))
        }
      } catch (e) {
        // ignore on native
      }

      return { data: newUser, error: null }
    }

    const result = await apiClient<{ user: User; token: string }>(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    try {
      if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
      }
    } catch (e) {
      // ignore on native
    }

    return { data: result.data.user, error: null }
  },

  // Logout
  async logout(): Promise<{ error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      try {
        if (typeof localStorage !== 'undefined' && localStorage?.removeItem) {
          localStorage.removeItem("user")
        }
      } catch (e) {
        // ignore on native
      }
      return { error: null }
    }

    await apiClient(API_ENDPOINTS.LOGOUT, { method: "POST" })
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.removeItem) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    } catch (e) {
      // ignore on native
    }

    return { error: null }
  },

  // Get current user
  getCurrentUser(): User | null {
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
        const userStr = localStorage.getItem("user")
        return userStr ? JSON.parse(userStr) : null
      }
    } catch (e) {
      // ignore on native
    }
    return null
  },
}
