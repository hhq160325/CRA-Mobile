import { apiClient } from "../client"

export interface Location {
    id: string
    name: string
    address: string
    city: string
    state?: string
    country: string
    postalCode: string
    latitude: number
    longitude: number
    type: "pickup" | "dropoff" | "parking" | "service-center"
    available: boolean
    workingHours?: {
        open: string
        close: string
        days: string[]
    }
    contact?: {
        phone: string
        email: string
    }
    amenities?: string[]
}

export interface CarLocation {
    carId: string
    carName: string
    carImage: string
    latitude: number
    longitude: number
    available: boolean
    price: number
    distance?: number
}

export interface RouteData {
    distance: number // in kilometers
    duration: number // in minutes
    polyline: string // encoded polyline
    steps: {
        instruction: string
        distance: number
        duration: number
    }[]
}

export interface NearbySearch {
    latitude: number
    longitude: number
    radius: number // in kilometers
    type?: "pickup" | "dropoff" | "parking"
}

export const locationService = {
    /**
     * Get all available pickup/dropoff locations
     */
    async getLocations(type?: string): Promise<{ data: Location[] | null; error: Error | null }> {
        const params = type ? `?type=${type}` : ""
        const result = await apiClient<Location[]>(`/locations${params}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get location by ID
     */
    async getLocationById(locationId: string): Promise<{ data: Location | null; error: Error | null }> {
        const result = await apiClient<Location>(`/locations/${locationId}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Search nearby locations
     */
    async searchNearby(params: NearbySearch): Promise<{ data: Location[] | null; error: Error | null }> {
        const queryParams = new URLSearchParams({
            latitude: params.latitude.toString(),
            longitude: params.longitude.toString(),
            radius: params.radius.toString(),
        })
        if (params.type) queryParams.append("type", params.type)

        const result = await apiClient<Location[]>(`/locations/nearby?${queryParams}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get available cars near a location
     */
    async getCarsNearLocation(
        latitude: number,
        longitude: number,
        radius: number = 10
    ): Promise<{ data: CarLocation[] | null; error: Error | null }> {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString(),
        })

        const result = await apiClient<CarLocation[]>(`/cars/nearby?${params}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Calculate route between two points
     */
    async calculateRoute(
        origin: { latitude: number; longitude: number },
        destination: { latitude: number; longitude: number }
    ): Promise<{ data: RouteData | null; error: Error | null }> {
        const result = await apiClient<RouteData>("/locations/route", {
            method: "POST",
            body: JSON.stringify({ origin, destination }),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Geocode address to coordinates
     */
    async geocodeAddress(
        address: string
    ): Promise<{ data: { latitude: number; longitude: number; formattedAddress: string } | null; error: Error | null }> {
        const result = await apiClient<{ latitude: number; longitude: number; formattedAddress: string }>(
            "/locations/geocode",
            {
                method: "POST",
                body: JSON.stringify({ address }),
            }
        )
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(
        latitude: number,
        longitude: number
    ): Promise<{ data: { address: string; city: string; country: string } | null; error: Error | null }> {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        })

        const result = await apiClient<{ address: string; city: string; country: string }>(
            `/locations/reverse-geocode?${params}`,
            {
                method: "GET",
            }
        )
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get user's current location (using device GPS)
     */
    async getCurrentLocation(): Promise<{
        data: { latitude: number; longitude: number } | null
        error: Error | null
    }> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ data: null, error: new Error("Geolocation not supported") })
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        data: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                        error: null,
                    })
                },
                (error) => {
                    resolve({ data: null, error: new Error(error.message) })
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            )
        })
    },

    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371 // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1)
        const dLon = this.toRad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    },

    toRad(degrees: number): number {
        return degrees * (Math.PI / 180)
    },
}
