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
        // Validate booking ID format
        if (!bookingId || bookingId === 'pending' || bookingId.length < 10) {
            console.log(`⚠️ Invalid booking ID provided: "${bookingId}" - skipping payment check`);
            return {
                results: [],
                allPaid: false,
                error: new Error(`Invalid booking ID: ${bookingId}`)
            };
        }

        console.log("\n === Payment Status Checker ===")
        console.log(` Booking: ${bookingId}`)
        console.log(` Base URL: ${API_CONFIG.BASE_URL}`)
        console.log(` PayOS Base URL: ${API_CONFIG.BASE_URL.replace('/api', '')}`)

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

        // Fetch booking details - use full API URL with /api prefix
        const baseUrl = API_CONFIG.BASE_URL; // Keep /api prefix
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

        // Fetch payments for booking - use base URL without /api prefix (consistent with other services)
        const paymentsBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const paymentsUrl = `${paymentsBaseUrl}/Booking/${bookingId}/Payments`
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
            console.log(`   Payment details:`, JSON.stringify(payment, null, 2))

            // Skip payments that don't have valid order codes
            if (!orderCode || orderCode === 0 || orderCode === null) {
                console.log(`   ⚠️ Skipping payment with invalid order code: ${orderCode}`)
                results.push({
                    orderCode: orderCode || 0,
                    item,
                    originalStatus,
                    payosStatus: "INVALID_ORDER_CODE",
                    updated: false
                })
                continue
            }

            // Skip PayOS status check for Rental Fee payments that are still Pending
            // These are paid separately after booking creation, so PayOS order may not exist yet
            if (item.toLowerCase().includes("rental") && originalStatus === "Pending") {
                console.log(`   ⏭️ Skipping PayOS check for pending Rental Fee - payment not made yet`)
                results.push({
                    orderCode,
                    item,
                    originalStatus,
                    payosStatus: "PENDING", // Keep as pending until actually paid
                    updated: false
                })
                continue
            }


            // Try to get PayOS payment status - try multiple endpoints
            console.log(`🔍 Checking PayOS status for order ${orderCode}`)

            let payosData = null;
            let payosError = null;

            // Try multiple PayOS endpoints in order of preference
            const endpoints = [
                { name: 'PayOSPayment', method: () => paymentService.getPayOSPayment(orderCode.toString()) },
                { name: 'Payment', method: () => paymentService.getPaymentByOrderCode(orderCode.toString()) },
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`🔍 Trying ${endpoint.name} endpoint for order ${orderCode}`);
                    const result = await endpoint.method();

                    if (result.data && !result.error) {
                        payosData = result.data;
                        payosError = null;
                        console.log(`✅ ${endpoint.name} endpoint succeeded for order ${orderCode}`);
                        break;
                    } else if (result.error) {
                        console.log(`⚠️ ${endpoint.name} endpoint failed:`, result.error.message);
                        payosError = result.error;
                    }
                } catch (error) {
                    console.log(`⚠️ ${endpoint.name} endpoint exception:`, error);
                    payosError = error as Error;
                }
            }

            // If all endpoints fail, try a direct API call to PayOS status endpoint
            if (!payosData && payosError) {
                console.log(`🔍 Trying additional PayOS status endpoints for order ${orderCode}`);

                // Try different PayOS endpoint variations
                const additionalEndpoints = [
                    `/PayOS/status/${orderCode}`,
                    `/PayOS/payment/${orderCode}`,
                    `/PayOS/order/${orderCode}`,
                    `/PayOS/check/${orderCode}`,
                    `/api/PayOS/status/${orderCode}`,
                    `/api/PayOSPayment/${orderCode}`,
                    `/api/Payment/${orderCode}`,
                ];

                for (const endpoint of additionalEndpoints) {
                    try {
                        const directUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}${endpoint}`;
                        console.log(`📡 Trying PayOS endpoint: ${directUrl}`);

                        const directResponse = await fetch(directUrl, {
                            method: 'GET',
                            headers: authHeaders
                        });

                        if (directResponse.ok) {
                            const directData = await directResponse.json();
                            payosData = directData;
                            payosError = null;
                            console.log(`✅ PayOS endpoint ${endpoint} succeeded for order ${orderCode}`);
                            break;
                        } else {
                            console.log(`⚠️ PayOS endpoint ${endpoint} failed: ${directResponse.status}`);
                        }
                    } catch (directError) {
                        console.log(`⚠️ PayOS endpoint ${endpoint} exception:`, directError);
                    }
                }
            }

            if (payosError || !payosData) {
                console.log(`  ✗ All PayOS status checks failed for order ${orderCode}:`, payosError?.message)

                // Check if this is a "not found" or "server error" case
                const isOrderNotFound = payosError?.message?.includes('not found') ||
                    payosError?.message?.includes('server error') ||
                    payosError?.message?.includes('may not exist');

                if (isOrderNotFound) {
                    console.log(`  → Order ${orderCode} doesn't exist in PayOS system - using original booking status`);

                    // For orders that don't exist in PayOS, trust the original booking status
                    let assumedStatus = "PENDING";
                    if (originalStatus === "Success" || originalStatus === "Paid" || originalStatus === "Completed") {
                        assumedStatus = "PAID";
                        console.log(`  → Trusting original status: ${originalStatus} → PAID`);
                    } else if (originalStatus === "Cancelled" || originalStatus === "Canceled" || originalStatus === "Failed") {
                        assumedStatus = "CANCELLED";
                        console.log(`  → Trusting original status: ${originalStatus} → CANCELLED`);
                    } else {
                        console.log(`  → Original status ${originalStatus} suggests payment is still pending`);
                    }

                    results.push({
                        orderCode,
                        item,
                        originalStatus,
                        payosStatus: assumedStatus,
                        updated: false
                    })
                } else {
                    // For other errors, check if the original status indicates completion
                    let assumedStatus = "PENDING";

                    if (originalStatus === "Success" || originalStatus === "Paid" || originalStatus === "Completed") {
                        assumedStatus = "PAID";
                        console.log(`  → Payment ${orderCode} appears to be completed based on original status: ${originalStatus}`);
                    } else if (originalStatus === "Cancelled" || originalStatus === "Canceled" || originalStatus === "Failed") {
                        assumedStatus = "CANCELLED";
                        console.log(`  → Payment ${orderCode} appears to be cancelled based on original status: ${originalStatus}`);
                    } else {
                        console.log(`  → Assuming payment ${orderCode} is still pending (status check unavailable, original: ${originalStatus})`);
                    }

                    results.push({
                        orderCode,
                        item,
                        originalStatus,
                        payosStatus: assumedStatus,
                        updated: false
                    })
                }
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

                    // Use base URL without /api for update payment endpoints (consistent with other services)
                    const updateBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');

                    // Determine the correct update endpoint based on payment type
                    if (item.toLowerCase().includes("rental")) {
                        // Rental Fee payments
                        updateUrl = `${updateBaseUrl}/UpdatePayment/Booking/RentalPayment`;
                        payload = {
                            bookingId: bookingId,
                            status: newStatus
                        };
                    } else if (item.toLowerCase().includes("additional") || item.toLowerCase().includes("extension")) {
                        // Additional Fee and Booking Extension payments - use orderCode endpoint
                        updateUrl = `${updateBaseUrl}/UpdatePayment/Booking/PaymentOrderCode`;
                        payload = {
                            orderCode: orderCode,
                            status: newStatus === 'paid' ? 'Paid' : newStatus, // Use proper case for PayOS
                            method: 'payos'
                        };
                    } else {
                        // Booking Fee and other payments
                        updateUrl = `${updateBaseUrl}/UpdatePayment/Booking/BookingPayment`;
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


        // Check if ALL payments (including rental fee) are paid for pickup eligibility
        const allPaymentsPaid = results.every(r =>
            r.payosStatus === "PAID" ||
            r.originalStatus === "Success" ||
            r.originalStatus === "Paid"
        );

        // Check if booking fees (not rental fees) are paid for confirmation
        const bookingFeePaid = results
            .filter(r => !r.item.toLowerCase().includes("rental")) // Exclude rental fees
            .every(r =>
                r.payosStatus === "PAID" ||
                r.originalStatus === "Success" ||
                r.originalStatus === "Paid"
            );

        const anyPending = results.some(r =>
            r.payosStatus === "PENDING" ||
            r.originalStatus === "Pending"
        );

        const anyCancelled = results.some(r =>
            r.payosStatus === "CANCELLED" ||
            r.payosStatus === "EXPIRED"
        );

        console.log(`\n Payment Check Complete - All Paid: ${allPaymentsPaid}, Booking Fee Paid: ${bookingFeePaid}, Any Pending: ${anyPending}, Any Cancelled: ${anyCancelled}`)

        // Update booking status to Confirmed if booking fees are paid (rental fees can be pending)
        if (bookingFeePaid && !anyCancelled) {
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
                    console.log(" Booking status → Confirmed (booking fees paid, rental fees can be pending)")
                } else {
                    const responseText = await updateResponse.text()
                    console.log(` Booking update failed (${updateResponse.status}):`, responseText)
                }
            } catch (err) {
                console.error(" Booking update error:", err)
            }
        } else if (anyCancelled && !bookingFeePaid) {
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
            allPaid: allPaymentsPaid,
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
