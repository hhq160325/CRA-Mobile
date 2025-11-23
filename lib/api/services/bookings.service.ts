
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

// API Response from backend
interface ApiBookingResponse {
  id: string
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
  userId: string
  carId: string
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
  addons?: string[]
}

// Map API response to app Booking model
function mapApiBookingToBooking(apiBooking: ApiBookingResponse): Booking {
  // Map status
  let status: "upcoming" | "completed" | "cancelled" = "upcoming"
  const apiStatus = apiBooking.status?.toLowerCase()
  if (apiStatus === "completed" || apiStatus === "finished") {
    status = "completed"
  } else if (apiStatus === "cancelled" || apiStatus === "canceled") {
    status = "cancelled"
  }

  return {
    id: apiBooking.id,
    userId: apiBooking.userId,
    carId: apiBooking.carId,
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

    // Map API response to app model
    const mappedData = result.data?.map(mapApiBookingToBooking) || null
    return { data: mappedData, error: null }
  },

  async getBookingById(id: string): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("bookingsService.getBookingById: fetching booking", id)
    const result = await apiClient<ApiBookingResponse>(API_ENDPOINTS.BOOKING_DETAILS(id), { method: "GET" })
    console.log("bookingsService.getBookingById: result", { hasError: !!result.error, hasData: !!result.data })

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Map API response to app model
    const mappedData = result.data ? mapApiBookingToBooking(result.data) : null
    return { data: mappedData, error: null }
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

    if (result.error) {
      return { data: null, error: result.error }
    }

    // API can return either a PayOS URL (string) or a Booking object
    // If it's a string (URL), return as-is
    if (typeof result.data === 'string') {
      console.log("bookingsService.createBooking: received PayOS URL")
      return { data: result.data, error: null }
    }

    // Otherwise, map API response to app model
    const mappedData = result.data ? mapApiBookingToBooking(result.data) : null
    return { data: mappedData, error: null }
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
}
