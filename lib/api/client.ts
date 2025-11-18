
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

    // Create AbortController for timeout (React Native compatible)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("apiClient: response status", response.status)

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
      console.log("apiClient: success response", responseText)

      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        console.error("apiClient: failed to parse JSON response")
        throw new APIError("Invalid JSON response from server")
      }

      return { data, error: null }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("apiClient: caught error", error)

    if (error instanceof APIError) {
      return { data: null, error }
    }

    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: null,
        error: new APIError("Request timeout - please check your connection"),
      }
    }

    return {
      data: null,
      error: new APIError(error instanceof Error ? error.message : "Unknown error occurred"),
    }
  }
}
