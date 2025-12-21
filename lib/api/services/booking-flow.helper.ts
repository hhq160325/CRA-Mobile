import { bookingsService } from "./bookings.service"
import { paymentService } from "./payment.service"



export interface BookingFlowResult {
    success: boolean
    error?: Error
    booking?: any
    payment?: any
}


export async function cancelBookingWithPayment(bookingId: string): Promise<BookingFlowResult> {
    try {
        console.log(" Starting cancel booking flow for:", bookingId)

        // Step 1: Update booking status to "cancelled"
        console.log(" Step 1: Updating booking status to cancelled...")
        const { data: updatedBooking, error: statusError } = await bookingsService.updateBookingStatus(
            bookingId,
            "cancelled"
        )

        if (statusError) {
            console.error(" Failed to cancel booking:", statusError)
            return { success: false, error: statusError }
        }

        console.log(" Booking status updated to cancelled")

        // Step 2: Update payment to "cancelled" (lowercase)
        console.log(" Step 2: Updating payment status to cancelled...")
        const { data: paymentUpdate, error: paymentError } = await bookingsService.updateBookingPayment(
            bookingId,
            "cancelled"
        )

        if (paymentError) {
            console.warn(" Payment update failed (this may be expected):", paymentError.message)
            console.log(" Booking cancelled successfully (payment update skipped)")

            return {
                success: true,
                booking: updatedBooking,
                payment: null,
            }
        }

        console.log(" Payment status updated to Cancelled")
        console.log(" Cancel booking flow completed successfully")

        return {
            success: true,
            booking: updatedBooking,
            payment: paymentUpdate,
        }
    } catch (error) {
        console.error(" Unexpected error in cancel booking flow:", error)
        return {
            success: false,
            error: error instanceof Error ? error : new Error("Unknown error"),
        }
    }
}


export async function confirmBookingWithPayment(bookingId: string): Promise<BookingFlowResult> {
    try {
        console.log(" Starting confirm booking flow for:", bookingId)

        // Step 1: Update booking status to "confirmed"
        console.log(" Step 1: Updating booking status to confirmed...")
        const { data: updatedBooking, error: statusError } = await bookingsService.updateBookingStatus(
            bookingId,
            "confirmed"
        )

        if (statusError) {
            console.error(" Failed to confirm booking:", statusError)
            return { success: false, error: statusError }
        }

        console.log(" Booking status updated to confirmed")

        // Step 2: Update rental payment to "paid" using the working endpoint
        console.log(" Step 2: Updating rental payment status to paid...")
        const { data: paymentUpdate, error: paymentError } = await paymentService.updateRentalPaymentCash(bookingId)

        if (paymentError) {
            console.warn("⚠️ Payment update failed:", paymentError.message)
            console.log("✅ Booking confirmed successfully (payment update skipped)")

            return {
                success: true,
                booking: updatedBooking,
                payment: null,
            }
        }

        console.log(" Rental payment status updated to Paid")
        console.log(" Confirm booking flow completed successfully")
        console.log(" Payment details:", {
            amount: paymentUpdate?.paidAmount,
            method: paymentUpdate?.paymentMethod,
            status: paymentUpdate?.status,
        })

        return {
            success: true,
            booking: updatedBooking,
            payment: paymentUpdate,
        }
    } catch (error) {
        console.error(" Unexpected error in confirm booking flow:", error)
        return {
            success: false,
            error: error instanceof Error ? error : new Error("Unknown error"),
        }
    }
}


export async function handleBookingAction(
    bookingId: string,
    action: "confirm" | "cancel"
): Promise<BookingFlowResult> {
    if (action === "confirm") {
        return confirmBookingWithPayment(bookingId)
    } else {
        return cancelBookingWithPayment(bookingId)
    }
}
