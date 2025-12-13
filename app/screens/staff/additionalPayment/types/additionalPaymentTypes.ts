export interface AdditionalFee {
    id: string;
    name: string;
    amount: number;
    description: string;
    icon: string;
}

export interface PaymentResponse {
    orderCode: number;
    payOSLink: string;
    item3: {
        id: string;
        orderCode: number;
        item: string;
        paidAmount: number;
        createDate: string;
        updateDate: string;
        paymentMethod: string;
        status: string;
        invoiceId: string;
        userId: string;
    };
}

export interface AdditionalPaymentSectionProps {
    bookingId: string;
    onPaymentAdded?: () => void;
    onNavigateToReturn?: () => void;
}