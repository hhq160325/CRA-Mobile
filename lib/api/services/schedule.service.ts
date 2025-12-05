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
        console.log("scheduleService.getSchedulesByBooking:", bookingId)

        const result = await apiClient<Schedule[]>(
            API_ENDPOINTS.GET_SCHEDULES_BY_BOOKING(bookingId),
            {
                method: "GET",
            }
        )

        if (result.error) {
            console.error("scheduleService.getSchedulesByBooking: error", result.error)
            return { data: null, error: result.error }
        }

        console.log("scheduleService.getSchedulesByBooking: success", {
            count: result.data?.length || 0,
            schedules: result.data?.map(s => ({ type: s.scheduleType, status: s.status }))
        })

        return { data: result.data, error: null }
    },

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

    async getCheckInImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        console.log("scheduleService.getCheckInImages:", bookingId)

        try {
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'
            const url = `/Schedule/checkIn/images?BookingId=${bookingId}&isCheckIn=true`

            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token from localStorage:", e)
            }

            console.log("scheduleService.getCheckInImages: fetching from", `${baseUrl}${url}`)

            const response = await fetch(`${baseUrl}${url}`, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            })

            console.log("scheduleService.getCheckInImages: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("scheduleService.getCheckInImages: error response", errorText)
                return { data: null, error: new Error("Failed to fetch check-in images") }
            }

            const responseData = await response.json()
            console.log("scheduleService.getCheckInImages: success", responseData)

            // Extract images and description from the view object
            const images = responseData?.view?.urls || []
            const description = responseData?.view?.description || ""

            return { data: { images, description }, error: null }
        } catch (error) {
            console.error("scheduleService.getCheckInImages: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async getCheckOutImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        console.log("scheduleService.getCheckOutImages:", bookingId)

        try {
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'
            const url = `/Schedule/checkIn/images?BookingId=${bookingId}&isCheckIn=false`

            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token from localStorage:", e)
            }

            console.log("scheduleService.getCheckOutImages: fetching from", `${baseUrl}${url}`)

            const response = await fetch(`${baseUrl}${url}`, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            })

            console.log("scheduleService.getCheckOutImages: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("scheduleService.getCheckOutImages: error response", errorText)
                return { data: null, error: new Error("Failed to fetch check-out images") }
            }

            const responseData = await response.json()
            console.log("scheduleService.getCheckOutImages: success", responseData)

            // Extract images and description from the view object
            const images = responseData?.view?.urls || []
            const description = responseData?.view?.description || ""

            return { data: { images, description }, error: null }
        } catch (error) {
            console.error("scheduleService.getCheckOutImages: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async checkIn(
        bookingId: string,
        imageUris: string[],
        responsibleStaffId: string,
        description: string = "Pickup confirmation"
    ): Promise<{ data: any | null; error: Error | null }> {
        console.log("scheduleService.checkIn:", { bookingId, responsibleStaffId, imageCount: imageUris.length })

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
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'

            console.log("scheduleService.checkIn: uploading to", `${baseUrl}${url}`)
            console.log("scheduleService.checkIn: form data", {
                bookingId,
                responsibleStaffId,
                description,
                imageCount: imageUris.length
            })

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
                console.log("scheduleService.checkIn: non-JSON response, treating as success")
                data = { success: true }
            }

            console.log("scheduleService.checkIn: success", data)
            return { data, error: null }
        } catch (error) {
            console.error("scheduleService.checkIn: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async checkOut(
        bookingId: string,
        imageUris: string[],
        responsibleStaffId: string,
        description: string = "Return confirmation"
    ): Promise<{ data: any | null; error: Error | null }> {
        console.log("scheduleService.checkOut:", { bookingId, responsibleStaffId, imageCount: imageUris.length })

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
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'

            console.log("scheduleService.checkOut: uploading to", `${baseUrl}${url}`)
            console.log("scheduleService.checkOut: form data", {
                bookingId,
                responsibleStaffId,
                description,
                imageCount: imageUris.length
            })

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
            console.log("scheduleService.checkOut: raw response text:", responseText)

            let data: any

            try {
                data = JSON.parse(responseText)
                console.log("scheduleService.checkOut: parsed JSON response:", JSON.stringify(data, null, 2))
            } catch (parseError) {
                console.log("scheduleService.checkOut: non-JSON response, treating as success")
                console.log("scheduleService.checkOut: response text was:", responseText)
                data = { success: true, message: responseText }
            }

            console.log("scheduleService.checkOut: returning success with data:", data)
            return { data, error: null }
        } catch (error) {
            console.error("scheduleService.checkOut: caught error", error)
            return { data: null, error: error as Error }
        }
    },
}
