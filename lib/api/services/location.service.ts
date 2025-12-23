import { apiClient } from "../client"
import * as ExpoLocation from 'expo-location'

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
    distance: number
    duration: number
    polyline: string
    steps: {
        instruction: string
        distance: number
        duration: number
    }[]
}

export interface NearbySearch {
    latitude: number
    longitude: number
    radius: number
    type?: "pickup" | "dropoff" | "parking"
}

export const locationService = {

    async getLocations(type?: string): Promise<{ data: Location[] | null; error: Error | null }> {
        const params = type ? `?type=${type}` : ""
        const result = await apiClient<Location[]>(`/locations${params}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getLocationById(locationId: string): Promise<{ data: Location | null; error: Error | null }> {
        const result = await apiClient<Location>(`/locations/${locationId}`, { method: "GET" })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


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


    async getCoordinatesFromAddress(
        address: string
    ): Promise<{ data: { latitude: string; longitude: string } | null; error: Error | null }> {
        console.log("locationService.getCoordinatesFromAddress: geocoding address", address)

        const result = await apiClient<{ latitude: string; longitude: string }>(
            "/TrackAsia/GetCoordinateFromAddress",
            {
                method: "POST",
                body: JSON.stringify(address),
            }
        )

        console.log("locationService.getCoordinatesFromAddress: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            data: result.data,
        })

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async getDistanceBetweenAddresses(
        sourceAddress: string,
        destinationAddress: string
    ): Promise<{ data: { distanceInMeters: number } | null; error: Error | null }> {
        console.log("locationService.getDistanceBetweenAddresses: calculating distance", {
            sourceAddress,
            destinationAddress
        })

        const result = await apiClient<{ distanceInMeters: number }>(
            "/TrackAsia/GetDistanceBetweenAddresses",
            {
                method: "POST",
                body: JSON.stringify({
                    sourceAddress,
                    destinationAddress
                }),
            }
        )

        console.log("locationService.getDistanceBetweenAddresses: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            data: result.data,
        })

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async reverseGeocode(
        latitude: number,
        longitude: number
    ): Promise<{ data: { address: string; city: string; country: string } | null; error: Error | null }> {
        console.log("locationService.reverseGeocode: getting address for", { latitude, longitude })

        const result = await apiClient<any>(
            "/TrackAsia/GetReverseGeocoding",
            {
                method: "POST",
                body: JSON.stringify({
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                }),
            }
        )

        console.log("locationService.reverseGeocode: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            data: result.data,
        })

        if (result.error) {
            return { data: null, error: result.error }
        }

        // Handle different possible response formats from TrackAsia API
        const responseData = result.data

        // Try to extract address information from various possible formats
        let address = ''
        let city = ''
        let country = ''

        if (responseData) {
            // TrackAsia API returns formattedAddress - only use the main formatted address
            address = responseData.formattedAddress ||
                responseData.address ||
                responseData.display_name ||
                responseData.formatted_address ||
                ''

            city = responseData.city || responseData.town || responseData.village || ''
            country = responseData.country || responseData.country_name || ''

            // If no direct address, try to build from components
            if (!address && responseData.address_components) {
                const components = responseData.address_components
                address = [
                    components.road,
                    components.suburb,
                    components.city || components.town,
                    components.state,
                    components.country
                ].filter(Boolean).join(', ')
            }

            console.log("locationService.reverseGeocode: parsed address", { address, city, country })
        }

        return {
            data: { address, city, country },
            error: null
        }
    },


    async getCurrentLocation(): Promise<{
        data: { latitude: number; longitude: number } | null
        error: Error | null
    }> {
        try {
            console.log("locationService.getCurrentLocation: requesting permissions");
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log("locationService.getCurrentLocation: permission denied");
                return {
                    data: null,
                    error: new Error("Location permission denied. Please enable location access in your device settings.")
                };
            }

            console.log("locationService.getCurrentLocation: getting current position");
            const location = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            console.log("locationService.getCurrentLocation: success", {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            return {
                data: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                error: null,
            };
        } catch (error) {
            console.error("locationService.getCurrentLocation: caught error", error);
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get location. Please ensure location services are enabled.")
            };
        }
    },


    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371
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
