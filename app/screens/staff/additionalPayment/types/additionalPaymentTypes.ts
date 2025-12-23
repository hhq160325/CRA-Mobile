export interface AdditionalFee {
    id: string;
    name: string;
    amount: number;
    description: string;
    icon: string;
    isEditable?: boolean;
    unit?: string;
    minQuantity?: number;
    maxQuantity?: number;
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