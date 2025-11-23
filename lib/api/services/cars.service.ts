
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

// API Response from backend
interface ApiCarResponse {
  id: string
  licensePlate: string
  model: string
  manufacturer: string
  seats: number
  yearofManufacture: number
  transmission: string
  fuelType: string
  fuelConsumption: number
  description: string
  rating: number
  status: string
  owner?: any
  preferredLot?: any
  imageUrls: string[]
}

// App Car model
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
  imageUrls?: string[] // API returns this field
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

// Map API response to app Car model
function mapApiCarToCar(apiCar: ApiCarResponse): Car {
  // Determine category based on car type/seats
  let category = "sedan"
  if (apiCar.seats >= 7) {
    category = "suv"
  } else if (apiCar.model.toLowerCase().includes("sport")) {
    category = "sport"
  }

  // Calculate price (mock - should come from API)
  const basePrice = 500000 // 500k VND base
  const yearFactor = (apiCar.yearofManufacture - 2020) * 50000
  const price = basePrice + yearFactor

  return {
    id: apiCar.id,
    name: `${apiCar.manufacturer} ${apiCar.model}`,
    brand: apiCar.manufacturer,
    model: apiCar.model,
    year: apiCar.yearofManufacture,
    category: category,
    price: price,
    image: apiCar.imageUrls?.[0] || "",
    images: apiCar.imageUrls || [],
    imageUrls: apiCar.imageUrls || [],
    rating: apiCar.rating || 0,
    reviews: 0, // API doesn't provide this
    seats: apiCar.seats,
    transmission: apiCar.transmission,
    fuelType: apiCar.fuelType,
    mileage: `${apiCar.fuelConsumption} L/100km`,
    features: [], // API doesn't provide this
    description: apiCar.description || "",
    available: apiCar.status?.toLowerCase() === "available" || apiCar.status?.toLowerCase() === "active",
    location: apiCar.preferredLot?.city || apiCar.preferredLot?.address || undefined,
  }
}

export const carsService = {

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
    const result = await apiClient<ApiCarResponse[]>(endpoint, { method: "GET" })

    console.log("carsService.getCars: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    let mappedData = result.data?.map(mapApiCarToCar) || []

    // Apply client-side filters if needed
    if (filters?.category && filters.category !== "all") {
      mappedData = mappedData.filter(car => car.category === filters.category)
    }
    if (filters?.minPrice !== undefined) {
      mappedData = mappedData.filter(car => car.price >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      mappedData = mappedData.filter(car => car.price <= filters.maxPrice!)
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      mappedData = mappedData.filter(car =>
        car.name.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower)
      )
    }

    return { data: mappedData, error: null }
  },


  async getAllCars(): Promise<{ data: Car[] | null; error: Error | null }> {
    console.log("carsService.getAllCars: fetching all cars")
    const result = await apiClient<ApiCarResponse[]>(API_ENDPOINTS.CARS, { method: "GET" })

    console.log("carsService.getAllCars: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data?.map(mapApiCarToCar) || null
    return { data: mappedData, error: null }
  },

  async getCarById(id: string): Promise<{ data: Car | null; error: Error | null }> {
    console.log("carsService.getCarById: fetching car", id)
    const result = await apiClient<ApiCarResponse>(API_ENDPOINTS.CAR_DETAILS(id), { method: "GET" })

    console.log("carsService.getCarById: result", {
      hasError: !!result.error,
      hasData: !!result.data
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data ? mapApiCarToCar(result.data) : null
    return { data: mappedData, error: null }
  },

  async searchCars(query: string): Promise<{ data: Car[] | null; error: Error | null }> {
    const result = await apiClient<ApiCarResponse[]>(`${API_ENDPOINTS.CAR_SEARCH}?q=${encodeURIComponent(query)}`, { method: "GET" })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data?.map(mapApiCarToCar) || null
    return { data: mappedData, error: null }
  },
}
