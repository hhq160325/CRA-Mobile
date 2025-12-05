import { apiClient } from "../client"
import { API_ENDPOINTS, API_CONFIG } from "../config"

export interface Payment {
    id: string
    bookingId: string
    userId: string
    amount: number
    currency: string
    status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"
    paymentMethod: "cash" | "qr-payos"
    transactionId?: string
    createdAt: string | Date
    updatedAt: string | Date
    metadata?: {
        cardLast4?: string
        cardBrand?: string
        receiptUrl?: string
        failureReason?: string
    }
}

export interface Invoice {
    id: string
    bookingId?: string
    customerId: string
    vendorId?: string
    amount: number
    currency?: string
    status: "pending" | "paid" | "failed" | "cancelled" | "completed"
    dueDate?: string
    createdAt: string
    updatedAt?: string
    items?: InvoiceItem[]
    description?: string
}

export interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
    amount: number
}

export interface CreateInvoiceData {
    customerId: string
    vendorId?: string
    bookingId?: string
    amount: number
    currency?: string
    dueDate?: string
    description?: string
    items?: InvoiceItem[]
}

export interface UpdateInvoiceData {
    id: string
    amount?: number
    status?: string
    dueDate?: string
    description?: string
    items?: InvoiceItem[]
}

export interface PayOSPayment {
    orderCode: string
    amount: number
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" | "PAID" | "CANCELLED" | "EXPIRED"
    paymentUrl?: string
    qrCode?: string
    transactionId?: string
    createdAt: string
}

export interface User {
    id: string
    email: string
    name: string
    phone?: string
    role: string
}

export interface CreatePayOSPaymentRequest {
    amount: number
    description: string
    returnUrl?: string
    cancelUrl?: string
    bookingId?: string
}

export interface PaymentIntent {
    id: string
    clientSecret: string
    amount: number
    currency: string
    status: string
}

export interface CreatePaymentData {
    bookingId: string
    amount: number
    currency?: string
    paymentMethod: "cash" | "qr-payos"
}

export interface RefundData {
    paymentId: string
    amount?: number
    reason?: string
}

export interface PaymentHistory {
    payments: Payment[]
    totalAmount: number
    totalCount: number
    page: number
    pageSize: number
}

