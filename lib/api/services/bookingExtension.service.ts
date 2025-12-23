import { apiClient } from '../client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (e) {
        console.error("Failed to get token:", e);
        return null;
    }
};

export interface BookingDetail {
    id: string;
    bookingNumber: string;
    pickupPlace: string;
    pickupTime: string;
    dropoffPlace: string;
    dropoffTime: string;
    createDate: string;
    updateDate: string;
    invoiceId: string;
    userId: string;
    carId: string;
    status: string;
    invoiceNo: string;
    user: {
        id: string;
        username: string;
        phoneNumber: string;
        email: string;
        fullname: string;
        address: string;
        imageAvatar: string;
        isGoogle: boolean;
        isVerified: boolean;
        rating: number;
        status: string;
        roleId: number;
    };
}

export interface InvoiceItem {
    item: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    note: string;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    issueDate: string;
    dueDate: string;
    subTotal: number;
    grandTotal: number;
    note: string;
    createDate: string;
    customerId: string;
    vendorId: string;
    status: string;
    invoiceItems: InvoiceItem[];
}

export interface PaymentDetail {
    paymentId: string;
    amount: number;
    invoiceId: string;
}

export interface PayOSPaymentRequest {
    paymentId: string;
    amount: number;
    invoiceId: string;
    timeToPay: number;
}

export interface PayOSPaymentResponse {
    orderCode: number;
    checkoutUrl: string;
}

