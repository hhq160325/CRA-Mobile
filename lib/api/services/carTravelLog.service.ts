import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface CarTravelLog {
    carId: string
    bookingId: string
    travelDate: string
    tollBoothId: number
    chargeAmount: number
}

export interface TollBooth {
    id: number
    name: string
    location: string
    chargeAmount: number
    latitude?: number
    longitude?: number
}

export interface CreateTravelLogRequest {
    carId: string
    bookingId: string
    numOfToll: number
}

// Individual functions for better tree-shaking and debugging
export const getCarTravelLogsByCarAndBooking = async (
    carId: string,
    bookingId: string
): Promise<{ data: CarTravelLog[] | null; error: Error | null }> => {
    console.log("carTravelLogService.getCarTravelLogsByCarAndBooking: fetching travel logs", { carId, bookingId })

    const result = await apiClient<CarTravelLog[]>(
        API_ENDPOINTS.CAR_TRAVEL_LOG_BY_CAR_AND_BOOKING(carId, bookingId),
        { method: "GET" }
    )

    if (result.error) {
        return { data: null, error: result.error }
    }

    return { data: result.data || [], error: null }
}

export const getAllTollBooths = async (): Promise<{ data: TollBooth[] | null; error: Error | null }> => {
    console.log("carTravelLogService.getAllTollBooths: fetching all toll booths")

    try {
        const result = await apiClient<TollBooth[]>(
            API_ENDPOINTS.TOLL_BOOTH_ALL,
            { method: "GET" }
        )

        if (result.error) {
            console.warn("API error, falling back to mock data:", result.error)
            // Fallback to mock data when API fails
            return { data: getMockTollBooths(), error: null }
        }

        return { data: result.data || [], error: null }
    } catch (error) {
        console.warn("API exception, falling back to mock data:", error)
        // Fallback to mock data when API fails
        return { data: getMockTollBooths(), error: null }
    }
}

// Mock data based on your API response
const getMockTollBooths = (): TollBooth[] => {
    return [
        {
            id: 1,
            name: "Trạm thu phí xa lộ Hà Nội",
            location: "249 Võ Nguyên Giáp, Phước Long A, Thủ Đức, Thành phố Hồ Chí Minh, Vietnam",
            chargeAmount: 100000,
            latitude: 10.8231,
            longitude: 106.6297
        },
        {
            id: 2,
            name: "Trạm Thu phí Long Phước",
            location: "Trạm thu phí Long Phước, Long Phước, Thủ Đức, Thành phố Hồ Chí Minh, Vietnam",
            chargeAmount: 150000,
            latitude: 10.9231,
            longitude: 106.7297
        },
        {
            id: 3,
            name: "Trạm Thu Phí Cầu Ông Bố",
            location: "WP27+8P6, ĐT743B, Binh Hoà, Thuận An, Bình Dương, Vietnam",
            chargeAmount: 120000,
            latitude: 10.7231,
            longitude: 106.5297
        },
        {
            id: 4,
            name: "Trạm Thu phí Nguyễn Văn Linh",
            location: "702 Đường Nguyễn Văn Linh, Tân Hưng, Quận 7, Thành phố Hồ Chí Minh, Vietnam",
            chargeAmount: 200000,
            latitude: 10.8531,
            longitude: 106.6597
        }
    ]
}

export const createRandomTravelLog = async (
    request: CreateTravelLogRequest
): Promise<{ data: any | null; error: Error | null }> => {
    console.log("carTravelLogService.createRandomTravelLog: creating travel log", request)

    try {
        const result = await apiClient<any>(
            API_ENDPOINTS.CAR_TRAVEL_LOG_CREATE_RANDOM,
            {
                method: "POST",
                body: JSON.stringify(request),
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        if (result.error) {
            console.warn("API error creating travel log:", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    } catch (error) {
        console.error("API exception creating travel log:", error)
        return { data: null, error: error as Error }
    }
}

// Service object for backward compatibility
export const carTravelLogService = {
    getCarTravelLogsByCarAndBooking,
    getAllTollBooths,
    createRandomTravelLog,
}