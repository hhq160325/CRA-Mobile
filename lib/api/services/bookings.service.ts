
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

// API Response from backend
interface ApiBookingResponse {
  id: string
  bookingNumber?: string
  pickupPlace: string
  pickupTime: string
  dropoffPlace: string
  dropoffTime: string
  createDate: string
  updateDate: string
  status: string
  userId: string
  carId: string
  invoiceId: string
  user?: any
  invoice?: any
  car?: any
}

// App Booking model
export interface Booking {
  id: string
  bookingNumber?: string
  userId: string
  carId: string
  invoiceId: string
  carName: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropoffLocation: string
  status: "upcoming" | "completed" | "cancelled"
  totalPrice: number
  bookingDate: string
  driverInfo?: {
    name: string
    email: string
    phone: string
    licenseNumber: string
  }
  carDetails?: any
  userDetails?: any
  addons?: string[]
}

// Map API response to app Booking model
function mapApiBookingToBooking(apiBooking: ApiBookingResponse): Booking {
  // Map status from backend to app
  // Backend statuses: cancelled, confirmed, completed
  // App statuses: cancelled, upcoming, completed
  let status: "upcoming" | "completed" | "cancelled" = "upcoming"
  const apiStatus = apiBooking.status?.toLowerCase()

  if (apiStatus === "completed") {
    status = "completed"
  } else if (apiStatus === "cancelled") {
    status = "cancelled"
  } else if (apiStatus === "confirmed") {
    // Confirmed bookings are "completed" in the app (payment confirmed)
    status = "completed"
  } else {
    // Default to upcoming for any other status
    status = "upcoming"
  }

  return {
    id: apiBooking.id,
    bookingNumber: apiBooking.bookingNumber,
    userId: apiBooking.userId,
    carId: apiBooking.carId,
    invoiceId: apiBooking.invoiceId,
    carName: apiBooking.car?.model || apiBooking.car?.name || "Unknown Car",
    carImage: apiBooking.car?.imageUrls?.[0] || apiBooking.car?.image || "",
    startDate: apiBooking.pickupTime,
    endDate: apiBooking.dropoffTime,
    pickupLocation: apiBooking.pickupPlace,
    dropoffLocation: apiBooking.dropoffPlace,
    status: status,
    totalPrice: apiBooking.invoice?.amount || 0,
    bookingDate: apiBooking.createDate,
  }
}

export interface CreateBookingData {
  customerId: string
  carId: string
  pickupPlace: string
  pickupTime: string
  dropoffPlace: string
  dropoffTime: string
  bookingFee?: number
  carRentPrice: number
  rentime: number
  rentType: string
  request?: string // Required by API
}

export interface UpdateBookingData {
  id: string
  carId?: string
  startDate?: string
  endDate?: string
  pickupLocation?: string
  dropoffLocation?: string
  status?: "upcoming" | "completed" | "cancelled" | "pending_payment" | "paid"
  paymentMethod?: "cash" | "qr-payos"
  driverInfo?: {
    name: string
    email: string
    phone: string
    licenseNumber: string
  }
  addons?: string[]
}

