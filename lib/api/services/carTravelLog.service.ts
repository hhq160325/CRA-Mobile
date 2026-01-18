import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface CarTravelLog {
    carId: string
    bookingId: string
    travelDate: string
    tollBoothId: number
    chargeAmount: number
}

export const carTravelLogService = {
    async getCarTravelLogsByCarAndBooking(
        carId: string,
        bookingId: string
    ): Promise<{ data: CarTravelLog[] | null; error: Error | null }> {
        console.log("carTravelLogService.getCarTravelLogsByCarAndBooking: fetching travel logs", { carId, bookingId })

        const result = await apiClient<CarTravelLog[]>(
            API_ENDPOINTS.CAR_TRAVEL_LOG_BY_CAR_AND_BOOKING(carId, bookingId),
            { method: "GET" }
        )

        // console.log("carTravelLogService.getCarTravelLogsByCarAndBooking: result", {
        //     hasError: !!result.error,
        //     hasData: !!result.data,
        //     logsCount: result.data?.length || 0
        // })

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data || [], error: null }
    },
}