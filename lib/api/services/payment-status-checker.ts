import { paymentService } from "./payment.service"
import { API_CONFIG } from "../config"



interface PaymentStatusResult {
    orderCode: number
    item: string
    originalStatus: string
    payosStatus: string
    updated: boolean
}


export async function checkAndUpdatePaymentStatuses(bookingId: string): Promise<{
    results: PaymentStatusResult[]
    allPaid: boolean
    error: Error | null
}> {
    try {
        console.log("\n === Payment Status Checker ===")
        console.log(` Booking: ${bookingId}`)


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

        console.log(` Booking ${bookingId} - Invoice: ${invoiceId}`)


        const paymentsUrl = `${API_CONFIG.BASE_URL}/Booking/${bookingId}/Payments`

        const paymentsResponse = await fetch(paymentsUrl)
        if (!paymentsResponse.ok) {
            throw new Error(`Failed to fetch payments: ${paymentsResponse.status}`)
        }

        const payments = await paymentsResponse.json()

        console.log(` Found ${payments.length} payment(s) for booking ${bookingId}`)

        if (!Array.isArray(payments) || payments.length === 0) {
            console.log(" No payments found - booking may not have payment records yet")
            return {
                results: [],
                allPaid: false,
                error: new Error("No payments found for this booking. Payment records may not be created yet.")
            }
        }


        const results: PaymentStatusResult[] = []

        for (const payment of payments) {
            const { orderCode, item, status: originalStatus } = payment

            console.log(` ${item}: ${originalStatus} (order: ${orderCode})`)


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


            let updated = false
            let newStatus: string | null = null


            if (payosStatus === "PAID" && originalStatus !== "Success" && originalStatus !== "Paid") {
                newStatus = "paid"
            } else if (payosStatus === "CANCELLED" && originalStatus !== "Cancelled" && originalStatus !== "Canceled") {
                newStatus = "cancelled"
            } else if (payosStatus === "EXPIRED" && originalStatus !== "Expired" && originalStatus !== "Cancelled") {
                newStatus = "cancelled"
            }


            if (newStatus) {
                console.log(`   Updating ${item}: ${originalStatus} → ${newStatus}`)

                try {

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
                        console.log(`   Updated ${item} to ${newStatus}`)
                        updated = true
                    } else {
                        const errorText = await updateResponse.text()
                        console.log(`   Update failed (${updateResponse.status}):`, errorText)
                    }
                } catch (updateError) {
                    console.error(`   Update error:`, updateError)
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


        const allPaid = results.every(r =>
            r.payosStatus === "PAID" ||
            r.originalStatus === "Success" ||
            r.originalStatus === "Paid"
        )


        const anyCancelled = results.some(r =>
            r.payosStatus === "CANCELLED" ||
            r.payosStatus === "EXPIRED"
        )

        console.log(`\n Payment Check Complete - All Paid: ${allPaid}, Any Cancelled: ${anyCancelled}`)


        if (allPaid) {
            console.log("Updating booking status to Confirmed...")
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
                    console.log(" Booking status → Confirmed")
                } else {
                    const responseText = await updateResponse.text()
                    console.log(` Booking update failed (${updateResponse.status}):`, responseText)
                }
            } catch (err) {
                console.error(" Booking update error:", err)
            }
        } else if (anyCancelled && !allPaid) {
            console.log(" Updating booking status to Canceled...")
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
                    console.log(" Booking status → Canceled")
                } else {
                    const responseText = await updateResponse.text()
                    console.log(` Booking update failed (${updateResponse.status}):`, responseText)
                }
            } catch (err) {
                console.error(" Booking update error:", err)
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

export async function areAllPaymentsPaid(bookingId: string): Promise<boolean> {
    const { allPaid } = await checkAndUpdatePaymentStatuses(bookingId)
    return allPaid
}
