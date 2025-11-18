import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface Payment {
    id: string
    bookingId: string
    userId: string
    amount: number
    currency: string
    status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"
    paymentMethod: "credit-card" | "debit-card" | "paypal" | "bitcoin" | "bank-transfer"
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
    status: string
    paymentUrl?: string
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
    paymentMethod: "credit-card" | "debit-card" | "paypal" | "bitcoin" | "bank-transfer"
    cardDetails?: {
        cardNumber: string
        cardHolder: string
        expirationDate: string
        cvc: string
    }
    billingAddress?: {
        name: string
        address: string
        city: string
        state?: string
        postalCode: string
        country: string
    }
}

export interface RefundData {
    paymentId: string
    amount?: number // Partial refund if specified, full refund if not
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

    // ==================== INVOICE METHODS ====================

    /**
     * Get all invoices
     */
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

    /**
     * Get all invoices for a customer
     */
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

    /**
     * Get all invoices for a vendor
     */
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

    /**
     * Get invoice by ID
     */
    async getInvoiceById(invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.getInvoiceById: fetching invoice", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.GET_INVOICE(invoiceId), {
            method: "GET",
        })
        console.log("paymentService.getInvoiceById: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Create a new invoice
     */
    async createInvoice(data: CreateInvoiceData): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.createInvoice: creating invoice", data)
        const result = await apiClient<Invoice>(API_ENDPOINTS.CREATE_INVOICE, {
            method: "POST",
            body: JSON.stringify(data),
        })
        console.log("paymentService.createInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Update an existing invoice
     */
    async updateInvoice(data: UpdateInvoiceData): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.updateInvoice: updating invoice", data.id)
        const result = await apiClient<Invoice>(API_ENDPOINTS.UPDATE_INVOICE, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
        console.log("paymentService.updateInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Mark invoice as complete
     */
    async completeInvoice(invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.completeInvoice: completing invoice", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_COMPLETE, {
            method: "PATCH",
            body: JSON.stringify({ id: invoiceId }),
        })
        console.log("paymentService.completeInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Mark invoice as failed
     */
    async failInvoice(invoiceId: string, reason?: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("paymentService.failInvoice: marking invoice as failed", invoiceId)
        const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_FAILED, {
            method: "PATCH",
            body: JSON.stringify({ id: invoiceId, reason }),
        })
        console.log("paymentService.failInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    // ==================== PAYOS PAYMENT METHODS ====================

    /**
     * Get PayOS payment by order code
     */
    async getPayOSPayment(orderCode: string): Promise<{ data: PayOSPayment | null; error: Error | null }> {
        console.log("paymentService.getPayOSPayment: fetching payment", orderCode)
        const result = await apiClient<PayOSPayment>(API_ENDPOINTS.GET_PAYOS_PAYMENT(orderCode), {
            method: "GET",
        })
        console.log("paymentService.getPayOSPayment: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get payment by order code
     */
    async getPaymentByOrderCode(orderCode: string): Promise<{ data: Payment | null; error: Error | null }> {
        console.log("paymentService.getPaymentByOrderCode: fetching payment", orderCode)
        const result = await apiClient<Payment>(API_ENDPOINTS.GET_PAYMENT(orderCode), {
            method: "GET",
        })
        console.log("paymentService.getPaymentByOrderCode: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Create PayOS payment request
     */
    async createPayOSPayment(data: CreatePayOSPaymentRequest): Promise<{ data: PayOSPayment | null; error: Error | null }> {
        console.log("paymentService.createPayOSPayment: creating payment", data)
        const result = await apiClient<PayOSPayment>(API_ENDPOINTS.CREATE_PAYOS_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        console.log("paymentService.createPayOSPayment: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Create payment from invoice
     */
    async createPaymentFromInvoice(invoiceId: string): Promise<{ data: Payment | null; error: Error | null }> {
        console.log("paymentService.createPaymentFromInvoice: creating payment for invoice", invoiceId)
        const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT_FROM_INVOICE(invoiceId), {
            method: "POST",
        })
        console.log("paymentService.createPaymentFromInvoice: result", { hasError: !!result.error })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Create a payment intent for a booking (legacy)
     */
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

    /**
     * Process a payment for a booking (legacy)
     */
    async createPayment(data: CreatePaymentData): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get payment by ID (legacy)
     */
    async getPaymentById(paymentId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_DETAILS(paymentId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get payment by booking ID (legacy)
     */
    async getPaymentByBookingId(bookingId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_BY_BOOKING(bookingId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get user's payment history (legacy)
     */
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

    /**
     * Get all payments (staff/admin only) (legacy)
     */
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

    /**
     * Verify payment status (legacy)
     */
    async verifyPayment(paymentId: string): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.VERIFY_PAYMENT(paymentId), {
            method: "POST",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Cancel a pending payment (legacy)
     */
    async cancelPayment(paymentId: string): Promise<{ error: Error | null }> {
        const result = await apiClient(API_ENDPOINTS.CANCEL_PAYMENT(paymentId), {
            method: "POST",
        })
        return { error: result.error }
    },

    /**
     * Request a refund (legacy)
     */
    async requestRefund(data: RefundData): Promise<{ data: Payment | null; error: Error | null }> {
        const result = await apiClient<Payment>(API_ENDPOINTS.REFUND_PAYMENT, {
            method: "POST",
            body: JSON.stringify(data),
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get payment receipt (legacy)
     */
    async getPaymentReceipt(paymentId: string): Promise<{ data: { receiptUrl: string } | null; error: Error | null }> {
        const result = await apiClient<{ receiptUrl: string }>(API_ENDPOINTS.PAYMENT_RECEIPT(paymentId), {
            method: "GET",
        })
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    /**
     * Get payment statistics (for car owners) (legacy)
     */
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

    /**
     * Process webhook for payment status updates (legacy)
     */
    async handlePaymentWebhook(webhookData: any): Promise<{ error: Error | null }> {
        const result = await apiClient(API_ENDPOINTS.PAYMENT_WEBHOOK, {
            method: "POST",
            body: JSON.stringify(webhookData),
        })
        return { error: result.error }
    },
}
