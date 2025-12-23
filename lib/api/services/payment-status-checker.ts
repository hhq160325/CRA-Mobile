import { paymentService } from "./payment.service"
import { API_CONFIG } from "../config"
import AsyncStorage from '@react-native-async-storage/async-storage'

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token")
    } catch (e) {
        console.error("Failed to get token:", e)
        return null
    }
}



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

        // Get authentication token
        const token = await getAuthToken()
        console.log('🔐 Auth token available:', !!token)

        const authHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'accept': '*/*'
        }

        if (token) {
            authHeaders['Authorization'] = `Bearer ${token}`
        }

        // Fetch booking details - remove /api prefix for consistency
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const bookingUrl = `${baseUrl}/Booking/GetBookingById/${bookingId}`
        console.log('📡 Fetching booking:', bookingUrl)

        const bookingResponse = await fetch(bookingUrl, {
            method: 'GET',
            headers: authHeaders
        })

        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text()
            console.error('❌ Booking fetch failed:', bookingResponse.status, errorText)
            throw new Error(`Failed to fetch booking: ${bookingResponse.status}`)
        }

        const booking = await bookingResponse.json()
        const invoiceId = booking.invoiceId

        if (!invoiceId) {
            throw new Error("Booking has no invoiceId")
        }

        console.log(` Booking ${bookingId} - Invoice: ${invoiceId}`)

        // Fetch payments for booking - reuse the same baseUrl variable
        const paymentsUrl = `${baseUrl}/Booking/${bookingId}/Payments`
        console.log('📡 Fetching payments:', paymentsUrl)

        const paymentsResponse = await fetch(paymentsUrl, {
            method: 'GET',
            headers: authHeaders
        })

        if (!paymentsResponse.ok) {
            const errorText = await paymentsResponse.text()
            console.error('❌ Payments fetch failed:', paymentsResponse.status, errorText)
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
                    let updateUrl: string;
                    let payload: any;

                    // Determine the correct update endpoint based on payment type
                    if (item.toLowerCase().includes("rental")) {
                        // Rental Fee payments
                        updateUrl = `${baseUrl}/UpdatePayment/Booking/RentalPayment`;
                        payload = {
                            bookingId: bookingId,
                            status: newStatus
                        };
                    } else if (item.toLowerCase().includes("additional") || item.toLowerCase().includes("extension")) {
                        // Additional Fee and Booking Extension payments - use orderCode endpoint
                        updateUrl = `${baseUrl}/UpdatePayment/Booking/PaymentOrderCode`;
                        payload = {
                            orderCode: orderCode,
                            status: newStatus === 'paid' ? 'Paid' : newStatus, // Use proper case for PayOS
                            method: 'payos'
                        };
                    } else {
                        // Booking Fee and other payments
                        updateUrl = `${baseUrl}/UpdatePayment/Booking/BookingPayment`;
                        payload = {
                            bookingId: bookingId,
                            status: newStatus
                        };
                    }

                    console.log('📡 Updating payment status:', updateUrl);
                    console.log('📡 Payload:', JSON.stringify(payload, null, 2));

                    const updateResponse = await fetch(updateUrl, {
                        method: "PATCH",
                        headers: authHeaders,
                        body: JSON.stringify(payload)
                    })

                    if (updateResponse.ok) {
                        console.log(`   ✅ Updated ${item} to ${newStatus}`)
                        updated = true
                    } else {
                        const errorText = await updateResponse.text()
                        console.log(`   ❌ Update failed (${updateResponse.status}):`, errorText)
                    }
                } catch (updateError) {
                    console.error(`   💥 Update error:`, updateError)
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
                const updateUrl = `${baseUrl}/Booking/UpdateBooking`
                console.log('📡 Updating booking status:', updateUrl)

                const updateResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: authHeaders,
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
                const updateUrl = `${baseUrl}/Booking/UpdateBooking`
                console.log('📡 Updating booking status to Canceled:', updateUrl)

                const updateResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: authHeaders,
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
