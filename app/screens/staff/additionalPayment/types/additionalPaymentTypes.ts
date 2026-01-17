export interface AdditionalFee {
    id: string;
    name: string;
    amount: number;
    description: string;
    icon: string;
    isEditable?: boolean;
    isAmountEditable?: boolean; // New: allows editing the amount itself
    unit?: string;
    minQuantity?: number;
    maxQuantity?: number;
    minAmount?: number; // New: minimum amount for custom charges
    maxAmount?: number; // New: maximum amount for custom charges
    placeholder?: string; // New: placeholder text for amount input
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