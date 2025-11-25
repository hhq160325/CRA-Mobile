
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api",
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/Authen/authenticate",
  REGISTER: "/Authen/SignUp",
  LOGOUT: "/Authen/Logout",
  VERIFY_OTP: "/Authen/verify-otp",

  // Alternative paths to try: /Authen/forgotPassword, /Authen/request-reset, /User/forgot-password
  FORGOT_PASSWORD: "/Authen/ForgotPassword",
  RESET_PASSWORD: "/Authen/ResetPassword",
  VERIFY_RESET_CODE: "/Authen/VerifyResetCode",
  LOGIN_GOOGLE: "/Authen/login/google",
  REFRESH_TOKEN: "/Authen/refresh-token",

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
  UPDATE_BOOKING_STATUS: "/Booking/UpdateBooking",
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  // Feedback (Reviews)
  ALL_FEEDBACK: "/Feedback/All",
  FEEDBACK_BY_CAR: (carId: string) => `/Feedback/GetFeedbacksForCar/${carId}`,
  CREATE_FEEDBACK: "/Feedback/CreateFeedback",
  UPDATE_FEEDBACK: (id: string) => `/Feedback/UpdateFeedback/${id}`,
  DELETE_FEEDBACK: (id: string) => `/Feedback/DeleteFeedback/${id}`,

  // User
  USER_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",
  GET_ALL_USERS: "/User/GetAllUsers",
  UPDATE_USER_INFO: "/User/UpdateUserInfo",
  UPLOAD_AVATAR: "/User/UploadAvatar",
  UPLOAD_DRIVER_LICENSE: (userId: string) => `/User/driverLicense/${userId}`,

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
  REVERSE_GEOCODE: "/locations/reverse-geocode",

  // Notifications
  GET_NOTIFICATIONS: (userId: string) => `/Notification/GetNotificationsForUser/${userId}`,
  MARK_NOTIFICATION_READ: (notificationId: string) => `/Notification/MarkAsRead/${notificationId}`,
  DELETE_NOTIFICATION: (notificationId: string) => `/Notification/DeleteNotification/${notificationId}`,

  // Schedules
  GET_SCHEDULE_BY_BOOKING: (bookingId: string, scheduleType: string) => `/Schedule/GetLastScheduleByBookingAndType/${bookingId}/${scheduleType}`,
  CHECK_IN: "/Schedule/checkIn",
  CHECK_OUT: "/Schedule/checkOut",
  UPLOAD_SCHEDULE_IMAGE: (scheduleId: string) => `/Schedule/UploadImage/${scheduleId}`,
}
