import { API_ENDPOINTS, API_CONFIG } from "../config"
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

// Helper function to get token consistently
const getAuthToken = (): string | null => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
            return localStorage.getItem("token")
        }
    } catch (e) {
        console.error("Failed to get token:", e)
    }
    return null
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
            const fullUrl = `${baseUrl}${url}`

            console.log('📸 getCheckInImages: fetching from', fullUrl)

            const token = getAuthToken()
            console.log('📸 getCheckInImages: token available:', !!token)

            const response = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json',
                },
            })

            console.log('📸 getCheckInImages: response status', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.log('📸 getCheckInImages: error response', errorText)

                // 500 error with "Object reference" means no checkin data exists yet - this is normal
                if (response.status === 500 && errorText.includes('Object reference')) {
                    console.log('📸 getCheckInImages: No checkin data exists yet (normal for new bookings)')
                    return { data: { images: [], description: '' }, error: null }
                }

                // 404 also means no data - return empty instead of error
                if (response.status === 404) {
                    return { data: { images: [], description: '' }, error: null }
                }

                return { data: null, error: new Error(`Failed to fetch check-in images: ${response.status}`) }
            }

            const responseData = await response.json()
            console.log('📸 getCheckInImages: response data', JSON.stringify(responseData, null, 2))

            // Extract images and description from the view object
            const images = responseData?.view?.urls || responseData?.urls || []
            const description = responseData?.view?.description || responseData?.description || ""

            console.log('📸 getCheckInImages: extracted', { imagesCount: images.length, description })

            return { data: { images, description }, error: null }
        } catch (error) {
            console.error('📸 getCheckInImages: exception', error)
            return { data: null, error: error as Error }
        }
    },

    async getCheckOutImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        try {
            const baseUrl = API_CONFIG.BASE_URL
            const url = `/Schedule/checkIn/images?BookingId=${bookingId}&isCheckIn=false`
            const fullUrl = `${baseUrl}${url}`

            console.log('📸 getCheckOutImages: fetching from', fullUrl)

            const token = getAuthToken()

            const response = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json',
                },
            })

            console.log('📸 getCheckOutImages: response status', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.log('📸 getCheckOutImages: error response', errorText)

                // 500 error with "Object reference" means no checkout data exists yet - this is normal
                if (response.status === 500 && errorText.includes('Object reference')) {
                    console.log('📸 getCheckOutImages: No checkout data exists yet (normal for pending returns)')
                    return { data: { images: [], description: '' }, error: null }
                }

                // 404 also means no data - return empty instead of error
                if (response.status === 404) {
                    return { data: { images: [], description: '' }, error: null }
                }

                return { data: null, error: new Error(`Failed to fetch check-out images: ${response.status}`) }
            }

            const responseData = await response.json()
            console.log('📸 getCheckOutImages: response data', JSON.stringify(responseData, null, 2))

            // Extract images and description from the view object
            const images = responseData?.view?.urls || responseData?.urls || []
            const description = responseData?.view?.description || responseData?.description || ""

            return { data: { images, description }, error: null }
        } catch (error) {
            console.error('📸 getCheckOutImages: exception', error)
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
            const token = getAuthToken()

            console.log('✅ checkIn: starting')
            console.log('✅ checkIn: bookingId', bookingId)
            console.log('✅ checkIn: staffId', responsibleStaffId)
            console.log('✅ checkIn: images count', imageUris.length)
            console.log('✅ checkIn: token available', !!token)

            const formData = new FormData()

            // Append BookingId (capital B as per API spec)
            formData.append('BookingId', bookingId)

            // Append ResponsibleStaffId (capital R and S as per API spec)
            formData.append('ResponsibleStaffId', responsibleStaffId)

            // Append Description (capital D as per API spec)
            formData.append('Description', description)

            // Append multiple images - React Native requires specific format
            imageUris.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `pickup_${index}.jpg`
                const match = /\.(\w+)$/.exec(filename)
                const ext = match ? match[1].toLowerCase() : 'jpg'
                const type = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'

                console.log(`✅ checkIn: adding image ${index + 1}:`, { filename, type, uri: imageUri.substring(0, 50) + '...' })

                // React Native FormData requires this specific object format for files
                formData.append('images', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any)
            })

            const url = API_ENDPOINTS.CHECK_IN
            const baseUrl = API_CONFIG.BASE_URL
            const fullUrl = `${baseUrl}${url}`

            console.log('✅ checkIn: posting to', fullUrl)

            const response = await fetch(fullUrl, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': '*/*',
                    // Note: Don't set Content-Type for FormData, let fetch set it with boundary
                },
                body: formData,
            })

            console.log('✅ checkIn: response status', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('✅ checkIn: error response', errorText)

                // Parse error message for user-friendly display
                let userMessage = "Check-in failed. Please try again."
                try {
                    const errorJson = JSON.parse(errorText)
                    if (errorJson.message) {
                        userMessage = errorJson.message
                    } else if (errorJson.title) {
                        userMessage = errorJson.title
                    } else if (errorJson.errors) {
                        userMessage = Object.values(errorJson.errors).flat().join(', ')
                    }
                } catch {
                    // If not JSON, use the raw error text if it's short enough
                    if (errorText.length < 200) {
                        userMessage = errorText
                    }
                }

                return { data: null, error: new Error(userMessage) }
            }

            const responseText = await response.text()
            console.log('✅ checkIn: success response', responseText)

            let data: any
            try {
                data = JSON.parse(responseText)
            } catch {
                data = { success: true, message: responseText || 'Check-in successful' }
            }

            return { data, error: null }
        } catch (error) {
            console.error('✅ checkIn: exception', error)
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
            const token = getAuthToken()

            console.log('🔄 checkOut: starting')
            console.log('🔄 checkOut: bookingId', bookingId)
            console.log('🔄 checkOut: staffId', responsibleStaffId)
            console.log('🔄 checkOut: images count', imageUris.length)
            console.log('🔄 checkOut: token available', !!token)

            const formData = new FormData()

            // Append BookingId (capital B as per API spec)
            formData.append('BookingId', bookingId)

            // Append ResponsibleStaffId (capital R and S as per API spec)
            formData.append('ResponsibleStaffId', responsibleStaffId)

            // Append Description (capital D as per API spec)
            formData.append('Description', description)

            // Append multiple images - React Native requires specific format
            imageUris.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `return_${index}.jpg`
                const match = /\.(\w+)$/.exec(filename)
                const ext = match ? match[1].toLowerCase() : 'jpg'
                const type = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'

                console.log(`🔄 checkOut: adding image ${index + 1}:`, { filename, type })

                // React Native FormData requires this specific object format for files
                formData.append('images', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any)
            })

            const url = API_ENDPOINTS.CHECK_OUT
            const baseUrl = API_CONFIG.BASE_URL
            const fullUrl = `${baseUrl}${url}`

            console.log('🔄 checkOut: posting to', fullUrl)

            const response = await fetch(fullUrl, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': '*/*',
                },
                body: formData,
            })

            console.log('🔄 checkOut: response status', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('🔄 checkOut: error response', errorText)

                // Parse error message for user-friendly display
                let userMessage = "Check-out failed. Please try again."
                try {
                    const errorJson = JSON.parse(errorText)
                    if (errorJson.message) {
                        userMessage = errorJson.message
                    } else if (errorJson.title) {
                        userMessage = errorJson.title
                    } else if (errorJson.errors) {
                        userMessage = Object.values(errorJson.errors).flat().join(', ')
                    }
                } catch {
                    // If not JSON, use the raw error text if it's short enough
                    if (errorText.length < 200) {
                        userMessage = errorText
                    }
                }

                return { data: null, error: new Error(userMessage) }
            }

            const responseText = await response.text()
            console.log('🔄 checkOut: success response', responseText)

            let data: any
            try {
                data = JSON.parse(responseText)
            } catch {
                data = { success: true, message: responseText || 'Check-out successful' }
            }

            return { data, error: null }
        } catch (error) {
            console.error('🔄 checkOut: exception', error)
            return { data: null, error: error as Error }
        }
    },
}
