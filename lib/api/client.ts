// API Client with error handling and interceptors
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

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(errorData.message || "Request failed", response.status, errorData)
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    if (error instanceof APIError) {
      return { data: null, error }
    }
    return {
      data: null,
      error: new APIError(error instanceof Error ? error.message : "Unknown error occurred"),
    }
  }
}
