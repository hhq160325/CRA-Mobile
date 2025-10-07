// API Configuration
// Toggle between mock and real API by changing USE_MOCK_DATA
export const API_CONFIG = {
  USE_MOCK_DATA: true, // Set to true to use local mock data for testing
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.yourdomain.com",
  TIMEOUT: 10000,
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",

  // Cars
  CARS: "/cars",
  CAR_DETAILS: (id: string) => `/cars/${id}`,
  CAR_SEARCH: "/cars/search",
  CAR_FILTER: "/cars/filter",

  // Bookings
  BOOKINGS: "/bookings",
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
  CREATE_BOOKING: "/bookings/create",
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  // Reviews
  REVIEWS: (carId: string) => `/cars/${carId}/reviews`,
  CREATE_REVIEW: "/reviews/create",

  // User
  USER_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",
}
