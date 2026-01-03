import { API_CONFIG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (e) {
        console.error("Failed to get token:", e);
        return null;
    }
};

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

    checkAdditionalFeePayment: async (bookingId: string): Promise<{
        data: {
            hasAdditionalFee: boolean;
            additionalFeePayment?: AdditionalFeePayment;
            isPending: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {
            console.log(' Checking additional fee payment for:', bookingId);

            // Validate bookingId
            if (!bookingId || bookingId === 'undefined' || bookingId === 'null') {
                console.log(' Invalid booking ID provided:', bookingId);
                return {
                    data: {
                        hasAdditionalFee: false,
                        isPending: false
                    },
                    error: null
                };
            }


            const token = await getAuthToken();
            console.log(' Auth token available for check:', !!token);

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';

            const timestamp = new Date().getTime();
            const url = `${baseUrl}/Booking/${bookingId}/Payments?_t=${timestamp}`;

            console.log(' Calling API:', url);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log(' Check request headers:', JSON.stringify(headers, null, 2));

            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                console.error(' HTTP error:', response.status);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const payments: AdditionalFeePayment[] = await response.json();
            console.log(' Got payments:', payments);


            const pendingAdditionalFeePayment = payments.find(payment =>
                payment.item === 'Additional Fee' && payment.status.toLowerCase() === 'pending'
            );

            if (!pendingAdditionalFeePayment) {
                console.log(' No PENDING additional fee found');

                // Check if there are any additional fee payments at all (for logging)
                const anyAdditionalFeePayment = payments.find(payment => payment.item === 'Additional Fee');
                if (anyAdditionalFeePayment) {
                    console.log(' Found additional fee payment but it is already PAID - OrderCode:', anyAdditionalFeePayment.orderCode);
                    return {
                        data: {
                            hasAdditionalFee: true,
                            additionalFeePayment: anyAdditionalFeePayment,
                            isPending: false
                        },
                        error: null
                    };
                } else {
                    console.log(' No additional fee payments found at all');
                    return {
                        data: {
                            hasAdditionalFee: false,
                            isPending: false
                        },
                        error: null
                    };
                }
            }

            console.log(` Found PENDING additional fee - OrderCode: ${pendingAdditionalFeePayment.orderCode}, Status: "${pendingAdditionalFeePayment.status}"`);
            console.log(' This payment will be updated via PATCH API');

            return {
                data: {
                    hasAdditionalFee: true,
                    additionalFeePayment: pendingAdditionalFeePayment,
                    isPending: true
                },
                error: null
            };

        } catch (error) {
            console.error(' Error checking additional fee payment:', error);
            return { data: null, error: error as Error };
        }
    },


    getAdditionalFeePaymentUrl: async (bookingId: string): Promise<{
        data: { orderCode: number; checkoutUrl: string } | null;
        error: Error | null;
    }> => {
        try {
            console.log(' Creating additional fee payment URL for booking:', bookingId);

            // First check if there's an additional fee payment
            const statusResult = await additionalFeePaymentService.checkAdditionalFeePayment(bookingId);

            if (statusResult.error || !statusResult.data) {
                return { data: null, error: statusResult.error || new Error('Failed to check additional fee payment') };
            }

            const { hasAdditionalFee, additionalFeePayment, isPending } = statusResult.data;

            if (!hasAdditionalFee || !additionalFeePayment) {
                return { data: null, error: new Error('No additional fee payment found') };
            }

            if (!isPending) {
                return { data: null, error: new Error('Additional fee payment is already completed') };
            }

            // Get authentication token
            const token = await getAuthToken();
            console.log(' Auth token available for payment URL creation:', !!token);

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/CreatePayOSPaymentRequest`;

            const paymentRequest = {
                paymentId: additionalFeePayment.id,
                amount: additionalFeePayment.paidAmount,
                invoiceId: additionalFeePayment.invoiceId,
                timeToPay: 10
            };

            console.log(' Creating PayOS payment request:', paymentRequest);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'accept': '*/*'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(paymentRequest)
            });

            if (!response.ok) {
                console.error(' Failed to create additional fee payment URL:', response.status);
                const errorText = await response.text();
                console.error(' Error response:', errorText);
                return { data: null, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const result = await response.json();
            console.log(' Additional fee payment URL created successfully:', result);

            return { data: result, error: null };

        } catch (error) {
            console.error(' Error creating additional fee payment URL:', error);
            return { data: null, error: error as Error };
        }
    },


    updateAdditionalFeePaymentStatus: async (orderCode: number, status: string = 'Paid', method: string = 'payos'): Promise<{
        data: boolean;
        error: Error | null;
    }> => {
        try {
            console.log(' Updating additional fee payment status:', { orderCode, status, method });

            // Get authentication token
            const token = await getAuthToken();
            console.log(' Auth token available for status update:', !!token);

            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const url = `${baseUrl}/UpdatePayment/Booking/PaymentOrderCode`;

            const payload: UpdateAdditionalFeePaymentStatusRequest = {
                orderCode,
                status,
                method
            };

            console.log(' Calling update API:', url);
            console.log(' Payload:', JSON.stringify(payload, null, 2));

            const headers: Record<string, string> = {
                'accept': '*/*',
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log(' Update request headers:', JSON.stringify(headers, null, 2));

            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(payload)
            });

            console.log(' Update response status:', response.status);

            if (!response.ok) {
                console.error(' Additional fee payment update failed:', response.status);
                const errorText = await response.text();
                console.error(' Error response:', errorText);
                return { data: false, error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
            }

            const responseText = await response.text();
            console.log(' Additional fee payment status updated successfully');
            console.log(' Update response body:', responseText);
            return { data: true, error: null };

        } catch (error) {
            console.error(' Error updating additional fee payment status:', error);
            return { data: false, error: error as Error };
        }
    },


    handleAdditionalFeePayOSCompletion: async (bookingId: string, paymentUrl: string): Promise<{
        data: {
            success: boolean;
            orderCode?: number;
            wasUpdated: boolean;
        } | null;
        error: Error | null;
    }> => {
        try {

            console.log(' Booking ID:', bookingId);
            console.log(' Payment URL:', paymentUrl);


            let orderCode: number | undefined;


            console.log(' Step 1: Checking additional fee payment status...');
            const statusResult = await additionalFeePaymentService.checkAdditionalFeePayment(bookingId);

            if (statusResult.error) {
                console.error(' Error checking additional fee payment:', statusResult.error.message);

                return { data: null, error: statusResult.error };
            }

            if (!statusResult.data) {
                console.error(' No data returned from additional fee payment check');
                return { data: null, error: new Error('Failed to check additional fee payment status') };
            }

            const { hasAdditionalFee, additionalFeePayment, isPending } = statusResult.data;



            if (!hasAdditionalFee || !additionalFeePayment) {
                console.log(' No additional fee found for this booking - this is normal for regular bookings');
                return {
                    data: {
                        success: true,
                        wasUpdated: false
                    },
                    error: null
                };
            }

            orderCode = additionalFeePayment.orderCode;


            if (!isPending) {
                console.log(' Additional fee payment already completed, no update needed');
                console.log(' Current status:', additionalFeePayment.status);
                return {
                    data: {
                        success: true,
                        orderCode,
                        wasUpdated: false
                    },
                    error: null
                };
            }




            const updateResult = await additionalFeePaymentService.updateAdditionalFeePaymentStatus(orderCode);

            console.log(' Step 3 Results - Update result:', {
                success: updateResult.data,
                error: updateResult.error?.message,
                orderCode
            });

            if (updateResult.error) {
                console.error(' Failed to update additional fee payment status:', updateResult.error.message);
                console.error(' Full update error:', updateResult.error);
                return { data: null, error: updateResult.error };
            }

            if (!updateResult.data) {
                console.error(' Update additional fee payment returned false');
                return { data: null, error: new Error('Failed to update additional fee payment status') };
            }


            console.log(' OrderCode updated:', orderCode);
            return {
                data: {
                    success: true,
                    orderCode,
                    wasUpdated: true
                },
                error: null
            };

        } catch (error) {
            console.error(' Exception in handleAdditionalFeePayOSCompletion:', error);
            console.error(' Error details:', JSON.stringify(error, null, 2));
            return { data: null, error: error as Error };
        }
    }
};