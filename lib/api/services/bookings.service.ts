
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

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

export interface CreateBookingData {
  carId: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropoffLocation: string
  driverInfo: {
    name: string
    email: string
    phone: string
    licenseNumber: string
  }
  addons?: string[]
}

export interface UpdateBookingData {
  id: string
  carId?: string
  startDate?: string
  endDate?: string
  pickupLocation?: string
  dropoffLocation?: string
  status?: "upcoming" | "completed" | "cancelled"
  driverInfo?: {
    name: string
    email: string
    phone: string
    licenseNumber: string
  }
  addons?: string[]
}

export const bookingsService = {
  // Get all bookings (admin/staff)
  async getAllBookings(): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getAllBookings: fetching all bookings")
    const result = await apiClient<Booking[]>(API_ENDPOINTS.BOOKINGS, { method: "GET" })
    console.log("bookingsService.getAllBookings: result", { hasError: !!result.error, dataLength: result.data?.length })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Get bookings for a specific customer
  async getBookings(userId: string): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getBookings: fetching bookings for user", userId)
    const result = await apiClient<Booking[]>(API_ENDPOINTS.BOOKINGS_BY_CUSTOMER(userId), { method: "GET" })
    console.log("bookingsService.getBookings: result", { hasError: !!result.error, dataLength: result.data?.length })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async getBookingById(id: string): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("bookingsService.getBookingById: fetching booking", id)
    const result = await apiClient<Booking>(API_ENDPOINTS.BOOKING_DETAILS(id), { method: "GET" })
    console.log("bookingsService.getBookingById: result", { hasError: !!result.error, hasData: !!result.data })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Get bookings for a specific car
  async getBookingsForCar(carId: string): Promise<{ data: Booking[] | null; error: Error | null }> {
    console.log("bookingsService.getBookingsForCar: fetching bookings for car", carId)
    const result = await apiClient<Booking[]>(API_ENDPOINTS.BOOKINGS_BY_CAR(carId), { method: "GET" })
    console.log("bookingsService.getBookingsForCar: result", { hasError: !!result.error, dataLength: result.data?.length })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async createBooking(data: CreateBookingData): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("bookingsService.createBooking: creating booking", data)
    const result = await apiClient<Booking>(API_ENDPOINTS.CREATE_BOOKING, {
      method: "POST",
      body: JSON.stringify(data),
    })
    console.log("bookingsService.createBooking: result", { hasError: !!result.error, hasData: !!result.data })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async updateBooking(data: UpdateBookingData): Promise<{ data: Booking | null; error: Error | null }> {
    console.log("bookingsService.updateBooking: updating booking", data.id)
    const result = await apiClient<Booking>(API_ENDPOINTS.UPDATE_BOOKING, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    console.log("bookingsService.updateBooking: result", { hasError: !!result.error, hasData: !!result.data })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  async cancelBooking(id: string): Promise<{ error: Error | null }> {
    console.log("bookingsService.cancelBooking: cancelling booking", id)
    const result = await apiClient(API_ENDPOINTS.CANCEL_BOOKING(id), { method: "POST" })
    console.log("bookingsService.cancelBooking: result", { hasError: !!result.error })
    return { error: result.error }
  },
}
