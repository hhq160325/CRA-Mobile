
import { API_CONFIG } from "./config"

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

// Test connectivity to the API server
export async function testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
  const startTime = Date.now()
  try {
    console.log("Testing connection to:", API_CONFIG.BASE_URL)

    // Try a simple HEAD request to the base URL
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for test

    const response = await fetch(API_CONFIG.BASE_URL, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    console.log("Connection test result:", response.status, "latency:", latency, "ms")

    return {
      success: response.status < 500,
      message: `Server reachable (${latency}ms)`,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    console.error("Connection test failed:", error)

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: `Connection timeout after ${latency}ms - Server may be unreachable`,
        latency,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
      latency,
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
      console.error("apiClient: error response", errorText)
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      throw new APIError(errorData.message || "Request failed", response.status, errorData)
    }

    const responseText = await response.text()
    console.log("apiClient: success response length:", responseText.length)

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
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

    // Get auth token from localStorage
    let token: string | null = null
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
        token = localStorage.getItem("token")
      }
    } catch (e) {
      console.error("Failed to get token from localStorage:", e)
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    }

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    }

    // Try with retry logic
    let lastError: Error | null = null
    const maxRetries = API_CONFIG.RETRY_ATTEMPTS || 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`apiClient: retry attempt ${attempt}/${maxRetries}`)
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }

        const data = await makeRequest<T>(url, fetchOptions, API_CONFIG.TIMEOUT)
        return { data, error: null }
      } catch (error) {
        lastError = error as Error
        console.error(`apiClient: attempt ${attempt + 1} failed:`, error)

        // Don't retry on certain errors
        if (error instanceof APIError && error.status && error.status >= 400 && error.status < 500) {
          // Client errors (4xx) shouldn't be retried
          throw error
        }

        // If this was the last attempt, throw the error
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

    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: null,
        error: new APIError("Request timeout - The server took too long to respond. Please check your internet connection or try again later."),
      }
    }

    // Handle network errors
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
