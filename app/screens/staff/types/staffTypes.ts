export type PaymentStatus = 'all' | 'successfully' | 'pending' | 'cancelled';

export interface PaymentDetails {
    isBookingFeePaid: boolean;
    isRentalFeePaid: boolean;
    isExtensionPaid: boolean;
    isAdditionalFeePaid: boolean;
    hasExtension: boolean;
    canPickup: boolean;
    canReturn: boolean;
    rentalFeePayment?: any;
    extensionPayment?: any;
}

export interface BookingItem {
    id: string;
    bookingNumber?: string;
    carId: string;
    carName: string;
    carBrand: string;
    carModel: string;
    carLicensePlate: string;
    carImage: string;
    customerName: string;
    userId: string;
    invoiceId: string;
    amount: number;
    invoiceStatus: string;
    status: string;
    date: string;
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    hasExtension: boolean;
    extensionDescription?: string;
    extensionDays?: number;
    extensionAmount?: number;
    extensionPaymentStatus?: string;
    isExtensionPaymentCompleted?: boolean;
    paymentDetails?: PaymentDetails;
}