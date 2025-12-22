import { API_CONFIG } from '../config';

export interface BookingPayment {
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
}

export interface UpdatePaymentStatusRequest {
    orderCode: number;
    status: string;
    method: string;
}

export const bookingExtensionPaymentService = {
    // Step 1: Check payment status for booking extension
    checkBookingExtensionPayment: async (bookingId: string): Promise<{
        data: {
            hasExtension: boolean;
            extensionPayment?: BookingPayment;
            isPending: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {
            console.log(' Checking booking extension payment for:', bookingId);

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const url = `${baseUrl}/Booking/${bookingId}/Payments?_t=${timestamp}`;

            console.log(' Calling API:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
            });

            if (!response.ok) {
                console.error(' HTTP error:', response.status);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const payments: BookingPayment[] = await response.json();
            console.log(' Got payments:', payments);

            // Find "Booking Extension" payment
            const extensionPayment = payments.find(payment => payment.item === 'Booking Extension');

            if (!extensionPayment) {
                console.log(' No booking extension found');
                return {
                    data: {
                        hasExtension: false,
                        isPending: false
                    },
                    error: null
                };
            }

            const isPending = extensionPayment.status.toLowerCase() === 'pending';
            console.log(` Found booking extension - Status: "${extensionPayment.status}", Pending: ${isPending}`);

            return {
                data: {
                    hasExtension: true,
                    extensionPayment,
                    isPending
                },
                error: null
            };

        } catch (error) {
            console.error(' Error checking booking extension payment:', error);
            return { data: null, error: error as Error };
        }
    },

    // Step 2: Update payment status after PayOS completion
    updatePaymentStatus: async (orderCode: number, status: string = 'Paid', method: string = 'payos'): Promise<{
        data: boolean;
        error: Error | null;
    }> => {
        try {
            console.log(' Updating payment status:', { orderCode, status, method });

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/UpdatePayment/Booking/PaymentOrderCode`;

            const payload: UpdatePaymentStatusRequest = {
                orderCode,
                status,
                method
            };

            console.log(' Calling update API:', url);
            console.log(' Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(' Payment update failed:', response.status);
                const errorText = await response.text();
                console.error(' Error response:', errorText);
                return { data: false, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            console.log(' Payment status updated successfully');
            return { data: true, error: null };

        } catch (error) {
            console.error(' Error updating payment status:', error);
            return { data: false, error: error as Error };
        }
    },

    // Step 3: Complete flow - check status and update if needed
    handlePayOSCompletion: async (bookingId: string, paymentUrl: string): Promise<{
        data: {
            success: boolean;
            orderCode?: number;
            wasUpdated: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {
            console.log(' Handling PayOS completion for booking:', bookingId);
            console.log(' Payment URL:', paymentUrl);


            let orderCode: number | undefined;

            // First check current payment status
            const statusResult = await bookingExtensionPaymentService.checkBookingExtensionPayment(bookingId);

            if (statusResult.error || !statusResult.data) {
                return { data: null, error: statusResult.error || new Error('Failed to check payment status') };
            }

            const { hasExtension, extensionPayment, isPending } = statusResult.data;

            if (!hasExtension || !extensionPayment) {
                return { data: null, error: new Error('No booking extension found') };
            }

            orderCode = extensionPayment.orderCode;
            console.log(' Found extension payment with orderCode:', orderCode);

            if (!isPending) {
                console.log(' Payment already completed, no update needed');
                return {
                    data: {
                        success: true,
                        orderCode,
                        wasUpdated: false
                    },
                    error: null
                };
            }

            // Update payment status to Paid
            console.log(' Payment is pending, updating to Paid...');
            const updateResult = await bookingExtensionPaymentService.updatePaymentStatus(orderCode);

            if (updateResult.error) {
                return { data: null, error: updateResult.error };
            }

            console.log(' PayOS completion handled successfully');
            return {
                data: {
                    success: true,
                    orderCode,
                    wasUpdated: true
                },
                error: null
            };

        } catch (error) {
            console.error(' Error handling PayOS completion:', error);
            return { data: null, error: error as Error };
        }
    }
};