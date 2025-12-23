export interface Payment {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
    paymentMethod: "cash" | "qr-payos";
    transactionId?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    metadata?: {
        cardLast4?: string;
        cardBrand?: string;
        receiptUrl?: string;
        failureReason?: string;
    };
}

export interface Invoice {
    id: string;
    bookingId?: string;
    customerId: string;
    vendorId?: string;
    amount: number;
    currency?: string;
    status: "pending" | "paid" | "failed" | "cancelled" | "completed";
    dueDate?: string;
    createdAt: string;
    updatedAt?: string;
    items?: InvoiceItem[];
    description?: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface CreateInvoiceData {
    customerId: string;
    vendorId?: string;
    bookingId?: string;
    amount: number;
    currency?: string;
    dueDate?: string;
    description?: string;
    items?: InvoiceItem[];
}

export interface UpdateInvoiceData {
    id: string;
    amount?: number;
    status?: string;
    dueDate?: string;
    description?: string;
    items?: InvoiceItem[];
}

export interface PayOSPayment {
    orderCode: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" | "PAID" | "CANCELLED" | "EXPIRED";
    paymentUrl?: string;
    qrCode?: string;
    transactionId?: string;
    createdAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
}

export interface CreatePayOSPaymentRequest {
    amount: number;
    description: string;
    returnUrl?: string;
    cancelUrl?: string;
    bookingId?: string;
}

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
}

export interface CreatePaymentData {
    bookingId: string;
    amount: number;
    currency?: string;
    paymentMethod: "cash" | "qr-payos";
}

export interface RefundData {
    paymentId: string;
    amount?: number;
    reason?: string;
}

export interface PaymentHistory {
    payments: Payment[];
    totalAmount: number;
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface PaymentStats {
    totalEarnings: number;
    totalPayments: number;
    averagePayment: number;
    pendingAmount: number;
    completedAmount: number;
}
