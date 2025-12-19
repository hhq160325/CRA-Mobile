
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { apiCache, cacheKeys } from "../cache"

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
  rentalRate?: {
    dailyRate: number
    hourlyRate: number
    weeklyDiscount: number
    monthlyDiscount: number
    maxDistancePerDay: number | null
    overtravelRatePerKm: number
    status: string
    carId: string
  } | null
  imageUrls: string[]
}

// Rental Rate Response from API
export interface RentalRate {
  dailyRate: number
  hourlyRate: number
  weeklyDiscount: number
  monthlyDiscount: number
  maxDistancePerDay: number | null
  overtravelRatePerKm: number
  status: string
  carId: string
}

// App Car model
export interface Car {
  id: string
  name: string
  brand: string
  model: string
  manufacturer: string
  licensePlate?: string
  year: number
  yearofManufacture: number
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
  fuelConsumption?: number
  mileage: string
  features: string[]
  description: string
  available: boolean
  status?: string
  location?: string
  preferredLot?: any
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

  // Get price from rentalRate if available
  const price = apiCar.rentalRate?.dailyRate || 0

  // Debug logging
  if (apiCar.rentalRate) {
    console.log(`🚗 ${apiCar.manufacturer} ${apiCar.model}: rentalRate found, dailyRate = ${apiCar.rentalRate.dailyRate}, status = ${apiCar.status}`)
  } else {
    console.log(`🚗 ${apiCar.manufacturer} ${apiCar.model}: NO rentalRate, status = ${apiCar.status}`)
  }

  return {
    id: apiCar.id,
    name: `${apiCar.manufacturer} ${apiCar.model}`,
    brand: apiCar.manufacturer,
    manufacturer: apiCar.manufacturer,
    model: apiCar.model,
    licensePlate: apiCar.licensePlate,
    year: apiCar.yearofManufacture,
    yearofManufacture: apiCar.yearofManufacture,
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
    fuelConsumption: apiCar.fuelConsumption,
    mileage: `${apiCar.fuelConsumption} L/100km`,
    features: [], // API doesn't provide this
    description: apiCar.description || "",
    available: apiCar.status?.toLowerCase() === "available" || apiCar.status?.toLowerCase() === "active",
    status: apiCar.status,
    location: apiCar.preferredLot?.city || apiCar.preferredLot?.address || undefined,
    preferredLot: apiCar.preferredLot,
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

    // Check cache first (only for unfiltered requests)
    const cacheKey = cacheKeys.cars();
    if (!filters || Object.keys(filters).length === 0) {
      const cachedData = apiCache.get<Car[]>(cacheKey);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
    }

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

    // Cache unfiltered results
    if (!filters || Object.keys(filters).length === 0) {
      apiCache.set(cacheKey, mappedData, 3 * 60 * 1000); // 3 minutes
    }

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

    // Map API response to app model (rentalRate.dailyRate is already included)
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

    // Map API response to app model (rentalRate.dailyRate is already included)
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

  async getCarRentalRate(carId: string): Promise<{ data: RentalRate | null; error: Error | null }> {
    // Check cache first
    const cacheKey = cacheKeys.carRate(carId);
    const cachedData = apiCache.get<RentalRate>(cacheKey);
    if (cachedData) {
      return { data: cachedData, error: null };
    }

    const result = await apiClient<RentalRate>(API_ENDPOINTS.CAR_RENTAL_RATE(carId), { method: "GET" })

    if (result.error) {
      // Don't log 404 errors as they're expected for cars without rental rates
      if (!result.error.message.includes("404") && !result.error.message.includes("not found")) {
        console.error("carsService.getCarRentalRate: unexpected error for car", carId, result.error)
      }
      return { data: null, error: result.error }
    }

    // Cache successful results
    if (result.data) {
      apiCache.set(cacheKey, result.data, 5 * 60 * 1000); // 5 minutes
    }

    console.log("carsService.getCarRentalRate: found rate for car", carId, {
      dailyRate: result.data?.dailyRate,
      status: result.data?.status
    })

    return { data: result.data, error: null }
  },
}
