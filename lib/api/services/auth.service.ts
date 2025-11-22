
import { API_ENDPOINTS, API_CONFIG } from "../config"
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

// Map API response to app User model (used for Google login and other endpoints that return full user data)
function mapApiUserToUser(apiUser: ApiUserResponse): User {
  // Determine role based on roleId and isCarOwner
  let role: "customer" | "staff" | "car-owner" = "customer"

  const roleId = apiUser.roleId

  if (roleId === 1002 || String(roleId) === "1002") {
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

export interface GoogleLoginData {
  idToken: string
}

export interface RefreshTokenData {
  refreshToken: string
}

export interface TokenResponse {
  token: string
  refreshToken: string
  expiresIn?: number
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ data: User | null; error: Error | null }> {
    console.log("authService.login: sending request with", { email: credentials.email })

    const result = await apiClient<{ token: string; expiration?: string }>(API_ENDPOINTS.LOGIN, {
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

    // Decode JWT token to get user info
    const token = result.data.token
    let user: User | null = null

    try {
      const tokenParts = token.split('.')
      console.log("authService.login: token has", tokenParts.length, "parts")

      if (tokenParts.length === 3) {
        const payload = tokenParts[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

        // Decode base64 - compatible with React Native
        let jsonPayload: string
        try {
          // Try using atob (works in web and some RN environments)
          jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        } catch (e) {
          // Fallback: manual base64 decode for React Native
          console.log("atob failed, using Buffer fallback")
          if (typeof Buffer !== 'undefined') {
            jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
          } else {
            throw new Error("Cannot decode base64 in this environment")
          }
        }

        const decodedToken = JSON.parse(jsonPayload)
        console.log("authService.login: decoded JWT", JSON.stringify(decodedToken, null, 2))

        // Extract role from JWT claims
        const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        const isCarOwner = decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true

        let role: "customer" | "staff" | "car-owner" = "customer"

        console.log("=== DEBUG: Role Detection ===")
        console.log("roleFromToken:", roleFromToken)
        console.log("roleFromToken type:", typeof roleFromToken)
        console.log("isCarOwner:", isCarOwner)
        console.log("Checking if roleFromToken === '1002':", roleFromToken === "1002")
        console.log("Checking if parseInt(roleFromToken) === 1002:", parseInt(roleFromToken) === 1002)

        if (roleFromToken === "1002" || roleFromToken === 1002 || parseInt(roleFromToken) === 1002) {
          role = "staff"
          console.log("✅ Detected STAFF role")
        } else if (isCarOwner) {
          role = "car-owner"
          console.log("✅ Detected CAR-OWNER role")
        } else {
          console.log("✅ Detected CUSTOMER role (default)")
        }

        // Create user object from JWT
        user = {
          id: decodedToken.sub || "",
          name: decodedToken.name || "",
          email: decodedToken.email || credentials.email,
          phone: decodedToken.phone || "",
          role: role,
          roleId: parseInt(roleFromToken) || 1,
          isCarOwner: isCarOwner,
          createdAt: new Date().toISOString(),
        }

        console.log("authService.login: created user from JWT", user)
      }
    } catch (e) {
      console.error("Failed to decode JWT:", e)
      return { data: null, error: new Error("Failed to decode authentication token") }
    }

    if (!user) {
      return { data: null, error: new Error("Failed to create user from token") }
    }

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
    console.log("authService.register: sending request with", data)

    // Transform data to match backend expectations
    const requestBody = {
      Username: data.name,
      Email: data.email,
      Password: data.password,
      PhoneNumber: data.phone || "",
    }

    console.log("authService.register: request body", requestBody)

    const result = await apiClient<{ user: User; token: string }>(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })

    console.log("authService.register: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
    })

    if (result.error) {
      console.error("authService.register: error details", result.error)
      return { data: null, error: result.error }
    }

    try {
      if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
        console.log("authService.register: saved to localStorage")
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
    }

    return { data: result.data.user, error: null }
  },

  logout(): { error: Error | null } {
    // Logout is client-side only - just clear local storage
    // No API call needed since tokens are stateless (JWT)
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.removeItem) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("refreshToken")
        console.log("User logged out successfully")
      }
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
      return { error: e as Error }
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

  async loginWithGoogle(idToken: string): Promise<{ data: User | null; error: Error | null }> {
    console.log("authService.loginWithGoogle: sending request with idToken")

    const result = await apiClient<{
      username: string
      email: string
      isGoogle: string
      roleName: string | null
      jwtToken: string
      refreshToken: string | null
    }>(
      API_ENDPOINTS.LOGIN_GOOGLE,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    )

    console.log("authService.loginWithGoogle: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
      error: result.error?.message,
    })

    if (result.error) {
      console.error("authService.loginWithGoogle: error details", result.error)
      return { data: null, error: result.error }
    }

    console.log("authService.loginWithGoogle: raw API response", result.data)

    // Decode JWT to get user info
    const token = result.data.jwtToken
    let user: User | null = null

    try {
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        const payload = tokenParts[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

        let jsonPayload: string
        try {
          jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        } catch (e) {
          if (typeof Buffer !== 'undefined') {
            jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
          } else {
            throw new Error("Cannot decode base64 in this environment")
          }
        }

        const decodedToken = JSON.parse(jsonPayload)
        console.log("authService.loginWithGoogle: decoded JWT", decodedToken)

        const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        const isCarOwner = decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true

        let role: "customer" | "staff" | "car-owner" = "customer"

        if (roleFromToken === "1002" || roleFromToken === 1002 || parseInt(roleFromToken) === 1002) {
          role = "staff"
        } else if (isCarOwner) {
          role = "car-owner"
        }

        user = {
          id: decodedToken.sub || "",
          name: decodedToken.name || result.data.username,
          email: decodedToken.email || result.data.email,
          phone: decodedToken.phone || "",
          role: role,
          roleId: parseInt(roleFromToken) || 1,
          isCarOwner: isCarOwner,
          createdAt: new Date().toISOString(),
        }

        console.log("authService.loginWithGoogle: created user from JWT", user)
      }
    } catch (e) {
      console.error("Failed to decode JWT:", e)
      return { data: null, error: new Error("Failed to decode authentication token") }
    }

    if (!user) {
      return { data: null, error: new Error("Failed to create user from token") }
    }

    try {
      if (typeof localStorage !== "undefined" && localStorage?.setItem) {
        localStorage.setItem("token", result.data.jwtToken)
        if (result.data.refreshToken) {
          localStorage.setItem("refreshToken", result.data.refreshToken)
        }
        localStorage.setItem("user", JSON.stringify(user))
        console.log("authService.loginWithGoogle: saved to localStorage")
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
    }

    return { data: user, error: null }
  },

  getGoogleLoginUrl(): string {
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`
  },

  async refreshToken(refreshToken?: string): Promise<{ data: TokenResponse | null; error: Error | null }> {
    console.log("authService.refreshToken: sending request")

    // Get refresh token from parameter or localStorage
    let token = refreshToken
    if (!token) {
      try {
        if (typeof localStorage !== "undefined" && localStorage?.getItem) {
          token = localStorage.getItem("refreshToken") || undefined
        }
      } catch (e) {
        console.error("Failed to get refreshToken from localStorage:", e)
      }
    }

    if (!token) {
      return { data: null, error: new Error("No refresh token available") }
    }

    const result = await apiClient<TokenResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    })

    console.log("authService.refreshToken: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
      error: result.error?.message,
    })

    if (result.error) {
      console.error("authService.refreshToken: error details", result.error)
      return { data: null, error: result.error }
    }

    // Save new tokens to localStorage
    try {
      if (typeof localStorage !== "undefined" && localStorage?.setItem) {
        localStorage.setItem("token", result.data.token)
        if (result.data.refreshToken) {
          localStorage.setItem("refreshToken", result.data.refreshToken)
        }
        console.log("authService.refreshToken: saved new tokens to localStorage")
      }
    } catch (e) {
      console.error("Failed to save tokens to localStorage:", e)
    }

    return { data: result.data, error: null }
  },

  getRefreshToken(): string | null {
    try {
      if (typeof localStorage !== "undefined" && localStorage?.getItem) {
        return localStorage.getItem("refreshToken")
      }
    } catch (e) {
      console.error("Failed to get refreshToken from localStorage:", e)
    }
    return null
  },

  async forgotPassword(email: string, phone?: string): Promise<{ data: { message: string } | null; error: Error | null }> {
    console.log("authService.forgotPassword: sending request for", email, phone ? "with phone verification" : "")

    const requestBody: any = { email }
    if (phone) {
      requestBody.phone = phone
    }

    const result = await apiClient<{ message: string }>(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })

    console.log("authService.forgotPassword: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
    })

    if (result.error) {
      console.error("authService.forgotPassword: error details", result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  },

  async verifyResetCode(email: string, code: string): Promise<{ data: { valid: boolean } | null; error: Error | null }> {
    console.log("authService.verifyResetCode: verifying code for", email)

    const result = await apiClient<{ valid: boolean }>(API_ENDPOINTS.VERIFY_RESET_CODE, {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })

    console.log("authService.verifyResetCode: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
    })

    if (result.error) {
      console.error("authService.verifyResetCode: error details", result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ data: { message: string } | null; error: Error | null }> {
    console.log("authService.resetPassword: resetting password for", email)

    const result = await apiClient<{ message: string }>(API_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    })

    console.log("authService.resetPassword: received response", {
      hasError: !!result.error,
      hasData: !!result.data,
    })

    if (result.error) {
      console.error("authService.resetPassword: error details", result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  },
}
