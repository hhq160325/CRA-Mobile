
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api",
  TIMEOUT: 30000,
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/User/authenticate",
  REGISTER: "/User/Signup",
  LOGOUT: "/auth/logout",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",

  // Cars
  CARS: "/Car/AllCars",
  CAR_DETAILS: (id: string) => `/Car/${id}`,
  CAR_SEARCH: "/cars/search",
  CAR_FILTER: "/cars/filter",

  // Bookings
  BOOKINGS: "/Booking/GetAllBookings",
  BOOKING_DETAILS: (id: string) => `/Booking/GetBookingById/${id}`,
  BOOKINGS_BY_CUSTOMER: (customerId: string) => `/Booking/GetBookingsFromCustomer/${customerId}`,
  BOOKINGS_BY_CAR: (carId: string) => `/Booking/GetBookingsForCar/${carId}`,
  CREATE_BOOKING: "/Booking/CreateBooking",
  UPDATE_BOOKING: "/Booking/UpdateBooking",
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  // Feedback (Reviews)
  ALL_FEEDBACK: "/Feedback/All",
  FEEDBACK_BY_CAR: (carId: string) => `/Feedback/${carId}`,
  CREATE_FEEDBACK: "/Feedback",
  UPDATE_FEEDBACK: (id: string) => `/Feedback/${id}`,
  DELETE_FEEDBACK: (id: string) => `/Feedback/${id}`,

  // User
  USER_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",

  // Payments & Invoices
  GET_USER: (userId: string) => `/User/${userId}`,

  // Invoice endpoints
  ALL_INVOICES: "/api/Invoice/AllInvoices",
  INVOICES_BY_CUSTOMER: (cusId: string) => `/api/Invoice/AllInvoicesFromCustomer/${cusId}`,
  INVOICES_BY_VENDOR: (vendorId: string) => `/api/Invoice/AllInvoicesToVendor/${vendorId}`,
  GET_INVOICE: (invoiceId: string) => `/${invoiceId}`,
  CREATE_INVOICE: "/api/Invoice/CreateInvoice",
  UPDATE_INVOICE: "/api/Invoice/UpdateInvoice",
  INVOICE_COMPLETE: "/api/Invoice/InvoiceComplete",
  INVOICE_FAILED: "/api/Invoice/InvoiceFailed",

  // PayOS Payment endpoints
  GET_PAYOS_PAYMENT: (orderCode: string) => `/PayOSPayment/${orderCode}`,
  GET_PAYMENT: (orderCode: string) => `/Payment/${orderCode}`,
  CREATE_PAYOS_PAYMENT: "/CreatePayOSPaymentRequest",
  CREATE_PAYMENT_FROM_INVOICE: (invoiceId: string) => `/api/Payment/CreatePaymentFromInvoice/${invoiceId}`,

  // Legacy payment endpoints (keeping for backward compatibility)
  PAYMENT_INTENT: "/payments/intent",
  CREATE_PAYMENT: "/payments/create",
  PAYMENT_DETAILS: (id: string) => `/payments/${id}`,
  PAYMENT_BY_BOOKING: (bookingId: string) => `/payments/booking/${bookingId}`,
  PAYMENT_HISTORY: "/payments/history",
  ALL_PAYMENTS: "/payments/all",
  VERIFY_PAYMENT: (id: string) => `/payments/${id}/verify`,
  CANCEL_PAYMENT: (id: string) => `/payments/${id}/cancel`,
  REFUND_PAYMENT: "/payments/refund",
  PAYMENT_RECEIPT: (id: string) => `/payments/${id}/receipt`,
  PAYMENT_STATS: "/payments/stats",
  PAYMENT_WEBHOOK: "/payments/webhook",

  // Locations
  LOCATIONS: "/locations",
  LOCATION_DETAILS: (id: string) => `/locations/${id}`,
  LOCATIONS_NEARBY: "/locations/nearby",
  CARS_NEARBY: "/cars/nearby",
  CALCULATE_ROUTE: "/locations/route",
  GEOCODE: "/locations/geocode",
  REVERSE_GEOCODE: "/locations/reverse-geocode",
}
