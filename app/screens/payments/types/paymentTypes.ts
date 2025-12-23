export interface PaymentItem {
    orderCode: number;
    item: string;
    paidAmount: number;
    status: string;
    paymentMethod: string;
    createDate: string;
    invoiceId?: string;
    bookingNumber?: string;
    carName?: string;
    userId?: string;
}

export interface BookingPayments {
    bookingId: string;
    bookingNumber?: string;
    carName: string;
    payments: PaymentItem[];
    mostRecentPaymentDate?: number;
}