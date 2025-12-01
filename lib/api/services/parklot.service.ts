import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface ParkLot {
    id: string
    name: string
    address: string
    latitude?: number
    longitude?: number
}

export const parkLotService = {
    async getAllParkLots(): Promise<{ data: ParkLot[] | null; error: Error | null }> {
        console.log("parkLotService.getAllParkLots: fetching park lots")
        const result = await apiClient<ParkLot[]>(API_ENDPOINTS.PARK_LOTS, { method: "GET" })
        console.log("parkLotService.getAllParkLots: result", { hasError: !!result.error, dataLength: result.data?.length })

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },
}
