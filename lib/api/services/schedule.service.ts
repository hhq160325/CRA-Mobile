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

    async getCheckInOutInfo(
        bookingId: string,
        isCheckIn: boolean
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {
        try {
            const baseUrl = API_CONFIG.BASE_URL
            const url = API_ENDPOINTS.CHECK_IN_OUT_INFO(bookingId, isCheckIn)
            const fullUrl = `${baseUrl}${url}`

            console.log(`📸 getCheckInOutInfo (${isCheckIn ? 'check-in' : 'check-out'}): fetching from`, fullUrl)

            const token = getAuthToken()

            const response = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': '*/*',
                },
            })

            if (!response.ok) {
                const errorText = await response.text()

                // Handle expected cases where no data exists yet
                if (response.status === 500 && errorText.includes('Object reference')) {
                    console.log(`📸 getCheckInOutInfo (${isCheckIn ? 'check-in' : 'check-out'}): No data exists yet for booking ${bookingId}`)
                    return { data: { images: [], description: '' }, error: null }
                }

                if (response.status === 404) {
                    console.log(`📸 getCheckInOutInfo (${isCheckIn ? 'check-in' : 'check-out'}): No data found for booking ${bookingId}`)
                    return { data: { images: [], description: '' }, error: null }
                }

                // Only log actual errors
                console.log(`📸 getCheckInOutInfo: response status ${response.status}`)
                console.log(`📸 getCheckInOutInfo: error response`, errorText)
                return { data: null, error: new Error(`Failed to fetch info: ${response.status}`) }
            }

            const responseData = await response.json()
            console.log(`📸 getCheckInOutInfo: response data`, JSON.stringify(responseData, null, 2))


            const viewData = responseData?.view || responseData
            const images = viewData?.urls || []
            const description = viewData?.description || ""

            console.log(`📸 getCheckInOutInfo: extracted`, { imagesCount: images.length, description })

            return { data: { images, description }, error: null }
        } catch (error) {
            console.error(`📸 getCheckInOutInfo: exception`, error)
            return { data: null, error: error as Error }
        }
    },

    async getCheckInImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {

        return this.getCheckInOutInfo(bookingId, true)
    },

    async getCheckOutImages(
        bookingId: string
    ): Promise<{ data: { images: string[]; description: string } | null; error: Error | null }> {

        return this.getCheckInOutInfo(bookingId, false)
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


            formData.append('BookingId', bookingId)


            formData.append('ResponsibleStaffId', responsibleStaffId)


            formData.append('Description', description)


            imageUris.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `pickup_${index}.jpg`
                const match = /\.(\w+)$/.exec(filename)
                const ext = match ? match[1].toLowerCase() : 'jpg'
                const type = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'

                console.log(`✅ checkIn: adding image ${index + 1}:`, { filename, type, uri: imageUri.substring(0, 50) + '...' })


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

                },
                body: formData,
            })

            console.log('✅ checkIn: response status', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('✅ checkIn: error response', errorText)


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
                data = responseText ? JSON.parse(responseText) : { success: true }
            } catch {

                data = { success: true, message: responseText || 'Check-in successful' }
            }

            console.log('✅ checkIn: parsed data', data)
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


            formData.append('BookingId', bookingId)


            formData.append('ResponsibleStaffId', responsibleStaffId)


            formData.append('Description', description)


            imageUris.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `return_${index}.jpg`
                const match = /\.(\w+)$/.exec(filename)
                const ext = match ? match[1].toLowerCase() : 'jpg'
                const type = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'

                console.log(`🔄 checkOut: adding image ${index + 1}:`, { filename, type })


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