export const paymentService = {
    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<{ data: User | null; error: Error | null }> {
        console.log("paymentService.getUserById: fetching user", userId)
        const result = await apiClient<User>(API_ENDPOINTS.GET_USER(userId), {
            method: "GET",
        })
        console.log("paymentService.getUserById: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },



    async getAllInvoices(): Promise<{ data: Invoice[] | null; error: Error | null }> {
        console.log("paymentService.getAllInvoices: fetching all invoices")
        const result = await apiClient<Invoice[]>(API_ENDPOINTS.ALL_INVOICES, {
            method: "GET",
        })
        console.log("paymentService.getAllInvoices: result", {
            hasError: !!result.error,
            dataLength: result.data?.length
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async getInvoicesByCustomer(customerId: string): Promise<{ data: Invoice[] | null; error: Error | null }> {
        console.log("paymentService.getInvoicesByCustomer: fetching invoices for customer", customerId)
        const result = await apiClient<Invoice[]>(API_ENDPOINTS.INVOICES_BY_CUSTOMER(customerId), {
            method: "GET",
        })
        console.log("paymentService.getInvoicesByCustomer: result", {
            hasError: !!result.error,
            dataLength: result.data?.length
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getInvoicesByVendor(vendorId: string): Promise<{ data: Invoice[] | null; error: Error | null }> {
        console.log("paymentService.getInvoicesByVendor: fetching invoices for vendor", vendorId)
        const result = await apiClient<Invoice[]>(API_ENDPOINTS.INVOICES_BY_VENDOR(vendorId), {
            method: "GET",
        })
        console.log("paymentService.getInvoicesByVendor: result", {
            hasError: !!result.error,
            dataLength: result.data?.length
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getInvoiceById(invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.getInvoiceById: fetching invoice", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.GET_INVOICE(invoiceId), {
            method: "GET",
        })
        console.log("paymentService.getInvoiceById: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async createInvoice(data: CreateInvoiceData): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.createInvoice: creating invoice", data)
        const result = await apiClient<Invoice>(API_ENDPOINTS.CREATE_INVOICE, {
            method: "POST",
            body: JSON.stringify(data),
        })
        console.log("paymentService.createInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async updateInvoice(data: UpdateInvoiceData): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.updateInvoice: updating invoice", data.id)
        const result = await apiClient<Invoice>(API_ENDPOINTS.UPDATE_INVOICE, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
        console.log("paymentService.updateInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async completeInvoice(invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.completeInvoice: completing invoice", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_COMPLETE, {
            method: "PATCH",
            body: JSON.stringify({ id: invoiceId }),
        })
        console.log("paymentService.completeInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async failInvoice(invoiceId: string, reason?: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.failInvoice: marking invoice as failed", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_FAILED, {
            method: "PATCH",
            body: JSON.stringify({ id: invoiceId, reason }),
        })
        console.log("paymentService.failInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getPayOSPayment(orderCode: string): Promise<{ data: PayOSPayment | null; error: Error | null }> {
        console.log("paymentService.getPayOSPayment: fetching payment", orderCode)
        const result = await apiClient<PayOSPayment>(API_ENDPOINTS.GET_PAYOS_PAYMENT(orderCode), {
            method: "GET",
        })
        console.log("paymentService.getPayOSPayment: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async getPaymentByOrderCode(orderCode: string): Promise<{ data: Payment | null; error: Error | null }> {
        console.log("paymentService.getPaymentByOrderCode: fetching payment", orderCode)
        const result = await apiClient<Payment>(API_ENDPOINTS.GET_PAYMENT(orderCode), {
            method: "GET",
        })
        console.log("paymentService.getPaymentByOrderCode: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async createPayOSPayment(data: CreatePayOSPaymentRequest): Promise<{ data: PayOSPayment | null; error: Error | null }> {
        console.log("paymentService.createPayOSPayment: creating payment", data)
        const result = await apiClient<PayOSPayment>(API_ENDPOINTS.CREATE_PAYOS_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        console.log("paymentService.createPayOSPayment: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async createPaymentFromInvoice(invoiceId: string): Promise<{ data: Payment | null; error: Error | null }> {
        console.log("paymentService.createPaymentFromInvoice: creating payment for invoice", invoiceId)
        const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT_FROM_INVOICE(invoiceId), {
            method: "POST",
        })
        console.log("paymentService.createPaymentFromInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async createPaymentIntent(
        bookingId: string,
        amount: number
    ): Promise<{ data: PaymentIntent | null; error: Error | null }> {
        const result = await apiClient<PaymentIntent>(API_ENDPOINTS.PAYMENT_INTENT, {
            method: "POST",
            body: JSON.stringify({ bookingId, amount }),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async createPayment(data: CreatePaymentData): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getPaymentById(paymentId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_DETAILS(paymentId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getPaymentByBookingId(bookingId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_BY_BOOKING(bookingId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async getPaymentHistory(
        userId: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<{ data: PaymentHistory | null; error: Error | null }> {
        const result = await apiClient<PaymentHistory>(
            `${API_ENDPOINTS.PAYMENT_HISTORY}?userId=${userId}&page=${page}&pageSize=${pageSize}`,
            {
                method: "GET",
            }
        )
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getAllPayments(
        page: number = 1,
        pageSize: number = 20,
        status?: string
    ): Promise<{ data: PaymentHistory | null; error: Error | null }> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        })
        if (status) params.append("status", status)

        const result = await apiClient<PaymentHistory>(`${API_ENDPOINTS.ALL_PAYMENTS}?${params}`, {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async verifyPayment(paymentId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.VERIFY_PAYMENT(paymentId), {
            method: "POST",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async cancelPayment(paymentId: string): Promise<{ error: Error | null }> {
        const result = await apiClient(API_ENDPOINTS.CANCEL_PAYMENT(paymentId), {
            method: "POST",
        })
        return { error: result.error }
    },

    async requestRefund(data: RefundData): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.REFUND_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getPaymentReceipt(paymentId: string): Promise<{ data: { receiptUrl: string } | null; error: Error | null }> {
        const result = await apiClient<{ receiptUrl: string }>(API_ENDPOINTS.PAYMENT_RECEIPT(paymentId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },


    async getPaymentStats(
        ownerId: string,
        startDate?: string,
        endDate?: string
    ): Promise<{
        data: {
            totalEarnings: number
            totalPayments: number
            averagePayment: number
            pendingAmount: number
            completedAmount: number
        } | null
        error: Error | null
    }> {
        const params = new URLSearchParams({ ownerId })
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)

        const result = await apiClient<{
            totalEarnings: number
            totalPayments: number
            averagePayment: number
            pendingAmount: number
            completedAmount: number
        }>(`${API_ENDPOINTS.PAYMENT_STATS}?${params}`, {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async handlePaymentWebhook(webhookData: any): Promise<{ error: Error | null }> {
        const result = await apiClient(API_ENDPOINTS.PAYMENT_WEBHOOK, {
            method: "POST",
            body: JSON.stringify(webhookData),
        })
        return { error: result.error }
    },

    async createRentalPayment(bookingId: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("paymentService.createRentalPayment: creating rental payment for booking", bookingId)

        // PayOS endpoint doesn't use /api prefix, so we need to call it directly
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '') // Remove /api from base URL
        const fullUrl = `${baseUrl}/PayOS/Booking/CreateRentalPayment`

        console.log("paymentService.createRentalPayment: calling", fullUrl)

        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token:", e)
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            }

            if (token) {
                headers["Authorization"] = `Bearer ${token}`
            }

            const response = await fetch(fullUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({ bookingId }),
            })

            console.log("paymentService.createRentalPayment: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("paymentService.createRentalPayment: error", errorText)
                return {
                    data: null,
                    error: new Error(`Failed to create rental payment: ${response.status}`)
                }
            }

            const data = await response.json()
            console.log("paymentService.createRentalPayment: success", data)
            return { data, error: null }
        } catch (error: any) {
            console.error("paymentService.createRentalPayment: exception", error)
            return {
                data: null,
                error: new Error(error?.message || "Failed to create rental payment")
            }
        }
    },

    async updateRentalPaymentCash(bookingId: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("paymentService.updateRentalPaymentCash: updating booking payment for booking", bookingId)

        // Use UpdatePayment/Booking/BookingPayment endpoint without /api prefix
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
        const fullUrl = `${baseUrl}/UpdatePayment/Booking/BookingPayment`

        console.log("paymentService.updateRentalPaymentCash: calling", fullUrl)

        try {
            let token: string | null = null
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token:", e)
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            }

            if (token) {
                headers["Authorization"] = `Bearer ${token}`
            }

            const response = await fetch(fullUrl, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    bookingId,
                    paymentMethod: "Cash on Delivery",
                    status: "Success"
                }),
            })

            console.log("paymentService.updateRentalPaymentCash: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("paymentService.updateRentalPaymentCash: error", errorText)
                return {
                    data: null,
                    error: new Error(`Failed to update payment: ${response.status}`)
                }
            }

            const data = await response.json()
            console.log("paymentService.updateRentalPaymentCash: success", data)
            return { data, error: null }
        } catch (error: any) {
            console.error("paymentService.updateRentalPaymentCash: exception", error)
            return {
                data: null,
                error: new Error(error?.message || "Failed to update payment")
            }
        }
    },

    async getPaymentsByInvoice(invoiceId: string): Promise<{ data: any[] | null; error: Error | null }> {
        console.log("paymentService.getPaymentsByInvoice: fetching payments for invoice", invoiceId)
        const result = await apiClient<any[]>(API_ENDPOINTS.GET_INVOICE(invoiceId), {
            method: "GET",
        })
        console.log("paymentService.getPaymentsByInvoice: result", {
            hasError: !!result.error,
            dataLength: Array.isArray(result.data) ? result.data.length : 0
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async getBookingPayments(bookingId: string): Promise<{ data: any[] | null; error: Error | null }> {
        console.log("paymentService.getBookingPayments: fetching payments for booking", bookingId)

        // Try with /api prefix first
        let result = await apiClient<any[]>(API_ENDPOINTS.GET_BOOKING_PAYMENTS(bookingId), {
            method: "GET",
        })

        console.log("paymentService.getBookingPayments: first attempt result", {
            hasError: !!result.error,
            errorMessage: result.error?.message,
            dataLength: Array.isArray(result.data) ? result.data.length : 0
        })

        // If failed with 404, try without /api prefix
        if (result.error && result.error.message.includes('404')) {
            console.log("paymentService.getBookingPayments: trying without /api prefix")
            const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
            const fullUrl = `${baseUrl}/Booking/${bookingId}/Payments`

            try {
                let token: string | null = null
                try {
                    if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                        token = localStorage.getItem("token")
                    }
                } catch (e) {
                    console.error("Failed to get token:", e)
                }

                const response = await fetch(fullUrl, {
                    method: "GET",
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                })

                console.log("paymentService.getBookingPayments: direct fetch status", response.status)

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error("paymentService.getBookingPayments: error", errorText)
                    return { data: null, error: new Error(`Failed to fetch payments: ${response.status}`) }
                }

                const data = await response.json()
                console.log("paymentService.getBookingPayments: success with direct fetch", {
                    dataLength: Array.isArray(data) ? data.length : 0,
                    payments: data
                })
                return { data, error: null }
            } catch (error: any) {
                console.error("paymentService.getBookingPayments: exception", error)
                return { data: null, error: new Error(error?.message || "Failed to fetch payments") }
            }
        }

        console.log("paymentService.getBookingPayments: final result", {
            hasError: !!result.error,
            dataLength: Array.isArray(result.data) ? result.data.length : 0,
            payments: result.data
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },
}
