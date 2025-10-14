
import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { mockCars, getCarById, searchCars, type Car } from "@/lib/mock-data/cars"

export const carsService = {
 
  async getCars(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }): Promise<{ data: Car[] | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500)) 
      let cars = [...mockCars]

      if (filters?.category && filters.category !== "all") {
        cars = cars.filter((car) => car.category === filters.category)
      }
      if (filters?.minPrice !== undefined) {
        cars = cars.filter((car) => car.price >= filters.minPrice!)
      }
      if (filters?.maxPrice !== undefined) {
        cars = cars.filter((car) => car.price <= filters.maxPrice!)
      }
      if (filters?.search) {
        cars = searchCars(filters.search)
      }

      return { data: cars, error: null }
    }

    const result = await apiClient<Car[]>(API_ENDPOINTS.CARS, {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },


  async getCarById(id: string): Promise<{ data: Car | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const car = getCarById(id)
      return car ? { data: car, error: null } : { data: null, error: new Error("Car not found") }
    }

    const result = await apiClient<Car>(API_ENDPOINTS.CAR_DETAILS(id), {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  
  async searchCars(query: string): Promise<{ data: Car[] | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return { data: searchCars(query), error: null }
    }

    const result = await apiClient<Car[]>(`${API_ENDPOINTS.CAR_SEARCH}?q=${encodeURIComponent(query)}`, {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },
}
