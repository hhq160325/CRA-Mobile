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
    async getSchedulesByBooking(
        bookingId: string
    ): Promise<{ data: Schedule[] | null; error: Error | null }> {
        const result = await apiClient<Schedule[]>(
            API_ENDPOINTS.GET_SCHEDULES_BY_BOOKING(bookingId),
            {
                method: "GET",
            }
        )

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async getScheduleByBookingAndType(
        bookingId: string,
        scheduleType: "Pickup" | "Return"
    ): Promise<{ data: Schedule | null; error: Error | null }> {
        const result = await apiClient<Schedule>(
            API_ENDPOINTS.GET_SCHEDULE_BY_BOOKING(bookingId, scheduleType),
            {
                method: "GET",
            }
        )

        if (result.error) {
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async getCheckInImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        try {
            const baseUrl = API_CONFIG.BASE_URL
            const url = `/Schedule/checkIn/images?BookingId=${bookingId}&isCheckIn=true`

            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                // Failed to get token
            }

            const response = await fetch(`${baseUrl}${url}`, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            })

            if (!response.ok) {
                return { data: null, error: new Error("Failed to fetch check-in images") }
            }

            const responseData = await response.json()

            // Extract images and description from the view object
            const images = responseData?.view?.urls || []
            const description = responseData?.view?.description || ""

            return { data: { images, description }, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    },

    async getCheckOutImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        try {
            const baseUrl = API_CONFIG.BASE_URL
            const url = `/Schedule/checkIn/images?BookingId=${bookingId}&isCheckIn=false`

            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                // Failed to get token
            }

            const response = await fetch(`${baseUrl}${url}`, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            })

            if (!response.ok) {
                return { data: null, error: new Error("Failed to fetch check-out images") }
            }

            const responseData = await response.json()

            // Extract images and description from the view object
            const images = responseData?.view?.urls || []
            const description = responseData?.view?.description || ""

            return { data: { images, description }, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    },

    async checkIn(
        bookingId: string,
        imageUris: string[],
        responsibleStaffId: string,
        description: string = "Pickup confirmation"
    ): Promise<{ data: any | null; error: Error | null }> {
        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                // Failed to get token
            }

            const formData = new FormData()

            // Append BookingId (capital B as per API spec)
            formData.append('BookingId', bookingId)

            // Append ResponsibleStaffId (capital R and S as per API spec)
            formData.append('ResponsibleStaffId', responsibleStaffId)

            // Append Description (capital D as per API spec)
            formData.append('Description', description)

            // Append multiple images
            imageUris.forEach((imageUri) => {
                const filename = imageUri.split('/').pop() || 'pickup.jpg'
                const match = /\.(\w+)$/.exec(filename)
                const type = match ? `image/${match[1]}` : 'image/jpeg'

                formData.append('images', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any)
            })

            const url = API_ENDPOINTS.CHECK_IN
            const baseUrl = API_CONFIG.BASE_URL

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()

                // Parse error message for user-friendly display
                let userMessage = "Check-in failed. Please try again."
                try {
                    const errorJson = JSON.parse(errorText)
                    if (errorJson.message) {
                        userMessage = errorJson.message
                    }
                } catch {
                    // If not JSON, use the raw error text if it's short enough
                    if (errorText.length < 100) {
                        userMessage = errorText
                    }
                }

                return { data: null, error: new Error(userMessage) }
            }

            const responseText = await response.text()
            let data: any

            try {
                data = JSON.parse(responseText)
            } catch {
                data = { success: true }
            }

            return { data, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    },

    async checkOut(
        bookingId: string,
        imageUris: string[],
        responsibleStaffId: string,
        description: string = "Return confirmation"
    ): Promise<{ data: any | null; error: Error | null }> {
        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                // Failed to get token
            }

            const formData = new FormData()

            // Append BookingId (capital B as per API spec)
            formData.append('BookingId', bookingId)

            // Append ResponsibleStaffId (capital R and S as per API spec)
            formData.append('ResponsibleStaffId', responsibleStaffId)

            // Append Description (capital D as per API spec)
            formData.append('Description', description)

            // Append multiple images
            imageUris.forEach((imageUri) => {
                const filename = imageUri.split('/').pop() || 'return.jpg'
                const match = /\.(\w+)$/.exec(filename)
                const type = match ? `image/${match[1]}` : 'image/jpeg'

                formData.append('images', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any)
            })

            const url = API_ENDPOINTS.CHECK_OUT
            const baseUrl = API_CONFIG.BASE_URL

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()

                // Parse error message for user-friendly display
                let userMessage = "Check-out failed. Please try again."
                try {
                    const errorJson = JSON.parse(errorText)
                    if (errorJson.message) {
                        userMessage = errorJson.message
                    }
                } catch {
                    // If not JSON, use the raw error text if it's short enough
                    if (errorText.length < 100) {
                        userMessage = errorText
                    }
                }

                return { data: null, error: new Error(userMessage) }
            }

            const responseText = await response.text()

            let data: any

            try {
                data = JSON.parse(responseText)
            } catch (parseError) {
                data = { success: true, message: responseText }
            }

            return { data, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    },
}
