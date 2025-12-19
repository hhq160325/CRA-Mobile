
import { API_CONFIG } from "./config"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getOptimalExpoConfig } from './expo-dev-helper'

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}


export async function testConnection(): Promise<{ success: boolean; message: string; latency?: number; connectionQuality?: string }> {
  const startTime = Date.now()
  try {
    console.log("Testing connection to:", API_CONFIG.BASE_URL)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // Reduced timeout for mobile

    const response = await fetch(API_CONFIG.BASE_URL, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    // Determine connection quality based on latency
    let connectionQuality = "excellent"
    if (latency > 2000) connectionQuality = "poor"
    else if (latency > 1000) connectionQuality = "fair"
    else if (latency > 500) connectionQuality = "good"

    console.log("Connection test result:", response.status, "latency:", latency, "ms", "quality:", connectionQuality)

    return {
      success: response.status < 500,
      message: `Server reachable (${latency}ms) - ${connectionQuality} connection`,
      latency,
      connectionQuality,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    console.error("Connection test failed:", error)

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: `Connection timeout after ${latency}ms - Check your internet connection`,
        latency,
        connectionQuality: "timeout",
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
      latency,
      connectionQuality: "failed",
    }
  }
}

async function makeRequest<T>(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log("apiClient: request timeout after", timeout, "ms")
    controller.abort()
  }, timeout)

  try {
    console.log("apiClient: fetch starting...")
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("apiClient: response received, status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()


      if (response.status !== 404) {
        console.error("apiClient: error response status:", response.status)
        console.error("apiClient: error response body:", errorText)
      }

      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
        if (response.status !== 404) {
          console.error("apiClient: parsed error data:", JSON.stringify(errorData, null, 2))
        }
      } catch {
        errorData = { message: errorText }
      }

      // Provide more helpful error messages for common status codes
      let errorMessage = errorData.message || errorData.title || "Request failed"
      if (!errorMessage || errorMessage === "Request failed") {
        if (response.status === 500) {
          errorMessage = "Server error occurred. Please try again later or contact support if the issue persists."
        } else if (response.status === 400) {
          errorMessage = "Invalid request data. Please check your input and try again."
        } else if (response.status === 401) {
          errorMessage = "Authentication required. Please log in again."
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action."
        } else if (response.status === 404) {
          errorMessage = "The requested resource was not found."
        }
      }

      throw new APIError(errorMessage, response.status, errorData)
    }

    const responseText = await response.text()
    console.log("apiClient: success response length:", responseText.length)

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {

      console.log("apiClient: response is not JSON, treating as text:", responseText)

      if (responseText.startsWith('http') || responseText.length < 500) {
        return responseText as any
      }
      console.error("apiClient: failed to parse JSON response")
      throw new APIError("Invalid JSON response from server")
    }

    return data
  } catch (fetchError) {
    clearTimeout(timeoutId)
    throw fetchError
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{ data: T; error: null } | { data: null; error: APIError }> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    console.log("apiClient: making request to", url)
    console.log("apiClient: request body", options?.body)


    let token: string | null = null
    try {
      token = await AsyncStorage.getItem("token")
    } catch (e) {
      console.error("Failed to get token from AsyncStorage:", e)
    }

    // Get Expo-optimized configuration in development
    const expoConfig = __DEV__ ? getOptimalExpoConfig() : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Mobile-specific optimizations
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Accept-Encoding": "gzip, deflate",
      // Add Expo-specific headers in development
      ...(expoConfig?.headers || {}),
      ...(options?.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log("apiClient: using auth token (length:", token.length, ")")
    }


    const fetchOptions: RequestInit = {
      ...options,
      headers,
    }


    let lastError: Error | null = null
    const maxRetries = API_CONFIG.RETRY_ATTEMPTS || 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`apiClient: retry attempt ${attempt}/${maxRetries}`)

          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }

        const data = await makeRequest<T>(url, fetchOptions, API_CONFIG.TIMEOUT)
        return { data, error: null }
      } catch (error) {
        lastError = error as Error
        console.error(`apiClient: attempt ${attempt + 1} failed:`, error)


        if (error instanceof APIError && error.status && error.status >= 400 && error.status < 500) {

          throw error
        }


        if (attempt === maxRetries) {
          throw error
        }
      }
    }

    throw lastError || new Error("Request failed after retries")
  } catch (error) {
    console.error("apiClient: caught error", error)

    if (error instanceof APIError) {
      return { data: null, error }
    }


    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: null,
        error: new APIError("Request timeout - The server took too long to respond. Please check your internet connection or try again later."),
      }
    }


    // Handle specific tunnel/ngrok errors
    if (error instanceof Error && (
      error.message.includes("ER_NGROK_3200") ||
      error.message.includes("tunnel not found") ||
      error.message.includes("ngrok") ||
      error.message.includes("Tunnel") ||
      error.message.includes("3200")
    )) {
      return {
        data: null,
        error: new APIError("Development tunnel error - Please restart your development server or check your API configuration"),
      }
    }

    if (error instanceof Error && error.message.includes("Network request failed")) {
      return {
        data: null,
        error: new APIError("Network error - Please check your internet connection"),
      }
    }

    return {
      data: null,
      error: new APIError(error instanceof Error ? error.message : "Unknown error occurred"),
    }
  }
}
