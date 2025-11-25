import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface Schedule {
    id: string
    title: string
    location: string
    startDate: string
    endDate: string
    scheduleType: string
    priority: number
    note: string
    isBlocking: boolean
    carId: string
    userId: string
    bookingId: string
    status: string
    createdAt: string
}

export const scheduleService = {
    async getScheduleByBookingAndType(
        bookingId: string,
        scheduleType: "Pickup" | "Return"
    ): Promise<{ data: Schedule | null; error: Error | null }> {
        console.log("scheduleService.getScheduleByBookingAndType:", bookingId, scheduleType)

        const result = await apiClient<Schedule>(
            API_ENDPOINTS.GET_SCHEDULE_BY_BOOKING(bookingId, scheduleType),
            {
                method: "GET",
            }
        )

        if (result.error) {
            console.error("scheduleService.getScheduleByBookingAndType: error", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async checkIn(
        bookingId: string,
        imageUri: string,
        userId: string,
        carId: string
    ): Promise<{ data: any | null; error: Error | null }> {
        console.log("scheduleService.checkIn:", { bookingId, userId, carId })

        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token from localStorage:", e)
            }

            const formData = new FormData()

            const filename = imageUri.split('/').pop() || 'pickup.jpg'
            const match = /\.(\w+)$/.exec(filename)
            const type = match ? `image/${match[1]}` : 'image/jpeg'

            // Append image(s) - using 'images' as array field name
            formData.append('images', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            // Append required fields
            formData.append('userId', userId)
            formData.append('carId', carId)

            const url = API_ENDPOINTS.CHECK_IN
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'

            console.log("scheduleService.checkIn: uploading to", `${baseUrl}${url}`)
            console.log("scheduleService.checkIn: form data", { userId, carId, imageUri })

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            console.log("scheduleService.checkIn: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("scheduleService.checkIn: error response", errorText)
                return { data: null, error: new Error(`Check-in failed: ${response.status} - ${errorText}`) }
            }

            const responseText = await response.text()
            let data: any

            try {
                data = JSON.parse(responseText)
            } catch {
                console.log("scheduleService.checkIn: non-JSON response, treating as success")
                data = { success: true }
            }

            console.log("scheduleService.checkIn: success")
            return { data, error: null }
        } catch (error) {
            console.error("scheduleService.checkIn: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async checkOut(
        bookingId: string,
        imageUri: string,
        userId: string,
        carId: string
    ): Promise<{ data: any | null; error: Error | null }> {
        console.log("scheduleService.checkOut:", { bookingId, userId, carId })

        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token from localStorage:", e)
            }

            const formData = new FormData()

            const filename = imageUri.split('/').pop() || 'return.jpg'
            const match = /\.(\w+)$/.exec(filename)
            const type = match ? `image/${match[1]}` : 'image/jpeg'

            // Append image(s) - using 'images' as array field name
            formData.append('images', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            // Append required fields
            formData.append('userId', userId)
            formData.append('carId', carId)

            const url = API_ENDPOINTS.CHECK_OUT
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'

            console.log("scheduleService.checkOut: uploading to", `${baseUrl}${url}`)
            console.log("scheduleService.checkOut: form data", { userId, carId, imageUri })

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            console.log("scheduleService.checkOut: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("scheduleService.checkOut: error response", errorText)
                return { data: null, error: new Error(`Check-out failed: ${response.status} - ${errorText}`) }
            }

            const responseText = await response.text()
            let data: any

            try {
                data = JSON.parse(responseText)
            } catch {
                console.log("scheduleService.checkOut: non-JSON response, treating as success")
                data = { success: true }
            }

            console.log("scheduleService.checkOut: success")
            return { data, error: null }
        } catch (error) {
            console.error("scheduleService.checkOut: caught error", error)
            return { data: null, error: error as Error }
        }
    },
}