export const bookingsService = {

  async getAllBookings(): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getAllBookings: fetching all bookings")
    const result = await apiClient<ApiBookingResponse[]>(API_ENDPOINTS.BOOKINGS, { method: "GET" })
    console.log("bookingsService.getAllBookings: result", { hasError: !!result.error, dataLength: result.data?.length })

    // Log sample booking data to understand structure
    if (result.data && result.data.length > 0) {
      console.log("📋 Sample booking from API:", JSON.stringify(result.data[0], null, 2));
    }

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data?.map(mapApiBookingToBooking) || null
    return { data: mappedData, error: null }
  },


  async getBookings(userId: string): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getBookings: fetching bookings for user", userId)

    // Try the customer-specific endpoint first
    let result = await apiClient<ApiBookingResponse[]>(API_ENDPOINTS.BOOKINGS_BY_CUSTOMER(userId), { method: "GET" })

    // If it fails with 404, fallback to getting all bookings and filter client-side
    if (result.error && result.error.message.includes('404')) {
      console.log("bookingsService.getBookings: customer endpoint not found, trying getAllBookings")
      result = await apiClient<ApiBookingResponse[]>(API_ENDPOINTS.BOOKINGS, { method: "GET" })

      if (!result.error && result.data) {
        // Filter bookings for this user
        result.data = result.data.filter(booking => booking.userId === userId)
        console.log("bookingsService.getBookings: filtered bookings", { dataLength: result.data.length })
      }
    }

    console.log("bookingsService.getBookings: result", { hasError: !!result.error, dataLength: result.data?.length })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model and enrich with car details
    if (result.data && result.data.length > 0) {
      const { carsService } = require("./cars.service")

      const enrichedBookings = await Promise.all(
        result.data.map(async (booking) => {
          const mapped = mapApiBookingToBooking(booking)

          // If car details are missing, fetch them
          if (mapped.carName === "Unknown Car" && booking.carId) {
            try {
              const carResult = await carsService.getCarById(booking.carId)
              if (carResult.data) {
                mapped.carName = carResult.data.name
                mapped.carImage = carResult.data.image
                // Calculate total price if missing
                if (mapped.totalPrice === 0 && carResult.data.price) {
                  const days = Math.ceil((new Date(mapped.endDate).getTime() - new Date(mapped.startDate).getTime()) / (1000 * 60 * 60 * 24))
                  mapped.totalPrice = carResult.data.price * days
                }
              }
            } catch (err) {
              console.log(`Could not fetch car details for booking ${booking.id}`)
            }
          }

          return mapped
        })
      )

      return { data: enrichedBookings, error: null }
    }

    const mappedData = result.data?.map(mapApiBookingToBooking) || null
    return { data: mappedData, error: null }
  },

  async getBookingById(id: string): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("🔍 bookingsService.getBookingById: fetching booking", id)
    console.log("🔍 bookingsService.getBookingById: endpoint", API_ENDPOINTS.BOOKING_DETAILS(id))

    const result = await apiClient<ApiBookingResponse>(API_ENDPOINTS.BOOKING_DETAILS(id), { method: "GET" })

    console.log("🔍 bookingsService.getBookingById: result", {
      hasError: !!result.error,
      hasData: !!result.data,
      errorMessage: result.error?.message,
      rawData: result.data ? {
        id: result.data.id,
        userId: result.data.userId,
        bookingNumber: result.data.bookingNumber,
        status: result.data.status,
        carId: result.data.carId
      } : null
    })

    if (result.error) {
      console.log("🔍 bookingsService.getBookingById: returning error", result.error.message)
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data ? mapApiBookingToBooking(result.data) : null
    console.log("🔍 bookingsService.getBookingById: mapped data", mappedData ? {
      id: mappedData.id,
      userId: mappedData.userId,
      bookingNumber: mappedData.bookingNumber,
      carName: mappedData.carName,
      status: mappedData.status
    } : null)

    return { data: mappedData, error: null }
  },

  async getBookingByNumber(bookingNumber: string): Promise<{ data: any | null; error: Error | null }> {
    console.log("🔍 bookingsService.getBookingByNumber: fetching booking", bookingNumber)
    console.log("🔍 bookingsService.getBookingByNumber: endpoint", API_ENDPOINTS.BOOKING_BY_NUMBER(bookingNumber))

    const result = await apiClient<any>(API_ENDPOINTS.BOOKING_BY_NUMBER(bookingNumber), { method: "GET" })

    console.log("🔍 bookingsService.getBookingByNumber: result", {
      hasError: !!result.error,
      hasData: !!result.data,
      errorMessage: result.error?.message,
      hasCar: !!result.data?.car,
      carData: result.data?.car ? {
        model: result.data.car.model,
        manufacturer: result.data.car.manufacturer,
        licensePlate: result.data.car.licensePlate
      } : null
    })

    if (result.error) {
      console.log("🔍 bookingsService.getBookingByNumber: returning error", result.error.message)
      return { data: null, error: result.error }
    }

    // Return raw data since it includes car details
    console.log("🔍 bookingsService.getBookingByNumber: returning raw data with car details")
    return { data: result.data, error: null }
  },

  async getBookingsForCar(carId: string): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getBookingsForCar: fetching bookings for car", carId)
    const result = await apiClient<ApiBookingResponse[]>(API_ENDPOINTS.BOOKINGS_BY_CAR(carId), { method: "GET" })
    console.log("bookingsService.getBookingsForCar: result", { hasError: !!result.error, dataLength: result.data?.length })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data?.map(mapApiBookingToBooking) || null
    return { data: mappedData, error: null }
  },

  async createBooking(data: CreateBookingData): Promise<{ data: any; error: Error | null }> {
    console.log("bookingsService.createBooking: creating booking", data)
    const result = await apiClient<any>(API_ENDPOINTS.CREATE_BOOKING, {
      method: "POST",
      body: JSON.stringify(data),
    })
    console.log("bookingsService.createBooking: result", { hasError: !!result.error, hasData: !!result.data })
    console.log("bookingsService.createBooking: raw response data", result.data)

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Return raw response data without mapping
    // This preserves bookingId, paymentUrl, and other fields from API
    return { data: result.data, error: null }
  },

  async updateBooking(data: UpdateBookingData): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("bookingsService.updateBooking: updating booking", data.id)
    const result = await apiClient<ApiBookingResponse>(API_ENDPOINTS.UPDATE_BOOKING, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    console.log("bookingsService.updateBooking: result", { hasError: !!result.error, hasData: !!result.data })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data ? mapApiBookingToBooking(result.data) : null
    return { data: mappedData, error: null }
  },

  async cancelBooking(id: string): Promise<{ error: Error | null }> {
    console.log("bookingsService.cancelBooking: cancelling booking", id)
    const result = await apiClient(API_ENDPOINTS.CANCEL_BOOKING(id), { method: "POST" })
    console.log("bookingsService.cancelBooking: result", { hasError: !!result.error })
    return { error: result.error }
  },

  async updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled"): Promise<{ data: any | null; error: Error | null }> {
    console.log("bookingsService.updateBookingStatus: updating booking status", { bookingId, status })

    // Simple approach: just send bookingId and status
    const updateData = {
      bookingId: bookingId,
      status: status,
    }

    console.log("bookingsService.updateBookingStatus: sending update data", updateData)

    const result = await apiClient(API_ENDPOINTS.UPDATE_BOOKING_STATUS, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    })

    console.log("bookingsService.updateBookingStatus: result", { hasError: !!result.error })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async updateBookingPayment(bookingId: string, status: "paid" | "cancelled"): Promise<{ data: any | null; error: Error | null }> {
    console.log("bookingsService.updateBookingPayment: updating booking payment", { bookingId, status })

    // Try different endpoint variations and HTTP methods
    const attempts = [
      // Attempt 1: POST with body (bookingId in body)
      {
        endpoint: API_ENDPOINTS.UPDATE_BOOKING_PAYMENT,
        method: "POST",
        body: { bookingId, status },
        description: "POST with bookingId in body"
      },
      // Attempt 2: PATCH with body
      {
        endpoint: API_ENDPOINTS.UPDATE_BOOKING_PAYMENT,
        method: "PATCH",
        body: { bookingId, status },
        description: "PATCH with bookingId in body"
      },
      // Attempt 3: PUT with body
      {
        endpoint: API_ENDPOINTS.UPDATE_BOOKING_PAYMENT,
        method: "PUT",
        body: { bookingId, status },
        description: "PUT with bookingId in body"
      },
      // Attempt 4: POST with bookingId in URL
      {
        endpoint: API_ENDPOINTS.UPDATE_BOOKING_PAYMENT_BY_ID(bookingId),
        method: "POST",
        body: { status },
        description: "POST with bookingId in URL"
      },
      // Attempt 5: PATCH with bookingId in URL
      {
        endpoint: API_ENDPOINTS.UPDATE_BOOKING_PAYMENT_BY_ID(bookingId),
        method: "PATCH",
        body: { status },
        description: "PATCH with bookingId in URL"
      },
    ]

    for (const attempt of attempts) {
      console.log(`bookingsService.updateBookingPayment: trying ${attempt.description}...`)

      const result = await apiClient(attempt.endpoint, {
        method: attempt.method as any,
        body: JSON.stringify(attempt.body),
      })

      // If successful, return immediately
      if (!result.error) {
        console.log(`✅ Success with ${attempt.description}`)
        console.log("bookingsService.updateBookingPayment: result", { hasError: false, hasData: !!result.data })
        return { data: result.data, error: null }
      }

      // If not 404, it's a different error - return it
      if (!result.error.message.includes('404')) {
        console.error(`❌ Failed with ${attempt.description}:`, result.error.message)
        return { data: null, error: result.error }
      }

      console.log(`⚠️ 404 with ${attempt.description}, trying next...`)
    }

    // All attempts failed
    console.error("❌ All attempts failed to update booking payment")
    return {
      data: null,
      error: new Error("Failed to update booking payment: endpoint not found. Please check API documentation.")
    }
  },
}
