import { API_CONFIG } from '../config';

export interface AdditionalFeePayment {
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

export interface UpdateAdditionalFeePaymentStatusRequest {
    orderCode: number;
    status: string;
    method: string;
}

export const additionalFeePaymentService = {
    // Step 1: Check payment status for additional fee
    checkAdditionalFeePayment: async (bookingId: string): Promise<{
        data: {
            hasAdditionalFee: boolean;
            additionalFeePayment?: AdditionalFeePayment;
            isPending: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {
            console.log('🔍 Checking additional fee payment for:', bookingId);

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const url = `${baseUrl}/Booking/${bookingId}/Payments?_t=${timestamp}`;

            console.log('📡 Calling API:', url);

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
                console.error('❌ HTTP error:', response.status);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const payments: AdditionalFeePayment[] = await response.json();
            console.log('📋 Got payments:', payments);

            // Find "Additional Fee" payment
            const additionalFeePayment = payments.find(payment => payment.item === 'Additional Fee');

            if (!additionalFeePayment) {
                console.log('ℹ️ No additional fee found');
                return {
                    data: {
                        hasAdditionalFee: false,
                        isPending: false
                    },
                    error: null
                };
            }

            const isPending = additionalFeePayment.status.toLowerCase() === 'pending';
            console.log(`✅ Found additional fee - Status: "${additionalFeePayment.status}", Pending: ${isPending}`);

            return {
                data: {
                    hasAdditionalFee: true,
                    additionalFeePayment,
                    isPending
                },
                error: null
            };

        } catch (error) {
            console.error('💥 Error checking additional fee payment:', error);
            return { data: null, error: error as Error };
        }
    },

    // Step 2: Update payment status after PayOS completion
    updateAdditionalFeePaymentStatus: async (orderCode: number, status: string = 'Paid', method: string = 'payos'): Promise<{
        data: boolean;
        error: Error | null;
    }> => {
        try {
            console.log('🔄 Updating additional fee payment status:', { orderCode, status, method });

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/UpdatePayment/Booking/PaymentOrderCode`;

            const payload: UpdateAdditionalFeePaymentStatusRequest = {
                orderCode,
                status,
                method
            };

            console.log('📡 Calling update API:', url);
            console.log('📦 Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('❌ Additional fee payment update failed:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                return { data: false, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            console.log('✅ Additional fee payment status updated successfully');
            return { data: true, error: null };

        } catch (error) {
            console.error('💥 Error updating additional fee payment status:', error);
            return { data: false, error: error as Error };
        }
    },

    // Step 3: Complete flow - check status and update if needed
    handleAdditionalFeePayOSCompletion: async (bookingId: string, paymentUrl: string): Promise<{
        data: {
            success: boolean;
            orderCode?: number;
            wasUpdated: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {
            console.log('🎯 Handling PayOS completion for additional fee in booking:', bookingId);
            console.log('🔗 Payment URL:', paymentUrl);

            // Extract orderCode from PayOS success URL if possible
            let orderCode: number | undefined;

            // First check current payment status
            const statusResult = await additionalFeePaymentService.checkAdditionalFeePayment(bookingId);

            if (statusResult.error || !statusResult.data) {
                return { data: null, error: statusResult.error || new Error('Failed to check additional fee payment status') };
            }

            const { hasAdditionalFee, additionalFeePayment, isPending } = statusResult.data;

            if (!hasAdditionalFee || !additionalFeePayment) {
                return { data: null, error: new Error('No additional fee found') };
            }

            orderCode = additionalFeePayment.orderCode;
            console.log('📋 Found additional fee payment with orderCode:', orderCode);

            if (!isPending) {
                console.log('ℹ️ Additional fee payment already completed, no update needed');
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
            console.log('🔄 Additional fee payment is pending, updating to Paid...');
            const updateResult = await additionalFeePaymentService.updateAdditionalFeePaymentStatus(orderCode);

            if (updateResult.error) {
                return { data: null, error: updateResult.error };
            }

            console.log('✅ Additional fee PayOS completion handled successfully');
            return {
                data: {
                    success: true,
                    orderCode,
                    wasUpdated: true
                },
                error: null
            };

        } catch (error) {
            console.error('💥 Error handling additional fee PayOS completion:', error);
            return { data: null, error: error as Error };
        }
    }
};