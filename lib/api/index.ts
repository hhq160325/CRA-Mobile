
export * from "./config"
export * from "./client"


export { authService, type User, type LoginCredentials, type RegisterData, type GoogleLoginData, type RefreshTokenData, type TokenResponse } from "./services/auth.service"

export * from "./services/cars.service"
export * from "./services/bookings.service"
export * from "./services/reviews.service"
export * from "./services/confirmations.service"


export {
    paymentService,
    type Payment,
    type Invoice,
    type InvoiceItem,
    type CreateInvoiceData,
    type UpdateInvoiceData,
    type PayOSPayment,
    type CreatePayOSPaymentRequest,
    type PaymentIntent,
    type CreatePaymentData,
    type RefundData,
    type PaymentHistory
} from "./services/payment.service"

export * from "./services/location.service"

export { parkLotService, type ParkLot } from "./services/parklot.service"

export { userService, type UserData } from "./services/user.service"


export { storageService } from "./services/storage.service"


export { scheduleService, type Schedule } from "./services/schedule.service"


export { notificationService, type Notification } from "./services/notification.service"


export { invoiceService, type Invoice as InvoiceData } from "./services/invoice.service"


export { checkAndUpdatePaymentStatuses, areAllPaymentsPaid } from "./services/payment-status-checker"
