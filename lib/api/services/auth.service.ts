
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

// API Response from backend
interface ApiUserResponse {
  id: string
  username: string
  password: string
  phoneNumber: string
  email: string
  fullname: string
  address: string
  imageAvatar: string | null
  isGoogle: boolean
  googleId: string | null
  isCarOwner: boolean
  rating: number
  status: string
  roleId: number
  gender: number
}

// App User model
export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: "customer" | "staff" | "car-owner"
  createdAt: Date | string
  // Additional fields from API
  username?: string
  address?: string
  isCarOwner?: boolean
  rating?: number
  status?: string
  roleId?: number
}

// Map API response to app User model
function mapApiUserToUser(apiUser: ApiUserResponse): User {
  // Determine role based on roleId and isCarOwner
  let role: "customer" | "staff" | "car-owner" = "customer"

  if (apiUser.roleId === 2) {
    role = "staff"
  } else if (apiUser.isCarOwner) {
    role = "car-owner"
  }

  return {
    id: apiUser.id,
    name: apiUser.fullname || apiUser.username,
    email: apiUser.email,
    phone: apiUser.phoneNumber,
    avatar: apiUser.imageAvatar || undefined,
    role,
    createdAt: new Date().toISOString(),
    username: apiUser.username,
    address: apiUser.address,
    isCarOwner: apiUser.isCarOwner,
    rating: apiUser.rating,
    status: apiUser.status,
    roleId: apiUser.roleId,
  }
}

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
  async login(credentials: LoginCredentials): Promise<{ data: User | null; error: Error | null }> {
    console.log("authService.login: sending request with", { email: credentials.email })

    const result = await apiClient<{ token: string } & ApiUserResponse>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    console.log("authService.login: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
      error: result.error?.message
    })

    if (result.error) {
      console.error("authService.login: error details", result.error)
      return { data: null, error: result.error }
    }

    console.log("authService.login: raw API response", result.data)

    // Map API response to app User model
    const user = mapApiUserToUser(result.data)
    console.log("authService.login: mapped user", user)

    try {
      if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(user))
        console.log("authService.login: saved to localStorage")
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
    }

    return { data: user, error: null }
  },

  async register(data: RegisterData): Promise<{ data: User | null; error: Error | null }> {
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
      console.error("Failed to save to localStorage:", e)
    }

    return { data: result.data.user, error: null }
  },

  async logout(): Promise<{ error: Error | null }> {
    await apiClient(API_ENDPOINTS.LOGOUT, { method: "POST" })
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.removeItem) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    return { error: null }
  },

  getCurrentUser(): User | null {
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
        const userStr = localStorage.getItem("user")
        return userStr ? JSON.parse(userStr) : null
      }
    } catch (e) {
      console.error("Failed to get user from localStorage:", e)
    }
    return null
  },
}
