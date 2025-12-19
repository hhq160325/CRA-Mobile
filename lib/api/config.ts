// Get base URL from environment variable
// For React Native, we need to use a different approach than process.env
const getBaseUrl = () => {
  // In development, you can set this in .env file
  // In production, this should be configured through your build process
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // For Expo development - always use Azure directly to avoid tunnel issues
  if (__DEV__) {
    console.log("🔧 Development mode: Using Azure URL directly for stable connection")
    console.log("💡 This avoids ER_NGROK_3200 and tunnel expiration issues")
  }

  // Production Azure URL - stable and fast for both dev and prod
  return "https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api"
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: __DEV__ ? 20000 : 15000, // Slightly longer timeout for Expo development
  RETRY_ATTEMPTS: __DEV__ ? 1 : 2, // Fewer retries in dev for faster feedback
  RETRY_DELAY: 1000,
  // Development flags
  ENABLE_LOGGING: __DEV__,
  ENABLE_DEBUG: __DEV__,
}

// Helper to get base URL without /api suffix for direct API calls
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL.replace('/api', '')
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/Authen/authenticate",
  REGISTER: "/Authen/SignUp",
  LOGOUT: "/Authen/Logout",
  SEND_OTP: "/Authen/otp/send",
  VERIFY_OTP: "/Authen/SignUp/verify",

  // Alternative paths to try: /Authen/forgotPassword, /Authen/request-reset, /User/forgot-password
  FORGOT_PASSWORD: "/Authen/ForgotPassword",
  RESET_PASSWORD: "/Authen/ResetPassword",
  RESET_PASSWORD_BY_PHONE: "/Authen/ResetPasswordByPhone",
  VERIFY_RESET_CODE: "/Authen/VerifyResetCode",

  // User password change endpoints
  CHANGE_PASSWORD: "/User/reset-password",
  VERIFY_PASSWORD_CHANGE: (email: string, otpCode: string) => `/User/reset-password/verify?email=${encodeURIComponent(email)}&OTPCode=${otpCode}`,
  LOGIN_GOOGLE: "/Authen/login/google",
  REFRESH_TOKEN: "/Authen/refresh-token",

  // Cars
  CARS: "/Car/AllCars",
  CAR_DETAILS: (id: string) => `/Car/${id}`,
  CAR_RENTAL_RATE: (carId: string) => `/Car/rentalRate/${carId}`,
  CAR_SEARCH: "/cars/search",
  CAR_FILTER: "/cars/filter",

  // Bookings
  BOOKINGS: "/Booking/GetAllBookings",
  BOOKING_DETAILS: (id: string) => `/Booking/GetBookingById/${id}`,
  BOOKING_BY_NUMBER: (bookingNumber: string) => `/Booking/GetBookingsByBookNum/${bookingNumber}`,
  BOOKINGS_BY_CUSTOMER: (customerId: string) => `/Booking/GetBookingsFromCustomer/${customerId}`,
  BOOKINGS_BY_CAR: (carId: string) => `/Booking/GetBookingsForCar/${carId}`,
  CREATE_BOOKING: "/Booking/CreateBooking",
  UPDATE_BOOKING: "/Booking/UpdateBooking",
  UPDATE_BOOKING_STATUS: "/Booking/UpdateBooking",
  UPDATE_BOOKING_PAYMENT: "/UpdatePayment/Booking/BookingPayment",
  UPDATE_BOOKING_PAYMENT_BY_ID: (bookingId: string) => `/UpdatePayment/Booking/BookingPayment/${bookingId}`,
  UPDATE_RENTAL_PAYMENT: "/UpdatePayment/Booking/RentalPayment",
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  // Feedback (Reviews)
  ALL_FEEDBACK: "/Feedback/All",
  FEEDBACK_BY_CAR: (carId: string) => `/Feedback/${carId}`,
  CREATE_FEEDBACK: "/Feedback",
  UPDATE_FEEDBACK: (id: string) => `/Feedback/UpdateFeedback/${id}`,
  DELETE_FEEDBACK: (id: string) => `/Feedback/DeleteFeedback/${id}`,

  // User
  USER_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",
  GET_ALL_USERS: "/User/GetAllUsers",
  UPDATE_USER_INFO: "/User/UpdateUserInfo",
  UPLOAD_AVATAR: (userId: string) => `/User/upload-avatar/${userId}`,
  UPLOAD_DRIVER_LICENSE: (userId: string) => `/User/driverLicense/${userId}`,
  GET_DRIVER_LICENSE: (userId: string, email: string) => `/User/driverLicense?UserId=${userId}&Email=${encodeURIComponent(email)}`,
  GET_ALL_DRIVER_LICENSES: "/User/driverLicense/all",

  // Payments & Invoices
  GET_USER: (userId: string) => `/User/GetUserById?userId=${userId}`,

  // Invoice endpoints
  ALL_INVOICES: "/Invoice/AllInvoices",
  INVOICES_BY_CUSTOMER: (cusId: string) => `/Invoice/AllInvoicesFromCustomer/${cusId}`,
  INVOICES_BY_VENDOR: (vendorId: string) => `/Invoice/AllInvoicesToVendor/${vendorId}`,
  GET_INVOICE: (invoiceId: string) => `/Invoice/${invoiceId}`,
  CREATE_INVOICE: "/Invoice/CreateInvoice",
  UPDATE_INVOICE: "/Invoice/UpdateInvoice",
  INVOICE_COMPLETE: "/Invoice/InvoiceComplete",
  INVOICE_FAILED: "/Invoice/InvoiceFailed",
  UPDATE_ALL_INVOICE_PAYMENTS: "/UpdatePayment/Booking/BookingPayment",
  GET_BOOKING_PAYMENTS: (bookingId: string) => `/Booking/${bookingId}/Payments`,

  // PayOS Payment endpoints
  GET_PAYOS_PAYMENT: (orderCode: string) => `/PayOSPayment/${orderCode}`,
  GET_PAYMENT: (orderCode: string) => `/Payment/${orderCode}`,
  CREATE_PAYOS_PAYMENT: "/CreatePayOSPaymentRequest",
  CREATE_PAYMENT_FROM_INVOICE: (invoiceId: string) => `/Payment/CreatePaymentFromInvoice/${invoiceId}`,
  CREATE_RENTAL_PAYMENT: "/PayOS/Booking/CreateRentalPayment",

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
  REVERSE_GEOCODE: "/TrackAsia/GetReverseGeocoding",
  PARK_LOTS: "/ParkLot",

  // Notifications
  GET_NOTIFICATIONS: (userId: string) => `/Notification/GetNotificationsForUser/${userId}`,
  MARK_NOTIFICATION_READ: (notificationId: string) => `/Notification/MarkAsRead/${notificationId}`,
  DELETE_NOTIFICATION: (notificationId: string) => `/Notification/DeleteNotification/${notificationId}`,

  // Schedules
  GET_SCHEDULE_BY_BOOKING: (bookingId: string, scheduleType: string) => `/Schedule/GetLastScheduleByBookingAndType/${bookingId}/${scheduleType}`,
  GET_SCHEDULES_BY_BOOKING: (bookingId: string) => `/Schedule/booking?bookingId=${bookingId}`,
  CHECK_IN: "/Schedule/checkIn",
  CHECK_OUT: "/Schedule/checkOut",
  CHECK_IN_OUT_INFO: (bookingId: string, isCheckIn: boolean) => `/Schedule/checkInOut/info?BookingId=${bookingId}&isCheckIn=${isCheckIn}`,
  UPLOAD_SCHEDULE_IMAGE: (scheduleId: string) => `/Schedule/UploadImage/${scheduleId}`,
  UPLOAD_CHECKIN_IMAGES: "/Schedule/checkIn/images",

  // Inquiry
  CREATE_INQUIRY: "/Inquiry/initial",
  CHAT_LOG: (senderId: string, receiverId: string) => `/Inquiry/chatLog?senderId=${senderId}&receiverId=${receiverId}`,
}
