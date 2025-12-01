import { paymentService } from "./payment.service"
import { API_CONFIG } from "../config"

/**
 * Payment Status Checker
 * 
 * Flow:
 * 1. Get booking payments (Booking Fee + Rental Fee) by orderCode
 * 2. Check PayOS status for each payment
 * 3. Update payment status if PAID
 */

interface PaymentStatusResult {
    orderCode: number
    item: string
    originalStatus: string
    payosStatus: string
    updated: boolean
}

/**
 * Check and update payment statuses for a booking
 * @param bookingId - The booking ID
 * @returns Array of payment status results
 */
export async function checkAndUpdatePaymentStatuses(bookingId: string): Promise<{
    results: PaymentStatusResult[]
    allPaid: boolean
    error: Error | null
}> {
    try {
        console.log("\n🔍 === Payment Status Checker ===")
        console.log(`📦 Booking: ${bookingId}`)

        // Step 1: Get booking details to find invoiceId
        const bookingUrl = `${API_CONFIG.BASE_URL}/Booking/GetBookingById/${bookingId}`

        const bookingResponse = await fetch(bookingUrl)
        if (!bookingResponse.ok) {
            throw new Error(`Failed to fetch booking: ${bookingResponse.status}`)
        }

        const booking = await bookingResponse.json()
        const invoiceId = booking.invoiceId

        if (!invoiceId) {
            throw new Error("Booking has no invoiceId")
        }

        console.log(`📋 Booking ${bookingId} - Invoice: ${invoiceId}`)

        // Step 2: Get payments for this booking directly
        const paymentsUrl = `${API_CONFIG.BASE_URL}/Booking/${bookingId}/Payments`

        const paymentsResponse = await fetch(paymentsUrl)
        if (!paymentsResponse.ok) {
            throw new Error(`Failed to fetch payments: ${paymentsResponse.status}`)
        }

        const payments = await paymentsResponse.json()

        console.log(`💳 Found ${payments.length} payment(s) for booking ${bookingId}`)

        if (!Array.isArray(payments) || payments.length === 0) {
            console.log("⚠️ No payments found - booking may not have payment records yet")
            return {
                results: [],
                allPaid: false,
                error: new Error("No payments found for this booking. Payment records may not be created yet.")
            }
        }

        // Step 3: Check PayOS status for each payment
        const results: PaymentStatusResult[] = []

        for (const payment of payments) {
            const { orderCode, item, status: originalStatus } = payment

            console.log(`💰 ${item}: ${originalStatus} (order: ${orderCode})`)

            // Get PayOS status
            const { data: payosData, error: payosError } = await paymentService.getPayOSPayment(orderCode.toString())

            if (payosError || !payosData) {
                console.log(`  ✗ Failed to get PayOS status:`, payosError?.message)
                results.push({
                    orderCode,
                    item,
                    originalStatus,
                    payosStatus: "ERROR",
                    updated: false
                })
                continue
            }

            const payosStatus = payosData.status
            console.log(`  → PayOS: ${payosStatus}`)

            // Step 4: Update payment status based on PayOS status (PAID/CANCELLED/EXPIRED)
            let updated = false
            let newStatus: string | null = null

            // Determine what status to update to
            if (payosStatus === "PAID" && originalStatus !== "Success" && originalStatus !== "Paid") {
                newStatus = "paid"
            } else if (payosStatus === "CANCELLED" && originalStatus !== "Cancelled" && originalStatus !== "Canceled") {
                newStatus = "cancelled"
            } else if (payosStatus === "EXPIRED" && originalStatus !== "Expired" && originalStatus !== "Cancelled") {
                newStatus = "cancelled" // Treat expired as cancelled
            }

            // Update if status needs to change
            if (newStatus) {
                console.log(`  ⟳ Updating ${item}: ${originalStatus} → ${newStatus}`)

                try {
                    // Update payment status via API - use different endpoint based on payment type
                    const isRentalPayment = item.toLowerCase().includes("rental")
                    const updateUrl = isRentalPayment
                        ? `${API_CONFIG.BASE_URL}/UpdatePayment/Booking/RentalPayment`
                        : `${API_CONFIG.BASE_URL}/UpdatePayment/Booking/BookingPayment`

                    const updateResponse = await fetch(updateUrl, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            bookingId: bookingId,
                            status: newStatus
                        })
                    })

                    if (updateResponse.ok) {
                        console.log(`  ✓ Updated ${item} to ${newStatus}`)
                        updated = true
                    } else {
                        const errorText = await updateResponse.text()
                        console.log(`  ✗ Update failed (${updateResponse.status}):`, errorText)
                    }
                } catch (updateError) {
                    console.error(`  ✗ Update error:`, updateError)
                }
            }

            results.push({
                orderCode,
                item,
                originalStatus,
                payosStatus,
                updated
            })
        }

        // Check if all payments are paid
        const allPaid = results.every(r =>
            r.payosStatus === "PAID" ||
            r.originalStatus === "Success" ||
            r.originalStatus === "Paid"
        )

        // Check if any payment is cancelled
        const anyCancelled = results.some(r =>
            r.payosStatus === "CANCELLED" ||
            r.payosStatus === "EXPIRED"
        )

        console.log(`\n✅ Payment Check Complete - All Paid: ${allPaid}, Any Cancelled: ${anyCancelled}`)

        // Step 5: Update booking status based on payment status
        if (allPaid) {
            console.log("📝 Updating booking status to Confirmed...")
            try {
                const updateUrl = `${API_CONFIG.BASE_URL}/Booking/UpdateBooking`

                const updateResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        bookingId: bookingId,
                        status: "Confirmed"
                    })
                })

                if (updateResponse.ok) {
                    console.log("✓ Booking status → Confirmed")
                } else {
                    const responseText = await updateResponse.text()
                    console.log(`✗ Booking update failed (${updateResponse.status}):`, responseText)
                }
            } catch (err) {
                console.error("✗ Booking update error:", err)
            }
        } else if (anyCancelled && !allPaid) {
            console.log("📝 Updating booking status to Canceled...")
            try {
                const updateUrl = `${API_CONFIG.BASE_URL}/Booking/UpdateBooking`

                const updateResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        bookingId: bookingId,
                        status: "Canceled"
                    })
                })

                if (updateResponse.ok) {
                    console.log("✓ Booking status → Canceled")
                } else {
                    const responseText = await updateResponse.text()
                    console.log(`✗ Booking update failed (${updateResponse.status}):`, responseText)
                }
            } catch (err) {
                console.error("✗ Booking update error:", err)
            }
        }

        return {
            results,
            allPaid,
            error: null
        }
    } catch (error) {
        console.error("Payment status checker error:", error)
        return {
            results: [],
            allPaid: false,
            error: error as Error
        }
    }
}

/**
 * Quick check if all payments for a booking are paid
 * @param bookingId - The booking ID
 * @returns true if all payments are paid
 */
export async function areAllPaymentsPaid(bookingId: string): Promise<boolean> {
    const { allPaid } = await checkAndUpdatePaymentStatuses(bookingId)
    return allPaid
}