export const bookingExtensionService = {
    // Get booking details by ID
    getBookingById: async (bookingId: string): Promise<{ data: BookingDetail | null; error: Error | null }> => {
        console.log(' getBookingById: fetching booking', bookingId);

        const result = await apiClient<BookingDetail>(`/Booking/GetBookingById/${bookingId}`, {
            method: 'GET',
        });

        if (result.error) {
            console.error(' getBookingById: error', result.error);
            return { data: null, error: result.error };
        }

        console.log(' getBookingById: success', result.data?.bookingNumber);
        return { data: result.data, error: null };
    },

    // Get invoice by ID (first API call)
    getInvoiceById: async (invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> => {
        console.log(' getInvoiceById: fetching invoice', invoiceId);

        const result = await apiClient<Invoice>(`/Invoice/${invoiceId}`, {
            method: 'GET',
        });

        if (result.error) {
            console.error(' getInvoiceById: error', result.error);
            return { data: null, error: result.error };
        }

        console.log(' getInvoiceById: success', result.data?.invoiceNo);
        return { data: result.data, error: null };
    },

    // Get payment details by invoice ID (second API call)
    getPaymentDetailsByInvoiceId: async (invoiceId: string): Promise<{ data: PaymentDetail | null; error: Error | null }> => {
        console.log(' getPaymentDetailsByInvoiceId: fetching payment details', invoiceId);

        try {
            // Get authentication token
            const token = await getAuthToken();
            console.log('🔐 Auth token available:', !!token);

            const authHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                'accept': '*/*'
            };

            if (token) {
                authHeaders['Authorization'] = `Bearer ${token}`;
            }

            // Use direct fetch since this endpoint doesn't use /api/ prefix
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/Invoice/${invoiceId}`;

            console.log(' getPaymentDetailsByInvoiceId: calling URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: authHeaders,
            });

            if (!response.ok) {
                console.error(' getPaymentDetailsByInvoiceId: HTTP error', response.status);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const result = await response.json();
            console.log(' getPaymentDetailsByInvoiceId: got response:', result);

            // Find the "Booking Extension" payment in the array
            const extensionPayment = result?.find((payment: any) =>
                payment && typeof payment === 'object' && 'item' in payment &&
                payment.item === 'Booking Extension'
            );

            if (!extensionPayment) {
                console.log(' getPaymentDetailsByInvoiceId: no booking extension found');
                return { data: null, error: new Error('No booking extension payment found') };
            }


            const paymentDetail: PaymentDetail = {
                paymentId: extensionPayment.id,
                amount: extensionPayment.paidAmount,
                invoiceId: invoiceId
            };

            console.log(' getPaymentDetailsByInvoiceId: found extension payment', paymentDetail);
            return { data: paymentDetail, error: null };

        } catch (error) {
            console.error(' getPaymentDetailsByInvoiceId: fetch error', error);
            return { data: null, error: error as Error };
        }
    },

    // Check if booking has extensions (simplified check)
    checkBookingExtensions: async (bookingId: string): Promise<{
        data: {
            hasExtension: boolean;
            extensionDetails?: InvoiceItem;
        } | null;
        error: Error | null
    }> => {
        try {
            console.log(' checkBookingExtensions: checking for extensions in booking', bookingId);

            // Step 1: Get booking details
            const bookingResult = await bookingExtensionService.getBookingById(bookingId);
            if (bookingResult.error || !bookingResult.data) {
                console.log(' checkBookingExtensions: no booking found');
                return { data: { hasExtension: false }, error: null };
            }

            const invoiceId = bookingResult.data.invoiceId;
            console.log(' checkBookingExtensions: got invoiceId', invoiceId);

            // Step 2: Get invoice details to check for booking extension
            const invoiceResult = await bookingExtensionService.getInvoiceById(invoiceId);
            if (invoiceResult.error || !invoiceResult.data) {
                console.log(' checkBookingExtensions: no invoice found');
                return { data: { hasExtension: false }, error: null };
            }

            // Step 3: Look for "Booking Extension" items
            const extensionItem = invoiceResult.data.invoiceItems.find(item =>
                item.item === 'Booking Extension'
            );

            if (extensionItem) {
                console.log(' checkBookingExtensions: found booking extension', extensionItem);
                return {
                    data: {
                        hasExtension: true,
                        extensionDetails: extensionItem
                    },
                    error: null
                };
            } else {
                console.log(' checkBookingExtensions: no booking extension found');
                return { data: { hasExtension: false }, error: null };
            }

        } catch (error) {
            console.error(' checkBookingExtensions: error', error);
            return { data: null, error: error as Error };
        }
    },

    // Create PayOS payment request
    createPayOSPaymentRequest: async (paymentRequest: PayOSPaymentRequest): Promise<{ data: PayOSPaymentResponse | null; error: Error | null }> => {
        console.log(' createPayOSPaymentRequest: creating payment', paymentRequest);

        try {
            // Get authentication token
            const token = await getAuthToken();
            console.log('🔐 Auth token available:', !!token);

            const authHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                'accept': '*/*'
            };

            if (token) {
                authHeaders['Authorization'] = `Bearer ${token}`;
            }

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/CreatePayOSPaymentRequest`;

            console.log(' createPayOSPaymentRequest: calling URL:', url);
            console.log(' createPayOSPaymentRequest: payload:', JSON.stringify(paymentRequest, null, 2));

            const response = await fetch(url, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(paymentRequest),
            });

            if (!response.ok) {
                console.error(' createPayOSPaymentRequest: HTTP error', response.status);
                const errorText = await response.text();
                console.error(' createPayOSPaymentRequest: error response:', errorText);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const result = await response.json();
            console.log(' createPayOSPaymentRequest: success', result);

            return { data: result, error: null };

        } catch (error) {
            console.error('🔗 createPayOSPaymentRequest: fetch error', error);
            return { data: null, error: error as Error };
        }
    },

    // Complete flow: Get booking extension payment URL
    getBookingExtensionPaymentUrl: async (bookingId: string): Promise<{ data: PayOSPaymentResponse | null; error: Error | null }> => {
        try {
            console.log(' getBookingExtensionPaymentUrl: starting flow for booking', bookingId);

            // Step 1: Get booking details
            const bookingResult = await bookingExtensionService.getBookingById(bookingId);
            if (bookingResult.error || !bookingResult.data) {
                return { data: null, error: bookingResult.error || new Error('Booking not found') };
            }

            const invoiceId = bookingResult.data.invoiceId;
            console.log(' getBookingExtensionPaymentUrl: got invoiceId', invoiceId);

            // Step 2: Get payment details to find the actual paymentId
            const paymentResult = await bookingExtensionService.getPaymentDetailsByInvoiceId(invoiceId);
            if (paymentResult.error || !paymentResult.data) {
                return { data: null, error: paymentResult.error || new Error('Payment details not found') };
            }

            console.log(' getBookingExtensionPaymentUrl: got payment details', paymentResult.data);

            // Step 3: Create PayOS payment request using actual paymentId
            const paymentRequest: PayOSPaymentRequest = {
                paymentId: paymentResult.data.paymentId,
                amount: paymentResult.data.amount,
                invoiceId: paymentResult.data.invoiceId,
                timeToPay: 10 // 10 minutes to pay
            };

            console.log(' getBookingExtensionPaymentUrl: creating PayOS payment request', paymentRequest);

            const payosResult = await bookingExtensionService.createPayOSPaymentRequest(paymentRequest);
            if (payosResult.error || !payosResult.data) {
                return { data: null, error: payosResult.error || new Error('Failed to create payment URL') };
            }

            console.log(' getBookingExtensionPaymentUrl: payment URL created successfully');
            return { data: payosResult.data, error: null };

        } catch (error) {
            console.error(' getBookingExtensionPaymentUrl: unexpected error', error);
            return { data: null, error: error as Error };
        }
    }
};