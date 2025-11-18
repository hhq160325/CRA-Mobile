
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: string
  price: number
  image: string
  images?: string[]
  rating: number
  reviews: number
  seats: number
  transmission: string
  fuelType: string
  mileage: string
  features: string[]
  description: string
  available: boolean
  location?: string
}

export const carsService = {
  // Get all cars with optional filters
  async getCars(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }): Promise<{ data: Car[] | null; error: Error | null }> {
    console.log("carsService.getCars: fetching cars with filters", filters)

    const params = new URLSearchParams()
    if (filters?.category && filters.category !== "all") params.append("category", filters.category)
    if (filters?.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString())
    if (filters?.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString())
    if (filters?.search) params.append("search", filters.search)

    const endpoint = params.toString() ? `${API_ENDPOINTS.CARS}?${params}` : API_ENDPOINTS.CARS
    const result = await apiClient<Car[]>(endpoint, { method: "GET" })

    console.log("carsService.getCars: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Get all cars (alias for getCars with no filters)
  async getAllCars(): Promise<{ data: Car[] | null; error: Error | null }> {
    console.log("carsService.getAllCars: fetching all cars")
    const result = await apiClient<Car[]>(API_ENDPOINTS.CARS, { method: "GET" })

    console.log("carsService.getAllCars: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async getCarById(id: string): Promise<{ data: Car | null; error: Error | null }> {
    console.log("carsService.getCarById: fetching car", id)
    const result = await apiClient<Car>(API_ENDPOINTS.CAR_DETAILS(id), { method: "GET" })

    console.log("carsService.getCarById: result", {
      hasError: !!result.error,
      hasData: !!result.data
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async searchCars(query: string): Promise<{ data: Car[] | null; error: Error | null }> {
    const result = await apiClient<Car[]>(`${API_ENDPOINTS.CAR_SEARCH}?q=${encodeURIComponent(query)}`, { method: "GET" })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },
}
