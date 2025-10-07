// Bookings API Service
import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { mockBookings, type Booking } from "@/lib/mock-data/bookings"

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

export const bookingsService = {
  // Get user bookings
  async getBookings(userId: string): Promise<{ data: Booking[] | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const userBookings = mockBookings.filter((b) => b.userId === userId)
      return { data: userBookings, error: null }
    }

    const result = await apiClient<Booking[]>(API_ENDPOINTS.BOOKINGS, {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<{ data: Booking | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const booking = mockBookings.find((b) => b.id === id)
      return booking ? { data: booking, error: null } : { data: null, error: new Error("Booking not found") }
    }

    const result = await apiClient<Booking>(API_ENDPOINTS.BOOKING_DETAILS(id), {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Create booking
  async createBooking(data: CreateBookingData): Promise<{ data: Booking | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newBooking: Booking = {
        id: String(mockBookings.length + 1),
        userId: "1", // Current user
        carId: data.carId,
        carName: "Tesla Model S", // Would come from car data
        carImage: "/tesla-model-s-luxury.png",
        startDate: data.startDate,
        endDate: data.endDate,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        status: "upcoming",
        totalPrice: 450,
        bookingDate: new Date().toISOString(),
      }

      mockBookings.push(newBooking)
      return { data: newBooking, error: null }
    }

    const result = await apiClient<Booking>(API_ENDPOINTS.CREATE_BOOKING, {
      method: "POST",
      body: JSON.stringify(data),
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Cancel booking
  async cancelBooking(id: string): Promise<{ error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const booking = mockBookings.find((b) => b.id === id)
      if (booking) {
        booking.status = "cancelled"
      }
      return { error: null }
    }

    const result = await apiClient(API_ENDPOINTS.CANCEL_BOOKING(id), {
      method: "POST",
    })

    return { error: result.error }
  },
}
